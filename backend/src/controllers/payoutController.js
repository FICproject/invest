import { Payout } from '../models/Payout.js';
import { Investment } from '../models/Investment.js';
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
