export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'investor' | 'admin' | 'company_admin' | 'company_member';
  companyId?: string;
  isVerified: boolean;
  createdAt?: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  isVerified?: boolean;
}

export interface InvestorProfile {
  _id?: string;
  userId: string;
  panNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  bankDetails?: BankDetails;
  notificationPreferences?: {
    emailAlerts?: boolean;
    smsAlerts?: boolean;
    payoutUpdates?: boolean;
    promotionalOffers?: boolean;
  };
}

export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KYC {
  _id?: string;
  investorId: string;
  fullName: string;
  panNumber?: string;
  panDocumentUrl?: string;
  addressProofType?: string;
  addressProofNumber?: string;
  addressProofUrl?: string;
  selfieUrl?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankProofUrl?: string;
  status: KycStatus;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface InvestmentOffer {
  _id: string;
  title: string;
  companyName: string;
  type: 'Company' | 'Project';
  category: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  minInvestment: number;
  maxInvestment: number;
  returnRate: number; // in %
  tenureMonths: number;
  payoutFrequency: 'Monthly' | 'Quarterly' | 'At Maturity';
  riskLevel: 'Low' | 'Moderate' | 'High';
  status: 'Draft' | 'Active' | 'Fully Funded' | 'Closed' | 'Hidden';
  isFeatured: boolean;
  imageUrl?: string;
  location?: string;
  securityType?: string;
  financialHighlights?: string[];
  documents?: { name: string; url: string }[];
  createdAt?: string;
}

export interface Investment {
  _id: string;
  investorId: string;
  offerId: InvestmentOffer;
  amountInvested: number;
  returnRate: number;
  tenureMonths: number;
  expectedReturns: number;
  returnsReceived: number;
  startDate: string;
  maturityDate: string;
  certificateNumber?: string;
  status: 'Pending' | 'Confirmed' | 'Active' | 'Matured' | 'Cancelled';
  payoutFrequency: string;
  createdAt?: string;
}

export interface Transaction {
  _id: string;
  investorId: string;
  investmentId?: string;
  title: string;
  type: 'Investment' | 'Payout' | 'Refund' | 'Deposit';
  amount: number;
  status: 'Pending' | 'Confirmed' | 'Failed';
  referenceId: string;
  paymentMethod?: string;
  description?: string;
  createdAt: string;
}

export interface Payout {
  _id: string;
  investorId: string;
  investmentId: Investment;
  offerTitle: string;
  amount: number;
  payoutType: string;
  scheduledDate: string;
  processedDate?: string;
  status: 'Scheduled' | 'Processing' | 'Completed' | 'Failed';
}

export interface AppNotification {
  _id: string;
  investorId: string;
  title: string;
  message: string;
  type: 'investment' | 'kyc' | 'payout' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ReturnCalculation {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  payoutFrequency: string;
  monthlyPayout: number;
  totalExpectedInterest: number;
  totalMaturityAmount: number;
}

export interface DashboardData {
  metrics: {
    totalInvested: number;
    totalReturnsEarned: number;
    pendingReturns: number;
    activeInvestments: number;
    nextPayoutDate: string | null;
  };
  portfolioOverview: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  monthlyReturns: {
    month: string;
    amount: number;
  }[];
  investmentStatus: {
    confirmed: number;
    pending: number;
    completed: number;
    total: number;
  };
  recentActivity: {
    id: string;
    title: string;
    amount: number;
    date: string;
    status: string;
  }[];
  recentTransactions: Transaction[];
  kycStatus: KycStatus;
}
