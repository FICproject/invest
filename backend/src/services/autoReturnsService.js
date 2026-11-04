import { Payout } from '../models/Payout.js';
import { Investment } from '../models/Investment.js';
import { Ledger } from '../models/Ledger.js';
import { Transaction } from '../models/Transaction.js';
import { Statuses } from '../constants/index.js';
import { formatINR } from './rulesService.js';

/**
 * Automatically processes monthly returns for active/confirmed investments.
 * Evaluates each investment:
 * - Checks the original investment / payment activation date.
 * - Schedules/calculates once a month from the date they paid.
 * - If today >= scheduled payout date and return is not already paid or held, auto-executes the payout.
 */
export async function processAutoMonthlyReturns() {
  try {
    const now = new Date();

    // 1. Fetch all confirmed or active investments
    const investments = await Investment.find({
      status: { $in: [Statuses.INVESTMENT.CONFIRMED, Statuses.INVESTMENT.ACTIVE, 'Active', 'Confirmed'] }
    }).populate('investorId').populate('offerId');

    let processedCount = 0;
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

        // If this cycle due date is in the future beyond today, we don't auto-pay yet
        const isDue = cycleDueDate <= now;

        // Check if a payout record already exists for this investment and cycle month
        // We match by investmentId and close scheduledDate
        const windowStart = new Date(cycleDueDate);
        windowStart.setDate(windowStart.getDate() - 15);
        const windowEnd = new Date(cycleDueDate);
        windowEnd.setDate(windowEnd.getDate() + 15);

        let payout = await Payout.findOne({
          investmentId: inv._id,
          scheduledDate: { $gte: windowStart, $lte: windowEnd }
        });

        if (!payout) {
          // If not existing yet, create it
          payout = await Payout.create({
            investmentId: inv._id,
            investorId: inv.investorId?._id || inv.investorId,
            offerId: inv.offerId?._id || inv.offerId,
            offerTitle: inv.offerId?.title || inv.entityOrProjectName || 'Investment Return',
            amountPaise: monthlyReturnPaise,
            amount: monthlyReturnPaise / 100,
            payoutType: m === tenureMonths ? 'Maturity & Final Return' : 'Monthly Return',
            status: isDue ? Statuses.PAYOUT.READY : Statuses.PAYOUT.CALCULATED,
            scheduledDate: cycleDueDate
          });
          createdCount++;
        }

        // If the return is due (1 month reached from payment date) and not On Hold and not Paid
        if (isDue && payout.status !== Statuses.PAYOUT.PAID && payout.status !== 'Paid') {
          // If admin has placed this return On Hold, DO NOT auto-pay
          if (payout.isHold || payout.status === Statuses.PAYOUT.ON_HOLD || payout.status === 'On Hold') {
            continue;
          }

          // Auto-pay the investor
          payout.status = Statuses.PAYOUT.PAID;
          payout.paidDate = new Date();
          payout.paidAt = new Date();
          payout.autoPaid = true;
          payout.bankRef = `AUTO-UTR-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;
          payout.utrNumber = payout.bankRef;
          await payout.save();

          // Record in Ledger
          try {
            await Ledger.create({
              account: 'INVESTOR_WALLET',
              debitPaise: 0,
              creditPaise: payout.amountPaise,
              refType: 'PAYOUT',
              refId: payout._id,
              description: `Auto-paid monthly return of ${formatINR(payout.amountPaise)} to ${inv.investorId?.name || 'Investor'} Ref: ${payout.bankRef}`
            });
          } catch (ledErr) {
            console.warn('[AutoPayout] Ledger notice:', ledErr.message);
          }

          // Record in Transaction if not existing
          try {
            await Transaction.create({
              investorId: inv.investorId?._id || inv.investorId,
              investmentId: inv._id,
              title: `Monthly Return - ${inv.offerId?.title || 'Investment'}`,
              type: 'Payout',
              amount: payout.amount || payout.amountPaise / 100,
              status: 'Completed',
              referenceId: payout.bankRef,
              paymentMethod: 'Auto Bank Settlement (IMPS/RTGS)',
              description: `Automated monthly return cycle credit for investment #${inv._id.toString().slice(-6)}`
            });
          } catch (txErr) {
            console.warn('[AutoPayout] Transaction notice:', txErr.message);
          }

          processedCount++;
        }
      }
    }

    if (processedCount > 0 || createdCount > 0) {
      console.log(`[AutoReturnsScheduler] Evaluated monthly returns. Auto-paid: ${processedCount}, Created: ${createdCount}`);
    }
  } catch (error) {
    console.error('[AutoReturnsScheduler] Error processing monthly returns:', error);
  }
}

