import { Investment } from '../../models/Investment.js';
import { Ledger } from '../../models/Ledger.js';
import { Transaction } from '../../models/Transaction.js';
import { Statuses } from '../../constants/index.js';
import { logAction } from '../../middleware/audit.js';
import { broadcastSyncEvent } from '../../services/sse.js';
import { formatINR } from '../../services/rulesService.js';

/**
 * GET /api/v1/admin/maturity-releases
 * Fetch all investments with their maturity calculations, elapsed tenure,
 * and current release status (Pending, Ready, Released, On Hold).
 */
export async function getMaturityReleases(req, res, next) {
  try {
    const { status, search } = req.query;
    const now = new Date();

    const query = {
      status: { $in: [Statuses.INVESTMENT.CONFIRMED, Statuses.INVESTMENT.ACTIVE, Statuses.INVESTMENT.MATURED, Statuses.INVESTMENT.COMPLETED, 'Confirmed', 'Active', 'Matured', 'Completed'] }
    };

    const investments = await Investment.find(query)
      .populate('investorId', 'name email mobile pan bankDetails')
      .populate({
        path: 'offerId',
        select: 'title kind status targetPaise rateBps companyId minTenureMonths tenures',
        populate: {
          path: 'companyId',
          select: 'name regNo sector bankDetails'
        }
      })
      .populate('requestId', 'title investmentPurpose')
      .sort({ maturityDate: 1, createdAt: -1 });

    const enriched = investments.map(inv => {
      const paidDate = inv.activationDate || inv.investedAt || inv.createdAt;
      const tenure = inv.tenureMonths || 12;
      
      let maturityDate = inv.maturityDate;
      if (!maturityDate && paidDate) {
        maturityDate = new Date(paidDate);
        maturityDate.setMonth(maturityDate.getMonth() + tenure);
      }

      const isMatured = maturityDate ? (new Date(maturityDate) <= now) : false;
      const daysRemaining = maturityDate ? Math.ceil((new Date(maturityDate) - now) / (1000 * 60 * 60 * 24)) : 0;

      // Determine automated release status
      let releaseStatus = inv.principalReleaseStatus || 'Pending';
      if (releaseStatus === 'Pending' && isMatured) {
        releaseStatus = 'Ready';
      }

      const amountRupees = inv.amount || inv.amountInvested || (inv.amountPaise ? inv.amountPaise / 100 : 0);

      return {
        id: inv._id,
        investor: {
          id: inv.investorId?._id,
          name: inv.investorId?.name || inv.investorName || 'Investor',
          email: inv.investorId?.email || inv.investorEmail || 'N/A',
          mobile: inv.investorId?.mobile || '—',
          pan: inv.investorId?.pan || '—',
          bankAccount: inv.investorId?.bankDetails?.accountNo || '•••4210'
        },
        offer: {
          id: inv.offerId?._id || inv.requestId?._id,
          title: inv.offerId?.title || inv.requestId?.title || 'Investment Opportunity',
          kind: inv.offerId?.kind || 'project',
          companyName: inv.offerId?.companyId?.name || 'Borrowing Company'
        },
        principalPaise: inv.amountPaise || (amountRupees * 100),
        principalRupees: amountRupees,
        tenureMonths: tenure,
        paidDate,
        maturityDate,
        isMatured,
        daysRemaining: Math.max(0, daysRemaining),
        releaseStatus,
        principalReleasedAt: inv.principalReleasedAt,
        principalReleaseUtr: inv.principalReleaseUtr,
        principalReleaseRemarks: inv.principalReleaseRemarks
      };
    });

    // In-memory status & search filtering
    let result = enriched;
    if (status && status !== 'ALL') {
      result = result.filter(r => r.releaseStatus.toUpperCase() === status.toUpperCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(r =>
        r.investor.name.toLowerCase().includes(q) ||
        r.investor.email.toLowerCase().includes(q) ||
        r.offer.title.toLowerCase().includes(q) ||
        r.offer.companyName.toLowerCase().includes(q) ||
        (r.principalReleaseUtr && r.principalReleaseUtr.toLowerCase().includes(q))
      );
    }

    // Counts
    const counts = {
      total: enriched.length,
      ready: enriched.filter(e => e.releaseStatus === 'Ready').length,
      released: enriched.filter(e => e.releaseStatus === 'Released').length,
      pending: enriched.filter(e => e.releaseStatus === 'Pending').length,
      onHold: enriched.filter(e => e.releaseStatus === 'On Hold').length
    };

    return res.json({
      success: true,
      counts,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/admin/maturity-releases/:id/release
 * Release and transfer matured principal amount back to the investor.
 */
export async function releaseMaturityPrincipal(req, res, next) {
  try {
    const { id } = req.params;
    const { remarks, utrNumber } = req.body || {};

    const investment = await Investment.findById(id)
      .populate('investorId', 'name email mobile')
      .populate('offerId', 'title');

    if (!investment) {
      return res.status(404).json({ success: false, error: 'Investment record not found' });
    }

    if (investment.principalReleaseStatus === 'Released') {
      return res.status(400).json({ success: false, error: 'Principal has already been released and returned to this investor.' });
    }

    const principalPaise = investment.amountPaise || Math.round((investment.amount || investment.amountInvested || 0) * 100);
    const utr = utrNumber || `REL-PRIN-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;

    investment.principalReleaseStatus = 'Released';
    investment.principalReleasedAt = new Date();
    investment.principalReleaseUtr = utr;
    investment.principalReleaseRemarks = remarks || 'Tenure completed (12+ Months). Principal capital returned to investor.';
    investment.principalReleasedBy = req.user._id;
    investment.status = Statuses.INVESTMENT.COMPLETED;
    await investment.save();

    // Financial Ledger entry
    try {
      await Ledger.create({
        account: 'INVESTOR_WALLET',
        debitPaise: 0,
        creditPaise: principalPaise,
        refType: 'PRINCIPAL_REDEMPTION',
        refId: investment._id,
        description: `Maturity Principal Release of ${formatINR(principalPaise)} to ${investment.investorId?.name || 'Investor'} Ref: ${utr}`
      });
    } catch (ledErr) {
      console.warn('[MaturityRelease] Ledger record error:', ledErr.message);
    }

    // Universal Transaction entry
    try {
      await Transaction.create({
        investorId: investment.investorId?._id || investment.investorId,
        investmentId: investment._id,
        title: `Maturity Capital Return - ${investment.offerId?.title || 'Investment'}`,
        type: 'Principal Redemption',
        amount: principalPaise / 100,
        status: 'Completed',
        referenceId: utr,
        paymentMethod: 'Direct Escrow Settlement / RTGS',
        description: `Full release of invested principal upon completion of ${investment.tenureMonths || 12}-month tenure.`
      });
    } catch (txErr) {
      console.warn('[MaturityRelease] Transaction record error:', txErr.message);
    }

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'MATURITY_PRINCIPAL_RELEASED',
      targetEntity: 'Investment',
      targetId: investment._id,
      reason: investment.principalReleaseRemarks,
      after: {
        principalReleaseStatus: 'Released',
        utr,
        amountPaise: principalPaise
      },
      ipAddress: req.ip
    });

    broadcastSyncEvent('maturity_principal_released', {
      investmentId: investment._id,
      utr,
      investorName: investment.investorId?.name
    });

    return res.json({
      success: true,
      message: `Principal amount of ${formatINR(principalPaise)} successfully released to ${investment.investorId?.name || 'investor'}!`,
      investment
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/admin/maturity-releases/:id/hold
 * Put on hold or resume maturity release for an investor.
 */
export async function toggleMaturityReleaseHold(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const investment = await Investment.findById(id).populate('investorId', 'name');
    if (!investment) {
      return res.status(404).json({ success: false, error: 'Investment record not found' });
    }

    if (investment.principalReleaseStatus === 'Released') {
      return res.status(400).json({ success: false, error: 'Cannot hold principal that has already been released.' });
    }

    const isHold = investment.principalReleaseStatus === 'On Hold';
    const nextStatus = isHold ? 'Ready' : 'On Hold';

    investment.principalReleaseStatus = nextStatus;
    investment.principalReleaseRemarks = !isHold ? (reason || 'Placed on hold by platform administrator') : null;
    await investment.save();

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: !isHold ? 'MATURITY_RELEASE_ON_HOLD' : 'MATURITY_RELEASE_RESUMED',
      targetEntity: 'Investment',
      targetId: investment._id,
      reason: investment.principalReleaseRemarks,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: !isHold
        ? `Maturity release for ${investment.investorId?.name || 'Investor'} placed ON HOLD.`
        : `Maturity release for ${investment.investorId?.name || 'Investor'} resumed and marked READY.`,
      investment
    });
  } catch (error) {
    next(error);
  }
}

