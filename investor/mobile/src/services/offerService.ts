import api from './api';
import { InvestmentOffer } from '../types';

export interface ReturnCalculation {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  payoutFrequency: string;
  monthlyPayout: number;
  totalExpectedInterest: number;
  totalMaturityAmount: number;
}

export const offerService = {
  async getAllOffers(params: {
    category?: string;
    type?: string;
    search?: string;
    sort?: string;
    minAmount?: number;
    maxAmount?: number;
    status?: string;
  } = {}): Promise<{ success: boolean; count: number; data: InvestmentOffer[] }> {
    return (await api.get('/investments', { params })) as any;
  },

  async getFeaturedOffers(): Promise<{ success: boolean; count: number; data: InvestmentOffer[] }> {
    return (await api.get('/investments/featured')) as any;
  },

  async getOfferById(id: string): Promise<{ success: boolean; data: InvestmentOffer }> {
    return (await api.get(`/investments/${id}`)) as any;
  },

  async calculateReturns(
    offerId: string,
    amount: number,
    customTenureMonths?: number
  ): Promise<{ success: boolean; data: ReturnCalculation }> {
    return (await api.post('/investments/calculate', {
      offerId,
      amount,
      customTenureMonths,
    })) as any;
  },
};

export default offerService;
