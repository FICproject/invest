import api from './api';

export const authService = {
  async register(data) {
    return await api.post('/auth/register', data);
  },

  async login(identifier, password) {
    return await api.post('/auth/login', { identifier, password });
  },

  async verifyOTP(payload) {
    return await api.post('/auth/verify-otp', payload);
  },

  async forgotPassword(email) {
    return await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(email, otp, newPassword) {
    return await api.post('/auth/reset-password', { email, otp, newPassword });
  },

  async getMe() {
    return await api.get('/auth/me');
  }
};
