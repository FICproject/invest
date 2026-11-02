import api from './api';
import { Investment, DashboardData } from '../types';

export const investmentService = {
  async getDashboardSummary(): Promise<{ success: boolean; data: DashboardData }> {
    return (await api.get('/investor/dashboard')) as any;
  },

  async getMyInvestments(params: { status?: string; search?: string } = {}): Promise<{
    success: boolean;
    count: number;
    data: Investment[];
  }> {
    return (await api.get('/investor/my-investments', { params })) as any;
  },

  async createPaymentOrder(
    offerId: string,
    amount: number,
    paymentMethod = 'Net Banking'
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      orderId: string;
      amount: number;
      currency: string;
      offerTitle: string;
      companyName: string;
      returnRate: number;
      tenureMonths: number;
    };
  }> {
    return (await api.post('/payments/create-order', {
      offerId,
      amount,
      paymentMethod,
    })) as any;
  },

  async verifyPayment(
    orderId: string,
    paymentId?: string,
    status = 'Success'
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      investmentId: string;
      certificateNumber: string;
      amountInvested: number;
      expectedReturns: number;
      maturityDate: string;
      transactionRef: string;
    };
  }> {
    return (await api.post('/payments/verify', {
      orderId,
      paymentId: paymentId || 'MOB_PAY_' + Date.now(),
      status,
    })) as any;
  },
};

export default investmentService;
