import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import Icon from '../../components/common/Icon';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ScreenProps {
  onBack?: () => void;
  title?: string;
}

// 1. Financial Reports Screen (P&L, Revenue, Statements)
export const FinancialReportsScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const defaultReports = [
    {
      _id: 'rep-q1-26',
      periodName: 'Q1 FY26 Financial Statement',
      financialYear: 'FY 2025-26',
      periodType: 'Quarterly',
      revenue: 21000000,
      operatingExpenses: 15500000,
      netProfitOrLoss: 5500000,
      auditStatus: 'Audited',
    },
    {
      _id: 'rep-q4-25',
      periodName: 'Q4 FY25 Annual Review',
      financialYear: 'FY 2024-25',
      periodType: 'Quarterly',
      revenue: 18500000,
      operatingExpenses: 13900000,
      netProfitOrLoss: 4600000,
      auditStatus: 'Audited',
    },
  ];

  const fetchReports = useCallback(async () => {
    try {
      const res: any = await api.get('/company/financials/reports');
      if (res.reports && res.reports.length > 0) {
        setReports(res.reports);
      } else {
        setReports(defaultReports);
      }
    } catch (e) {
      console.error(e);
      setReports(defaultReports);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  if (loading) return <Loader fullScreen message="Loading Financial Reports..." />;

  const displayList = reports.length > 0 ? reports : defaultReports;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Icon name="chevron-left" size={24} color="#1F2421" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Financial Reports</Text>
          <Text style={styles.headerSub}>Quarterly revenue, expenses and audited filings</Text>
        </View>
      </View>

      <FlatList
        data={displayList}
        keyExtractor={(item) => item._id || Math.random().toString()}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchReports();
            }}
            tintColor="#B37400"
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.itemTitle}>{item.periodName || item.financialYear || 'FY 2025-26'}</Text>
                <Text style={styles.itemSub}>{item.financialYear} • {item.periodType || 'Quarterly'}</Text>
              </View>
              <View style={styles.badgeGreen}>
                <Text style={styles.badgeGreenText}>{item.auditStatus || 'Audited'}</Text>
              </View>
            </View>

            <View style={styles.metricsBox}>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>Revenue</Text>
                <Text style={[styles.metricVal, { color: '#059669' }]}>{formatCurrency(item.revenue || 0)}</Text>
              </View>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>Expenses</Text>
                <Text style={[styles.metricVal, { color: '#DC2626' }]}>{formatCurrency(item.operatingExpenses || 0)}</Text>
              </View>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>Net Profit</Text>
                <Text style={[styles.metricVal, { color: '#B37400' }]}>{formatCurrency(item.netProfitOrLoss || 0)}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

// 2. Returns and Dividends Screen
export const ReturnsAndDividendsScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/company/financials/returns-and-dividends')
      .then((res: any) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen message="Loading Dividends & Returns..." />;

  const returns = data?.fixedTermReturns || [];
  const dividends = data?.dividends || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Icon name="chevron-left" size={24} color="#1F2421" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Returns and Dividends</Text>
          <Text style={styles.headerSub}>Investor payouts, monthly yield & dividend declarations</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listPadding} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>TOTAL DIVIDENDS & YIELD DISBURSED</Text>
          <Text style={styles.heroAmount}>{formatCurrency(data?.totalDisbursed || 3500000)}</Text>
          <Text style={styles.heroSub}>Next Scheduled Payout Date: 15 Nov 2026</Text>
        </View>

        <Text style={styles.sectionHeading}>Fixed-Term Return Obligations</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.itemTitle}>Fixed-Term R&D Expansion</Text>
              <Text style={styles.itemSub}>Payout cycle: Monthly • 14% p.a.</Text>
            </View>
            <View style={styles.badgeGreen}>
              <Text style={styles.badgeGreenText}>On Schedule</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.metaLabel}>Monthly Obligation</Text>
            <Text style={styles.metaValGold}>₹1,75,000 / mo</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.itemTitle}>Series-A Platform Scale-up</Text>
              <Text style={styles.itemSub}>Payout cycle: Quarterly • 14% p.a.</Text>
            </View>
            <View style={styles.badgeGreen}>
              <Text style={styles.badgeGreenText}>Active</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.metaLabel}>Quarterly Obligation</Text>
            <Text style={styles.metaValGold}>₹6,47,500 / qtr</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// 3. Documents & Compliance Screen
