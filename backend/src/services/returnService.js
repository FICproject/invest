import { ReturnAgreement } from '../models/ReturnAgreement.js';
import { ReturnPayment } from '../models/ReturnPayment.js';
import { Notification } from '../models/Notification.js';
import { Ledger } from '../models/Ledger.js';
import { Transaction } from '../models/Transaction.js';
import { broadcastSyncEvent } from './sse.js';

/**
 * Service to manage lifecycle of Return Agreements & Monthly Return Payment Schedules
 */

/**
 * Activates a Return Agreement and generates monthly payment schedules upon admin capital disbursement
 */
export async function activateReturnAgreementForDisbursement({
  investment,
  companyId,
  investorId,
  disbursementReference,
  disbursedAmount
}) {
  try {
    if (!investment) return null;

    // Check if an agreement already exists
    const existing = await ReturnAgreement.findOne({ investmentId: investment._id });
    if (existing) {
      console.log(`[ReturnService] ReturnAgreement already active for investment: ${investment._id}`);
      return existing;
    }

    // Retrieve approved terms
    const principalAmount = disbursedAmount || investment.amount || investment.amountInvested || (investment.amountPaise ? investment.amountPaise / 100 : 0);
    const principalAmountPaise = Math.round(principalAmount * 100);

    // Monthly return rate from accepted agreement (default 2% per month or annual rate / 12)
    // If returnRate is stored as annual percentage (e.g. 24%), monthly rate is 2%
    let agreedMonthlyRate = 2; // 2% per month default
    if (investment.monthlyReturnRate != null && investment.monthlyReturnRate > 0) {
      agreedMonthlyRate = investment.monthlyReturnRate;
    } else if (investment.returnRate != null && investment.returnRate > 0) {
      agreedMonthlyRate = parseFloat((investment.returnRate > 10 ? investment.returnRate / 12 : investment.returnRate).toFixed(2));
    }

    // Monthly return amount
    const monthlyReturnAmount = Math.round((principalAmount * (agreedMonthlyRate / 100)));
    const monthlyReturnAmountPaise = Math.round(monthlyReturnAmount * 100);

    const tenureMonths = investment.tenureMonths || 12;
    const startDate = new Date();
    
    // First due date: exactly 1 month from disbursement
    const firstDueDate = new Date(startDate);
    firstDueDate.setMonth(firstDueDate.getMonth() + 1);

    // Maturity date: tenure months from disbursement
    const maturityDate = new Date(startDate);
    maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);

    const agreementNumber = `RA-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const agreement = await ReturnAgreement.create({
      investmentId: investment._id,
      companyId: companyId || investment.companyId,
      investorId: investorId || investment.investorId,
      offerId: investment.offerId,
      requestId: investment.requestId,
      agreementNumber,
      projectTitle: investment.offerTitle || investment.title || 'Fixed-Term Return Note',
      principalAmount,
      principalAmountPaise,
      agreedMonthlyRate,
      monthlyReturnAmount,
      monthlyReturnAmountPaise,
      paymentFrequency: 'Monthly',
      tenureMonths,
      startDate,
      maturityDate,
      nextDueDate: firstDueDate,
      agreementStatus: 'Active',
      disbursementReference: disbursementReference || '',
      disbursedAt: startDate,
      totalReturnsDue: monthlyReturnAmount * tenureMonths,
      totalReturnsDuePaise: monthlyReturnAmountPaise * tenureMonths,
      approvedTerms: {
        investmentModel: 'Fixed-Term',
        agreedRate: agreedMonthlyRate,
        tenureMonths,
        disbursedAmount: principalAmount
      }
    });

    // Generate monthly payment schedule records
    const paymentsToCreate = [];
    const now = new Date();

    for (let i = 1; i <= tenureMonths; i++) {
      const cycleDueDate = new Date(startDate);
      cycleDueDate.setMonth(cycleDueDate.getMonth() + i);

      // Determine initial status based on due date
      let paymentStatus = 'Upcoming';
      if (cycleDueDate <= now) {
        paymentStatus = 'Due';
      }

      const monthName = cycleDueDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const paymentPeriod = `Month ${i} (${monthName})`;

      paymentsToCreate.push({
        returnAgreementId: agreement._id,
        investmentId: investment._id,
        companyId: agreement.companyId,
        investorId: agreement.investorId,
        paymentPeriod,
        cycleNumber: i,
        dueDate: cycleDueDate,
        amountDue: monthlyReturnAmount,
        amountDuePaise: monthlyReturnAmountPaise,
        paymentStatus,
        distributionStatus: 'Pending Collection'
      });
    }

    await ReturnPayment.insertMany(paymentsToCreate);

    console.log(`[ReturnService] Created ReturnAgreement ${agreementNumber} with ${paymentsToCreate.length} monthly scheduled payments.`);

    // Dispatch Notifications to Company and Admin
    try {
      await Notification.create({
        companyId: agreement.companyId,
        title: 'Monthly Return Obligation Activated',
        message: `Your fund disbursement of ₹${principalAmount.toLocaleString('en-IN')} is complete. Agreed monthly return obligation: ₹${monthlyReturnAmount.toLocaleString('en-IN')} (${agreedMonthlyRate}%/mo). First payment due on ${firstDueDate.toLocaleDateString('en-IN')}.`,
        type: 'return',
        link: '/dashboard/returns'
      });
    } catch (nErr) {
      console.warn('[ReturnService] Notification notice:', nErr.message);
    }

    broadcastSyncEvent({
      type: 'DATA_SYNC',
      entity: 'RETURN_AGREEMENT_ACTIVATED',
      action: 'ACTIVATED',
      payload: { agreementId: agreement._id, companyId: agreement.companyId }
    });

    return agreement;
  } catch (error) {
    console.error('[ReturnService] Error activating return agreement:', error);
    throw error;
  }
}

/**
 * Updates statuses of upcoming payments to Due or Overdue based on current date
 */
export async function refreshPaymentScheduleStatuses() {
  const now = new Date();
  
  // Set to 'Due' if dueDate <= now and status is 'Upcoming'
  await ReturnPayment.updateMany(
    {
      paymentStatus: 'Upcoming',
      dueDate: { $lte: now }
    },
    {
      $set: { paymentStatus: 'Due' }
    }
  );

  // Set to 'Overdue' if dueDate < 3 days ago and status is 'Due'
  const overdueThreshold = new Date(now);
  overdueThreshold.setDate(overdueThreshold.getDate() - 3);

  await ReturnPayment.updateMany(
    {
      paymentStatus: 'Due',
      dueDate: { $lt: overdueThreshold }
    },
    {
      $set: { paymentStatus: 'Overdue' }
    }
  );
}

