/**
 * Connect Invest - Rules Service
 * Central domain rules engine per PRD Sections 3, 7, and 10.3
 */

import { Constraints, OfferKind, Statuses, ErrorCodes } from '../constants/index.js';

/**
 * Standard financial round-half-up (away from zero)
 */
export function roundHalfUp(value) {
  return Math.floor(value + 0.5);
}

/**
 * Calculate single-month return in paise per PRD Section 3.4:
 * monthlyReturnPaise = round_half_up( principalPaise * rateBps / 10000 )
 */
export function calculateMonthlyReturnPaise(principalPaise, rateBps) {
  if (!principalPaise || !rateBps) return 0;
  return roundHalfUp((principalPaise * rateBps) / 10000);
}

/**
 * Calculate total returns over the selected tenure
 */
export function calculateTotalReturnsPaise(principalPaise, rateBps, tenureMonths) {
  const monthly = calculateMonthlyReturnPaise(principalPaise, rateBps);
  return monthly * tenureMonths;
}

/**
 * Rupee to whole paise integer conversion (guaranteed integer)
 */
export function rupeesToPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

/**
 * Whole paise integer to rupee float/number
 */
export function paiseToRupees(paise) {
  return Number(paise) / 100;
}

/**
 * Format paise into Indian Rupee string (e.g., ₹1,50,000)
 */
export function formatINR(paise, includeSymbol = true) {
  const rupees = paiseToRupees(paise || 0);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(rupees);
  return includeSymbol ? `₹${formatted}` : formatted;
}

/**
 * Validate offer tenures based on offer kind (PRD Section 3.1 & 8.3)
 * For 'equity', there is no fixed tenure or maturity date.
 */
export function validateOfferTenures(kind, tenures) {
  if (kind === OfferKind.EQUITY) {
    return { valid: true };
  }

  if (!Array.isArray(tenures) || tenures.length === 0) {
    return { valid: false, error: 'At least one tenure is required for debt offers' };
  }

  const minTenure =
    kind === OfferKind.PROJECT
      ? Constraints.MIN_PROJECT_TENURE_MONTHS
      : Constraints.MIN_COMPANY_TENURE_MONTHS;

  for (const tenure of tenures) {
    if (typeof tenure !== 'number' || tenure < minTenure) {
      return {
        valid: false,
        error: `Tenure ${tenure} months is below the minimum required ${minTenure} months for ${kind} offers`
      };
    }
  }

  return { valid: true };
}

/**
 * Calculate equity share count from invested paise and price per share
 */
export function calculateSharesFromPaise(amountPaise, sharePricePaise) {
  if (!amountPaise || !sharePricePaise || sharePricePaise <= 0) return 0;
  return Math.floor(amountPaise / sharePricePaise);
}

/**
 * Calculate dilution percentage given target raise and pre-money valuation
 * Dilution % = [Target / (PreMoney + Target)] * 100
 */
export function calculateEquityDilutionPct(targetPaise, preMoneyValuationPaise) {
  if (!targetPaise || !preMoneyValuationPaise) return 0;
  const postMoney = preMoneyValuationPaise + targetPaise;
  if (postMoney <= 0) return 0;
  return Number(((targetPaise / postMoney) * 100).toFixed(2));
}

/**
 * Calculate dividend amount in paise for an individual investor
 */
export function calculateDividendPerInvestorPaise(sharesHeld, dividendPerSharePaise) {
  if (!sharesHeld || !dividendPerSharePaise) return 0;
  return Math.round(sharesHeld * dividendPerSharePaise);
}

/**
 * Validate investment amount (PRD Section 3.2 & 9.1)
 */
export function validateInvestmentAmount(amountPaise, offerLimitPaise, remainingRoomPaise) {
  if (amountPaise < Constraints.MIN_INVESTMENT_PAISE) {
    return {
      valid: false,
      code: ErrorCodes.AMOUNT_OUT_OF_RANGE,
      error: `Investment amount cannot be less than ${formatINR(Constraints.MIN_INVESTMENT_PAISE)}`
    };
  }

  const maxAllowed = offerLimitPaise || Constraints.MAX_INVESTMENT_PAISE;
  if (amountPaise > maxAllowed) {
    return {
      valid: false,
      code: ErrorCodes.AMOUNT_OUT_OF_RANGE,
      error: `Investment amount exceeds limit of ${formatINR(maxAllowed)}`
    };
  }

  if (remainingRoomPaise !== undefined && amountPaise > remainingRoomPaise) {
    return {
      valid: false,
      code: ErrorCodes.CAPACITY_EXCEEDED,
      error: `Amount exceeds remaining offer room (${formatINR(remainingRoomPaise)} left)`
    };
  }

  return { valid: true };
}

