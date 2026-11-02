import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import Icon from '../../components/common/Icon';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const CompanyFinancialsScreen = ({ onBack, initialTab = 'transactions' }: { onBack?: () => void; initialTab?: 'financials' | 'transactions' }) => {
  const [activeTab, setActiveTab] = useState<'financials' | 'transactions'>(initialTab);
  const [reports, setReports] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [repRes, txRes] = await Promise.allSettled([
        api.get('/company/financials/reports'),
        api.get('/company/transactions'),
      ]);

      if (repRes.status === 'fulfilled' && (repRes.value as any)) {
        const val: any = repRes.value;
        setReports(val.reports || []);
        if (val.metrics) setMetrics(val.metrics);
      }

      if (txRes.status === 'fulfilled' && (txRes.value as any)) {
        const val: any = txRes.value;
        setTransactions(val.transactions || []);
      }
    } catch (e) {
      console.error('Failed to load company financials', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <Loader fullScreen message="Loading Financial Ledger..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ marginRight: 10, padding: 4 }}>
            <Icon name="chevron-left" size={24} color="#1F2421" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Transactions & Ledger</Text>
          <Text style={styles.headerSub}>Capital received, return disbursements & ledger entries</Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'financials' && styles.tabItemActive]}
          onPress={() => setActiveTab('financials')}
        >
          <Text
            style={[styles.tabItemText, activeTab === 'financials' && styles.tabItemTextActive]}
          >
            P&L / Reports ({reports.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'transactions' && styles.tabItemActive]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text
            style={[styles.tabItemText, activeTab === 'transactions' && styles.tabItemTextActive]}
          >
            Transactions ({transactions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'financials' ? (
        <FlatList
          data={reports}
          keyExtractor={(item) => item._id || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#C8963E"
              colors={['#C8963E']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Icon name="file-text" size={38} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Financial Reports Yet</Text>
              <Text style={styles.emptySub}>
                Quarterly and annual statements submitted to Connect Invest will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.reportCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.reportPeriod}>{item.periodName || item.financialYear || 'Quarterly Period'}</Text>
                  <Text style={styles.reportFY}>{item.financialYear} • {item.periodType || 'Financial Report'}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{item.auditStatus || 'Audited'}</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Revenue</Text>
                  <Text style={styles.statValSuccess}>{formatCurrency(item.revenue || 0)}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Expenses</Text>
                  <Text style={styles.statValDanger}>{formatCurrency(item.operatingExpenses || 0)}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Net Profit</Text>
                  <Text style={styles.statValGold}>{formatCurrency(item.netProfitOrLoss || 0)}</Text>
                </View>
              </View>

              {item.notes ? (
                <Text style={styles.reportNotes} numberOfLines={2}>
                  Note: {item.notes}
                </Text>
              ) : null}
            </View>
          )}
        />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#C8963E"
              colors={['#C8963E']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Icon name="trending-up" size={38} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Transactions Logged</Text>
              <Text style={styles.emptySub}>
                Capital received and return payouts processed will be recorded here.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isInflow = item.type === 'FUNDING_RECEIVED' || item.type === 'INVESTMENT' || (item.amount > 0);
            return (
              <View style={styles.txCard}>
                <View style={[styles.txIconBox, { backgroundColor: isInflow ? '#ECFDF5' : '#FEF3C7' }]}>
                  <Icon
                    name={isInflow ? 'arrow-down-left' : 'arrow-up-right'}
                    size={18}
                    color={isInflow ? '#059669' : '#D97706'}
                  />
                </View>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <Text style={styles.txTitle}>{item.description || item.type || 'Transaction'}</Text>
                  <Text style={styles.txDate}>{formatDate(item.createdAt || item.date)} • {item.referenceId || item._id?.slice(-8)}</Text>
                </View>
                <Text style={[styles.txAmount, { color: isInflow ? '#059669' : '#1F2421' }]}>
                  {isInflow ? '+' : '-'}{formatCurrency(Math.abs(item.amount || 0))}
                </Text>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8D8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2421',
  },
  headerSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8D8',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#B37400',
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabItemTextActive: {
    color: '#B37400',
    fontWeight: '700',
  },
  listContainer: {
    padding: SPACING.md,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#EFE8D8',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportPeriod: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2421',
  },
  reportFY: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 10,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  statValSuccess: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  statValDanger: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  statValGold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B37400',
  },
  reportNotes: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#EFE8D8',
    marginBottom: 10,
    ...SHADOWS.sm,
  },
  txIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2421',
  },
  txDate: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE8D8',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2421',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});

export default CompanyFinancialsScreen;

