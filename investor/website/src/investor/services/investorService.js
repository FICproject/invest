import api from './api';

export const investorService = {
  async getDashboardSummary() {
    return await api.get('/investor/dashboard');
  },

  async getMyInvestments(params = {}) {
    return await api.get('/investor/my-investments', { params });
  },

  async getProfile() {
    return await api.get('/investor/profile');
  },

  async updateProfile(data) {
    return await api.put('/investor/profile', data);
  },

  async updateBankDetails(bankData) {
    return await api.put('/investor/bank-details', bankData);
  },

  async getNotifications() {
    return await api.get('/investor/notifications');
  },

  async markNotificationRead(id) {
    return await api.put(`/investor/notifications/${id}/read`);
  },

  async requestInvestment(data) {
    return await api.post('/investor/request-investment', data);
  },

  async respondToCounter(id, data) {
    return await api.post(`/investor/investments/${id}/respond`, data);
  },

  async getSubscription() {
    return await api.get('/investor/subscription');
  },

  async createSubscriptionOrder(data = {}) {
    return await api.post('/investor/subscription/create-order', data);
  },

  async verifySubscription(data) {
    return await api.post('/investor/subscription/verify', data);
  }
};