/**
 * Check if a bank account is within the cooling-off period (PRD Section 4.7 & 8.1)
 */
export function checkBankCoolingOff(effectiveFrom) {
  if (!effectiveFrom) return { inCoolingOff: false };
  const effectiveDate = new Date(effectiveFrom);
  const now = new Date();
  const inCoolingOff = effectiveDate > now;
  const hoursRemaining = inCoolingOff ? Math.ceil((effectiveDate - now) / (1000 * 60 * 60)) : 0;
  return {
    inCoolingOff,
    hoursRemaining,
    effectiveDate
  };
}

/**
 * Validate allowed status moves strictly per PRD Section 7 table
 */
export function isValidStatusMove(entityType, currentStatus, targetStatus) {
  const allowedMoves = {
    kyc: {
      [Statuses.KYC.NOT_STARTED]: [Statuses.KYC.SUBMITTED],
      [Statuses.KYC.SUBMITTED]: [Statuses.KYC.APPROVED, Statuses.KYC.REJECTED, Statuses.KYC.MORE_INFO_NEEDED],
      [Statuses.KYC.MORE_INFO_NEEDED]: [Statuses.KYC.SUBMITTED],
      [Statuses.KYC.REJECTED]: [Statuses.KYC.SUBMITTED]
    },
    company: {
      [Statuses.COMPANY.INVITED]: [Statuses.COMPANY.KYB_SUBMITTED],
      [Statuses.COMPANY.KYB_SUBMITTED]: [Statuses.COMPANY.APPROVED, Statuses.COMPANY.REJECTED],
      [Statuses.COMPANY.APPROVED]: [Statuses.COMPANY.BLOCKED],
      [Statuses.COMPANY.BLOCKED]: [Statuses.COMPANY.APPROVED]
    },
    offer: {
      [Statuses.OFFER.DRAFT]: [Statuses.OFFER.SUBMITTED],
      [Statuses.OFFER.SUBMITTED]: [Statuses.OFFER.RETURNED, Statuses.OFFER.APPROVED],
      [Statuses.OFFER.APPROVED]: [Statuses.OFFER.READY],
      [Statuses.OFFER.READY]: [Statuses.OFFER.OPEN],
      [Statuses.OFFER.OPEN]: [Statuses.OFFER.PAUSED, Statuses.OFFER.FUNDING_CLOSED, Statuses.OFFER.CANCELLED],
      [Statuses.OFFER.PAUSED]: [Statuses.OFFER.OPEN, Statuses.OFFER.CANCELLED],
      [Statuses.OFFER.FUNDING_CLOSED]: [Statuses.OFFER.ACTIVE, Statuses.OFFER.FAILED_TO_FUND],
      [Statuses.OFFER.ACTIVE]: [Statuses.OFFER.CLOSED]
    },
    investment: {
      [Statuses.INVESTMENT.PENDING_PAYMENT]: [Statuses.INVESTMENT.CONFIRMED],
      [Statuses.INVESTMENT.CONFIRMED]: [Statuses.INVESTMENT.ACTIVE, Statuses.INVESTMENT.REFUNDED],
      [Statuses.INVESTMENT.ACTIVE]: [Statuses.INVESTMENT.MATURED],
      [Statuses.INVESTMENT.MATURED]: [Statuses.INVESTMENT.COMPLETED]
    },
    repayment: {
      [Statuses.REPAYMENT.UPCOMING]: [Statuses.REPAYMENT.DUE],
      [Statuses.REPAYMENT.DUE]: [Statuses.REPAYMENT.RECEIVED, Statuses.REPAYMENT.OVERDUE],
      [Statuses.REPAYMENT.OVERDUE]: [Statuses.REPAYMENT.RECEIVED, Statuses.REPAYMENT.DEFAULTED]
    },
    payout: {
      [Statuses.PAYOUT.CALCULATED]: [Statuses.PAYOUT.READY],
      [Statuses.PAYOUT.READY]: [Statuses.PAYOUT.IN_BATCH],
      [Statuses.PAYOUT.IN_BATCH]: [Statuses.PAYOUT.APPROVED],
      [Statuses.PAYOUT.APPROVED]: [Statuses.PAYOUT.PAID, Statuses.PAYOUT.FAILED],
      [Statuses.PAYOUT.FAILED]: [Statuses.PAYOUT.IN_BATCH]
    }
  };

  const entityMoves = allowedMoves[entityType];
  if (!entityMoves) return true; // fallback if not strictly guarded
  const nextStates = entityMoves[currentStatus];
  if (!nextStates) return false;
  return nextStates.includes(targetStatus);
}
