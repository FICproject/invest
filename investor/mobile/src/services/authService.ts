import api from './api';
import { User, KycStatus } from '../types';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
    kycStatus: KycStatus;
    otpCode?: string;
  };
}

export const authService = {
  async register(data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
    termsAccepted?: boolean;
  }): Promise<AuthResponse> {
    return (await api.post('/auth/register', data)) as any;
  },

  async registerCompany(data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
    companyLegalName: string;
    companyType?: string;
    industry: string;
    pan: string;
    cin?: string;
    city?: string;
    state?: string;
    pincode?: string;
    description?: string;
  }): Promise<{
    success: boolean;
    message: string;
    token?: string;
    user?: User;
    company?: any;
  }> {
    return (await api.post('/company/auth/register', data)) as any;
  },

  async login(identifier: string, password: string): Promise<AuthResponse> {
    return (await api.post('/auth/login', { identifier, password })) as any;
  },

  async verifyOTP(payload: {
    email?: string;
    mobile?: string;
    otp: string;
  }): Promise<AuthResponse> {
    return (await api.post('/auth/verify-otp', payload)) as any;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; data?: { otpCode: string } }> {
    return (await api.post('/auth/forgot-password', { email })) as any;
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return (await api.post('/auth/reset-password', { email, otp, newPassword })) as any;
  },

  async getMe(): Promise<{ success: boolean; data: { user: User; profile: any; kycStatus: KycStatus } }> {
    return (await api.get('/auth/me')) as any;
  },
};

export default authService;
