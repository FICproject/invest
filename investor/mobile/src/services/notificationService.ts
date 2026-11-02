import api from './api';
import { AppNotification, KYC, KycStatus } from '../types';

export const notificationService = {
  async getNotifications(): Promise<{
    success: boolean;
    unreadCount: number;
    data: AppNotification[];
  }> {
    return (await api.get('/investor/notifications')) as any;
  },

  async markAsRead(id: string): Promise<{ success: boolean; message: string }> {
    return (await api.put(`/investor/notifications/${id}/read`)) as any;
  },
};

export const kycService = {
  async getKycStatus(): Promise<{ success: boolean; data: KYC }> {
    return (await api.get('/kyc/status')) as any;
  },

  async submitKyc(data: {
    fullName: string;
    panNumber: string;
    addressProofType?: string;
    addressProofNumber?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    autoApprove?: boolean;
  }): Promise<{ success: boolean; message: string; data: KYC }> {
    return (await api.post('/kyc/submit', data)) as any;
  },

  async toggleStatus(status: KycStatus): Promise<{ success: boolean; message: string; data: KYC }> {
    return (await api.post('/kyc/toggle-status', { status })) as any;
  },
};

export default notificationService;
