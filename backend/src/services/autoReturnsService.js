import { Payout } from '../models/Payout.js';
import { Investment } from '../models/Investment.js';
import { Statuses } from '../constants/index.js';

/**
 * Calculates and schedules monthly return records for active/confirmed investments.
 * IMPORTANT: Strictly NO automatic payments. Every return is created in 'Calculated' status
 * and requires manual Admin verification and manual execution (via batch or manual pay).
 */
export async function processAutoMonthlyReturns() {
  try {
    const now = new Date();

    // 1. Fetch all confirmed or active investments
    const investments = await Investment.find({
      status: { $in: [Statuses.INVESTMENT.CONFIRMED, Statuses.INVESTMENT.ACTIVE, 'Active', 'Confirmed'] }
    }).populate('investorId').populate('offerId');

    let createdCount = 0;

    for (const inv of investments) {
      // Determine the base payment / activation date
      const paidAt = inv.activationDate || inv.investedAt || inv.createdAt;
      if (!paidAt) continue;

      const baseDate = new Date(paidAt);
      const tenureMonths = inv.tenureMonths || 12;

      // Determine monthly return amount in paise
      let monthlyReturnPaise = inv.monthlyReturnPaise;
      if (!monthlyReturnPaise || monthlyReturnPaise <= 0) {
        const principalPaise = inv.amountPaise || Math.round((inv.amount || inv.amountInvested || 0) * 100);
        const rateBps = inv.offerId?.rateBps || (inv.returnRate ? Math.round(inv.returnRate * 100) : 1200);
        monthlyReturnPaise = Math.round((principalPaise * (rateBps / 10000)) / 12);
      }

      if (monthlyReturnPaise <= 0) continue;

      // For each elapsed month up to tenure
      for (let m = 1; m <= tenureMonths; m++) {
        const cycleDueDate = new Date(baseDate);
        cycleDueDate.setMonth(cycleDueDate.getMonth() + m);

        // Check if a payout record already exists for this investment and cycle month
        const windowStart = new Date(cycleDueDate);
        windowStart.setDate(windowStart.getDate() - 15);
        const windowEnd = new Date(cycleDueDate);
        windowEnd.setDate(windowEnd.getDate() + 15);

        let payout = await Payout.findOne({
          investmentId: inv._id,
          scheduledDate: { $gte: windowStart, $lte: windowEnd }
        });

        if (!payout) {
          // If not existing yet, create as Calculated for Admin review & manual payment
          payout = await Payout.create({
            investmentId: inv._id,
            investorId: inv.investorId?._id || inv.investorId,
            offerId: inv.offerId?._id || inv.offerId,
            offerTitle: inv.offerId?.title || inv.entityOrProjectName || 'Investment Return',
            amountPaise: monthlyReturnPaise,
            amount: monthlyReturnPaise / 100,
            payoutType: m === tenureMonths ? 'Maturity & Final Return' : 'Monthly Return',
            status: Statuses.PAYOUT.CALCULATED, // Always Calculated - Requires Admin manual verification & pay
            scheduledDate: cycleDueDate
          });
          createdCount++;
        }
      }
    }

    if (createdCount > 0) {
      console.log(`[ReturnsScheduler] Calculated ${createdCount} monthly return records awaiting Admin manual verification.`);
    }
  } catch (error) {
    console.error('[ReturnsScheduler] Error calculating monthly returns:', error);
  }
}

