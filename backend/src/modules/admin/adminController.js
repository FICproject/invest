import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  User,
  InvestorProfile,
  Company,
  Offer,
  OfferTerms,
  Investment,
  InvestmentRequest,
  Repayment,
  Payout,
  Batch,
  Release,
  Ledger,
  AuditLog,
  Query,
  Subscription,
  Dividend,
  KYC,
  Transaction
} from '../../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../../uploads');

export function normalizeDocUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/uploads/')) return trimmed;
  if (trimmed.startsWith('uploads/')) return `/${trimmed}`;
  if (trimmed.startsWith('/')) return `/uploads${trimmed}`;
  return `/uploads/${trimmed}`;
}
import {
  Roles,
  Statuses,
  Constraints,
  OfferKind,
  ErrorCodes
} from '../../constants/index.js';
import {
  calculateMonthlyReturnPaise,
  validateOfferTenures,
  checkBankCoolingOff,
  isValidStatusMove,
  formatINR,
  calculateEquityDilutionPct,
  calculateSharesFromPaise,
  calculateDividendPerInvestorPaise
} from '../../services/rulesService.js';
import { logAction } from '../../middleware/audit.js';
import { withTransaction } from '../../config/db.js';
import { broadcastSyncEvent } from '../../services/sse.js';

// ==========================================
// 1. DASHBOARD & OVERVIEW (PRD 5.5 M-1 & 6.3)
// ==========================================
// 1. DASHBOARD & OVERVIEW (PRD 5.5 M-1 & 6.3)
// ==========================================
export async function getDashboardStats(req, res, next) {
  try {
    // 1. Investor Counts
    const totalInvestorsCount = await InvestorProfile.countDocuments();
    const verifiedInvestorsCount = await InvestorProfile.countDocuments({
      kycStatus: Statuses.KYC.APPROVED
    });

    // 2. Company Counts
    const registeredCompaniesCount = await Company.countDocuments();

    // 3. Opportunities / Offers Counts (Excluding equity)
    const activeOffersCount = await Offer.countDocuments({
      kind: { $ne: 'equity' },
      status: { $in: [Statuses.OFFER.OPEN, Statuses.OFFER.ACTIVE] }
    });

    // 4. Total raised across all confirmed and active investments
    const raisedAgg = await Investment.aggregate([
      { $match: { status: { $in: [Statuses.INVESTMENT.CONFIRMED, Statuses.INVESTMENT.ACTIVE, Statuses.INVESTMENT.MATURED, Statuses.INVESTMENT.COMPLETED] } } },
      { $group: { _id: null, totalPaise: { $sum: '$amountPaise' }, count: { $sum: 1 } } }
    ]);
    const totalRaisedPaise = raisedAgg[0]?.totalPaise || 0;
    const totalInvestmentsCount = raisedAgg[0]?.count || 0;

    // Active investments count
    const activeInvestmentsCount = await Investment.countDocuments({ status: Statuses.INVESTMENT.ACTIVE });

    // Upcoming payouts count & total
    const upcomingPayoutsAgg = await Payout.aggregate([
      { $match: { status: { $in: [Statuses.PAYOUT.CALCULATED, Statuses.PAYOUT.READY] } } },
      { $group: { _id: null, totalPaise: { $sum: '$amountPaise' }, count: { $sum: 1 } } }
    ]);
    const upcomingPayoutsPaise = upcomingPayoutsAgg[0]?.totalPaise || 0;
    const upcomingPayoutsCount = upcomingPayoutsAgg[0]?.count || 0;

    // Overdue repayments
    const overdueRepaymentsAgg = await Repayment.aggregate([
      { $match: { status: Statuses.REPAYMENT.OVERDUE } },
      { $group: { _id: null, totalPaise: { $sum: '$expectedPaise' }, count: { $sum: 1 } } }
    ]);
    const overdueRepaymentsPaise = overdueRepaymentsAgg[0]?.totalPaise || 0;
    const overdueRepaymentsCount = overdueRepaymentsAgg[0]?.count || 0;

    // Pending approvals
    const pendingKycCount = await InvestorProfile.countDocuments({ kycStatus: Statuses.KYC.SUBMITTED });
    const pendingKybCount = await Company.countDocuments({ status: Statuses.COMPANY.KYB_SUBMITTED });
    const pendingOffersCount = await Offer.countDocuments({ status: Statuses.OFFER.SUBMITTED });
    const pendingReleasesCount = await Release.countDocuments({ status: Statuses.RELEASE_AND_REFUND.PREPARED });
    const pendingBatchesCount = await Batch.countDocuments({ status: 'Prepared' });
    const pendingFundingRequestsCount = await InvestmentRequest.countDocuments({ status: { $in: ['Submitted', 'Under Review'] } });
    const pendingInvestorRequestsCount = await Investment.countDocuments({ status: { $in: ['Pending Review', 'Submitted', 'Pending payment', 'Under Review'] } });

    const totalPendingApprovals =
      pendingKycCount + pendingKybCount + pendingOffersCount + pendingReleasesCount + pendingBatchesCount + pendingFundingRequestsCount + pendingInvestorRequestsCount;

    // Failed payments
    const failedPayoutsCount = await Payout.countDocuments({ status: Statuses.PAYOUT.FAILED });

    // 5. Real Project / Offer Investment Distribution
    // Aggregate by project title and raised amount (excluding equity since equity was removed)
    const projectAgg = await Offer.find({
      kind: { $ne: 'equity' },
      status: { $in: [Statuses.OFFER.OPEN, Statuses.OFFER.ACTIVE, Statuses.OFFER.COMPLETED, Statuses.OFFER.CLOSED] }
    })
      .select('title targetPaise raisedPaise')
      .sort({ raisedPaise: -1, createdAt: -1 })
      .limit(6);

    const palette = ['#0047BA', '#10B981', '#FAB800', '#9333EA', '#3B82F6', '#EC4899', '#F97316'];
    let distributionData = [];

    // Calculate total either from raisedPaise or from targetPaise if newly launched
    const totalProjectFunds = projectAgg.reduce((acc, p) => acc + (p.raisedPaise > 0 ? p.raisedPaise : (p.targetPaise || 0)), 0);

    if (projectAgg.length > 0 && totalProjectFunds > 0) {
      distributionData = projectAgg.map((p, idx) => {
        const amountPaise = p.raisedPaise > 0 ? p.raisedPaise : (p.targetPaise || 0);
        const val = Math.round((amountPaise / totalProjectFunds) * 100);
        return {
          label: p.title,
          projectName: p.title,
          value: val > 0 ? val : 5,
          color: palette[idx % palette.length],
          amount: formatINR(amountPaise)
        };
      });
    } else {
      distributionData = [];
    }

    // 6. Recent Real Investors with cumulative investment amount
    const recentProfiles = await InvestorProfile.find()
      .populate('userId', 'name email status')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentInvestors = await Promise.all(
      recentProfiles.map(async p => {
        const invSum = await Investment.aggregate([
          { $match: { investorId: p.userId?._id } },
          { $group: { _id: null, total: { $sum: '$amountPaise' } } }
        ]);
        const sumPaise = invSum[0]?.total || 0;
        return {
          id: p._id,
          name: p.userId?.name || 'Investor',
          email: p.userId?.email || 'user@example.com',
          amount: sumPaise > 0 ? formatINR(sumPaise) : '₹0',
          status: p.kycStatus === 'Approved' ? 'Verified' : p.kycStatus === 'Submitted' ? 'Under Review' : 'Pending'
        };
      })
    );

    // 7. Recent Real Companies with Target Funding
    const recentComps = await Company.find()
      .populate('ownerUserId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentCompanies = await Promise.all(
      recentComps.map(async c => {
        const offerSum = await Offer.aggregate([
          { $match: { companyId: c._id } },
          { $group: { _id: null, total: { $sum: '$targetPaise' } } }
        ]);
        const targetPaise = offerSum[0]?.total || 0;
        return {
          id: c._id,
          name: c.name,
          industry: c.profile?.sector || c.pendingProfile?.sector || 'Enterprise',
          fundingRequired: targetPaise > 0 ? formatINR(targetPaise) : '₹0',
          status: c.status === 'Approved' ? 'Approved' : c.status === 'KYB_Submitted' ? 'Under Review' : c.status === 'Rejected' ? 'Rejected' : 'Pending'
        };
      })
    );

    // 8. Recent Real Transactions
    const recentInvs = await Investment.find()
      .populate('investorId', 'name email')
      .populate('offerId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentTransactions = recentInvs.map(i => ({
      id: i._id,
      date: new Date(i.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: 'Investment',
      party: i.offerId?.title || i.investorId?.name || 'Project Opportunity',
      amount: formatINR(i.amountPaise),
      status: i.status === 'Confirmed' || i.status === 'Active' || i.status === 'Completed' ? 'Completed' : 'Pending'
    }));

    // 9. Recent Activities from Audit Log
    const recentActivities = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .then(logs => logs.map(l => ({
        id: l._id,
        text: (l.action || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
        time: new Date(l.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      })));

    return res.json({
      success: true,
      stats: {
        totalInvestorsCount,
        verifiedInvestorsCount,
        registeredCompaniesCount,
        activeOffersCount,
        totalRaisedPaise,
        totalInvestmentsCount,
        activeInvestmentsCount,
        upcomingPayoutsPaise,
        upcomingPayoutsCount,
        overdueRepaymentsPaise,
        overdueRepaymentsCount,
        pendingApprovals: {
          total: totalPendingApprovals,
          kyc: pendingKycCount,
          kyb: pendingKybCount,
          offers: pendingOffersCount,
          fundingRequests: pendingFundingRequestsCount,
          investorRequests: pendingInvestorRequestsCount,
          releases: pendingReleasesCount,
          batches: pendingBatchesCount
        },
        failedPayoutsCount
      },
      distribution: distributionData,
      recentInvestors,
      recentCompanies,
      recentTransactions,
      recentActivities
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 2. WORK LIST (PRD Section 6.3)
// ==========================================
export async function getWorkList(req, res, next) {
  try {
    const rawPendingKyc = await InvestorProfile.find({ kycStatus: Statuses.KYC.SUBMITTED })
      .populate('userId', 'name email mobile')
      .sort({ updatedAt: -1 })
      .limit(10);

    const pendingKyc = await Promise.all(
      rawPendingKyc.map(async p => {
        const kyc = await KYC.findOne({ investorId: p.userId?._id });
        const documents = [
          { name: 'PAN Card', key: 'panCard', url: normalizeDocUrl(p.panCardUrl || kyc?.panDocumentUrl || '/uploads/sample-pan.png'), type: 'identity' },
          { name: kyc?.addressProofType || 'Address Proof (Aadhaar)', key: 'addressProof', url: normalizeDocUrl(p.identityProofUrl || kyc?.addressProofUrl || '/uploads/sample-aadhaar.png'), type: 'address' },
          { name: 'Cancelled Cheque', key: 'bankProof', url: normalizeDocUrl(p.cancelledChequeUrl || p.bankDetails?.chequeUrl || kyc?.bankProofUrl || '/uploads/sample-cheque.png'), type: 'financial' }
        ];
        if (kyc?.selfieUrl) {
          documents.push({ name: 'Investor Selfie', key: 'selfie', url: normalizeDocUrl(kyc.selfieUrl), type: 'identity' });
        }
        return {
          ...p.toObject(),
          documents
        };
      })
    );

    const rawPendingKyb = await Company.find({ status: Statuses.COMPANY.KYB_SUBMITTED })
      .populate('ownerUserId', 'name email mobile')
      .sort({ updatedAt: -1 })
      .limit(10);

    const pendingKyb = rawPendingKyb.map(comp => {
      const documents = [
        { name: 'Certificate of Incorporation', key: 'incorporation', url: normalizeDocUrl(comp.documents?.incorporationCertificateUrl || '/uploads/sample-incorporation.pdf'), type: 'legal' },
        { name: 'Company PAN Card', key: 'panCard', url: normalizeDocUrl(comp.documents?.panCardUrl || '/uploads/sample-company-pan.png'), type: 'identity' },
        { name: 'GST Certificate', key: 'gst', url: normalizeDocUrl(comp.documents?.gstCertificateUrl || '/uploads/sample-gst.pdf'), type: 'tax' },
        { name: 'MOA & AOA Charter', key: 'moaAoa', url: normalizeDocUrl(comp.documents?.moaAoaUrl || '/uploads/sample-moa.pdf'), type: 'legal' },
        { name: 'Shareholding Pattern', key: 'shareholding', url: normalizeDocUrl(comp.documents?.shareholdingPatternUrl || '/uploads/sample-shareholding.pdf'), type: 'compliance' },
        { name: 'Financial Statements', key: 'financials', url: normalizeDocUrl(comp.documents?.financialStatementsUrl || '/uploads/sample-financials.pdf'), type: 'financial' },
        { name: 'Cancelled Cheque', key: 'cancelledCheque', url: normalizeDocUrl(comp.bankDetails?.chequeUrl || '/uploads/sample-cheque.png'), type: 'financial' }
      ];
      return {
        ...comp.toObject(),
        documents
      };
    });

    const pendingOffers = await Offer.find({ status: Statuses.OFFER.SUBMITTED })
      .populate('companyId', 'name')
      .sort({ updatedAt: -1 })
      .limit(10);

    const pendingFundingRequests = await InvestmentRequest.find({
      status: { $in: ['Submitted', 'Under Review'] }
    })
      .populate('companyId', 'name legalName officialEmail cin pan')
      .sort({ createdAt: -1 })
      .limit(20);

    const pendingReleases = await Release.find({ status: Statuses.RELEASE_AND_REFUND.PREPARED })
      .populate('companyId', 'name bankAccount')
      .populate('offerId', 'title')
      .sort({ createdAt: -1 });

    const pendingBatches = await Batch.find({ status: 'Prepared' })
      .sort({ createdAt: -1 });

    const failedPayouts = await Payout.find({ status: Statuses.PAYOUT.FAILED })
      .populate('investorId', 'name email')
      .populate('offerId', 'title')
      .sort({ updatedAt: -1 })
      .limit(20);

    return res.json({
      success: true,
      workList: {
        pendingKyc,
        pendingKyb,
        pendingOffers,
        pendingFundingRequests,
        pendingReleases,
        pendingBatches,
        failedPayouts
      }
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 3. INVESTORS & KYC (PRD 5.1 & 6.3)
// ==========================================
export async function getInvestors(req, res, next) {
  try {
    const { status, search } = req.query;

    const userQuery = { role: Roles.INVESTOR };
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(userQuery).select('-passwordHash -twoFactorCode');
    const userIds = users.map(u => u._id);

    const profileQuery = { userId: { $in: userIds } };
    if (status) {
      profileQuery.kycStatus = status;
    }

    const profiles = await InvestorProfile.find(profileQuery).populate('userId', '-passwordHash -twoFactorCode');
    const kycs = await KYC.find({ investorId: { $in: userIds } });
    const kycMap = new Map();
    kycs.forEach(k => kycMap.set(String(k.investorId), k));

    // Aggregate investment totals per investor
    const investmentTotals = await Investment.aggregate([
      { $match: { investorId: { $in: userIds }, status: { $ne: Statuses.INVESTMENT.PENDING_PAYMENT } } },
      { $group: { _id: '$investorId', totalPaise: { $sum: '$amountPaise' }, count: { $sum: 1 } } }
    ]);
    const totalsMap = {};
    investmentTotals.forEach(item => {
      totalsMap[item._id.toString()] = item;
    });

    const result = profiles.map(p => {
      const invInfo = totalsMap[p.userId?._id?.toString()] || { totalPaise: 0, count: 0 };
      const kyc = kycMap.get(String(p.userId?._id));

      const documents = [
        { name: 'PAN Card', key: 'panCard', url: normalizeDocUrl(p.panCardUrl || kyc?.panDocumentUrl || '/uploads/sample-pan.png'), type: 'identity' },
        { name: kyc?.addressProofType || 'Address Proof (Aadhaar)', key: 'addressProof', url: normalizeDocUrl(p.identityProofUrl || kyc?.addressProofUrl || '/uploads/sample-aadhaar.png'), type: 'address' },
        { name: 'Cancelled Cheque', key: 'bankProof', url: normalizeDocUrl(p.cancelledChequeUrl || p.bankDetails?.chequeUrl || kyc?.bankProofUrl || '/uploads/sample-cheque.png'), type: 'financial' }
      ];
      if (kyc?.selfieUrl) {
        documents.push({ name: 'Investor Selfie', key: 'selfie', url: normalizeDocUrl(kyc.selfieUrl), type: 'identity' });
      }

      return {
        ...p.toObject(),
        investmentsTotalPaise: invInfo.totalPaise,
        investmentsCount: invInfo.count,
        documents
      };
    });

    return res.json({ success: true, count: result.length, investors: result });
  } catch (error) {
    next(error);
  }
}

export async function getInvestorInvestments(req, res, next) {
  try {
    const { id } = req.params; // Can be InvestorProfile _id or User _id

    let userId = id;
    const profile = await InvestorProfile.findById(id);
    if (profile && profile.userId) {
      userId = profile.userId;
    }

    const investments = await Investment.find({ investorId: userId })
      .populate({
        path: 'offerId',
        select: 'title kind status targetPaise rateBps companyId',
        populate: {
          path: 'companyId',
          select: 'name regNo sector profile'
        }
      })
      .sort({ createdAt: -1 });

    const totalInvestedPaise = investments
      .filter(i => i.status !== Statuses.INVESTMENT.PENDING_PAYMENT)
      .reduce((sum, i) => sum + (i.amountPaise || 0), 0);

    return res.json({
      success: true,
      count: investments.length,
      totalInvestedPaise,
      investments: investments.map(inv => ({
        id: inv._id,
        amountPaise: inv.amountPaise,
        monthlyReturnPaise: inv.monthlyReturnPaise,
        tenureMonths: inv.tenureMonths,
        status: inv.status,
        createdAt: inv.createdAt,
        activationDate: inv.activationDate,
        maturityDate: inv.maturityDate,
        offerTitle: inv.offerId?.title || 'Unknown Project',
        offerKind: inv.offerId?.kind || 'project',
        offerStatus: inv.offerId?.status,
        rateBps: inv.offerId?.rateBps,
        companyName: inv.offerId?.companyId?.name || 'N/A',
        companyRegNo: inv.offerId?.companyId?.regNo || 'N/A',
        companySector: inv.offerId?.companyId?.sector || inv.offerId?.companyId?.profile?.sector || 'General'
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllInvestments(req, res, next) {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status) query.status = status;

    const investments = await Investment.find(query)
      .populate('investorId', 'name email mobile')
      .populate({
        path: 'offerId',
        select: 'title kind status targetPaise rateBps companyId',
        populate: {
          path: 'companyId',
          select: 'name regNo sector'
        }
      })
      .sort({ createdAt: -1 });

    const filtered = investments.filter(inv => {
      if (!search) return true;
      const s = search.toLowerCase();
      const investorName = inv.investorId?.name?.toLowerCase() || '';
      const investorEmail = inv.investorId?.email?.toLowerCase() || '';
      const offerTitle = inv.offerId?.title?.toLowerCase() || '';
      const compName = inv.offerId?.companyId?.name?.toLowerCase() || '';
      return investorName.includes(s) || investorEmail.includes(s) || offerTitle.includes(s) || compName.includes(s);
    });

    const totalInvestedPaise = filtered
      .filter(i => i.status !== Statuses.INVESTMENT.PENDING_PAYMENT)
      .reduce((sum, i) => sum + (i.amountPaise || 0), 0);

    return res.json({
      success: true,
      count: filtered.length,
      totalInvestedPaise,
      investments: filtered.map(inv => ({
        id: inv._id,
        amountPaise: inv.amountPaise,
        monthlyReturnPaise: inv.monthlyReturnPaise,
        tenureMonths: inv.tenureMonths,
        status: inv.status,
        createdAt: inv.createdAt,
        activationDate: inv.activationDate,
        maturityDate: inv.maturityDate,
        investor: {
          id: inv.investorId?._id,
          name: inv.investorId?.name || 'Unknown Investor',
          email: inv.investorId?.email || 'N/A',
          mobile: inv.investorId?.mobile || 'N/A'
        },
        offer: {
          id: inv.offerId?._id,
          title: inv.offerId?.title || 'Unknown Project',
          kind: inv.offerId?.kind || 'project',
          status: inv.offerId?.status,
          rateBps: inv.offerId?.rateBps
        },
        company: {
          id: inv.offerId?.companyId?._id,
          name: inv.offerId?.companyId?.name || 'N/A',
          regNo: inv.offerId?.companyId?.regNo || 'N/A',
          sector: inv.offerId?.companyId?.sector || 'General'
        }
      }))
    });
  } catch (error) {
    next(error);
  }
}



export async function decideKyc(req, res, next) {
  try {
    const { id } = req.params; // Profile ID
    const { decision, reason } = req.body;

    if (![Statuses.KYC.APPROVED, Statuses.KYC.REJECTED, Statuses.KYC.MORE_INFO_NEEDED].includes(decision)) {
      return res.status(400).json({
        success: false,
        code: ErrorCodes.BAD_REQUEST,
        error: 'Invalid decision'
      });
    }

    // PRD Section 5.1 A-5: A decision cannot be saved without a reason (auto-default if approved)
    const trimmedReason = (reason && reason.trim()) || (decision === Statuses.KYC.APPROVED ? 'KYC documents verified and approved.' : '');
    if (!trimmedReason) {
      return res.status(400).json({
        success: false,
        code: ErrorCodes.BAD_REQUEST,
        error: 'A written reason is required for this KYC decision'
      });
    }

    const profile = await InvestorProfile.findById(id).populate('userId');
    if (!profile) {
      return res.status(404).json({ success: false, code: ErrorCodes.NOT_FOUND, error: 'Investor profile not found' });
    }

    const before = { kycStatus: profile.kycStatus, kycReason: profile.kycReason };
    profile.kycStatus = decision;
    profile.registrationStatus = decision;
    profile.kycReason = trimmedReason;
    profile.rejectionReason = decision === 'Approved' ? null : trimmedReason;
    if (decision === Statuses.KYC.APPROVED && profile.bankAccount) {
      profile.bankAccount.verified = true;
    }
    await profile.save();

    if (profile.userId) {
      profile.userId.registrationStatus = decision;
      profile.userId.rejectionReason = decision === 'Approved' ? null : trimmedReason;
      profile.userId.adminRemarks = trimmedReason;
      profile.userId.reviewedAt = new Date();
      profile.userId.reviewedBy = req.user._id;
      if (!profile.userId.statusHistory) profile.userId.statusHistory = [];
      profile.userId.statusHistory.push({
        status: decision,
        reason: reason.trim(),
        adminId: req.user._id,
        adminName: req.user.name,
        timestamp: new Date()
      });
      await profile.userId.save();
    }

    broadcastSyncEvent('INVESTOR_KYC', 'DECIDED', { profileId: profile._id, status: decision });
    broadcastSyncEvent('REGISTRATION_DECISION', 'DECIDED', {
      userId: profile.userId?._id,
      role: 'investor',
      decision,
      status: decision,
      reason: reason.trim()
    });

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: `KYC_${decision.toUpperCase().replace(/\s+/g, '_')}`,
      targetEntity: 'InvestorProfile',
      targetId: profile._id,
      before,
      after: { kycStatus: decision, kycReason: reason },
      reason,
      ipAddress: req.ip
    });

    return res.json({ success: true, message: `KYC marked as ${decision}`, profile });
  } catch (error) {
    next(error);
  }
}

export async function setUserBlockStatus(req, res, next) {
  try {
    const { id } = req.params; // User ID
    const { status, reason } = req.body;

    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be active or blocked' });
    }

    // PRD Section 5.1 A-7: "Admin can block or unblock an investor or company with a written reason"
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, error: 'A written reason is mandatory when changing block status' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const before = { status: user.status, blockReason: user.blockReason };
    user.status = status;
    user.blockReason = status === 'blocked' ? reason.trim() : null;
    user.accountStatus = status === 'blocked' ? 'Suspended' : 'Active';
    user.accountSuspendedReason = status === 'blocked' ? reason.trim() : null;
    await user.save();

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: status === 'blocked' ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
      targetEntity: 'User',
      targetId: user._id,
      before,
      after: { status, blockReason: user.blockReason },
      reason,
      ipAddress: req.ip
    });

    broadcastSyncEvent('ACCOUNT_STATUS_CHANGED', 'UPDATED', {
      userId: user._id,
      role: user.role || 'investor',
      accountStatus: user.accountStatus,
      reason: user.accountSuspendedReason
    });

    return res.json({ success: true, message: `User status updated to ${status}`, user });
  } catch (error) {
    next(error);
  }
}

export async function suspendInvestorFunding(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body; // 'Allowed' | 'Suspended' | 'Revoked'

    if (!['Allowed', 'Suspended', 'Revoked'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be Allowed, Suspended, or Revoked' });
    }
    if ((status === 'Suspended' || status === 'Revoked') && (!reason || !reason.trim())) {
      return res.status(400).json({ success: false, error: 'A written reason is required when suspending or revoking funding privileges' });
    }

    let user = await User.findById(id);
    if (!user) {
      const profile = await InvestorProfile.findById(id);
      if (profile && profile.userId) {
        user = await User.findById(profile.userId);
      }
    }
    if (!user) return res.status(404).json({ success: false, error: 'Investor not found' });

    const prev = user.fundingStatus || 'Allowed';
    user.fundingStatus = status;
    user.fundingSuspendedReason = status === 'Allowed' ? null : reason.trim();
    user.fundingSuspendedAt = status === 'Allowed' ? null : new Date();
    user.fundingSuspendedBy = status === 'Allowed' ? null : req.user._id;

    if (!user.suspensionHistory) user.suspensionHistory = [];
    user.suspensionHistory.push({
      action: status === 'Allowed' ? 'REACTIVATE_FUNDING' : (status === 'Suspended' ? 'SUSPEND_FUNDING' : 'REVOKE_FUNDING'),
      type: 'funding',
      previousStatus: prev,
      newStatus: status,
      reason: reason ? reason.trim() : 'Reinstated by Admin',
      adminId: req.user._id,
      adminName: req.user.name || 'Admin',
      timestamp: new Date()
    });

    await user.save();

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: status === 'Allowed' ? 'INVESTOR_FUNDING_RESTORED' : 'INVESTOR_FUNDING_SUSPENDED',
      targetEntity: 'User',
      targetId: user._id,
      before: { fundingStatus: prev },
      after: { fundingStatus: status, reason: user.fundingSuspendedReason },
      reason,
      ipAddress: req.ip
    });

    await Notification.create({
      investorId: user._id,
      title: status === 'Allowed' ? 'Funding Privileges Restored' : `Funding Privileges ${status}`,
      message: status === 'Allowed'
        ? 'Your investment privileges on Connect Invest have been re-enabled.'
        : `Your ability to execute investments has been ${status.toLowerCase()} by administration.${reason ? ' Reason: ' + reason.trim() : ''}`,
      type: 'system',
      link: '/investor/dashboard'
    });

    broadcastSyncEvent('FUNDING_STATUS_CHANGED', 'UPDATED', {
      userId: user._id,
      role: 'investor',
      fundingStatus: status,
      reason: user.fundingSuspendedReason
    });

    return res.json({
      success: true,
      message: `Investor funding privileges updated to ${status}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        fundingStatus: user.fundingStatus,
        fundingSuspendedReason: user.fundingSuspendedReason
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function suspendInvestorAccount(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body; // 'Active' | 'Suspended' | 'Revoked'

    if (!['Active', 'Suspended', 'Revoked'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be Active, Suspended, or Revoked' });
    }
    if ((status === 'Suspended' || status === 'Revoked') && (!reason || !reason.trim())) {
      return res.status(400).json({ success: false, error: 'A written reason is required when suspending or revoking an account' });
    }

    let user = await User.findById(id);
    if (!user) {
      const profile = await InvestorProfile.findById(id);
      if (profile && profile.userId) {
        user = await User.findById(profile.userId);
      }
    }
    if (!user) return res.status(404).json({ success: false, error: 'Investor not found' });

    const prev = user.accountStatus || 'Active';
    user.accountStatus = status;
    user.accountSuspendedReason = status === 'Active' ? null : reason.trim();
    user.accountSuspendedAt = status === 'Active' ? null : new Date();
    user.accountSuspendedBy = status === 'Active' ? null : req.user._id;
    user.status = status === 'Active' ? 'active' : 'blocked';
    user.blockReason = status === 'Active' ? null : reason.trim();

    if (!user.suspensionHistory) user.suspensionHistory = [];
    user.suspensionHistory.push({
      action: status === 'Active' ? 'REACTIVATE_ACCOUNT' : (status === 'Suspended' ? 'SUSPEND_ACCOUNT' : 'REVOKE_ACCOUNT'),
      type: 'account',
      previousStatus: prev,
      newStatus: status,
      reason: reason ? reason.trim() : 'Reactivated by Admin',
      adminId: req.user._id,
      adminName: req.user.name || 'Admin',
      timestamp: new Date()
    });

    await user.save();

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: status === 'Active' ? 'INVESTOR_ACCOUNT_REACTIVATED' : 'INVESTOR_ACCOUNT_SUSPENDED',
      targetEntity: 'User',
      targetId: user._id,
      before: { accountStatus: prev },
      after: { accountStatus: status, reason: user.accountSuspendedReason },
      reason,
      ipAddress: req.ip
    });

    broadcastSyncEvent('ACCOUNT_STATUS_CHANGED', 'UPDATED', {
      userId: user._id,
      role: 'investor',
      accountStatus: status,
      reason: user.accountSuspendedReason
    });

    return res.json({
      success: true,
      message: `Investor account status updated to ${status}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus,
        accountSuspendedReason: user.accountSuspendedReason
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function suspendCompanyFunding(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body; // 'Allowed' | 'Suspended' | 'Revoked'

    if (!['Allowed', 'Suspended', 'Revoked'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be Allowed, Suspended, or Revoked' });
    }
    if ((status === 'Suspended' || status === 'Revoked') && (!reason || !reason.trim())) {
      return res.status(400).json({ success: false, error: 'A written reason is required when suspending or revoking fundraising privileges' });
    }

    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ success: false, error: 'Company not found' });

    const prev = company.fundingStatus || 'Allowed';
    company.fundingStatus = status;
    company.fundingSuspendedReason = status === 'Allowed' ? null : reason.trim();
    company.fundingSuspendedAt = status === 'Allowed' ? null : new Date();
    company.fundingSuspendedBy = status === 'Allowed' ? null : req.user._id;

    if (!company.suspensionHistory) company.suspensionHistory = [];
    company.suspensionHistory.push({
      action: status === 'Allowed' ? 'REACTIVATE_FUNDING' : (status === 'Suspended' ? 'SUSPEND_FUNDING' : 'REVOKE_FUNDING'),
      type: 'funding',
      previousStatus: prev,
      newStatus: status,
      reason: reason ? reason.trim() : 'Reinstated by Admin',
      adminId: req.user._id,
      adminName: req.user.name || 'Admin',
      timestamp: new Date()
    });

    await company.save();

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: status === 'Allowed' ? 'COMPANY_FUNDING_RESTORED' : 'COMPANY_FUNDING_SUSPENDED',
      targetEntity: 'Company',
      targetId: company._id,
      before: { fundingStatus: prev },
      after: { fundingStatus: status, reason: company.fundingSuspendedReason },
      reason,
      ipAddress: req.ip
    });

    await Notification.create({
      companyId: company._id,
      title: status === 'Allowed' ? 'Fundraising Privileges Restored' : `Fundraising Privileges ${status}`,
      message: status === 'Allowed'
        ? 'Your company can now create funding requests and raise capital.'
        : `Fundraising privileges for ${company.legalName || company.name} have been ${status.toLowerCase()} by administration.${reason ? ' Reason: ' + reason.trim() : ''}`,
      type: 'system',
      link: '/company/dashboard'
    });

    broadcastSyncEvent('FUNDING_STATUS_CHANGED', 'UPDATED', {
      companyId: company._id,
      role: 'company',
      fundingStatus: status,
      reason: company.fundingSuspendedReason
    });

    return res.json({
      success: true,
      message: `Company fundraising privileges updated to ${status}`,
      company: {
        id: company._id,
        name: company.legalName || company.name,
        fundingStatus: company.fundingStatus,
        fundingSuspendedReason: company.fundingSuspendedReason
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function suspendCompanyAccount(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body; // 'Active' | 'Suspended' | 'Revoked'

    if (!['Active', 'Suspended', 'Revoked'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be Active, Suspended, or Revoked' });
    }
    if ((status === 'Suspended' || status === 'Revoked') && (!reason || !reason.trim())) {
      return res.status(400).json({ success: false, error: 'A written reason is required when suspending or revoking a company account' });
    }

    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ success: false, error: 'Company not found' });

    const prev = company.accountStatus || 'Active';
    company.accountStatus = status;
    company.accountSuspendedReason = status === 'Active' ? null : reason.trim();
    company.accountSuspendedAt = status === 'Active' ? null : new Date();
    company.accountSuspendedBy = status === 'Active' ? null : req.user._id;
    company.status = status === 'Active' ? 'Active' : 'Suspended';

    if (!company.suspensionHistory) company.suspensionHistory = [];
    company.suspensionHistory.push({
      action: status === 'Active' ? 'REACTIVATE_ACCOUNT' : (status === 'Suspended' ? 'SUSPEND_ACCOUNT' : 'REVOKE_ACCOUNT'),
      type: 'account',
      previousStatus: prev,
      newStatus: status,
      reason: reason ? reason.trim() : 'Reactivated by Admin',
      adminId: req.user._id,
      adminName: req.user.name || 'Admin',
      timestamp: new Date()
    });

    await company.save();

    // Also update associated owner user accountStatus & block status
    if (company.ownerUserId || company.userId) {
      const ownerId = company.ownerUserId || company.userId;
      const ownerUser = await User.findById(ownerId);
      if (ownerUser) {
        ownerUser.accountStatus = status;
        ownerUser.accountSuspendedReason = company.accountSuspendedReason;
        ownerUser.status = status === 'Active' ? 'active' : 'blocked';
        ownerUser.blockReason = company.accountSuspendedReason;
        await ownerUser.save();
      }
    }

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: status === 'Active' ? 'COMPANY_ACCOUNT_REACTIVATED' : 'COMPANY_ACCOUNT_SUSPENDED',
      targetEntity: 'Company',
      targetId: company._id,
      before: { accountStatus: prev },
      after: { accountStatus: status, reason: company.accountSuspendedReason },
      reason,
      ipAddress: req.ip
    });

    broadcastSyncEvent('ACCOUNT_STATUS_CHANGED', 'UPDATED', {
      companyId: company._id,
      role: 'company',
      accountStatus: status,
      reason: company.accountSuspendedReason
    });

    return res.json({
      success: true,
      message: `Company account status updated to ${status}`,
      company: {
        id: company._id,
        name: company.legalName || company.name,
        accountStatus: company.accountStatus,
        accountSuspendedReason: company.accountSuspendedReason
      }
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 4. COMPANIES & KYB (PRD 5.1, 5.2 & 6.3)
// ==========================================
export async function getCompanies(req, res, next) {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    const companies = await Company.find(query).populate('ownerUserId', 'name email mobile status');

    // Attach cooling-off calculation, projects count, and compliance documents
    const enriched = await Promise.all(
      companies.map(async comp => {
        const cooling = checkBankCoolingOff(comp.bankAccount?.effectiveFrom);
        const projectsCount = await Offer.countDocuments({ companyId: comp._id });

        const documents = [
          { name: 'Certificate of Incorporation', key: 'incorporation', url: normalizeDocUrl(comp.documents?.incorporationCertificateUrl || '/uploads/sample-incorporation.pdf'), type: 'legal' },
          { name: 'Company PAN Card', key: 'panCard', url: normalizeDocUrl(comp.documents?.panCardUrl || '/uploads/sample-company-pan.png'), type: 'identity' },
          { name: 'GST Certificate', key: 'gst', url: normalizeDocUrl(comp.documents?.gstCertificateUrl || '/uploads/sample-gst.pdf'), type: 'tax' },
          { name: 'MOA & AOA Charter', key: 'moaAoa', url: normalizeDocUrl(comp.documents?.moaAoaUrl || '/uploads/sample-moa.pdf'), type: 'legal' },
          { name: 'Shareholding Pattern', key: 'shareholding', url: normalizeDocUrl(comp.documents?.shareholdingPatternUrl || '/uploads/sample-shareholding.pdf'), type: 'compliance' },
          { name: 'Audited Financial Statements', key: 'financials', url: normalizeDocUrl(comp.documents?.financialStatementsUrl || '/uploads/sample-financials.pdf'), type: 'financial' },
          { name: 'Cancelled Cheque', key: 'cancelledCheque', url: normalizeDocUrl(comp.bankDetails?.chequeUrl || '/uploads/sample-cheque.png'), type: 'financial' }
        ];

        return {
          ...comp.toObject(),
          bankCoolingOff: cooling,
          projectsCount,
          documents
        };
      })
    );

    return res.json({ success: true, count: enriched.length, companies: enriched });
  } catch (error) {
    next(error);
  }
}

export async function createCompany(req, res, next) {
  try {
    const { name, regNo, ownerName, ownerEmail, ownerMobile, profile, bankAccount } = req.body;

    if (!name || !regNo || !ownerName || !ownerEmail) {
      return res.status(400).json({
        success: false,
        code: ErrorCodes.BAD_REQUEST,
        error: 'Company name, registration number, owner name, and owner email are required'
      });
    }

    // Check if company regNo already exists
    const existingComp = await Company.findOne({ regNo: regNo.trim() });
    if (existingComp) {
      return res.status(400).json({ success: false, error: 'A company with this registration number already exists' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: ownerEmail.toLowerCase().trim() });
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpires = new Date(Date.now() + Constraints.INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    if (!user) {
      user = await User.create({
        role: Roles.COMPANY_OWNER,
        name: ownerName.trim(),
        email: ownerEmail.toLowerCase().trim(),
        mobile: ownerMobile,
        passwordHash: 'INVITATION_PENDING',
        invitationToken: inviteToken,
        invitationExpiresAt: inviteExpires
      });
    }

    const initialStatus = req.body.autoApprove === false ? Statuses.COMPANY.INVITED : Statuses.COMPANY.APPROVED;

    const company = await Company.create({
      name: name.trim(),
      regNo: regNo.trim(),
      ownerUserId: user._id,
      status: initialStatus,
      profile: profile || {},
      bankAccount: bankAccount
        ? {
            ...bankAccount,
            verified: true,
            effectiveFrom: new Date()
          }
        : undefined
    });

    broadcastSyncEvent('COMPANY', 'CREATED', { companyId: company._id, name: company.name });

    await logAction({
      targetEntity: 'Company',
      targetId: company._id,
      after: { name, regNo, ownerEmail },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: 'Company created successfully',
      company,
      invitationLink: `/company/onboarding?token=${inviteToken}`
    });
  } catch (error) {
    next(error);
  }
}

export async function decideKyb(req, res, next) {
  try {
    const { id } = req.params;
    const { decision, reason } = req.body;

    if (![Statuses.COMPANY.APPROVED, Statuses.COMPANY.REJECTED].includes(decision)) {
      return res.status(400).json({ success: false, error: 'Decision must be Approved or Rejected' });
    }

    // PRD Section 4.1 & 5.1 A-6: A written reason is required (auto-default if approved)
    const trimmedReason = (reason && reason.trim()) || (decision === Statuses.COMPANY.APPROVED ? 'KYB corporate documents verified and approved.' : '');
    if (!trimmedReason) {
      return res.status(400).json({ success: false, error: 'A written reason is required for KYB decision' });
    }

    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ success: false, error: 'Company not found' });

    const before = { status: company.status, statusReason: company.statusReason };
    company.status = decision;
    company.registrationStatus = decision;
    company.verificationStatus = decision;
    company.statusReason = trimmedReason;
    company.rejectionReason = decision === 'Approved' ? null : trimmedReason;
    if (decision === Statuses.COMPANY.APPROVED && company.bankAccount) {
      company.bankAccount.verified = true;
    }
    await company.save();

    const owner = await User.findById(company.ownerUserId || company.userId);
    if (owner) {
      owner.registrationStatus = decision;
      owner.rejectionReason = decision === 'Approved' ? null : trimmedReason;
      owner.adminRemarks = trimmedReason;
      owner.reviewedAt = new Date();
      owner.reviewedBy = req.user._id;
      if (!owner.statusHistory) owner.statusHistory = [];
      owner.statusHistory.push({
        status: decision,
        reason: reason.trim(),
        adminId: req.user._id,
        adminName: req.user.name,
        timestamp: new Date()
      });
      await owner.save();
    }

    broadcastSyncEvent('COMPANY_KYB', 'DECIDED', { companyId: company._id, status: decision });
    broadcastSyncEvent('REGISTRATION_DECISION', 'DECIDED', {
      companyId: company._id,
      userId: owner?._id,
      role: 'company',
      legalName: company.legalName,
      decision,
      status: decision,
      reason: reason.trim()
    });

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: `KYB_${decision.toUpperCase()}`,
      targetEntity: 'Company',
      targetId: company._id,
      before,
      after: { status: decision, statusReason: reason },
      reason,
      ipAddress: req.ip
    });

    return res.json({ success: true, message: `KYB decision saved: ${decision}`, company });
  } catch (error) {
    next(error);
  }
}

export async function deleteCompany(req, res, next) {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    // Check if company has active offers with capital
    const activeOffers = await Offer.find({
      companyId: company._id,
      status: { $in: [Statuses.OFFER.ACTIVE, Statuses.OFFER.OPEN] }
    });

    if (activeOffers.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete company with ${activeOffers.length} Active or Open project(s). Hold or cancel projects first.`
      });
    }

    // Cascade delete any non-active draft/submitted offers belonging to this company
    await Offer.deleteMany({ companyId: company._id, status: { $in: [Statuses.OFFER.DRAFT, Statuses.OFFER.SUBMITTED, Statuses.OFFER.CANCELLED] } });
    await Company.findByIdAndDelete(id);

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'COMPANY_DELETED',
      targetEntity: 'Company',
      targetId: company._id,
      before: { name: company.name, regNo: company.regNo },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: `Company "${company.name}" has been deleted.` });
  } catch (error) {
    next(error);
  }
}


// ==========================================
// 5. OFFERS & TERM SETTING (PRD 5.2 & 6.3)
// ==========================================
export async function getOffers(req, res, next) {
  try {
    const { status, kind } = req.query;
    const query = {};
    if (status) query.status = status;
    if (kind) query.kind = kind;

    const offers = await Offer.find(query).populate('companyId', 'name regNo status bankAccount').sort({ createdAt: -1 });

    return res.json({ success: true, count: offers.length, offers });
  } catch (error) {
    next(error);
  }
}

export async function createOffer(req, res, next) {
  try {
    const {
      kind,
      companyId,
      title,
      description,
      useOfFunds,
      targetPaise,
      minTargetPaise,
      rateBps,
      tenures,
      perInvestorLimitPaise,
      milestones,
      // Equity fields
      sharePricePaise,
      faceValuePaise,
      preMoneyValuationPaise,
      equityInstrument,
      minShares,
      hasVotingRights
    } = req.body;

    if (!kind || !companyId || !title || !targetPaise) {
      return res.status(400).json({ success: false, error: 'Missing required offer fields (kind, companyId, title, targetPaise)' });
    }

    if (kind === OfferKind.EQUITY) {
      if (!sharePricePaise || sharePricePaise <= 0) {
        return res.status(400).json({ success: false, error: 'Share price is required for equity investments' });
      }
    } else {
      if (rateBps === undefined || rateBps === null || !tenures || tenures.length === 0) {
        return res.status(400).json({ success: false, error: 'rateBps and tenures are required for debt investments' });
      }
      // PRD Section 5.2 C-4 & C-5: Validate tenures
      const tenureValidation = validateOfferTenures(kind, tenures);
      if (!tenureValidation.valid) {
        return res.status(400).json({
          success: false,
          code: ErrorCodes.TENURE_NOT_ALLOWED,
          error: tenureValidation.error
        });
      }
    }

    if (minTargetPaise && minTargetPaise > targetPaise) {
      return res.status(400).json({
        success: false,
        error: 'Minimum target cannot be higher than the total target amount'
      });
    }

    const activationDate = new Date();
    let maturityDate = null;
    if (kind !== OfferKind.EQUITY && tenures && tenures.length > 0) {
      const maxTenure = Math.max(...tenures);
      maturityDate = new Date(activationDate);
      maturityDate.setMonth(maturityDate.getMonth() + maxTenure);
    }

    // Equity calculations
    let totalSharesOffered = null;
    let equityOfferedPercentage = null;
    let postMoneyValuationPaise = null;
    if (kind === OfferKind.EQUITY) {
      totalSharesOffered = Math.floor(targetPaise / sharePricePaise);
      if (preMoneyValuationPaise) {
        postMoneyValuationPaise = preMoneyValuationPaise + targetPaise;
        equityOfferedPercentage = calculateEquityDilutionPct(targetPaise, preMoneyValuationPaise);
      }
    }

    const offer = await Offer.create({
      kind,
      companyId,
      title: title.trim(),
      description,
      useOfFunds,
      targetPaise,
      minTargetPaise: minTargetPaise || targetPaise,
      rateBps: kind === OfferKind.EQUITY ? 0 : rateBps,
      tenures: kind === OfferKind.EQUITY ? [] : tenures,
      perInvestorLimitPaise: perInvestorLimitPaise || targetPaise,
      status: Statuses.OFFER.ACTIVE,
      activationDate,
      maturityDate,
      windowStart: activationDate,
      windowEnd: maturityDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      milestones: milestones || [],
      // Equity fields
      sharePricePaise: kind === OfferKind.EQUITY ? sharePricePaise : null,
      faceValuePaise: kind === OfferKind.EQUITY ? (faceValuePaise || 1000) : null,
      preMoneyValuationPaise: kind === OfferKind.EQUITY ? preMoneyValuationPaise : null,
      postMoneyValuationPaise: kind === OfferKind.EQUITY ? postMoneyValuationPaise : null,
      totalSharesOffered: kind === OfferKind.EQUITY ? totalSharesOffered : null,
      equityOfferedPercentage: kind === OfferKind.EQUITY ? equityOfferedPercentage : null,
      equityInstrument: kind === OfferKind.EQUITY ? (equityInstrument || 'equity_shares') : 'equity_shares',
      minShares: kind === OfferKind.EQUITY ? (minShares || 1) : 1,
      hasVotingRights: kind === OfferKind.EQUITY ? Boolean(hasVotingRights) : false
    });

    broadcastSyncEvent('OFFER', 'CREATED', { offerId: offer._id, title: offer.title });

    await logAction({
      targetEntity: 'Offer',
      targetId: offer._id,
      after: { title, kind, targetPaise, rateBps: offer.rateBps, status: Statuses.OFFER.ACTIVE },
      ipAddress: req.ip
    });

    return res.status(201).json({ success: true, message: 'Investment created and Active immediately', offer });
  } catch (error) {
    next(error);
  }
}

export async function setOfferTerms(req, res, next) {
  try {
    const { id } = req.params;
    const {
      fundingWindowDays,
      targetPaise,
      minTargetPaise,
      rateBps,
      tenures,
      perInvestorLimitPaise,
      termsBody
    } = req.body;

    const offer = await Offer.findById(id);
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });

    // Validate tenures
    if (tenures) {
      const tenureCheck = validateOfferTenures(offer.kind, tenures);
      if (!tenureCheck.valid) {
        return res.status(400).json({ success: false, code: ErrorCodes.TENURE_NOT_ALLOWED, error: tenureCheck.error });
      }
      offer.tenures = tenures;
    }

    if (targetPaise) offer.targetPaise = targetPaise;
    if (minTargetPaise) {
      if (minTargetPaise > offer.targetPaise) {
        return res.status(400).json({ success: false, error: 'Minimum target cannot exceed target amount' });
      }
      offer.minTargetPaise = minTargetPaise;
    }
    if (rateBps) offer.rateBps = rateBps;
    if (perInvestorLimitPaise) offer.perInvestorLimitPaise = perInvestorLimitPaise;

    if (fundingWindowDays) {
      offer.windowStart = new Date();
      offer.windowEnd = new Date(Date.now() + fundingWindowDays * 24 * 60 * 60 * 1000);
    }

    // PRD Section 5.2 C-4: Moves to Approved (awaiting company owner acceptance)
    offer.status = Statuses.OFFER.APPROVED;
    await offer.save();

    // Create or increment terms version (PRD Section 5.2 C-7)
    const latestTerms = await OfferTerms.findOne({ offerId: offer._id }).sort({ version: -1 });
    const nextVersion = latestTerms ? latestTerms.version + 1 : 1;

    const termsRecord = await OfferTerms.create({
      offerId: offer._id,
      version: nextVersion,
      body:
        termsBody ||
        (offer.kind === OfferKind.EQUITY
          ? `Equity Shareholding terms for ${offer.title} offering ${offer.equityOfferedPercentage || 0}% equity at ${formatINR(offer.sharePricePaise)} per share.`
          : `Standard terms for ${offer.title} at ${offer.rateBps} bps monthly return.`),
      acceptedByCompanyAt: null
    });

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'OFFER_TERMS_CONFIGURED',
      targetEntity: 'Offer',
      targetId: offer._id,
      after: { targetPaise: offer.targetPaise, rateBps: offer.rateBps, tenures: offer.tenures, version: nextVersion },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Offer terms configured and sent for company acceptance',
      offer,
      terms: termsRecord
    });
  } catch (error) {
    next(error);
  }
}

export async function publishOffer(req, res, next) {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });

    // PRD Section 5.2 C-6: "The company owner must accept the final terms before the admin can publish"
    let latestTerms = await OfferTerms.findOne({ offerId: offer._id }).sort({ version: -1 });
    if (!latestTerms || !latestTerms.acceptedByCompanyAt) {
      // In single-admin dev / direct publish mode, we allow recording immediate owner acceptance if flagged
      if (req.body.forceAccept) {
        if (!latestTerms) {
          latestTerms = new OfferTerms({
            offerId: offer._id,
            version: 1,
            targetPaise: offer.targetPaise,
            minTargetPaise: offer.minTargetPaise || offer.targetPaise,
            rateBps: offer.rateBps || 300,
            tenures: offer.tenures?.length ? offer.tenures : [12],
            fundingWindowDays: 30,
            termsBody: `Standard terms agreed for ${offer.title}`,
            acceptedByCompanyAt: new Date()
          });
        } else {
          latestTerms.acceptedByCompanyAt = new Date();
        }
        await latestTerms.save();
      } else {
        return res.status(400).json({
          success: false,
          error: 'Cannot publish offer until company owner accepts final terms (PRD Section 5.2 C-6)'
        });
      }
    }

    offer.status = Statuses.OFFER.OPEN;
    if (!offer.windowStart) offer.windowStart = new Date();
    if (!offer.windowEnd) offer.windowEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 day default window
    await offer.save();

    broadcastSyncEvent('OFFER', 'PUBLISHED', { offerId: offer._id, status: offer.status });

    await logAction({
      targetEntity: 'Offer',
      targetId: offer._id,
      after: { status: Statuses.OFFER.OPEN },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Offer is now OPEN for investor funding', offer });
  } catch (error) {
    next(error);
  }
}

export async function activateOffer(req, res, next) {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id).populate('companyId');
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });

    // Check minimum funding target met (PRD Section 3.3 rule 4)
    if (offer.raisedPaise < offer.minTargetPaise) {
      return res.status(400).json({
        success: false,
        error: `Cannot activate offer: raised amount (${formatINR(offer.raisedPaise)}) has not reached minimum target (${formatINR(offer.minTargetPaise)})`
      });
    }

    const activationDate = new Date();
    let maturityDate = null;
    let maxTenure = 0;
    if (offer.kind !== OfferKind.EQUITY && offer.tenures && offer.tenures.length > 0) {
      maxTenure = Math.max(...offer.tenures);
      maturityDate = new Date(activationDate);
      maturityDate.setMonth(maturityDate.getMonth() + maxTenure);
    }

    offer.status = Statuses.OFFER.ACTIVE;
    offer.activationDate = activationDate;
    offer.maturityDate = maturityDate;
    await offer.save();

    broadcastSyncEvent('OFFER', 'ACTIVATED', { offerId: offer._id, status: Statuses.OFFER.ACTIVE });

    // Activate all confirmed investments in this offer (PRD Section 5.4 F-2)
    const confirmedInvestments = await Investment.find({
      offerId: offer._id,
      status: Statuses.INVESTMENT.CONFIRMED
    });

    for (const inv of confirmedInvestments) {
      inv.status = Statuses.INVESTMENT.ACTIVE;
      inv.activationDate = activationDate;

      if (offer.kind === OfferKind.EQUITY) {
        inv.maturityDate = null;
        if (offer.sharePricePaise && offer.sharePricePaise > 0) {
          inv.sharesAllotted = Math.floor(inv.amountPaise / offer.sharePricePaise);
          inv.sharePricePaise = offer.sharePricePaise;
          if (offer.totalSharesOffered && offer.totalSharesOffered > 0) {
            inv.ownershipPercentage = Number(((inv.sharesAllotted / offer.totalSharesOffered) * (offer.equityOfferedPercentage || 100)).toFixed(3));
          }
        }
        inv.allotmentStatus = 'Allotted';
      } else {
        const invMaturity = new Date(activationDate);
        invMaturity.setMonth(invMaturity.getMonth() + (inv.tenureMonths || maxTenure));
        inv.maturityDate = invMaturity;
      }
      await inv.save();
    }

    // Auto-create fund release record for company (prepared state)
    const release = await Release.create({
      offerId: offer._id,
      companyId: offer.companyId._id,
      amountPaise: offer.raisedPaise,
      adminId: req.user._id,
      status: Statuses.RELEASE_AND_REFUND.PREPARED,
      bankAccountSnapshot: offer.companyId.bankAccount
    });

    // Only generate debt repayment schedule for project and company debt offers
    if (offer.kind !== OfferKind.EQUITY && maxTenure > 0) {
      // Monthly return repayment amount owed by company
      const monthlyReturnRepayment = confirmedInvestments.reduce((acc, curr) => acc + curr.monthlyReturnPaise, 0);

      for (let m = 1; m <= maxTenure; m++) {
        const dueDate = new Date(activationDate);
        dueDate.setMonth(dueDate.getMonth() + m);
        dueDate.setDate(dueDate.getDate() - 5); // 5 days prior per PRD Section 3.5

        const payoutDate = new Date(activationDate);
        payoutDate.setMonth(payoutDate.getMonth() + m);

        await Repayment.create({
          offerId: offer._id,
          dueDate,
          payoutDate,
          kind: 'return',
          expectedPaise: monthlyReturnRepayment,
          status: Statuses.REPAYMENT.UPCOMING
        });
      }

      // Principal repayment at maturity
      if (maturityDate) {
        await Repayment.create({
          offerId: offer._id,
          dueDate: new Date(maturityDate.getTime() - 5 * 24 * 60 * 60 * 1000),
          payoutDate: maturityDate,
          kind: 'principal',
          expectedPaise: offer.raisedPaise,
          status: Statuses.REPAYMENT.UPCOMING
        });
      }
    }

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'OFFER_ACTIVATED',
      targetEntity: 'Offer',
      targetId: offer._id,
      after: { status: Statuses.OFFER.ACTIVE, activationDate, maturityDate, releaseId: release._id },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Offer activated! Investments are Active, schedule generated, and fund release is prepared.',
      offer,
      release
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleOfferHold(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const offer = await Offer.findById(id);
    if (!offer) return res.status(404).json({ success: false, error: 'Project not found' });

    const isPaused = offer.status === Statuses.OFFER.PAUSED;
    // Toggle between Active/Open and Paused
    const nextStatus = isPaused ? Statuses.OFFER.ACTIVE : Statuses.OFFER.PAUSED;

    const before = { status: offer.status };
    offer.status = nextStatus;
    await offer.save();

    broadcastSyncEvent('OFFER', 'STATUS_CHANGED', { offerId: offer._id, status: nextStatus });

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: isPaused ? 'OFFER_UNHELD' : 'OFFER_HOLD_FUNDING',
      targetEntity: 'Offer',
      targetId: offer._id,
      before,
      after: { status: nextStatus },
      reason: reason || (isPaused ? 'Resumed funding' : 'Funding placed on hold by Admin'),
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: isPaused ? 'Project funding resumed and set to Active' : 'Project funding placed on HOLD (Paused)',
      offer
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteOffer(req, res, next) {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);
    if (!offer) return res.status(404).json({ success: false, error: 'Project not found' });

    // Check if there are active paid investments
    const paidInvestments = await Investment.countDocuments({
      offerId: offer._id,
      status: { $in: [Statuses.INVESTMENT.CONFIRMED, Statuses.INVESTMENT.ACTIVE] }
    });

    if (paidInvestments > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete project with ${paidInvestments} confirmed investment(s). Refund or cancel investments first.`
      });
    }

    await Investment.deleteMany({ offerId: offer._id });
    await OfferTerms.deleteMany({ offerId: offer._id });
    await Offer.findByIdAndDelete(id);

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'OFFER_DELETED',
      targetEntity: 'Offer',
      targetId: offer._id,
      before: { title: offer.title, targetPaise: offer.targetPaise },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Project "${offer.title}" has been deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
}


// ==========================================
// 6. FUND RELEASES (PRD 5.4 F-3 & 6.3)
// ==========================================
export async function getReleases(req, res, next) {
  try {
    const releases = await Release.find()
      .populate('companyId', 'name legalName bankAccount bankDetails status')
      .populate('offerId', 'title raisedPaise targetPaise')
      .populate('investmentOfferId', 'title raisedAmount targetAmount companyName')
      .populate('investmentId', 'amount amountInvested amountPaise createdAt')
      .sort({ createdAt: -1 });

    const enriched = releases.map(r => {
      const cooling = checkBankCoolingOff(r.companyId?.bankAccount?.effectiveFrom);
      return {
        ...r.toObject(),
        bankCoolingOff: cooling
      };
    });

    return res.json({ success: true, count: enriched.length, releases: enriched });
  } catch (error) {
    next(error);
  }
}

export async function approveRelease(req, res, next) {
  try {
    const { id } = req.params;
    const { reference } = req.body;

    const release = await Release.findById(id).populate('companyId');
    if (!release) return res.status(404).json({ success: false, error: 'Release record not found' });

    if (release.status === Statuses.RELEASE_AND_REFUND.RELEASED) {
      return res.status(400).json({ success: false, error: 'Funds have already been released' });
    }

    // PRD Section 5.4 F-3: Cooling-off check
    const cooling = checkBankCoolingOff(release.companyId?.bankAccount?.effectiveFrom);
    if (cooling.inCoolingOff) {
      return res.status(400).json({
        success: false,
        code: ErrorCodes.BANK_IN_COOLING_OFF,
        error: `Cannot release funds: Company bank account is in 3-day cooling-off period (${cooling.hoursRemaining} hours remaining)`
      });
    }

    const before = { status: release.status };
    release.status = Statuses.RELEASE_AND_REFUND.RELEASED;
    release.reference = reference || `REL-${Date.now().toString().slice(-8)}`;
    release.releasedAt = new Date();
    await release.save();

    // Write balancing entry to immutable ledger (PRD Section 8.1 & 10.3)
    await Ledger.create({
      account: 'COMPANY_DISBURSEMENT',
      debitPaise: release.amountPaise,
      creditPaise: 0,
      refType: 'RELEASE',
      refId: release._id,
      description: `Disbursement of ${formatINR(release.amountPaise)} to ${release.companyId.name} Ref: ${release.reference}`
    });

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'FUND_RELEASE_APPROVED',
      targetEntity: 'Release',
      targetId: release._id,
      before,
      after: { status: release.status, reference: release.reference },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Funds of ${formatINR(release.amountPaise)} successfully released to company`,
      release
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 7. REPAYMENTS MONITOR (PRD 5.4 F-6 & 6.3)
// ==========================================
export async function getRepayments(req, res, next) {
  try {
    const { status, offerId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (offerId) query.offerId = offerId;

    const repayments = await Repayment.find(query)
      .populate({
        path: 'offerId',
        select: 'title companyId targetPaise',
        populate: { path: 'companyId', select: 'name bankAccount' }
      })
      .sort({ dueDate: 1 });

    return res.json({ success: true, count: repayments.length, repayments });
  } catch (error) {
    next(error);
  }
}

export async function confirmRepaymentReceipt(req, res, next) {
  try {
    const { id } = req.params;
    const { reference, receivedPaise } = req.body;

    const repayment = await Repayment.findById(id).populate('offerId');
    if (!repayment) return res.status(404).json({ success: false, error: 'Repayment record not found' });

    if (!reference) {
      return res.status(400).json({ success: false, error: 'Bank transfer reference is required' });
    }

    const before = { status: repayment.status, receivedPaise: repayment.receivedPaise };
    repayment.status = Statuses.REPAYMENT.RECEIVED;
    repayment.receivedPaise = receivedPaise || repayment.expectedPaise;
    repayment.reference = reference.trim();
    repayment.receivedAt = new Date();
    await repayment.save();

    // Record ledger entry
    await Ledger.create({
      account: 'PLATFORM_COLLECTION',
      debitPaise: 0,
      creditPaise: repayment.receivedPaise,
      refType: 'REPAYMENT',
      refId: repayment._id,
      description: `Repayment received from company for offer ${repayment.offerId?.title} Ref: ${repayment.reference}`
    });

    // Create or update investor payout lines to 'Ready' (PRD Section 5.4 F-7: "maker builds payout batch only from lines whose company money is confirmed")
    const activeInvestments = await Investment.find({
      offerId: repayment.offerId._id,
      status: Statuses.INVESTMENT.ACTIVE
    });

    for (const inv of activeInvestments) {
      const payoutAmount = repayment.kind === 'return' ? inv.monthlyReturnPaise : inv.amountPaise;

      let payout = await Payout.findOne({
        investmentId: inv._id,
        repaymentId: repayment._id
      });

      if (!payout) {
        await Payout.create({
          investmentId: inv._id,
          repaymentId: repayment._id,
          investorId: inv.investorId,
          offerId: repayment.offerId._id,
          amountPaise: payoutAmount,
          status: Statuses.PAYOUT.READY
        });
      } else {
        payout.status = Statuses.PAYOUT.READY;
        await payout.save();
      }
    }

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'REPAYMENT_RECEIPT_CONFIRMED',
      targetEntity: 'Repayment',
      targetId: repayment._id,
      before,
      after: { status: repayment.status, receivedPaise: repayment.receivedPaise, reference },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Repayment receipt confirmed. Investor payouts are now marked READY for batching.',
      repayment
    });
  } catch (error) {
    next(error);
  }
}

export async function markDefault(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const repayment = await Repayment.findById(id);
    if (!repayment) return res.status(404).json({ success: false, error: 'Repayment record not found' });

    repayment.status = Statuses.REPAYMENT.DEFAULTED;
    repayment.defaultReportedAt = new Date();
    await repayment.save();

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'REPAYMENT_DEFAULTED',
      targetEntity: 'Repayment',
      targetId: repayment._id,
      reason: reason || 'Company has stayed late for over 30 days',
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Repayment marked as Defaulted', repayment });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 8. PAYOUT BATCHES (PRD 5.4 F-7, F-8 & 6.3)
// ==========================================
export async function getPayouts(req, res, next) {
  try {
    const { status, offerId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (offerId) query.offerId = offerId;

    const payouts = await Payout.find(query)
      .populate('investorId', 'name email mobile')
      .populate('offerId', 'title rateBps tenures')
      .populate('repaymentId', 'dueDate kind reference status expectedPaise')
      .populate({
        path: 'investmentId',
        select: 'amount amountInvested amountPaise tenureMonths returnRate activationDate investedAt maturityDate createdAt status',
        populate: {
          path: 'offerId',
          select: 'title rateBps tenures'
        }
      })
      .sort({ createdAt: -1 });

    const enrichedPayouts = payouts.map((p) => {
      const inv = p.investmentId || {};
      const offer = p.offerId || inv.offerId || {};

      const investedAmountPaise =
        inv.amountPaise ||
        (inv.amount ? Math.round(inv.amount * 100) : 0) ||
        (inv.amountInvested ? Math.round(inv.amountInvested * 100) : 0) ||
        (p.amountInvested ? Math.round(p.amountInvested * 100) : 0);

      const investedAmount = investedAmountPaise / 100;

      const projectTitle =
        offer.title ||
        p.offerTitle ||
        inv.offerTitle ||
        'Investment Project';

      const ratePercent =
        inv.returnRate != null
          ? inv.returnRate
          : offer.rateBps
          ? offer.rateBps / 100
          : 12;

      const tenureMonths =
        inv.tenureMonths ||
        (offer.tenures && offer.tenures.length > 0 ? offer.tenures[0] : 12);

      const baseDate = p.scheduledDate || p.paidDate || p.createdAt || new Date();
      let remainingTenureMonths = tenureMonths;
      if (inv.maturityDate) {
        const diff = new Date(inv.maturityDate).getTime() - new Date(baseDate).getTime();
        remainingTenureMonths = diff > 0 ? Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24 * 30.4375))) : 0;
      }

      return {
        ...p.toObject(),
        investedAmountPaise,
        investedAmount,
        projectTitle,
        ratePercent,
        returnRate: ratePercent,
        tenureMonths,
        remainingTenureMonths,
        maturityDate: inv.maturityDate
      };
    });

    return res.json({ success: true, count: enrichedPayouts.length, payouts: enrichedPayouts });
  } catch (error) {
    next(error);
  }
}

export async function verifyPayout(req, res, next) {
  try {
    const { id } = req.params;
    const { remarks } = req.body || {};

    const payout = await Payout.findById(id);
    if (!payout) {
      return res.status(404).json({ success: false, error: 'Return payout record not found' });
    }

    if (payout.status === Statuses.PAYOUT.PAID) {
      return res.status(400).json({ success: false, error: 'Payout has already been executed and paid' });
    }

    // Set to Ready for batch disbursement
    payout.status = Statuses.PAYOUT.READY;
    payout.failureReason = remarks || null;
    await payout.save();

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'RETURN_PAYOUT_VERIFIED',
      targetEntity: 'Payout',
      targetId: payout._id,
      after: { status: Statuses.PAYOUT.READY, amountPaise: payout.amountPaise },
      ipAddress: req.ip
    });

    broadcastSyncEvent('payout_verified', { payoutId: payout._id, status: payout.status });

    return res.json({
      success: true,
      message: `Return payout of ${formatINR(payout.amountPaise)} successfully verified & marked READY.`,
      payout
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyAllPayouts(req, res, next) {
  try {
    const pendingPayouts = await Payout.find({
      status: { $in: [Statuses.PAYOUT.CALCULATED, Statuses.PAYOUT.FAILED] }
    });

    if (pendingPayouts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No return payouts currently pending admin verification'
      });
    }

    const ids = pendingPayouts.map(p => p._id);
    await Payout.updateMany(
      { _id: { $in: ids } },
      { $set: { status: Statuses.PAYOUT.READY, failureReason: null } }
    );

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'ALL_RETURN_PAYOUTS_VERIFIED',
      targetEntity: 'Payout',
      count: ids.length,
      ipAddress: req.ip
    });

    broadcastSyncEvent('payouts_all_verified', { count: ids.length });

    return res.json({
      success: true,
      message: `Successfully verified all ${ids.length} pending investor returns. Marked READY for batch creation.`,
      count: ids.length
    });
  } catch (error) {
    next(error);
  }
}

export async function getBatches(req, res, next) {
  try {
    const batches = await Batch.find().populate('adminId', 'name email').sort({ createdAt: -1 });
    return res.json({ success: true, count: batches.length, batches });
  } catch (error) {
    next(error);
  }
}

export async function createPayoutBatch(req, res, next) {
  try {
    // Find all payouts that are 'Ready' (i.e. company money is in)
    const readyPayouts = await Payout.find({ status: Statuses.PAYOUT.READY });
    if (readyPayouts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No payouts currently in READY status. Company repayments must be confirmed first.'
      });
    }

    const totalPaise = readyPayouts.reduce((sum, p) => sum + p.amountPaise, 0);

    const batch = await Batch.create({
      adminId: req.user._id,
      status: 'Prepared',
      totalPaise,
      payoutCount: readyPayouts.length
    });

    // Move payouts to IN_BATCH
    await Payout.updateMany(
      { _id: { $in: readyPayouts.map(p => p._id) } },
      { $set: { status: Statuses.PAYOUT.IN_BATCH, batchId: batch._id } }
    );

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'PAYOUT_BATCH_PREPARED',
      targetEntity: 'Batch',
      targetId: batch._id,
      after: { totalPaise, count: readyPayouts.length },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: `Batch created with ${readyPayouts.length} payouts totaling ${formatINR(totalPaise)}`,
      batch
    });
  } catch (error) {
    next(error);
  }
}

export async function approveAndSendBatch(req, res, next) {
  try {
    const { id } = req.params;
    const batch = await Batch.findById(id);
    if (!batch) return res.status(404).json({ success: false, error: 'Batch not found' });

    if (batch.status === 'Paid') {
      return res.status(400).json({ success: false, error: 'Batch has already been dispatched and paid' });
    }

    const batchPayouts = await Payout.find({ batchId: batch._id });

    // Execute batch payouts via Razorpay
    const { createRazorpayDisbursement } = await import('../../services/razorpayService.js');
    for (const payout of batchPayouts) {
      const rzpRes = await createRazorpayDisbursement({
        accountNumber: '50100482934210',
        ifsc: 'HDFC0001234',
        beneficiaryName: 'Investor',
        amountPaise: payout.amountPaise,
        purpose: 'payout',
        notes: { payoutId: payout._id.toString() }
      });

      const utr = rzpRes.utr || `RZP-BATCH-${Date.now().toString().slice(-8)}`;
      payout.status = Statuses.PAYOUT.PAID;
      payout.bankRef = utr;
      payout.utrNumber = utr;
      payout.paymentGateway = 'Razorpay';
      payout.razorpayPayoutId = rzpRes.payoutId || null;
      payout.razorpayUtr = utr;
      payout.paidAt = new Date();
      await payout.save();

      // Write ledger entry
      await Ledger.create({
        account: 'INVESTOR_WALLET',
        debitPaise: 0,
        creditPaise: payout.amountPaise,
        refType: 'PAYOUT',
        refId: payout._id,
        description: `Payout of ${formatINR(payout.amountPaise)} sent to investor Ref: ${payout.bankRef}`
      });
    }

    batch.status = 'Paid';
    batch.reference = `BATCH-DISPATCH-${Date.now().toString().slice(-6)}`;
    batch.executedAt = new Date();
    await batch.save();

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'PAYOUT_BATCH_DISPATCHED',
      targetEntity: 'Batch',
      targetId: batch._id,
      after: { status: 'Paid', reference: batch.reference },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Batch ${batch._id} executed successfully. ${batchPayouts.length} payouts marked PAID.`,
      batch
    });
  } catch (error) {
    next(error);
  }
}

export async function retryPayout(req, res, next) {
  try {
    const { id } = req.params;
    const payout = await Payout.findById(id);
    if (!payout) return res.status(404).json({ success: false, error: 'Payout not found' });

    payout.status = Statuses.PAYOUT.READY;
    payout.failureReason = null;
    await payout.save();

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'PAYOUT_RETRY_INITIATED',
      targetEntity: 'Payout',
      targetId: payout._id,
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Payout status reset to READY for next batch run', payout });
  } catch (error) {
    next(error);
  }
}



export async function togglePayoutHold(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const payout = await Payout.findById(id)
      .populate('investorId', 'name email')
      .populate('offerId', 'title');

    if (!payout) {
      return res.status(404).json({ success: false, error: 'Return payout record not found' });
    }

    if (payout.status === Statuses.PAYOUT.PAID || payout.status === 'Paid') {
      return res.status(400).json({ success: false, error: 'Cannot hold a return that has already been disbursed and paid.' });
    }

    const currentlyOnHold = payout.isHold || payout.status === Statuses.PAYOUT.ON_HOLD;
    const nextHoldState = !currentlyOnHold;

    if (nextHoldState) {
      payout.isHold = true;
      payout.status = Statuses.PAYOUT.ON_HOLD;
      payout.holdReason = reason || 'Return held by platform administrator';
      payout.heldAt = new Date();
      payout.heldBy = req.user._id;
    } else {
      payout.isHold = false;
      payout.status = Statuses.PAYOUT.READY;
      payout.holdReason = null;
      payout.heldAt = null;
      payout.heldBy = null;
    }

    await payout.save();

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: nextHoldState ? 'PAYOUT_PLACED_ON_HOLD' : 'PAYOUT_RELEASED_FROM_HOLD',
      targetEntity: 'Payout',
      targetId: payout._id,
      reason: payout.holdReason,
      after: { status: payout.status, isHold: payout.isHold },
      ipAddress: req.ip
    });

    broadcastSyncEvent('payout_hold_updated', { payoutId: payout._id, isHold: payout.isHold, status: payout.status });

    return res.json({
      success: true,
      message: nextHoldState
        ? ('Return for ' + (payout.investorId?.name || 'Investor') + ' placed ON HOLD. Auto-payouts paused.')
        : ('Return for ' + (payout.investorId?.name || 'Investor') + ' released from hold and marked READY.'),
      payout
    });
  } catch (error) {
    next(error);
  }
}

export async function paySingleReturn(req, res, next) {
  try {
    const { id } = req.params;
    const { reference, paymentMethod, remarks } = req.body || {};

    const payout = await Payout.findById(id)
      .populate('investorId', 'name email mobile')
      .populate('offerId', 'title');

    if (!payout) {
      return res.status(404).json({ success: false, error: 'Return payout record not found' });
    }

    if (payout.status === Statuses.PAYOUT.PAID || payout.status === 'Paid') {
      return res.status(400).json({ success: false, error: 'This return has already been disbursed and paid.' });
    }

    if (payout.isHold || payout.status === Statuses.PAYOUT.ON_HOLD) {
      return res.status(400).json({ success: false, error: 'This return is on hold. Please release from hold first before paying.' });
    }

    const amountPaise = payout.amountPaise || Math.round((payout.amount || 0) * 100);

    // Execute Razorpay Payout to Investor linked account
    const { createRazorpayDisbursement } = await import('../../services/razorpayService.js');
    const rzpResult = await createRazorpayDisbursement({
      accountNumber: '50100482934210',
      ifsc: 'HDFC0001234',
      beneficiaryName: payout.investorId?.name || 'Investor',
      amountPaise,
      purpose: 'payout',
      notes: {
        payoutId: payout._id.toString(),
        investorId: payout.investorId?._id?.toString() || '',
        offerTitle: payout.offerId?.title || ''
      }
    });

    const finalUtr = reference || rzpResult.utr || ('RZP-RET-' + Date.now().toString().slice(-8));

    payout.status = Statuses.PAYOUT.PAID;
    payout.paidDate = new Date();
    payout.paidAt = new Date();
    payout.bankRef = finalUtr;
    payout.utrNumber = finalUtr;
    payout.paymentGateway = 'Razorpay';
    payout.razorpayPayoutId = rzpResult.payoutId || null;
    payout.razorpayUtr = finalUtr;
    payout.failureReason = null;
    if (remarks) payout.remarks = remarks;
    await payout.save();

    // Ledger entry
    try {
      await Ledger.create({
        account: 'INVESTOR_WALLET',
        debitPaise: 0,
        creditPaise: amountPaise,
        refType: 'PAYOUT',
        refId: payout._id,
        description: 'Manual payout of ' + formatINR(amountPaise) + ' paid to ' + (payout.investorId?.name || 'Investor') + ' Ref: ' + utr
      });
    } catch (ledErr) {
      console.warn('[PayReturn] Ledger notice:', ledErr.message);
    }

    // Investor transaction history
    try {
      await Transaction.create({
        investorId: payout.investorId?._id || payout.investorId,
        investmentId: payout.investmentId,
        title: 'Monthly Return - ' + (payout.offerId?.title || 'Investment Project'),
        type: 'Payout',
        amount: amountPaise / 100,
        status: 'Completed',
        referenceId: utr,
        paymentMethod: paymentMethod || 'Razorpay Payouts (Direct Bank Settlement)',
        description: 'Monthly return payout disbursed via Razorpay to linked bank account. Ref: ' + finalUtr
      });
    } catch (txErr) {
      console.warn('[PayReturn] Transaction notice:', txErr.message);
    }

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'RETURN_PAYOUT_MANUALLY_EXECUTED',
      targetEntity: 'Payout',
      targetId: payout._id,
      after: { status: Statuses.PAYOUT.PAID, utrNumber: utr, amountPaise },
      ipAddress: req.ip
    });

    broadcastSyncEvent('payout_paid', { payoutId: payout._id, status: Statuses.PAYOUT.PAID, utrNumber: utr });

    return res.json({
      success: true,
      message: 'Return of ' + formatINR(amountPaise) + ' successfully paid to ' + (payout.investorId?.name || 'Investor') + ' (UTR: ' + utr + ')',
      payout
    });
  } catch (error) {
    next(error);
  }
}

