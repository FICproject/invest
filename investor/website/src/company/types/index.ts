export interface User {
  id: string;
  name: string;
  email: string;
  role: 'company_admin' | 'company_member' | 'admin' | 'investor';
  companyId?: string;
}

export interface Director {
  name: string;
  din?: string;
  pan?: string;
  email: string;
  mobile: string;
  designation: string;
  sharesOwnedPercentage?: number;
}

export interface Company {
  _id: string;
  legalName: string;
  tradingName?: string;
  cin?: string;
  pan: string;
  gstin?: string;
  incorporationDate?: string;
  companyType: string;
  industry: string;
  website?: string;
  registeredAddress: {
    street?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  description: string;
  logoUrl?: string;
  directors: Director[];
  authorizedCapital?: number;
  paidUpCapital?: number;
  totalShares?: number;
  shareFaceValue?: number;
  verificationStatus: 'Pending' | 'In Review' | 'Verified' | 'Rejected' | 'Action Required';
  verificationRemarks?: string;
}

export interface InvestmentRequest {
  _id: string;
  companyId: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  category: string;
  investmentPurpose?: 'Company Investment' | 'Project Investment';
  fundingDuration?: 'Short-Term' | 'Long-Term';
  entityOrProjectName?: string;
  investmentPeriodYears?: number;
  expectedReturnRate?: number;
  investmentModel: 'Fixed-Term' | 'Equity';
  fundingTarget: number;
  minInvestment: number;
  maxInvestment?: number;
  raisedAmount: number;
  committedAmount: number;

  // Fixed Term
  durationMonths?: number;
  agreedReturnRate?: number;
  returnStructure?: string;
  repaymentTerms?: string;
  maturityDate?: string;

  // Equity
  preMoneyValuation?: number;
  equityOfferedPercentage?: number;
  pricePerShare?: number;
  totalSharesOffered?: number;
  shareClass?: string;
  votingRights?: string;
  dividendPolicy?: string;

  useOfFunds: string;
  businessPlanUrl?: string;
  supportingDocuments?: Array<{
    name: string;
    fileUrl: string;
  }>;
  campaignStartDate?: string;
  campaignEndDate?: string;
  status:
    | 'Draft'
    | 'Submitted'
    | 'Under Review'
    | 'Approved'
    | 'Rejected'
    | 'Funded'
    | 'Additional Information Required'
    | 'Open for Investment'
    | 'Funding Completed'
    | 'Cancelled';
  reviewerFeedback?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Investment {
  _id: string;
  requestId: any;
  investorName: string;
  investorEmail: string;
  investmentModel: 'Fixed-Term' | 'Equity';
  amount: number;
  currency: string;
  paymentStatus: 'Pending' | 'Committed' | 'Received' | 'Settled' | 'Refunded' | 'Failed';
  allocationStatus: 'Unallocated' | 'Allocated' | 'Issued' | 'Cancelled';
  sharesAllocated?: number;
  sharePrice?: number;
  interestRate?: number;
  maturityDate?: string;
  totalExpectedReturn?: number;
  transactionReference?: string;
  investedAt: string;
}

export interface Shareholder {
  _id: string;
  name: string;
  email: string;
  panOrId: string;
  sharesHeld: number;
  shareClass: string;
  ownershipPercentage: number;
  totalInvestedAmount: number;
  folioNumber: string;
  certificateNumber?: string;
  issuanceStatus: 'Pending Allotment' | 'Board Approved' | 'Issued' | 'Cancelled';
  allotmentDate: string;
  agreementStatus: string;
}

export interface ShareAllocation {
  _id: string;
  shareholderId: any;
  allotmentRound: string;
  sharesCount: number;
  pricePerShare: number;
  totalConsideration: number;
  resolutionNumber: string;
  resolutionDate: string;
  status: string;
}

export interface FinancialReport {
  _id: string;
  financialYear: string;
  periodType: 'Monthly' | 'Quarterly' | 'Annual';
  periodName: string;
  revenue: number;
  operatingExpenses: number;
  netProfitOrLoss: number;
  cashFlowFromOperations?: number;
  fundsRaisedInPeriod: number;
  auditStatus: 'Company-Reported' | 'Independently Verified' | 'Audited';
  auditorName?: string;
  reportFileUrl?: string;
  notes?: string;
  createdAt?: string;
}

export interface Dividend {
  _id: string;
  declarationDate: string;
  recordDate: string;
  payoutDate?: string;
  financialYear: string;
  dividendType: string;
  amountPerShare: number;
  totalDividendAmount: number;
  eligibleShareholdersCount: number;
  boardResolutionRef: string;
  approvalStatus: string;
  disbursementStatus: string;
  notes?: string;
}

export interface Transaction {
  _id: string;
  referenceId: string;
  requestId?: any;
  investmentModel: string;
  type: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  providerReference?: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Reversed';
  notes?: string;
  transactionDate: string;
}

export interface CompanyDocument {
  _id: string;
  documentType: string;
  title: string;
  fileUrl: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Action Required';
  remarks?: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
}

