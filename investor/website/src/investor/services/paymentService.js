import api from './api';

export const paymentService = {
  async createOrder(offerId, amount, paymentMethod) {
    return await api.post('/payments/create-order', {
      offerId,
      amount,
      paymentMethod
    });
  },

  async verifyPayment(orderId, paymentId, status = 'Success') {
    return await api.post('/payments/verify', {
      orderId,
      paymentId,
      status
    });
  }
};