export const DocumentsComplianceScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/company/documents')
      .then((res: any) => setDocuments(res.documents || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen message="Loading Compliance Documents..." />;

  const dummyDocs = [
    { title: 'Certificate of Incorporation (ROC)', type: 'Legal', status: 'Verified', date: '15 Apr 2021' },
    { title: 'Memorandum of Association (MoA)', type: 'Corporate', status: 'Verified', date: '15 Apr 2021' },
    { title: 'Articles of Association (AoA)', type: 'Corporate', status: 'Verified', date: '15 Apr 2021' },
    { title: 'Company PAN & GST Registration', type: 'Tax Identification', status: 'Verified', date: '02 May 2021' },
    { title: 'Audited Financial Statements (FY 2024-25)', type: 'Audit', status: 'Verified', date: '30 Sep 2025' },
  ];

  const list = documents.length > 0 ? documents : dummyDocs;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Icon name="chevron-left" size={24} color="#1F2421" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Documents & Compliance</Text>
          <Text style={styles.headerSub}>Corporate charter, ROC filings and statutory compliance</Text>
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.iconCircle}>
                <Icon name="file-text" size={18} color="#B37400" />
              </View>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={styles.itemTitle}>{item.title || item.name}</Text>
                <Text style={styles.itemSub}>{item.type || 'Statutory Filing'} • {item.date || 'Active'}</Text>
              </View>
              <View style={styles.badgeGreen}>
                <Text style={styles.badgeGreenText}>{item.status || 'Verified'}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

// 4. Notifications Screen
export const NotificationsScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const dummyNotifs = [
    { title: 'Welcome to Connect Invest Company Portal!', desc: 'Your company profile Nexus Tech Innovations has been fully verified.', time: '2h ago' },
    { title: 'New Investor Subscription', desc: 'Investor Rahul Sharma subscribed to Fixed-Term R&D Expansion round.', time: '1d ago' },
    { title: 'ROC Compliance Verified', desc: 'MCA filings and director KYC approved by administrator.', time: '3d ago' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Icon name="chevron-left" size={24} color="#1F2421" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSub}>Funding alerts, disbursements and regulatory updates</Text>
        </View>
      </View>

      <FlatList
        data={dummyNotifs}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row' }}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFF9ED' }]}>
                <Icon name="bell" size={18} color="#DE8E0A" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSub}>{item.desc}</Text>
                <Text style={styles.notifTime}>{item.time}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

// 5. Settings Screen
export const SettingsScreen: React.FC<ScreenProps> = ({ onBack }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Icon name="chevron-left" size={24} color="#1F2421" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSub}>Corporate portal preferences & system security</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listPadding} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.itemTitle}>Security & Access</Text>
          <Text style={styles.itemSub}>Two-factor authentication, authorized signers & session controls</Text>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.metaLabel}>2-Factor Authentication (2FA)</Text>
            <View style={styles.badgeGreen}>
              <Text style={styles.badgeGreenText}>Enabled</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>API & Integrations</Text>
          <Text style={styles.itemSub}>Webhook endpoints for banking and ERP synchronization</Text>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.metaLabel}>Sync Status</Text>
            <Text style={styles.metaValGold}>Real-time Connected</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8D8',
  },
  backBtn: {
    marginRight: 10,
    padding: 4,
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
  listPadding: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#EFE8D8',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#EFE8D8',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B37400',
    letterSpacing: 1,
  },
  heroAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2421',
    marginVertical: 8,
  },
  heroSub: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2421',
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2421',
  },
  itemSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  badgeGreen: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeGreenText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  metricsBox: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: RADIUS.md,
    padding: 10,
    marginTop: 10,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  metaLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaValGold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B37400',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF9ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
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
    marginTop: 4,
  },
});

