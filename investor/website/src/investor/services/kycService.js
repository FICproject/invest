import api from './api';

export const kycService = {
  async getKycStatus() {
    return await api.get('/kyc/status');
  },

  async submitKyc(formData) {
    return await api.post('/kyc/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  async toggleStatus(status) {
    return await api.post('/kyc/toggle-status', { status });
  }
};
