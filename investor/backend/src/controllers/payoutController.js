import { Payout } from '../models/Payout.js';
import { Investment } from '../models/Investment.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @route   GET /api/payouts
// @desc    Get upcoming scheduled and completed payouts for logged-in investor
export const getPayouts = asyncHandler(async (req, res) => {
  const investorId = req.user._id;

  const payouts = await Payout.find({ investorId })
    .populate('investmentId')
    .sort({ scheduledDate: 1 });

  let totalReceived = 0;
  let totalScheduled = 0;
  const completedList = [];
  const upcomingList = [];

  payouts.forEach((p) => {
    if (p.status === 'Completed') {
      totalReceived += p.amount;
      completedList.push(p);
    } else {
      totalScheduled += p.amount;
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
