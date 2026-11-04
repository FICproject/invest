/**
 * Connect Invest - System Constants & PRD Business Rule Definitions
 * Strictly aligned with Connect Invest PRD v1.0
 */

export const Roles = {
  ADMIN: 'admin',
  COMPANY_OWNER: 'companyOwner',
  COMPANY_MEMBER: 'companyMember',
  INVESTOR: 'investor'
};

export const OfferKind = {
  PROJECT: 'project',
  COMPANY: 'company',
  EQUITY: 'equity'
};

export const EquityInstrument = {
  EQUITY_SHARES: 'equity_shares',
  CCPS: 'ccps',
  ISAFE: 'isafe'
};

export const Statuses = {
  KYC: {
    NOT_STARTED: 'Not started',
    SUBMITTED: 'Submitted',
    MORE_INFO_NEEDED: 'More info needed',
    APPROVED: 'Approved',
    REJECTED: 'Rejected'
  },
  COMPANY: {
    INVITED: 'Invited',
    KYB_SUBMITTED: 'KYB submitted',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    BLOCKED: 'Blocked'
  },
  OFFER: {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    RETURNED: 'Returned',
    APPROVED: 'Approved',
    READY: 'Ready', // Company accepted terms
    OPEN: 'Open',
    PAUSED: 'Paused',
    FUNDING_CLOSED: 'Funding closed',
    ACTIVE: 'Active',
    FAILED_TO_FUND: 'Failed to fund',
    CANCELLED: 'Cancelled',
    CLOSED: 'Closed'
  },
  INVESTMENT: {
    PENDING_REVIEW: 'Pending Review',
    CHANGES_REQUESTED: 'Changes Requested',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    PENDING_PAYMENT: 'Pending payment',
    CONFIRMED: 'Confirmed',
    ACTIVE: 'Active',
    MATURED: 'Matured',
    COMPLETED: 'Completed',
    REFUNDED: 'Refunded'
  },
  REPAYMENT: {
    UPCOMING: 'Upcoming',
    DUE: 'Due',
    RECEIVED: 'Received',
    OVERDUE: 'Overdue',
    DEFAULTED: 'Defaulted'
  },
  PAYOUT: {
    CALCULATED: 'Calculated',
    READY: 'Ready',
    IN_BATCH: 'In batch',
    APPROVED: 'Approved',
    PAID: 'Paid',
    FAILED: 'Failed'
  },
  DIVIDEND: {
    DECLARED: 'Declared',
    COLLECTED: 'Collected',
    BATCHED: 'Batched',
    PAID: 'Paid',
    CANCELLED: 'Cancelled'
  },
  ALLOTMENT: {
    PENDING: 'Pending',
    ALLOTTED: 'Allotted',
    CANCELLED: 'Cancelled'
  },
  RELEASE_AND_REFUND: {
    PREPARED: 'Prepared',
    APPROVED: 'Approved',
    RELEASED: 'Released',
    REFUNDED: 'Refunded',
    FAILED: 'Failed',
    REJECTED: 'Rejected'
  }
};

export const Constraints = {
  MIN_PROJECT_TENURE_MONTHS: 12,
  MIN_COMPANY_TENURE_MONTHS: 60,
  MIN_INVESTMENT_PAISE: 1000 * 100, // ₹1,000 in whole paise
  MAX_INVESTMENT_PAISE: 10000000 * 100, // ₹1,00,00,000 (1 Crore) in whole paise
  HOLD_DURATION_MINUTES: 10,
  COOLING_OFF_DAYS: 3,
  INVITATION_EXPIRY_DAYS: 7,
  TWO_FACTOR_EXPIRY_MINUTES: 10
};

export const ErrorCodes = {
  KYC_NOT_APPROVED: 'KYC_NOT_APPROVED',
  TENURE_NOT_ALLOWED: 'TENURE_NOT_ALLOWED',
  AMOUNT_OUT_OF_RANGE: 'AMOUNT_OUT_OF_RANGE',
  CAPACITY_EXCEEDED: 'CAPACITY_EXCEEDED',
  OFFER_NOT_OPEN: 'OFFER_NOT_OPEN',
  SAME_PERSON_APPROVAL: 'SAME_PERSON_APPROVAL',
  BANK_IN_COOLING_OFF: 'BANK_IN_COOLING_OFF',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  CONFLICT: 'CONFLICT'
};