export async function triggerAutoMonthlyReturns(req, res, next) {
  try {
    const { processAutoMonthlyReturns } = await import('../../services/autoReturnsService.js');
    await processAutoMonthlyReturns();
    return res.json({
      success: true,
      message: 'Monthly returns scheduled and calculated successfully for admin review and manual payment.'
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllTransactions(req, res, next) {
  try {
    const { type, search, limit = 100 } = req.query;

    const [investments, releases, repayments, payouts, subscriptions] = await Promise.all([
      Investment.find()
        .populate('investorId', 'name email mobile')
        .populate('offerId', 'title kind')
        .sort({ createdAt: -1 }),
      Release.find()
        .populate('companyId', 'name')
        .populate('offerId', 'title')
        .sort({ createdAt: -1 }),
      Repayment.find()
        .populate('offerId', 'title')
        .sort({ createdAt: -1 }),
      Payout.find()
        .populate('investorId', 'name email mobile')
        .populate('offerId', 'title')
        .sort({ createdAt: -1 }),
      Subscription.find()
        .populate('userId', 'name email mobile')
        .populate('companyId', 'name')
        .sort({ createdAt: -1 })
    ]);

    const txs = [];

    // 1. Investor Capital Inflows
    investments.forEach(inv => {
      txs.push({
        id: inv._id,
        txRef: `TX-INV-${inv._id.toString().slice(-6).toUpperCase()}`,
        type: 'INVESTMENT',
        category: 'Capital Inflow',
        flow: 'CREDIT',
        title: inv.offerId?.title || 'Investment Proposal',
        party: inv.investorId?.name || 'Verified Investor',
        partySub: inv.investorId?.email || 'Investor Capital',
        amountPaise: inv.amountPaise,
        status: inv.status === 'Active' || inv.status === 'Confirmed' ? 'Completed' : inv.status,
        date: inv.createdAt,
        gatewayRef: inv.certificateNo || `GW-${inv._id.toString().slice(-8)}`
      });
    });

    // 2. Company Capital Releases
    releases.forEach(rel => {
      txs.push({
        id: rel._id,
        txRef: `TX-REL-${rel._id.toString().slice(-6).toUpperCase()}`,
        type: 'RELEASE',
        category: 'Company Disbursement',
        flow: 'DEBIT',
        title: rel.offerId?.title || 'Company Fund Release',
        party: rel.companyId?.name || 'Borrower Company',
        partySub: 'Tranche Disbursement',
        amountPaise: rel.amountPaise,
        status: rel.status === 'Released' ? 'Completed' : rel.status,
        date: rel.createdAt,
        gatewayRef: rel.bankRef || 'BANK-DISBURSEMENT'
      });
    });

    // 3. Company Repayments
    repayments.forEach(rep => {
      const isRcvd = rep.status === 'Received';
      txs.push({
        id: rep._id,
        txRef: `TX-REP-${rep._id.toString().slice(-6).toUpperCase()}`,
        type: 'REPAYMENT',
        category: 'Company Repayment',
        flow: 'CREDIT',
        title: rep.offerId?.title || 'Project Repayment Cycle',
        party: 'Corporate Borrower',
        partySub: rep.kind === 'principal' ? 'Principal Repayment' : 'Yield Collection',
        amountPaise: rep.expectedPaise || rep.receivedPaise || 0,
        status: isRcvd ? 'Completed' : rep.status,
        date: rep.receivedAt || rep.dueDate || rep.createdAt,
        gatewayRef: rep.reference || 'BANK-UTR-IN'
      });
    });

    // 4. Investor Return Payouts
    payouts.forEach(p => {
      const isPaid = p.status === 'Paid';
      txs.push({
        id: p._id,
        txRef: `TX-PAY-${p._id.toString().slice(-6).toUpperCase()}`,
        type: 'PAYOUT',
        category: 'Investor Return Distribution',
        flow: 'DEBIT',
        title: p.offerId?.title || 'Monthly Return Distribution',
        party: p.investorId?.name || 'Verified Investor',
        partySub: p.investorId?.email || 'Direct Bank Settlement',
        amountPaise: p.amountPaise,
        status: isPaid ? 'Completed' : p.status === 'Ready' ? 'Verified Ready' : p.status,
        date: p.paidAt || p.createdAt,
        gatewayRef: p.bankRef || 'BATCH-SETTLEMENT'
      });
    });

    // 5. Monthly Subscriptions
    subscriptions.forEach(sub => {
      txs.push({
        id: sub._id,
        txRef: `TX-SUB-${sub._id.toString().slice(-6).toUpperCase()}`,
        type: 'SUBSCRIPTION',
        category: 'Platform Service Fee',
        flow: 'CREDIT',
        title: 'Platform Monthly Access Fee (₹500)',
        party: sub.userId?.name || sub.companyId?.name || 'Active Member',
        partySub: sub.userId?.email || 'Platform Maintenance',
        amountPaise: sub.amountPaise || 50000,
        status: sub.status === 'Paid' ? 'Completed' : sub.status,
        date: sub.paymentDate || sub.createdAt,
        gatewayRef: sub.paymentRef || 'RAZORPAY-SUB'
      });
    });

    // Sort descending by date
    txs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter by type or search query
    let filtered = txs;
    if (type && type !== 'ALL') {
      filtered = filtered.filter(t => t.type === type || t.flow === type);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.txRef.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.party.toLowerCase().includes(q) ||
          t.partySub.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    const totalVolumePaise = txs.reduce((sum, t) => sum + t.amountPaise, 0);
    const creditsTotalPaise = txs.filter(t => t.flow === 'CREDIT').reduce((sum, t) => sum + t.amountPaise, 0);
    const debitsTotalPaise = txs.filter(t => t.flow === 'DEBIT').reduce((sum, t) => sum + t.amountPaise, 0);

    return res.json({
      success: true,
      totalCount: txs.length,
      filteredCount: filtered.length,
      stats: {
        totalVolumePaise,
        creditsTotalPaise,
        debitsTotalPaise
      },
      transactions: filtered.slice(0, Number(limit))
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 9. AUDIT LOG & EXPORTS (PRD 5.5 M-2, M-3)
// ==========================================
export async function getAuditLogs(req, res, next) {
  try {
    const { entity, action, limit = 50, page = 1 } = req.query;
    const query = {};
    if (entity) query.targetEntity = entity;
    if (action) query.action = { $regex: action, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const logs = await AuditLog.find(query)
      .populate('actorId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await AuditLog.countDocuments(query);

    return res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      logs
    });
  } catch (error) {
    next(error);
  }
}

export async function exportReport(req, res, next) {
  try {
    const { name } = req.params; // 'investors', 'companies', 'offers', 'payouts'
    let data = [];
    let fields = [];

    if (name === 'investors') {
      const investors = await InvestorProfile.find().populate('userId', 'name email mobile status');
      data = investors.map(i => ({
        ID: i._id,
        Name: i.userId?.name,
        Email: i.userId?.email,
        Mobile: i.userId?.mobile,
        KYC_Status: i.kycStatus,
        Reason: i.kycReason || '',
        Account_Status: i.userId?.status
      }));
      fields = ['ID', 'Name', 'Email', 'Mobile', 'KYC_Status', 'Reason', 'Account_Status'];
    } else if (name === 'companies') {
      const companies = await Company.find().populate('ownerUserId', 'name email');
      data = companies.map(c => ({
        ID: c._id,
        Name: c.name,
        Registration_No: c.regNo,
        Owner_Email: c.ownerUserId?.email,
        Status: c.status,
        Bank_Account: c.bankAccount?.accountNo || '',
        Bank_Verified: c.bankAccount?.verified ? 'YES' : 'NO'
      }));
      fields = ['ID', 'Name', 'Registration_No', 'Owner_Email', 'Status', 'Bank_Account', 'Bank_Verified'];
    } else if (name === 'offers') {
      const offers = await Offer.find().populate('companyId', 'name');
      data = offers.map(o => ({
        ID: o._id,
        Title: o.title,
        Kind: o.kind,
        Company: o.companyId?.name,
        Target_INR: formatINR(o.targetPaise),
        Raised_INR: formatINR(o.raisedPaise),
        Rate_BPS: o.rateBps,
        Status: o.status
      }));
      fields = ['ID', 'Title', 'Kind', 'Company', 'Target_INR', 'Raised_INR', 'Rate_BPS', 'Status'];
    } else if (name === 'payouts') {
      const payouts = await Payout.find().populate('investorId', 'name email').populate('offerId', 'title');
      data = payouts.map(p => ({
        ID: p._id,
        Investor: p.investorId?.name,
        Email: p.investorId?.email,
        Offer: p.offerId?.title,
        Amount_INR: formatINR(p.amountPaise),
        Status: p.status,
        Bank_Ref: p.bankRef || '',
        Failure_Reason: p.failureReason || ''
      }));
      fields = ['ID', 'Investor', 'Email', 'Offer', 'Amount_INR', 'Status', 'Bank_Ref', 'Failure_Reason'];
    } else {
      return res.status(400).json({ success: false, error: 'Unknown report type' });
    }

    // Convert to CSV
    const csvRows = [];
    csvRows.push(fields.join(','));
    for (const row of data) {
      const values = fields.map(f => {
        const val = row[f] === undefined || row[f] === null ? '' : String(row[f]);
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="connect_invest_${name}_${Date.now()}.csv"`);
    return res.send(csvContent);
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 10. ADMIN CREDENTIALS & PROFILE SETTINGS
// ==========================================
export async function updateAdminCredentials(req, res, next) {
  try {
    const adminId = req.user._id;
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(adminId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Admin account not found' });
    }

    // Check current password
    if (!currentPassword) {
      return res.status(400).json({ success: false, error: 'Current password is required to save changes' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect current password' });
    }

    const changes = {};

    // Update name
    if (name && name.trim() && name.trim() !== user.name) {
      changes.oldName = user.name;
      changes.newName = name.trim();
      user.name = name.trim();
    }

    // Update email (Admin Login ID)
    if (email && email.trim() && email.trim().toLowerCase() !== user.email) {
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'This email address is already in use by another account' });
      }
      changes.oldEmail = user.email;
      changes.newEmail = normalizedEmail;
      user.email = normalizedEmail;
    }

    // Update password
    if (newPassword) {
      if (newPassword.length < 8) {
        return res.status(400).json({ success: false, error: 'New password must be at least 8 characters long' });
      }
      user.passwordHash = await bcrypt.hash(newPassword, 10);
      changes.passwordChanged = true;
    }

    await user.save();

    // Generate fresh JWT token with updated info
    const newToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: user.name,
        email: user.email
      },
      process.env.JWT_SECRET || 'connect_invest_dev_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Audit log
    await logAction({
      actorId: user._id,
      role: user.role,
      action: 'ADMIN_CREDENTIALS_UPDATED',
      targetEntity: 'User',
      targetId: user._id,
      stateDiff: {
        before: { name: changes.oldName || user.name, email: changes.oldEmail || user.email },
        after: { name: user.name, email: user.email, passwordUpdated: !!changes.passwordChanged }
      },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Admin credentials updated successfully',
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 14. QUERIES & SUPPORT TICKETS MANAGEMENT
// ==========================================

export async function getQueries(req, res, next) {
  try {
    const { status, senderType, category, priority, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (senderType && senderType !== 'all') {
      filter.senderType = senderType;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { ticketId: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { userName: { $regex: q, $options: 'i' } },
        { userEmail: { $regex: q, $options: 'i' } },
        { relatedTransactionRef: { $regex: q, $options: 'i' } }
      ];
    }

    const queries = await Query.find(filter)
      .sort({ updatedAt: -1 })
      .populate('investorId', 'userId pan')
      .populate('companyId', 'name regNo')
      .populate('relatedOfferId', 'title code');

    // Metrics for summary widgets
    const [totalOpen, totalUrgent, paymentQueriesCount, totalResolved] = await Promise.all([
      Query.countDocuments({ status: { $in: ['Open', 'In Progress'] } }),
      Query.countDocuments({ priority: 'Urgent', status: { $ne: 'Closed' } }),
      Query.countDocuments({ category: { $in: ['Payment & Payouts', 'Repayment & Dues'] } }),
      Query.countDocuments({ status: 'Resolved' })
    ]);

    return res.json({
      success: true,
      queries,
      summary: {
        totalOpen,
        totalUrgent,
        paymentQueriesCount,
        totalResolved,
        total: queries.length
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createQuery(req, res, next) {
  try {
    const {
      senderType,
      userName,
      userEmail,
      userPhone,
      category,
      priority,
      subject,
      description,
      relatedTransactionRef,
      investorId,
      companyId,
      relatedOfferId
    } = req.body;

    if (!subject || !description || !userName || !userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Subject, description, contact name and email are required'
      });
    }

    const ticketId = `TKT-${Date.now().toString().slice(-6)}`;

    const newQuery = await Query.create({
      ticketId,
      senderType: senderType || 'investor',
      userName,
      userEmail,
      userPhone: userPhone || '',
      category: category || 'Payment & Payouts',
      priority: priority || 'Medium',
      status: 'Open',
      subject,
      description,
      relatedTransactionRef: relatedTransactionRef || '',
      investorId: investorId || null,
      companyId: companyId || null,
      relatedOfferId: relatedOfferId || null,
      messages: [
        {
          senderType: senderType || 'investor',
          senderName: userName,
          message: description,
          sentAt: new Date()
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: `Query ticket ${ticketId} created successfully`,
      query: newQuery
    });
  } catch (error) {
    next(error);
  }
}

export async function replyQuery(req, res, next) {
  try {
    const { id } = req.params;
    const { message, nextStatus } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Reply message cannot be empty' });
    }

    const query = await Query.findById(id);
    if (!query) {
      return res.status(404).json({ success: false, error: 'Query ticket not found' });
    }

    query.messages.push({
      senderType: 'admin',
      senderName: req.user?.name || 'Platform Administrator',
      senderId: req.user?._id,
      message: message.trim(),
      sentAt: new Date()
    });

    if (nextStatus) {
      query.status = nextStatus;
      if (nextStatus === 'Resolved') {
        query.resolvedAt = new Date();
      }
    } else if (query.status === 'Open') {
      query.status = 'In Progress';
    }

    await query.save();

    return res.json({
      success: true,
      message: 'Reply sent successfully',
      query
    });
  } catch (error) {
    next(error);
  }
}

export async function updateQueryStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, priority, resolutionNote } = req.body;

    const query = await Query.findById(id);
    if (!query) {
      return res.status(404).json({ success: false, error: 'Query ticket not found' });
    }

    if (status) {
      query.status = status;
      if (status === 'Resolved') {
        query.resolvedAt = new Date();
      }
    }
    if (priority) {
      query.priority = priority;
    }
    if (resolutionNote !== undefined) {
      query.resolutionNote = resolutionNote;
    }

    await query.save();

    return res.json({
      success: true,
      message: 'Query status updated successfully',
      query
    });
  } catch (error) {
    next(error);
  }
}

async function seedInitialQueries() {
  try {
    // Find a company and an investor if available to attach realistic links
    const company = await Company.findOne();
    const investor = await InvestorProfile.findOne();
    const offer = await Offer.findOne();

    const sampleQueries = [
      {
        ticketId: 'TKT-108421',
        senderType: 'investor',
        userName: 'Aarav Patel',
        userEmail: 'aarav.patel@example.com',
        userPhone: '9876543210',
        category: 'Payment & Payouts',
        priority: 'High',
        status: 'Open',
        subject: 'Monthly Payout Credit Delay for Apex Solar Farm',
        description: 'My monthly return distribution of ₹14,250 for October has not been reflected in my ICICI Bank account yet. Could you check the transaction status?',
        relatedTransactionRef: 'PAYOUT-2026-OCT-8821',
        investorId: investor?._id || null,
        relatedOfferId: offer?._id || null,
        messages: [
          {
            senderType: 'investor',
            senderName: 'Aarav Patel',
            message: 'My monthly return distribution of ₹14,250 for October has not been reflected in my ICICI Bank account yet. Could you check the transaction status?',
            sentAt: new Date(Date.now() - 3600000 * 5)
          }
        ]
      },
      {
        ticketId: 'TKT-108390',
        senderType: 'company',
        userName: company?.name || 'Apex Renewable Energy Pvt Ltd',
        userEmail: 'finance@apexsolar.in',
        userPhone: '9123456780',
        category: 'Repayment & Dues',
        priority: 'Urgent',
        status: 'In Progress',
        subject: 'Disbursement Cooling-off Verification for Tranche 2',
        description: 'We have updated our primary HDFC current account for receiving the second tranche disbursement. Requesting expedited admin review of cooling-off period.',
        relatedTransactionRef: 'DISB-REL-9921',
        companyId: company?._id || null,
        relatedOfferId: offer?._id || null,
        messages: [
          {
            senderType: 'company',
            senderName: 'Finance Lead (Apex)',
            message: 'We have updated our primary HDFC current account for receiving the second tranche disbursement. Requesting expedited admin review of cooling-off period.',
            sentAt: new Date(Date.now() - 3600000 * 24)
          },
          {
            senderType: 'admin',
            senderName: 'Master Administrator',
            message: 'Thank you for reaching out. We have verified your HDFC Bank account statement. 3-day cooling-off finishes tomorrow at 11:00 AM IST.',
            sentAt: new Date(Date.now() - 3600000 * 18)
          }
        ]
      },
      {
        ticketId: 'TKT-108254',
        senderType: 'investor',
        userName: 'Meera Sharma',
        userEmail: 'meera.s@gmail.com',
        userPhone: '9988776655',
        category: 'KYC Verification',
        priority: 'Medium',
        status: 'Resolved',
        subject: 'NSDL PAN Name Mismatch Assistance',
        description: 'Uploaded my revised Aadhaar and PAN card copy as requested by the compliance team after initial rejection.',
        investorId: investor?._id || null,
        resolutionNote: 'Documents re-verified with NSDL database and approved.',
        resolvedAt: new Date(Date.now() - 3600000 * 48),
        messages: [
          {
            senderType: 'investor',
            senderName: 'Meera Sharma',
            message: 'Uploaded my revised Aadhaar and PAN card copy as requested by the compliance team after initial rejection.',
            sentAt: new Date(Date.now() - 3600000 * 72)
          },
          {
            senderType: 'admin',
            senderName: 'Master Administrator',
            message: 'Your revised PAN records matched successfully. Your KYC status is now APPROVED.',
            sentAt: new Date(Date.now() - 3600000 * 48)
          }
        ]
      },
      {
        ticketId: 'TKT-108112',
        senderType: 'company',
        userName: 'Zenith Agritech Solutions',
        userEmail: 'accounts@zenithagri.io',
        userPhone: '9845123456',
        category: 'Payment & Payouts',
        priority: 'Medium',
        status: 'Open',
        subject: 'Inward Repayment UTR Reference Confirmation',
        description: 'We have remitted ₹4,50,000 via RTGS for our scheduled project repayment. Inward UTR: UTR-IN-20261027-44819.',
        relatedTransactionRef: 'UTR-IN-20261027-44819',
        companyId: company?._id || null,
        relatedOfferId: offer?._id || null,
        messages: [
          {
            senderType: 'company',
            senderName: 'Accounts Officer',
            message: 'We have remitted ₹4,50,000 via RTGS for our scheduled project repayment. Inward UTR: UTR-IN-20261027-44819.',
            sentAt: new Date(Date.now() - 3600000 * 3)
          }
        ]
      }
    ];

    await Query.insertMany(sampleQueries);
  } catch (err) {
    console.error('Error seeding initial queries:', err);
  }
}

// ==========================================
// 15. SUBSCRIPTIONS MANAGEMENT (₹500 / month SaaS Fee)
// ==========================================

export async function getSubscriptions(req, res, next) {
  try {
    const { status, subscriberType, billingMonth, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (subscriberType && subscriberType !== 'all') {
      filter.subscriberType = subscriberType;
    }
    if (billingMonth && billingMonth !== 'all') {
      filter.billingMonth = billingMonth;
    }
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { subscriberName: { $regex: q, $options: 'i' } },
        { subscriberEmail: { $regex: q, $options: 'i' } },
        { invoiceNumber: { $regex: q, $options: 'i' } },
        { transactionRef: { $regex: q, $options: 'i' } }
      ];
    }

    const subscriptions = await Subscription.find(filter)
      .sort({ paymentDate: -1, createdAt: -1 })
      .populate('companyId', 'name regNo')
      .populate('investorId', 'userId pan');

    // Aggregate summary metrics
    const [paidAgg, totalSubscribers, overdueCount, pendingCount] = await Promise.all([
      Subscription.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, totalRupees: { $sum: '$amount' } } }
      ]),
      Subscription.countDocuments(),
      Subscription.countDocuments({ status: 'Overdue' }),
      Subscription.countDocuments({ status: 'Pending' })
    ]);

    const totalCollected = paidAgg[0]?.totalRupees || 0;
    const activeSubscribers = await Subscription.countDocuments({ status: { $in: ['Paid', 'Pending'] } });
    const mrr = 500 * (activeSubscribers || totalSubscribers || 0);

    return res.json({
      success: true,
      subscriptions,
      data: subscriptions,
      stats: {
        totalCollected,
        mrr,
        activeSubscribers: activeSubscribers || totalSubscribers || 0,
        pendingPayments: pendingCount,
        overduePayments: overdueCount
      },
      summary: {
        totalCollected,
        monthlyRecurring: mrr,
        totalSubscribers,
        overdueCount,
        pendingCount,
        feePerSubscriber: 500
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function recordSubscriptionPayment(req, res, next) {
  try {
    const {
      subscriberType,
      subscriberName,
      subscriberEmail,
      subscriberMobile,
      amount,
      billingCycle,
      billingMonth,
      paymentMethod,
      transactionRef,
      status,
      notes
    } = req.body;

    if (!subscriberName || !subscriberEmail) {
      return res.status(400).json({ success: false, error: 'Subscriber name and email are required' });
    }

    const feeAmount = Number(amount) || 500;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const paymentDate = new Date();
    const nextDueDate = new Date(paymentDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    const subscription = await Subscription.create({
      subscriberType: subscriberType || 'investor',
      subscriberName: subscriberName.trim(),
      subscriberEmail: subscriberEmail.toLowerCase().trim(),
      subscriberMobile: subscriberMobile || '',
      planName: 'SaaS Platform License',
      amount: feeAmount,
      amountPaise: feeAmount * 100,
      billingCycle: billingCycle || 'Monthly',
      billingMonth: billingMonth || 'October 2026',
      paymentDate,
      nextDueDate,
      status: status || 'Paid',
      paymentMethod: paymentMethod || 'UPI',
      transactionRef: transactionRef || `TXN-SUB-${Date.now().toString().slice(-6)}`,
      invoiceNumber,
      notes: notes || ''
    });

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'SUBSCRIPTION_RECORDED',
      targetEntity: 'Subscription',
      targetId: subscription._id,
      after: { invoiceNumber, subscriberName, amount: feeAmount },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: `Subscription invoice ${invoiceNumber} created successfully`,
      subscription
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSubscriptionStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, transactionRef, notes } = req.body;

    const sub = await Subscription.findById(id);
    if (!sub) return res.status(404).json({ success: false, error: 'Subscription invoice not found' });

    if (status) sub.status = status;
    if (transactionRef) sub.transactionRef = transactionRef;
    if (notes !== undefined) sub.notes = notes;

    await sub.save();

    return res.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: sub
    });
  } catch (error) {
    next(error);
  }
}

async function seedInitialSubscriptions() {
  try {
    const companies = await Company.find().limit(4);
    const investors = await InvestorProfile.find().populate('userId', 'name email mobile').limit(4);

    const initial = [];

    if (companies && companies.length > 0) {
      companies.forEach((c, idx) => {
        const pDate = new Date(Date.now() - 3600000 * 24 * (idx * 5 + 2));
        const dueDate = new Date(pDate);
        dueDate.setMonth(dueDate.getMonth() + 1);

        initial.push({
          subscriberType: 'company',
          companyId: c._id,
          subscriberName: c.name,
          subscriberEmail: `billing@${(c.name || 'company').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          subscriberMobile: '9873898766',
          planName: 'Company SaaS Platform License',
          amount: 500,
          amountPaise: 50000,
          billingCycle: 'Monthly',
          billingMonth: 'October 2026',
          paymentDate: pDate,
          nextDueDate: dueDate,
          status: idx === 3 ? 'Overdue' : 'Paid',
          paymentMethod: idx % 2 === 0 ? 'Net Banking' : 'Bank Transfer (NEFT/RTGS)',
          transactionRef: `UTR-SUB-${idx + 109283}`,
          invoiceNumber: `INV-2026-OCT-C0${idx + 1}`,
          notes: 'Monthly corporate portal and compliance software licensing fee.'
        });
      });
    } else {
      // Default sample companies
      const defaultCompanies = [
        { name: 'Apex Logistics India Ltd', email: 'accounts@apexlogistics.in', method: 'Net Banking', status: 'Paid' },
        { name: 'Zenith Solar Energy Pvt Ltd', email: 'finance@zenithsolar.in', method: 'Bank Transfer (NEFT/RTGS)', status: 'Paid' },
        { name: 'Vanguard Agri-Tech Pvt Ltd', email: 'admin@vanguardagri.com', method: 'UPI', status: 'Overdue' }
      ];
      defaultCompanies.forEach((c, idx) => {
        const pDate = new Date(Date.now() - 3600000 * 24 * (idx * 6 + 1));
        const dueDate = new Date(pDate);
        dueDate.setMonth(dueDate.getMonth() + 1);
        initial.push({
          subscriberType: 'company',
          subscriberName: c.name,
          subscriberEmail: c.email,
          subscriberMobile: '9876543210',
          planName: 'Company SaaS Platform License',
          amount: 500,
          amountPaise: 50000,
          billingCycle: 'Monthly',
          billingMonth: 'October 2026',
          paymentDate: pDate,
          nextDueDate: dueDate,
          status: c.status,
          paymentMethod: c.method,
          transactionRef: `UTR-2026-${idx + 893241}`,
          invoiceNumber: `INV-2026-OCT-C0${idx + 1}`,
          notes: 'Monthly corporate portal licensing fee.'
        });
      });
    }

    if (investors && investors.length > 0) {
      investors.forEach((inv, idx) => {
        const pDate = new Date(Date.now() - 3600000 * 24 * (idx * 4 + 1));
        const dueDate = new Date(pDate);
        dueDate.setMonth(dueDate.getMonth() + 1);

        initial.push({
          subscriberType: 'investor',
          investorId: inv._id,
          userId: inv.userId?._id,
          subscriberName: inv.userId?.name || `Verified Investor ${idx + 1}`,
          subscriberEmail: inv.userId?.email || `investor${idx + 1}@connectinvest.io`,
          subscriberMobile: inv.userId?.mobile || '9988776655',
          planName: 'Investor SaaS Analytics & Yield Dashboard',
          amount: 500,
          amountPaise: 50000,
          billingCycle: 'Monthly',
          billingMonth: 'October 2026',
          paymentDate: pDate,
          nextDueDate: dueDate,
          status: idx === 3 ? 'Pending' : 'Paid',
          paymentMethod: 'UPI',
          transactionRef: `UPI-RR-${idx + 884712}`,
          invoiceNumber: `INV-2026-OCT-I0${idx + 1}`,
          notes: 'Monthly platform tools and automated returns reconciliation access fee.'
        });
      });
    } else {
      // Default sample investors
      const defaultInvestors = [
        { name: 'Dr. Anand Verma', email: 'anand.verma@example.com', method: 'UPI', status: 'Paid' },
        { name: 'Pooja Deshmukh', email: 'pooja.deshmukh@example.com', method: 'UPI', status: 'Paid' },
        { name: 'Rohan Mehra', email: 'rohan.mehra@example.com', method: 'Credit/Debit Card', status: 'Pending' }
      ];
      defaultInvestors.forEach((inv, idx) => {
        const pDate = new Date(Date.now() - 3600000 * 24 * (idx * 3 + 2));
        const dueDate = new Date(pDate);
        dueDate.setMonth(dueDate.getMonth() + 1);
        initial.push({
          subscriberType: 'investor',
          subscriberName: inv.name,
          subscriberEmail: inv.email,
          subscriberMobile: '9988776655',
          planName: 'Investor SaaS Analytics & Yield Dashboard',
          amount: 500,
          amountPaise: 50000,
          billingCycle: 'Monthly',
          billingMonth: 'October 2026',
          paymentDate: pDate,
          nextDueDate: dueDate,
          status: inv.status,
          paymentMethod: inv.method,
          transactionRef: `UPI-RR-${idx + 991283}`,
          invoiceNumber: `INV-2026-OCT-I0${idx + 1}`,
          notes: 'Monthly investor software access fee.'
        });
      });
    }

    if (initial.length > 0) {
      await Subscription.insertMany(initial);
    }
  } catch (err) {
    console.error('Error seeding subscriptions:', err);
  }
}

// ==========================================
// 12. CAP TABLE & EQUITY SHAREHOLDINGS
// ==========================================
export async function getCompanyCapTable(req, res, next) {
  try {
    const { id } = req.params; // Company ID
    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ success: false, error: 'Company not found' });

    // Find all equity offers for this company
    const equityOffers = await Offer.find({ companyId: id, kind: OfferKind.EQUITY });
    const offerIds = equityOffers.map(o => o._id);

    // Find all active/confirmed equity investments
    const investments = await Investment.find({
      offerId: { $in: offerIds },
      status: { $in: [Statuses.INVESTMENT.ACTIVE, Statuses.INVESTMENT.CONFIRMED, Statuses.INVESTMENT.COMPLETED] }
    }).populate('investorId', 'name email mobile');

    // Aggregate holdings
    const shareholders = investments.map(inv => ({
      investmentId: inv._id,
      offerId: inv.offerId,
      investor: inv.investorId,
      sharesAllotted: inv.sharesAllotted || Math.floor(inv.amountPaise / (inv.sharePricePaise || 10000)),
      sharePricePaise: inv.sharePricePaise,
      amountInvestedPaise: inv.amountPaise,
      ownershipPercentage: inv.ownershipPercentage,
      certificateNo: inv.certificateNo,
      dematFolioNumber: inv.dematFolioNumber,
      allotmentStatus: inv.allotmentStatus,
      activationDate: inv.activationDate
    }));

    const totalSharesIssued = shareholders.reduce((sum, s) => sum + (s.sharesAllotted || 0), 0);
    const totalEquityCapitalRaisedPaise = shareholders.reduce((sum, s) => sum + (s.amountInvestedPaise || 0), 0);

    return res.json({
      success: true,
      company: {
        _id: company._id,
        name: company.name,
        regNo: company.regNo
      },
      summary: {
        totalSharesIssued,
        totalEquityCapitalRaisedPaise,
        shareholderCount: shareholders.length,
        equityCampaignsCount: equityOffers.length
      },
      shareholders
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 13. DIVIDEND DISTRIBUTIONS
// ==========================================
export async function getDividends(req, res, next) {
  try {
    const { companyId, offerId } = req.query;
    const query = {};
    if (companyId) query.companyId = companyId;
    if (offerId) query.offerId = offerId;

    const dividends = await Dividend.find(query)
      .populate('companyId', 'name regNo bankAccount')
      .populate('offerId', 'title targetPaise sharePricePaise totalSharesOffered')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: dividends.length, dividends });
  } catch (error) {
    next(error);
  }
}

export async function declareDividend(req, res, next) {
  try {
    const {
      companyId,
      offerId,
      financialYear,
      recordDate,
      dividendPerSharePaise,
      totalPoolPaise,
      bankRef,
      notes
    } = req.body;

    if (!companyId || !offerId || !financialYear || !recordDate || !dividendPerSharePaise || !totalPoolPaise) {
      return res.status(400).json({ success: false, error: 'Missing required dividend fields' });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });

    const dividend = await Dividend.create({
      companyId,
      offerId,
      financialYear,
      recordDate: new Date(recordDate),
      dividendPerSharePaise,
      totalPoolPaise,
      bankRef,
      notes,
      status: Statuses.DIVIDEND?.DECLARED || 'Declared'
    });

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'DIVIDEND_DECLARED',
      targetEntity: 'Dividend',
      targetId: dividend._id,
      after: { companyId, offerId, dividendPerSharePaise, totalPoolPaise, financialYear },
      ipAddress: req.ip
    });

    return res.status(201).json({ success: true, message: 'Dividend declared successfully', dividend });
  } catch (error) {
    next(error);
  }
}

export async function distributeDividend(req, res, next) {
  try {
    const { id } = req.params; // Dividend ID
    const dividend = await Dividend.findById(id).populate('offerId');
    if (!dividend) return res.status(404).json({ success: false, error: 'Dividend record not found' });

    // Find all active equity investments in this offer
    const investments = await Investment.find({
      offerId: dividend.offerId._id,
      status: { $in: [Statuses.INVESTMENT.ACTIVE, Statuses.INVESTMENT.COMPLETED] }
    });

    if (investments.length === 0) {
      return res.status(400).json({ success: false, error: 'No active equity shareholders found for this offer' });
    }

    const createdPayouts = [];
    for (const inv of investments) {
      const shares = inv.sharesAllotted || Math.floor(inv.amountPaise / (dividend.offerId.sharePricePaise || 10000));
      const amountPaise = shares * dividend.dividendPerSharePaise;

      if (amountPaise > 0) {
        const payout = await Payout.create({
          investmentId: inv._id,
          dividendId: dividend._id,
          investorId: inv.investorId,
          offerId: dividend.offerId._id,
          amountPaise,
          payoutType: 'dividend',
          status: Statuses.PAYOUT.READY
        });
        createdPayouts.push(payout);
      }
    }

    dividend.status = Statuses.DIVIDEND?.BATCHED || 'Batched';
    dividend.payoutDate = new Date();
    await dividend.save();

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'DIVIDEND_DISTRIBUTED',
      targetEntity: 'Dividend',
      targetId: dividend._id,
      after: { payoutsCreated: createdPayouts.length, totalPoolPaise: dividend.totalPoolPaise },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Dividend distributed into ${createdPayouts.length} ready investor payout lines`,
      payoutsCount: createdPayouts.length,
      dividend
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 14. SHAREHOLDER MANAGEMENT
// ==========================================
export async function getShareholders(req, res, next) {
  try {
    const { companyId, offerId, search, allotmentStatus } = req.query;

    // 1. Find all equity offers matching companyId / offerId
    const offerQuery = { kind: OfferKind.EQUITY };
    if (companyId) offerQuery.companyId = companyId;
    if (offerId) offerQuery._id = offerId;

    const equityOffers = await Offer.find(offerQuery).populate('companyId', 'name regNo profile');
    const offerMap = new Map();
    equityOffers.forEach(o => offerMap.set(o._id.toString(), o));

    const offerIds = equityOffers.map(o => o._id);

    // 2. Find all investments in these equity offers
    const invQuery = {
      offerId: { $in: offerIds },
      status: { $in: [Statuses.INVESTMENT.ACTIVE, Statuses.INVESTMENT.CONFIRMED, Statuses.INVESTMENT.COMPLETED] }
    };
    if (allotmentStatus) invQuery.allotmentStatus = allotmentStatus;

    const investments = await Investment.find(invQuery)
      .populate('investorId', 'name email mobile status')
      .sort({ createdAt: -1 });

    // 3. Format shareholder items & calculate holding percentages
    let shareholders = investments.map(inv => {
      const offer = offerMap.get(inv.offerId.toString());
      const company = offer?.companyId;

      const sharesAllotted = inv.sharesAllotted || Math.floor(inv.amountPaise / (offer?.sharePricePaise || 10000));
      const sharePricePaise = inv.sharePricePaise || offer?.sharePricePaise || 0;

      // Calculate shareholding percentage (%)
      let ownershipPercentage = inv.ownershipPercentage;
      if (!ownershipPercentage && offer) {
        if (offer.totalSharesOffered && offer.totalSharesOffered > 0) {
          ownershipPercentage = Number(((sharesAllotted / offer.totalSharesOffered) * (offer.equityOfferedPercentage || 100)).toFixed(2));
        } else if (offer.targetPaise && offer.targetPaise > 0) {
          ownershipPercentage = Number(((inv.amountPaise / offer.targetPaise) * (offer.equityOfferedPercentage || 100)).toFixed(2));
        } else {
          ownershipPercentage = 0;
        }
      }

      return {
        id: inv._id,
        investmentId: inv._id,
        investor: {
          id: inv.investorId?._id,
          name: inv.investorId?.name || 'Shareholder',
          email: inv.investorId?.email || 'N/A',
          mobile: inv.investorId?.mobile || 'N/A'
        },
        company: {
          id: company?._id,
          name: company?.name || 'Company',
          regNo: company?.regNo || 'N/A',
          sector: company?.profile?.sector || 'General'
        },
        offer: {
          id: offer?._id,
          title: offer?.title || 'Equity Round',
          instrument: offer?.equityInstrument || 'equity_shares',
          equityOfferedPercentage: offer?.equityOfferedPercentage || 10,
          totalSharesOffered: offer?.totalSharesOffered || 0,
          preMoneyValuationPaise: offer?.preMoneyValuationPaise || 0,
          postMoneyValuationPaise: offer?.postMoneyValuationPaise || 0
        },
        sharesAllotted,
        sharePricePaise,
        amountInvestedPaise: inv.amountPaise,
        ownershipPercentage: Number(ownershipPercentage || 0),
        allotmentStatus: inv.allotmentStatus || 'Allotted',
        certificateNo: inv.certificateNo || 'PENDING',
        dematFolioNumber: inv.dematFolioNumber || null,
        activationDate: inv.activationDate,
        createdAt: inv.createdAt
      };
    });

    // 4. Search filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      shareholders = shareholders.filter(s =>
        s.investor.name.toLowerCase().includes(q) ||
        s.investor.email.toLowerCase().includes(q) ||
        s.company.name.toLowerCase().includes(q) ||
        s.company.regNo.toLowerCase().includes(q)
      );
    }

    // 5. Aggregate summary stats
    const totalSharesIssued = shareholders.reduce((acc, s) => acc + s.sharesAllotted, 0);
    const totalEquityCapitalRaisedPaise = shareholders.reduce((acc, s) => acc + s.amountInvestedPaise, 0);
    const uniqueShareholdersCount = new Set(shareholders.map(s => s.investor.id?.toString())).size;
    const avgOwnershipPct = shareholders.length > 0
      ? Number((shareholders.reduce((acc, s) => acc + s.ownershipPercentage, 0) / shareholders.length).toFixed(2))
      : 0;

    return res.json({
      success: true,
      count: shareholders.length,
      summary: {
        totalShareholdersCount: uniqueShareholdersCount,
        totalSharesIssued,
        totalEquityCapitalRaisedPaise,
        avgOwnershipPct
      },
      shareholders
    });
  } catch (error) {
    next(error);
  }
}

export async function updateShareholderAllotment(req, res, next) {
  try {
    const { id } = req.params; // Investment ID
    const { certificateNo, dematFolioNumber, allotmentStatus, ownershipPercentage } = req.body;

    const investment = await Investment.findById(id);
    if (!investment) return res.status(404).json({ success: false, error: 'Shareholder investment record not found' });

    if (certificateNo !== undefined) investment.certificateNo = certificateNo;
    if (dematFolioNumber !== undefined) investment.dematFolioNumber = dematFolioNumber;
    if (allotmentStatus !== undefined) investment.allotmentStatus = allotmentStatus;
    if (ownershipPercentage !== undefined) investment.ownershipPercentage = Number(ownershipPercentage);

    await investment.save();

    await logAction({
      actorId: req.user._id,
      role: req.user.role,
      action: 'SHAREHOLDER_ALLOTMENT_UPDATED',
      targetEntity: 'Investment',
      targetId: investment._id,
      after: { certificateNo, dematFolioNumber, allotmentStatus, ownershipPercentage },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Shareholder allotment details updated', investment });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// REGISTRATION APPROVAL WORKFLOW CONTROLLER
// ==========================================

export async function getAllApprovals(req, res, next) {
  try {
    const { type = 'all', status = 'all', search = '' } = req.query;

    let investorList = [];
    let companyList = [];

    // 1. Fetch Investors
    if (type === 'all' || type === 'investor') {
      const profiles = await InvestorProfile.find().populate('userId').sort({ createdAt: -1 });
      const kycs = await KYC.find();
      const kycMap = new Map();
      kycs.forEach(k => kycMap.set(String(k.investorId), k));

      for (const p of profiles) {
        if (!p.userId) continue;

        const regStatus = p.registrationStatus || p.userId.registrationStatus || (p.kycStatus === 'Approved' ? 'Approved' : 'Pending Approval');
        const kyc = kycMap.get(String(p.userId._id));

        // Status filter
        if (status !== 'all' && regStatus !== status) continue;

        // Search filter
        if (search) {
          const s = search.toLowerCase();
          const matches =
            p.userId.name?.toLowerCase().includes(s) ||
            p.userId.email?.toLowerCase().includes(s) ||
            p.userId.mobile?.includes(s) ||
            p.pan?.toLowerCase().includes(s);
          if (!matches) continue;
        }

        const panUrl = normalizeDocUrl(p.panCardUrl || kyc?.panDocumentUrl || '/uploads/sample-pan.png');
        const addressUrl = normalizeDocUrl(p.identityProofUrl || kyc?.addressProofUrl || '/uploads/sample-aadhaar.png');
        const chequeUrl = normalizeDocUrl(p.cancelledChequeUrl || p.bankDetails?.chequeUrl || kyc?.bankProofUrl || '/uploads/sample-cheque.png');
        const selfieUrl = kyc?.selfieUrl ? normalizeDocUrl(kyc.selfieUrl) : '';

        const documents = [
          { name: 'PAN Card', key: 'panCard', url: panUrl, type: 'identity' },
          { name: kyc?.addressProofType || 'Address & Identity Proof', key: 'addressProof', url: addressUrl, type: 'address' },
          { name: 'Cancelled Cheque / Bank Proof', key: 'bankProof', url: chequeUrl, type: 'financial' }
        ];
        if (selfieUrl) {
          documents.push({ name: 'Investor Selfie Photo', key: 'selfie', url: selfieUrl, type: 'identity' });
        }

        investorList.push({
          id: p._id,
          profileId: p._id,
          userId: p.userId._id,
          type: 'investor',
          name: p.userId.name,
          email: p.userId.email,
          mobile: p.userId.mobile,
          registrationStatus: regStatus,
          rejectionReason: p.rejectionReason || p.userId.rejectionReason || p.kycReason || null,
          adminRemarks: p.userId.adminRemarks || null,
          submittedAt: p.userId.submittedAt || p.createdAt,
          reviewedAt: p.userId.reviewedAt || null,
          details: {
            pan: p.pan || p.panNumber || 'N/A',
            aadhaar: p.aadhaarNumber || 'N/A',
            dob: p.dob || p.dateOfBirth,
            nationality: p.nationality || 'Indian',
            occupation: p.occupation || 'N/A',
            annualIncomeRange: p.annualIncomeRange || 'N/A',
            sourceOfFunds: p.sourceOfFunds || 'N/A',
            address: p.address,
            bankDetails: p.bankDetails || p.bankAccount,
            investmentProfile: p.investmentProfile
          },
          documents,
          statusHistory: p.userId.statusHistory?.length ? p.userId.statusHistory : (p.statusHistory || [])
        });
      }
    }

    // 2. Fetch Companies
    if (type === 'all' || type === 'company') {
      const companies = await Company.find().populate('ownerUserId').populate('userId').sort({ createdAt: -1 });

      for (const c of companies) {
        const owner = c.ownerUserId || c.userId;
        const regStatus = c.registrationStatus || (c.status === 'Approved' ? 'Approved' : 'Pending Approval');

        // Status filter
        if (status !== 'all' && regStatus !== status) continue;

        // Search filter
        if (search) {
          const s = search.toLowerCase();
          const matches =
            c.legalName?.toLowerCase().includes(s) ||
            c.name?.toLowerCase().includes(s) ||
            c.cin?.toLowerCase().includes(s) ||
            c.pan?.toLowerCase().includes(s) ||
            c.officialEmail?.toLowerCase().includes(s) ||
            owner?.name?.toLowerCase().includes(s);
          if (!matches) continue;
        }

        const documents = [
          { name: 'Company PAN Card', key: 'panCard', url: normalizeDocUrl(c.documents?.panCardUrl || '/uploads/sample-company-pan.png'), type: 'identity' },
          { name: 'GST Registration Certificate', key: 'gst', url: normalizeDocUrl(c.documents?.gstCertificateUrl || '/uploads/sample-gst.pdf'), type: 'tax' }
        ];

        companyList.push({
          id: c._id,
          companyId: c._id,
          userId: owner?._id,
          type: 'company',
          name: c.legalName || c.name,
          legalName: c.legalName || c.name,
          brandName: c.brandName || c.name,
          email: c.officialEmail || owner?.email,
          mobile: c.officialMobile || owner?.mobile,
          registrationStatus: regStatus,
          rejectionReason: c.rejectionReason || c.statusReason || null,
          adminRemarks: owner?.adminRemarks || null,
          submittedAt: c.createdAt,
          reviewedAt: c.verifiedAt || null,
          details: {
            cin: c.cin || c.regNo || 'N/A',
            pan: c.pan || 'N/A',
            gstin: c.gstin || 'N/A',
            companyType: c.companyType || 'Private Limited',
            industry: c.industry || 'General',
            sector: c.sector || 'General',
            website: c.website || '',
            registeredAddress: c.registeredAddress,
            address: c.registeredAddress || c.address,
            officialEmail: c.officialEmail,
            officialMobile: c.officialMobile,
            repName: owner?.name,
            repEmail: owner?.email,
            repMobile: owner?.mobile,
            description: c.description || '',
            bankDetails: c.bankDetails || c.bankAccount,
            directors: c.directors || [],
            description: c.description || '',
            authorizedCapital: c.authorizedCapital,
            paidUpCapital: c.paidUpCapital
          },
          documents,
          statusHistory: c.statusHistory?.length ? c.statusHistory : (owner?.statusHistory || [])
        });
      }
    }

    // Combine or sort by submittedAt descending
    const applications = [...investorList, ...companyList].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Compute stats
    const allProfiles = await InvestorProfile.find().populate('userId');
    const allCompanies = await Company.find().populate('ownerUserId');

    let totalPending = 0;
    let pendingInvestors = 0;
    let pendingCompanies = 0;
    let totalApproved = 0;
    let totalRejected = 0;
    let resubmissionsNeeded = 0;

    allProfiles.forEach(p => {
      const st = p.registrationStatus || p.userId?.registrationStatus || (p.kycStatus === 'Approved' ? 'Approved' : 'Pending Approval');
      if (st === 'Pending Approval') {
        totalPending++;
        pendingInvestors++;
      } else if (st === 'Approved') {
        totalApproved++;
      } else if (st === 'Rejected') {
        totalRejected++;
      } else if (st === 'Resubmission Required') {
        resubmissionsNeeded++;
      }
    });

    allCompanies.forEach(c => {
      const st = c.registrationStatus || (c.status === 'Approved' ? 'Approved' : 'Pending Approval');
      if (st === 'Pending Approval') {
        totalPending++;
        pendingCompanies++;
      } else if (st === 'Approved') {
        totalApproved++;
      } else if (st === 'Rejected') {
        totalRejected++;
      } else if (st === 'Resubmission Required') {
        resubmissionsNeeded++;
      }
    });

    return res.json({
      success: true,
      stats: {
        totalPending,
        pending: totalPending,
        pendingInvestors,
        pendingCompanies,
        totalApproved,
        approved: totalApproved,
        totalRejected,
        rejected: totalRejected,
        resubmissionsNeeded,
        resubmission: resubmissionsNeeded,
        totalApplications: allProfiles.length + allCompanies.length,
        total: allProfiles.length + allCompanies.length
      },
      applications,
      approvals: applications
    });
  } catch (error) {
    next(error);
  }
}

export async function getApprovalById(req, res, next) {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (type === 'investor') {
      const profile = await InvestorProfile.findById(id).populate('userId');
      if (!profile) return res.status(404).json({ success: false, error: 'Investor profile not found' });
      const kyc = await KYC.findOne({ investorId: profile.userId?._id });
      return res.json({ success: true, application: { profile, kyc, user: profile.userId } });
    } else {
      const company = await Company.findById(id).populate('ownerUserId').populate('userId');
      if (!company) return res.status(404).json({ success: false, error: 'Company record not found' });
      return res.json({ success: true, application: { company } });
    }
  } catch (error) {
    next(error);
  }
}

export async function decideRegistrationApproval(req, res, next) {
  try {
    const { id } = req.params;
    const { type, decision, reason } = req.body;

    if (!['Approved', 'Rejected', 'Resubmission Required'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'Decision must be Approved, Rejected, or Resubmission Required.' });
    }

    const trimmedReason = (reason && reason.trim()) || (decision === 'Approved' ? 'Application verified and compliant with regulatory KYC/KYB requirements.' : '');

    if (!trimmedReason) {
      return res.status(400).json({ success: false, error: 'A written reason or compliance remark is required for any decision.' });
    }
    const adminId = req.user._id;
    const adminName = req.user.name || 'Compliance Admin';
    const now = new Date();

    if (type === 'investor') {
      let profile = await InvestorProfile.findById(id).populate('userId');
      let user = profile?.userId;
      if (!profile) {
        user = await User.findById(id);
        if (user) profile = await InvestorProfile.findOne({ userId: user._id });
      }

      if (!user) {
        return res.status(404).json({ success: false, error: 'Investor user account not found.' });
      }

      const historyEntry = {
        status: decision,
        reason: trimmedReason,
        adminId,
        adminName,
        timestamp: now
      };

      user.registrationStatus = decision;
      user.rejectionReason = decision === 'Approved' ? null : trimmedReason;
      user.adminRemarks = trimmedReason;
      user.reviewedAt = now;
      user.reviewedBy = adminId;
      if (decision === 'Approved') {
        user.accountStatus = 'Active';
        user.fundingStatus = 'Allowed';
      }
      if (!user.statusHistory) user.statusHistory = [];
      user.statusHistory.push(historyEntry);
      await user.save();

      if (profile) {
        profile.registrationStatus = decision;
        profile.kycStatus = decision;
        profile.kycReason = trimmedReason;
        profile.rejectionReason = decision === 'Approved' ? null : trimmedReason;
        if (!profile.statusHistory) profile.statusHistory = [];
        profile.statusHistory.push(historyEntry);
        if (decision === 'Approved' && profile.bankAccount) {
          profile.bankAccount.verified = true;
          if (profile.bankDetails) profile.bankDetails.isVerified = true;
        }
        await profile.save();
      }

      const kyc = await KYC.findOne({ investorId: user._id });
      if (kyc) {
        kyc.status = decision;
        kyc.registrationStatus = decision;
        kyc.rejectionReason = decision === 'Approved' ? '' : trimmedReason;
        kyc.reviewedAt = now;
        await kyc.save();
      }

      await logAction({
        actorId: adminId,
        role: req.user.role,
        action: `INVESTOR_REGISTRATION_${decision.toUpperCase().replace(/\s+/g, '_')}`,
        targetEntity: 'User',
        targetId: user._id,
        reason: trimmedReason,
        ipAddress: req.ip
      });

      // Broadcast real-time SSE event to Web & Mobile
      broadcastSyncEvent('REGISTRATION_DECISION', 'DECIDED', {
        id: user._id,
        userId: user._id,
        profileId: profile?._id,
        role: 'investor',
        name: user.name,
        email: user.email,
        decision,
        status: decision,
        reason: trimmedReason,
        reviewedBy: adminName,
        timestamp: now
      });

      return res.json({
        success: true,
        message: `Investor application marked as ${decision}.`,
        decision,
        user: { id: user._id, registrationStatus: user.registrationStatus }
      });
    } else {
      // Company decision
      const company = await Company.findById(id).populate('ownerUserId').populate('userId');
      if (!company) {
        return res.status(404).json({ success: false, error: 'Company record not found.' });
      }

      const owner = company.ownerUserId || company.userId;
      const historyEntry = {
        status: decision,
        reason: trimmedReason,
        adminId,
        adminName,
        timestamp: now
      };

      company.registrationStatus = decision;
      company.status = decision === 'Approved' ? 'Active' : decision;
      company.verificationStatus = decision;
      company.statusReason = trimmedReason;
      company.rejectionReason = decision === 'Approved' ? null : trimmedReason;
      company.verificationRemarks = trimmedReason;
      company.verifiedAt = now;
      if (decision === 'Approved') {
        company.accountStatus = 'Active';
        company.fundingStatus = 'Allowed';
      }
      if (!company.statusHistory) company.statusHistory = [];
      company.statusHistory.push(historyEntry);
      if (decision === 'Approved' && company.bankAccount) {
        company.bankAccount.verified = true;
        if (company.bankDetails) company.bankDetails.isVerified = true;
      }
      await company.save();

      if (owner) {
        owner.registrationStatus = decision;
        owner.rejectionReason = decision === 'Approved' ? null : trimmedReason;
        owner.adminRemarks = trimmedReason;
        owner.reviewedAt = now;
        owner.reviewedBy = adminId;
        if (decision === 'Approved') {
          owner.accountStatus = 'Active';
          owner.fundingStatus = 'Allowed';
        }
        if (!owner.statusHistory) owner.statusHistory = [];
        owner.statusHistory.push(historyEntry);
        await owner.save();
      }

      await logAction({
        actorId: adminId,
        role: req.user.role,
        action: `COMPANY_REGISTRATION_${decision.toUpperCase().replace(/\s+/g, '_')}`,
        targetEntity: 'Company',
        targetId: company._id,
        reason: trimmedReason,
        ipAddress: req.ip
      });

      // Broadcast real-time SSE event to Web & Mobile
      broadcastSyncEvent('REGISTRATION_DECISION', 'DECIDED', {
        id: company._id,
        companyId: company._id,
        userId: owner?._id,
        role: 'company',
        legalName: company.legalName,
        decision,
        status: decision,
        reason: trimmedReason,
        reviewedBy: adminName,
        timestamp: now
      });

      return res.json({
        success: true,
        message: `Company application marked as ${decision}.`,
        decision,
        company: { id: company._id, registrationStatus: company.registrationStatus }
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function previewDocument(req, res, next) {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    let filePath = path.join(uploadDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      const ext = path.extname(safeFilename).toLowerCase();
      const fallback = ext === '.pdf' ? 'sample-incorporation.pdf' : 'sample-pan.png';
      const fallbackPath = path.join(uploadDir, fallback);
      if (fs.existsSync(fallbackPath)) {
        filePath = fallbackPath;
      } else {
        return res.status(404).json({ success: false, error: 'Document file not found' });
      }
    }

    const effectiveExt = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg'
    };
    const contentType = mimeTypes[effectiveExt] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
    return fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    next(error);
  }
}

export async function downloadDocument(req, res, next) {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    let filePath = path.join(uploadDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      const ext = path.extname(safeFilename).toLowerCase();
      const fallback = ext === '.pdf' ? 'sample-incorporation.pdf' : 'sample-pan.png';
      const fallbackPath = path.join(uploadDir, fallback);
      if (fs.existsSync(fallbackPath)) {
        filePath = fallbackPath;
      } else {
        return res.status(404).json({ success: false, error: 'Document file not found' });
      }
    }

    return res.download(filePath, path.basename(filePath));
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 19. COMPANY FUNDING REQUESTS (PRD & WORKFLOW)
// ==========================================
export async function getFundingRequests(req, res, next) {
  try {
    const {
      status = 'all',
      search = '',
      fundingDuration = 'all',
      investmentPurpose = 'all'
    } = req.query;

    let query = {};

    // Intelligent status mapping
    if (status && status !== 'all') {
      const sLower = status.toLowerCase();
      if (sLower === 'pending' || sLower === 'pending review' || sLower === 'pending approval') {
        query.status = { $in: ['Submitted', 'Under Review'] };
      } else if (sLower === 'approved' || sLower === 'live') {
        query.status = { $in: ['Approved', 'Open for Investment', 'Funded', 'Funding Completed'] };
      } else if (sLower === 'resubmission' || sLower === 'resubmission required' || sLower === 'changes requested') {
        query.status = { $in: ['Resubmission Required', 'Changes Requested', 'Additional Information Required'] };
      } else if (sLower === 'rejected') {
        query.status = 'Rejected';
      } else {
        query.status = status;
      }
    }

    if (fundingDuration && fundingDuration !== 'all') {
      query.fundingDuration = fundingDuration;
    }

    if (investmentPurpose && investmentPurpose !== 'all') {
      query.investmentPurpose = investmentPurpose;
    }

    let requests = await InvestmentRequest.find(query)
      .populate('companyId')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      requests = requests.filter(r =>
        r.title?.toLowerCase().includes(s) ||
        r.companyId?.name?.toLowerCase().includes(s) ||
        r.companyId?.legalName?.toLowerCase().includes(s) ||
        r.category?.toLowerCase().includes(s) ||
        r.entityOrProjectName?.toLowerCase().includes(s) ||
        r.investmentPurpose?.toLowerCase().includes(s) ||
        r.fundingDuration?.toLowerCase().includes(s)
      );
    }

    // Global counts across all requests for accurate dashboard counters
    const allRequests = await InvestmentRequest.find({});
    const totalPending = allRequests.filter(r => ['Submitted', 'Under Review'].includes(r.status)).length;
    const totalApproved = allRequests.filter(r => ['Approved', 'Open for Investment', 'Funded', 'Funding Completed'].includes(r.status)).length;
    const resubmissionsNeeded = allRequests.filter(r => ['Resubmission Required', 'Changes Requested', 'Additional Information Required'].includes(r.status)).length;
    const totalRejected = allRequests.filter(r => r.status === 'Rejected').length;
    const pendingCapitalPaise = allRequests
      .filter(r => ['Submitted', 'Under Review'].includes(r.status))
      .reduce((sum, r) => sum + (Number(r.fundingTarget) || 0) * 100, 0);

    return res.json({
      success: true,
      count: requests.length,
      stats: {
        total: allRequests.length,
        totalPending,
        totalApproved,
        resubmissionsNeeded,
        totalRejected,
        pendingCapitalPaise
      },
      requests
    });
  } catch (error) {
    next(error);
  }
}

export async function getFundingRequestById(req, res, next) {
  try {
    const request = await InvestmentRequest.findById(req.params.id)
      .populate('companyId')
      .populate('reviewedBy', 'name email role');
    if (!request) {
      return res.status(404).json({ success: false, error: 'Funding request not found' });
    }
    return res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
}

export async function decideFundingRequest(req, res, next) {
  try {
    const { id } = req.params;
    const {
      decision,
      feedback,
      publishToMarketplace = true,
      // Counter proposal parameters
      proposedFundingTarget,
      proposedReturnRate,
      proposedDurationMonths,
      proposedMinInvestment,
      proposedMaxInvestment
    } = req.body;

    const request = await InvestmentRequest.findById(id).populate('companyId');
    if (!request) {
      return res.status(404).json({ success: false, error: 'Funding request not found' });
    }

    const company = request.companyId;
    if (!company) {
      return res.status(404).json({ success: false, error: 'Associated company not found' });
    }

    const trimmedFeedback = feedback?.trim() || '';

    if (decision === 'Approved') {
      // If admin modified the parameters on approval, apply them
      if (proposedFundingTarget) {
        request.fundingTarget = Number(proposedFundingTarget);
      }
      if (proposedReturnRate) {
        request.expectedReturnRate = Number(proposedReturnRate);
        request.agreedReturnRate = Number(proposedReturnRate);
      }
      if (proposedDurationMonths) {
        request.durationMonths = Number(proposedDurationMonths);
        request.investmentPeriodYears = Math.round(Number(proposedDurationMonths) / 12) || 1;
      }
      if (proposedMinInvestment) {
        request.minInvestment = Number(proposedMinInvestment);
      }

      const finalStatus = publishToMarketplace ? 'Open for Investment' : 'Approved';
      request.status = finalStatus;
      request.reviewerFeedback = trimmedFeedback || 'Funding request approved by platform administration.';
      request.reviewedBy = req.user._id;
      request.reviewedAt = new Date();
      await request.save();

      // Check if an offer already exists for this request
      let offer = await Offer.findOne({ title: request.title, companyId: company._id });

      const kind = request.investmentPurpose === 'Project Investment'
        ? 'project'
        : 'company';

      const targetPaise = Math.round((request.fundingTarget || 100000) * 100);
      const minTargetPaise = Math.round((request.minInvestment || (request.fundingTarget ? request.fundingTarget * 0.1 : 25000)) * 100);
      const rateBps = Math.round((request.expectedReturnRate || request.agreedReturnRate || 3) * 100);
      const tenureMonths = request.durationMonths || (request.investmentPeriodYears ? request.investmentPeriodYears * 12 : 24);
      const tenures = [tenureMonths];

      const offerStatus = publishToMarketplace ? Statuses.OFFER.OPEN : Statuses.OFFER.DRAFT;

      if (!offer) {
        offer = new Offer({
          kind,
          companyId: company._id,
          title: request.title || request.entityOrProjectName || `${company.name} Capital Raise`,
          description: request.detailedDescription || request.shortDescription || 'Verified enterprise opportunity',
          useOfFunds: request.useOfFunds || 'Business expansion and operational deployment',
          targetPaise,
          minTargetPaise,
          rateBps,
          tenures,
          status: offerStatus,
          windowStart: new Date(),
          windowEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          photos: [],
          documents: (request.supportingDocuments || []).map(d => ({ name: d.name, url: d.fileUrl }))
        });
      } else {
        offer.status = offerStatus;
        offer.targetPaise = targetPaise;
        offer.minTargetPaise = minTargetPaise;
        offer.rateBps = rateBps;
        offer.tenures = tenures;
      }
      await offer.save();

      // Ensure OfferTerms is created and accepted so it's fully active
      let terms = await OfferTerms.findOne({ offerId: offer._id }).sort({ version: -1 });
      if (!terms) {
        terms = new OfferTerms({
          offerId: offer._id,
          version: 1,
          targetPaise: offer.targetPaise,
          minTargetPaise: offer.minTargetPaise,
          rateBps: offer.rateBps,
          tenures: offer.tenures,
          fundingWindowDays: 30,
          termsBody: `Standard terms agreed for ${offer.title}`,
          acceptedByCompanyAt: new Date()
        });
      } else {
        terms.acceptedByCompanyAt = new Date();
      }
      await terms.save();

      await logAction({
        actorId: req.user._id,
        role: req.user.role,
        action: 'FUNDING_REQUEST_APPROVED',
        targetEntity: 'InvestmentRequest',
        targetId: request._id,
        reason: request.reviewerFeedback,
        ipAddress: req.ip
      });

      broadcastSyncEvent('FUNDING_REQUEST_DECISION', 'DECIDED', {
        requestId: request._id,
        offerId: offer._id,
        decision: 'Approved',
        status: request.status,
        companyId: company._id,
        title: request.title
      });

      broadcastSyncEvent('INVESTMENT_APPROVAL', 'APPROVED', {
        requestId: request._id,
        status: request.status,
        companyId: company._id
      });

      return res.json({
        success: true,
        message: publishToMarketplace
          ? 'Funding request approved and published live to investment marketplace!'
          : 'Funding request approved (saved in draft offers).',
        request,
        offer
      });
    } else if (decision === 'Rejected') {
      request.status = 'Rejected';
      request.reviewerFeedback = trimmedFeedback || 'Request rejected based on underwriting criteria.';
      request.reviewedBy = req.user._id;
      request.reviewedAt = new Date();
      await request.save();

      await logAction({
        actorId: req.user._id,
        role: req.user.role,
        action: 'FUNDING_REQUEST_REJECTED',
        targetEntity: 'InvestmentRequest',
        targetId: request._id,
        reason: request.reviewerFeedback,
        ipAddress: req.ip
      });

      broadcastSyncEvent('FUNDING_REQUEST_DECISION', 'DECIDED', {
        requestId: request._id,
        decision: 'Rejected',
        status: request.status,
        companyId: company._id,
        title: request.title
      });

      broadcastSyncEvent('INVESTMENT_APPROVAL', 'REJECTED', {
        requestId: request._id,
        status: request.status,
        companyId: company._id
      });

      return res.json({
        success: true,
        message: 'Funding request has been rejected.',
        request
      });
    } else if (
      decision === 'Resubmission Required' ||
      decision === 'Changes Requested' ||
      decision === 'Additional Information Required'
    ) {
      const pTarget = (proposedFundingTarget !== undefined && proposedFundingTarget !== null && proposedFundingTarget !== '')
        ? Number(proposedFundingTarget)
        : null;
      const pRate = (proposedReturnRate !== undefined && proposedReturnRate !== null && proposedReturnRate !== '')
        ? Number(proposedReturnRate)
        : null;
      const pMonths = (proposedDurationMonths !== undefined && proposedDurationMonths !== null && proposedDurationMonths !== '')
        ? Number(proposedDurationMonths)
        : null;
      const pMin = (proposedMinInvestment !== undefined && proposedMinInvestment !== null && proposedMinInvestment !== '')
        ? Number(proposedMinInvestment)
        : null;
      const pMax = (proposedMaxInvestment !== undefined && proposedMaxInvestment !== null && proposedMaxInvestment !== '')
        ? Number(proposedMaxInvestment)
        : null;

      request.status = 'Resubmission Required';
      request.proposedFundingTarget = pTarget;
      request.proposedReturnRate = pRate;
      request.proposedDurationMonths = pMonths;
      request.proposedMinInvestment = pMin;
      request.proposedMaxInvestment = pMax;
      request.reviewerFeedback = trimmedFeedback || 'Please update the requested parameters (fund amount, interest rate, tenure, etc.) and resubmit.';
      request.reviewedBy = req.user._id;
      request.reviewedAt = new Date();

      request.adminSuggestions = {
        fundingTarget: pTarget,
        returnRate: pRate,
        durationMonths: pMonths,
        minInvestment: pMin,
        maxInvestment: pMax,
        notes: trimmedFeedback,
        suggestedAt: new Date(),
        suggestedBy: req.user._id
      };

      request.revisionHistory = request.revisionHistory || [];
      request.revisionHistory.push({
        suggestedBy: req.user._id,
        suggestedAt: new Date(),
        decision: 'Resubmission Required',
        feedback: trimmedFeedback,
        proposedFundingTarget: pTarget,
        proposedReturnRate: pRate,
        proposedDurationMonths: pMonths,
        proposedMinInvestment: pMin,
        proposedMaxInvestment: pMax,
        originalFundingTarget: request.fundingTarget,
        originalReturnRate: request.expectedReturnRate || request.agreedReturnRate
      });

      await request.save();

      await logAction({
        actorId: req.user._id,
        role: req.user.role,
        action: 'FUNDING_REQUEST_CHANGES_REQUESTED',
        targetEntity: 'InvestmentRequest',
        targetId: request._id,
        reason: request.reviewerFeedback,
        details: {
          proposedFundingTarget: pTarget,
          proposedReturnRate: pRate,
          proposedDurationMonths: pMonths
        },
        ipAddress: req.ip
      });

      broadcastSyncEvent('FUNDING_REQUEST_DECISION', 'DECIDED', {
        requestId: request._id,
        decision: 'Resubmission Required',
        status: request.status,
        companyId: company._id,
        title: request.title,
        proposedFundingTarget: pTarget,
        proposedReturnRate: pRate
      });

      broadcastSyncEvent('INVESTMENT_APPROVAL', 'CHANGES_REQUESTED', {
        requestId: request._id,
        status: request.status,
        companyId: company._id
      });

      return res.json({
        success: true,
        message: 'Resubmission request sent to company with proposed changes.',
        request
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid decision specified' });
    }
  } catch (error) {
    next(error);
  }
}




// ==========================================
// INVESTOR INVESTMENT REQUESTS / APPROVALS
// ==========================================

export async function getInvestorRequests(req, res, next) {
  try {
    const {
      status = 'all',
      search = '',
      kind = 'all'
    } = req.query;

    let query = {};

    // Filter by status
    if (status && status !== 'all') {
      const sLower = status.toLowerCase();
      if (sLower === 'pending' || sLower === 'pending review' || sLower === 'pending approval') {
        query.status = { $in: ['Pending Review', 'Submitted', 'Pending payment', 'Under Review'] };
      } else if (sLower === 'changes requested' || sLower === 'resubmission') {
        query.status = { $in: ['Changes Requested', 'Resubmission Required'] };
      } else if (sLower === 'approved' || sLower === 'confirmed' || sLower === 'active') {
        query.status = { $in: ['Approved', 'Confirmed', 'Active', 'Completed'] };
      } else if (sLower === 'rejected') {
        query.status = 'Rejected';
      } else {
        query.status = status;
      }
    }

    let requests = await Investment.find(query)
      .populate({
        path: 'investorId',
        select: 'name email mobile status role createdAt'
      })
      .populate({
        path: 'offerId',
        select: 'title companyName category returnRate tenureMonths targetAmount raisedAmount kind minInvestment maxInvestment status rateBps tenures targetPaise raisedPaise'
      })
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    // Populate investor KYC details for each request
    const investorIds = requests.map(r => r.investorId?._id).filter(Boolean);
    const kycProfiles = await InvestorProfile.find({ userId: { $in: investorIds } }).select('userId kycStatus panNumber');
    const kycMap = {};
    kycProfiles.forEach(p => {
      if (p.userId) {
        kycMap[p.userId.toString()] = {
          kycStatus: p.kycStatus,
          panNumber: p.panNumber
        };
      }
    });

    let transformed = requests.map(r => {
      const obj = r.toObject();
      const kycInfo = r.investorId?._id ? kycMap[r.investorId._id.toString()] : null;
      return {
        ...obj,
        investorKycStatus: kycInfo?.kycStatus || 'Pending',
        investorPan: kycInfo?.panNumber || '—'
      };
    });

    // Filter by kind if specified
    if (kind && kind !== 'all') {
      transformed = transformed.filter(r => r.offerId?.kind === kind);
    }

    // Filter by search string if specified
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      transformed = transformed.filter(r =>
        r.investorId?.name?.toLowerCase().includes(s) ||
        r.investorId?.email?.toLowerCase().includes(s) ||
        r.investorId?.mobile?.toLowerCase().includes(s) ||
        r.offerId?.title?.toLowerCase().includes(s) ||
        r.offerId?.companyName?.toLowerCase().includes(s) ||
        r.investorPan?.toLowerCase().includes(s) ||
        r.certificateNumber?.toLowerCase().includes(s)
      );
    }

    // Calculate global stats across all investments
    const allInvs = await Investment.find({});
    const totalPending = allInvs.filter(i => ['Pending Review', 'Submitted', 'Pending payment', 'Under Review'].includes(i.status)).length;
    const changesRequested = allInvs.filter(i => ['Changes Requested', 'Resubmission Required'].includes(i.status)).length;
    const totalApproved = allInvs.filter(i => ['Approved', 'Confirmed', 'Active', 'Completed'].includes(i.status)).length;
    const totalRejected = allInvs.filter(i => i.status === 'Rejected').length;
    const pendingCapitalPaise = allInvs
      .filter(i => ['Pending Review', 'Submitted', 'Pending payment', 'Under Review'].includes(i.status))
      .reduce((sum, i) => sum + (Number(i.amountInvested || i.amount || 0) * 100), 0);

    return res.json({
      success: true,
      count: transformed.length,
      stats: {
        total: allInvs.length,
        totalPending,
        changesRequested,
        totalApproved,
        totalRejected,
        pendingCapitalPaise
      },
      requests: transformed
    });
  } catch (error) {
    next(error);
  }
}

export async function getInvestorRequestById(req, res, next) {
  try {
    const investment = await Investment.findById(req.params.id)
      .populate('investorId', 'name email mobile status role createdAt')
      .populate('offerId')
      .populate('reviewedBy', 'name email role');

    if (!investment) {
      return res.status(404).json({ success: false, error: 'Investor request not found' });
    }

    const profile = await InvestorProfile.findOne({ userId: investment.investorId?._id });

    return res.json({
      success: true,
      request: {
        ...investment.toObject(),
        investorProfile: profile || null
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function decideInvestorRequest(req, res, next) {
  try {
    const { id } = req.params;
    const {
      decision, // 'Approved' | 'Rejected' | 'Changes Requested'
      feedback,
      proposedAmount, // counter-amount if admin is revising the requested sum
      rejectionReason
    } = req.body;

    const investment = await Investment.findById(id)
      .populate('investorId')
      .populate('offerId');

    if (!investment) {
      return res.status(404).json({ success: false, error: 'Investor request not found' });
    }

    const trimmedFeedback = (feedback || '').trim();
    const investor = investment.investorId;
    const offer = investment.offerId;

    if (decision === 'Approved') {
      const finalAmount = proposedAmount ? Number(proposedAmount) : (investment.amountInvested || investment.amount || 0);
      investment.amountInvested = finalAmount;
      investment.amount = finalAmount;
      investment.amountPaise = Math.round(finalAmount * 100);
      investment.status = 'Approved';
      investment.adminFeedback = trimmedFeedback || 'Investment application approved by platform administration.';
      investment.reviewedBy = req.user._id;
      investment.reviewedAt = new Date();

      // Recalculate returns based on approved amount
      const annualRate = investment.returnRate || (offer ? offer.returnRate || (offer.rateBps ? offer.rateBps / 100 : 12) : 12);
      const tenureMonths = investment.tenureMonths || (offer ? offer.tenureMonths || (offer.tenures ? offer.tenures[0] : 12) : 12);
      const totalInterest = Math.round((finalAmount * annualRate * (tenureMonths / 12)) / 100);
      const totalMaturity = finalAmount + totalInterest;

      investment.returnRate = annualRate;
      investment.tenureMonths = tenureMonths;
      investment.expectedReturns = totalMaturity;

      if (!investment.startDate) investment.startDate = new Date();
      if (!investment.maturityDate) {
        const mat = new Date(investment.startDate);
        mat.setMonth(mat.getMonth() + tenureMonths);
        investment.maturityDate = mat;
      }

      await investment.save();

      // Update offer raised amount if associated offer exists
      if (offer) {
        offer.raisedAmount = (offer.raisedAmount || 0) + finalAmount;
        offer.raisedPaise = (offer.raisedPaise || 0) + Math.round(finalAmount * 100);
        if (offer.targetAmount && offer.raisedAmount >= offer.targetAmount) {
          offer.status = 'Fully Funded';
        }
        await offer.save();
      }

      // Record transaction
      const txnRef = 'TXN_' + Math.floor(100000000 + Math.random() * 900000000);
      try {
        await Transaction.create({
          investorId: investor?._id,
          investmentId: investment._id,
          title: `Investment in ${offer?.companyName || offer?.title || 'Opportunity'}`,
          type: 'Investment',
          amount: finalAmount,
          amountPaise: Math.round(finalAmount * 100),
          status: 'Confirmed',
          referenceId: txnRef,
          paymentMethod: 'Bank Transfer / Platform Balance',
          description: `Approved investment into ${offer?.title || 'Corporate Debt'} (${annualRate}% p.a. for ${tenureMonths} Months)`
        });
      } catch (txErr) {
        console.warn('Transaction creation notice:', txErr.message);
      }

      // Generate payouts schedule if not yet present
      const existingPayouts = await Payout.find({ investmentId: investment._id });
      if (existingPayouts.length === 0 && tenureMonths > 0) {
        const monthlyReturnAmount = Math.round(totalInterest / tenureMonths);
        for (let m = 1; m <= tenureMonths; m++) {
          const payoutDate = new Date(investment.startDate);
          payoutDate.setMonth(payoutDate.getMonth() + m);

          await Payout.create({
            investorId: investor?._id,
            investmentId: investment._id,
            offerTitle: offer?.companyName || offer?.title || 'Investment Offer',
            amount: m === tenureMonths ? monthlyReturnAmount + finalAmount : monthlyReturnAmount,
            amountPaise: Math.round((m === tenureMonths ? monthlyReturnAmount + finalAmount : monthlyReturnAmount) * 100),
            payoutType: m === tenureMonths ? 'Maturity Payout' : 'Monthly Interest',
            scheduledDate: payoutDate,
            status: Statuses.PAYOUT.SCHEDULED || 'Scheduled'
          });
        }
      }

      // Log action in audit log
      await logAction({
        actorId: req.user._id,
        role: req.user.role,
        action: 'INVESTOR_REQUEST_APPROVED',
        targetEntity: 'Investment',
        targetId: investment._id,
        reason: investment.adminFeedback,
        ipAddress: req.ip
      });

      broadcastSyncEvent('INVESTMENT_DECISION', 'APPROVED', {
        investmentId: investment._id,
        status: investment.status,
        investorId: investor?._id,
        amount: finalAmount
      });

      return res.json({
        success: true,
        message: `Investment request for ₹${finalAmount.toLocaleString('en-IN')} approved successfully!`,
        investment
      });
    } else if (decision === 'Rejected') {
      const reason = (rejectionReason || trimmedFeedback || 'Investment application rejected based on allocation guidelines.').trim();
      investment.status = 'Rejected';
      investment.rejectionReason = reason;
      investment.adminFeedback = trimmedFeedback || reason;
      investment.reviewedBy = req.user._id;
      investment.reviewedAt = new Date();
      await investment.save();

      await logAction({
        actorId: req.user._id,
        role: req.user.role,
        action: 'INVESTOR_REQUEST_REJECTED',
        targetEntity: 'Investment',
        targetId: investment._id,
        reason,
        ipAddress: req.ip
      });

      broadcastSyncEvent('INVESTMENT_DECISION', 'REJECTED', {
        investmentId: investment._id,
        status: investment.status,
        investorId: investor?._id,
        reason
      });

      return res.json({
        success: true,
        message: 'Investment application rejected.',
        investment
      });
    } else if (decision === 'Changes Requested' || decision === 'Resubmission Required') {
      const pAmount = (proposedAmount !== undefined && proposedAmount !== null && proposedAmount !== '')
        ? Number(proposedAmount)
        : null;

      investment.status = 'Changes Requested';
      investment.proposedAmount = pAmount;
      investment.proposedAmountPaise = pAmount ? Math.round(pAmount * 100) : null;
      investment.adminSuggestions = trimmedFeedback || `Admin proposed revised investment amount of ₹${pAmount ? pAmount.toLocaleString('en-IN') : 'N/A'}`;
      investment.adminFeedback = trimmedFeedback;
      investment.reviewedBy = req.user._id;
      investment.reviewedAt = new Date();

      investment.revisionHistory = investment.revisionHistory || [];
      investment.revisionHistory.push({
        amount: investment.amountInvested || investment.amount,
        proposedAmount: pAmount,
        feedback: trimmedFeedback,
        decision: 'Changes Requested',
        date: new Date(),
        changedBy: req.user.name || 'Admin'
      });

      await investment.save();

      await logAction({
        actorId: req.user._id,
        role: req.user.role,
        action: 'INVESTOR_REQUEST_CHANGES_REQUESTED',
        targetEntity: 'Investment',
        targetId: investment._id,
        reason: trimmedFeedback,
        details: { proposedAmount: pAmount },
        ipAddress: req.ip
      });

      broadcastSyncEvent('INVESTMENT_DECISION', 'CHANGES_REQUESTED', {
        investmentId: investment._id,
        status: investment.status,
        investorId: investor?._id,
        proposedAmount: pAmount
      });

      return res.json({
        success: true,
        message: `Changes requested. Proposed counter amount of ₹${pAmount ? pAmount.toLocaleString('en-IN') : 'N/A'} sent to investor.`,
        investment
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid decision specified' });
    }
  } catch (error) {
    next(error);
  }
}


// ==========================================
// OFFER INVESTORS LIST
// ==========================================

export async function getOfferInvestments(req, res, next) {
  try {
    const { id } = req.params;
    let offer = await Offer.findById(id).populate('companyId', 'name legalName regNo');
    
    // If not found in Offer, it could be an InvestmentRequest ID
    let requestProposal = null;
    if (!offer) {
      requestProposal = await InvestmentRequest.findById(id).populate('companyId', 'name legalName regNo');
    }

    // Find investments matching this offer or matching by title/company
    let query = { offerId: id };
    if (!offer && requestProposal) {
      const matchingOffer = await Offer.findOne({ companyId: requestProposal.companyId?._id, title: requestProposal.title });
      if (matchingOffer) {
        query = { offerId: matchingOffer._id };
        offer = matchingOffer;
      } else {
        query = { offerId: requestProposal._id };
      }
    }

    const investments = await Investment.find(query)
      .populate('investorId', 'name email mobile status role')
      .sort({ createdAt: -1 });

    const totalInvestedPaise = investments
      .filter(i => i.status !== 'Rejected' && i.status !== 'Cancelled')
      .reduce((sum, i) => sum + (i.amountPaise || (Number(i.amountInvested || i.amount || 0) * 100)), 0);

    const targetOfferInfo = offer || requestProposal;

    return res.json({
      success: true,
      offer: {
        id: targetOfferInfo?._id,
        title: targetOfferInfo?.title || 'Investment Opportunity',
        companyName: targetOfferInfo?.companyId?.name || targetOfferInfo?.companyId?.legalName || 'Registered Enterprise',
        targetPaise: targetOfferInfo?.targetPaise || (Number(targetOfferInfo?.fundingTarget || 0) * 100),
        raisedPaise: targetOfferInfo?.raisedPaise || totalInvestedPaise,
        status: targetOfferInfo?.status || 'Open',
        returnRate: targetOfferInfo?.returnRate || (targetOfferInfo?.rateBps ? targetOfferInfo.rateBps / 100 : (targetOfferInfo?.expectedReturnRate || 12)),
        tenureMonths: targetOfferInfo?.tenures ? targetOfferInfo.tenures[0] : (targetOfferInfo?.durationMonths || 12)
      },
      count: investments.length,
      totalInvestedPaise,
      investors: investments.map(inv => ({
        id: inv._id,
        investorName: inv.investorId?.name || 'Verified Investor',
        investorEmail: inv.investorId?.email || '—',
        investorMobile: inv.investorId?.mobile || '—',
        amount: inv.amountInvested || inv.amount || (inv.amountPaise ? inv.amountPaise / 100 : 0),
        amountPaise: inv.amountPaise || Math.round((Number(inv.amountInvested || inv.amount || 0)) * 100),
        status: inv.status || 'Confirmed',
        date: inv.createdAt,
        certificateNumber: inv.certificateNumber || '—',
        returnRate: inv.returnRate,
        tenureMonths: inv.tenureMonths,
        expectedReturns: inv.expectedReturns
      }))
    });
  } catch (error) {
    next(error);
  }
}
