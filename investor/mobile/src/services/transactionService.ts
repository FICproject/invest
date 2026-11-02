import api from './api';
import { Transaction, Payout, BankDetails, InvestorProfile, User } from '../types';

export const transactionService = {
  async getTransactions(params: { type?: string; status?: string; search?: string } = {}): Promise<{
    success: boolean;
    count: number;
    data: Transaction[];
  }> {
    return (await api.get('/transactions', { params })) as any;
  },

  async getStatement(params: { fromDate?: string; toDate?: string } = {}): Promise<{
    success: boolean;
    data: {
      investor: { name: string; email: string; mobile: string };
      generatedAt: string;
      summary: {
        totalInvested: number;
        totalReturnsReceived: number;
        totalActiveInvestments: number;
        totalTransactions: number;
      };
      transactions: Transaction[];
    };
  }> {
    return (await api.get('/transactions/statement', { params })) as any;
  },

  async getPayouts(): Promise<{
    success: boolean;
    data: {
      metrics: {
        totalReceived: number;
        totalScheduled: number;
        totalExpectedReturns: number;
        upcomingCount: number;
        completedCount: number;
      };
      upcomingPayouts: Payout[];
      completedPayouts: Payout[];
    };
  }> {
    return (await api.get('/payouts')) as any;
  },

  async getProfile(): Promise<{
    success: boolean;
    data: {
      user: User;
      profile: InvestorProfile;
      kyc: any;
    };
  }> {
    return (await api.get('/investor/profile')) as any;
  },

  async updateProfile(data: {
    address?: InvestorProfile['address'];
    notificationPreferences?: InvestorProfile['notificationPreferences'];
  }): Promise<{ success: boolean; message: string; data: InvestorProfile }> {
    return (await api.put('/investor/profile', data)) as any;
  },

  async updateBankDetails(bankData: BankDetails): Promise<{
    success: boolean;
    message: string;
    data: BankDetails;
  }> {
    return (await api.put('/investor/bank-details', bankData)) as any;
  },
};

export default transactionService;
