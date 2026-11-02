import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import investmentService from '../services/investmentService';
import transactionService from '../services/transactionService';
import { Investment, DashboardData, Transaction, Payout } from '../types';

interface PortfolioContextType {
  dashboardData: DashboardData | null;
  myInvestments: Investment[];
  transactions: Transaction[];
  upcomingPayouts: Payout[];
  completedPayouts: Payout[];
  isLoading: boolean;
  isRefreshing: boolean;
  fetchDashboard: () => Promise<void>;
  fetchInvestments: (status?: string) => Promise<void>;
  fetchTransactions: (type?: string) => Promise<void>;
  fetchPayouts: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [myInvestments, setMyInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [upcomingPayouts, setUpcomingPayouts] = useState<Payout[]>([]);
  const [completedPayouts, setCompletedPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await investmentService.getDashboardSummary();
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard', e);
    }
  }, []);

  const fetchInvestments = useCallback(async (status?: string) => {
    try {
      const res = await investmentService.getMyInvestments({ status });
      if (res.success && res.data) {
        setMyInvestments(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch investments', e);
    }
  }, []);

  const fetchTransactions = useCallback(async (type?: string) => {
    try {
      const res = await transactionService.getTransactions({ type });
      if (res.success && res.data) {
        setTransactions(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch transactions', e);
    }
  }, []);

  const fetchPayouts = useCallback(async () => {
    try {
      const res = await transactionService.getPayouts();
      if (res.success && res.data) {
        setUpcomingPayouts(res.data.upcomingPayouts || []);
        setCompletedPayouts(res.data.completedPayouts || []);
      }
    } catch (e) {
      console.error('Failed to fetch payouts', e);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      fetchDashboard(),
      fetchInvestments(),
      fetchTransactions(),
      fetchPayouts(),
    ]);
    setIsRefreshing(false);
  }, [fetchDashboard, fetchInvestments, fetchTransactions, fetchPayouts]);

  return (
    <PortfolioContext.Provider
      value={{
        dashboardData,
        myInvestments,
        transactions,
        upcomingPayouts,
        completedPayouts,
        isLoading,
        isRefreshing,
        fetchDashboard,
        fetchInvestments,
        fetchTransactions,
        fetchPayouts,
        refreshAll,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolioContext = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolioContext must be used within a PortfolioProvider');
  }
  return context;
};

export default PortfolioContext;
