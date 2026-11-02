import api from './api';

export const investmentService = {
  async getAllOffers(params = {}) {
    return await api.get('/investments', { params });
  },

  async getFeaturedOffers() {
    return await api.get('/investments/featured');
  },

  async getOfferById(id) {
    return await api.get(`/investments/${id}`);
  },

  async calculateReturns(offerId, amount, customTenureMonths) {
    return await api.post('/investments/calculate', {
      offerId,
      amount,
      customTenureMonths
    });
  }
};
