import { Payout } from '../models/Payout.js';
import { Investment } from '../models/Investment.js';
import { ReturnPayment } from '../models/ReturnPayment.js';
import { ReturnAgreement } from '../models/ReturnAgreement.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Helper to compute remaining tenure months given a maturityDate and scheduled or current date
function calculateRemainingTenure(maturityDate, baseDate = new Date(), totalTenure = 12) {
  if (!maturityDate) return totalTenure;
  const target = new Date(maturityDate);
  const current = new Date(baseDate);
  const diffTime = target.getTime() - current.getTime();
  if (diffTime <= 0) return 0;
  const months = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.4375));
  return Math.max(0, months);
}

// @route   GET /api/payouts
// @desc    Get upcoming scheduled and completed payouts for logged-in investor
export const getPayouts = asyncHandler(async (req, res) => {
  const investorId = req.user._id;

  const payouts = await Payout.find({ investorId })
    .populate({
      path: 'investmentId',
      populate: {
        path: 'offerId',
        select: 'title kind rateBps companyId tenures'
      }
    })
    .populate('offerId')
    .sort({ scheduledDate: 1 });

  let totalReceived = 0;
  let totalScheduled = 0;
  const completedList = [];
  const upcomingList = [];

  const formattedPayouts = payouts.map((p) => {
    const inv = p.investmentId || {};
    const offer = p.offerId || inv.offerId || {};

    const investedAmount =
      inv.amount ||
      inv.amountInvested ||
      (inv.amountPaise ? inv.amountPaise / 100 : 0) ||
      (p.amountInvested || 0);

    const projectTitle =
      offer.title ||
      p.offerTitle ||
      inv.offerTitle ||
      'Investment Project';

    const ratePercent =
      inv.returnRate != null
        ? inv.returnRate
        : offer.rateBps
        ? (offer.rateBps / 100)
        : 12;

    const tenureMonths =
      inv.tenureMonths ||
      (offer.tenures && offer.tenures.length > 0 ? offer.tenures[0] : 12);

    const payoutDate = p.scheduledDate || p.paidDate || p.createdAt || new Date();
    const remainingTenureMonths = calculateRemainingTenure(
      inv.maturityDate,
      payoutDate,
      tenureMonths
    );

    const payoutObj = {
      ...p.toObject(),
      investedAmount,
      projectTitle,
      returnRate: ratePercent,
      ratePercent,
      tenureMonths,
      remainingTenureMonths,
      startDate: inv.activationDate || inv.investedAt || inv.createdAt,
      maturityDate: inv.maturityDate
    };

    return payoutObj;
  });

  formattedPayouts.forEach((p) => {
    if (p.status === 'Completed' || p.status === 'Paid') {
      totalReceived += (p.amount || (p.amountPaise ? p.amountPaise / 100 : 0));
      completedList.push(p);
    } else {
      totalScheduled += (p.amount || (p.amountPaise ? p.amountPaise / 100 : 0));
      upcomingList.push(p);
    }
  });

  // Also include Monthly Return Payments from ReturnPayment schema
  try {
    const returnPayments = await ReturnPayment.find({ investorId })
      .populate('returnAgreementId')
      .populate('companyId', 'name legalName')
      .sort({ dueDate: 1 });

    for (const rp of returnPayments) {
      const agr = rp.returnAgreementId || {};
      const company = rp.companyId || {};

      let displayStatus = 'Upcoming';
      if (rp.distributionStatus === 'Disbursed to Investor') {
        displayStatus = 'Completed';
      } else if (rp.paymentStatus === 'Paid' || rp.distributionStatus === 'Received by Platform') {
        displayStatus = 'Paid by Company'; // PRD Section 8 - clearly distinguish
      } else if (rp.paymentStatus === 'Due') {
        displayStatus = 'Pending Company Collection';
      } else if (rp.paymentStatus === 'Overdue') {
        displayStatus = 'Delayed';
      }

      const item = {
        _id: rp._id,
        scheduledDate: rp.dueDate,
        paidDate: rp.paidAt,
        offerTitle: agr.projectTitle || `Monthly Return (${company.name || 'Company'})`,
        payoutType: `Monthly Yield: ${rp.paymentPeriod}`,
        investedAmount: agr.principalAmount || 0,
        returnRate: agr.agreedMonthlyRate ? agr.agreedMonthlyRate * 12 : 12,
        tenureMonths: agr.tenureMonths || 12,
        remainingTenureMonths: Math.max(0, (agr.tenureMonths || 12) - rp.cycleNumber),
        amount: rp.amountDue || (rp.amountDuePaise ? rp.amountDuePaise / 100 : 0),
        status: displayStatus,
        distributionStatus: rp.distributionStatus,
        utrNumber: rp.receiptReference || rp.razorpayPaymentId || 'In Processing',
        isReturnCycle: true,
        companyName: company.name || company.legalName || 'Authorized Issuer'
      };

      if (displayStatus === 'Completed') {
        totalReceived += item.amount;
        completedList.push(item);
      } else {
        totalScheduled += item.amount;
        upcomingList.push(item);
      }
    }
  } catch (err) {
    console.warn('[getPayouts] ReturnPayment enrichment notice:', err.message);
  }

  // Calculate expected returns from investments
  const investments = await Investment.find({ investorId });
  const totalExpectedSum = investments.reduce((acc, inv) => acc + (inv.expectedReturns || 0), 0);

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalReceived,
        totalScheduled,
        totalExpectedReturns: totalExpectedSum,
        upcomingCount: upcomingList.length,
        completedCount: completedList.length
      },
      upcomingPayouts: upcomingList,
      completedPayouts: completedList.reverse() // latest completed first
    }
  });
});
