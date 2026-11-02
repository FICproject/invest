import api from './api';

export interface CompanyDashboardOverview {
  success: boolean;
  kpi: {
    totalFundsRequested: number;
    totalFundsRaised: number;
    activeRequestsCount: number;
    totalInvestors: number;
    totalShareholders: number;
    fundingProgress: number;
    availableFunds: number;
    pendingApprovals: number;
  };
  charts: {
    fundingProgress: number;
    activityData: Array<{
      month: string;
      requested: number;
      raised: number;
    }>;
    modelDistribution: Array<{
      name: string;
      value: number;
      color: string;
    }>;
  };
  recentInvestments: any[];
  recentTransactions: any[];
  latestNotifications: any[];
}

export const companyMobileService = {
  getOverview: async (): Promise<CompanyDashboardOverview> => {
    return (await api.get('/company/dashboard-overview')) as any;
  },

  getProfile: async (): Promise<any> => {
    return (await api.get('/company/profile')) as any;
  },

  getRequests: async (): Promise<any> => {
    return (await api.get('/company/requests')) as any;
  },

  createRequest: async (data: any): Promise<any> => {
    return (await api.post('/company/requests', data)) as any;
  },

  getInvestments: async (): Promise<any> => {
    return (await api.get('/company/investments')) as any;
  },

  getShareholders: async (): Promise<any> => {
    return (await api.get('/company/shareholders')) as any;
  },

  getTransactions: async (): Promise<any> => {
    return (await api.get('/company/transactions')) as any;
  },
};

export default companyMobileService;

