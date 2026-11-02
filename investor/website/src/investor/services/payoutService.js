import api from './api';

export const payoutService = {
  async getPayouts() {
    return await api.get('/payouts');
  },

  async getTransactions(params = {}) {
    return await api.get('/transactions', { params });
  },

  async getStatement(params = {}) {
    return await api.get('/transactions/statement', { params });
  }
};
