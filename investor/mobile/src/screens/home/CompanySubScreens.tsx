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

  const fetchReports = useCallback(async () => {
    try {
      const res: any = await api.get('/company/financials/reports');
      setReports(res.reports || []);
    } catch (e) {
      console.error('Failed to fetch financial reports', e);
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  if (loading) return <Loader fullScreen message="Loading Financial Reports..." />;

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

      {reports.length === 0 ? (
        <View style={styles.emptyCard}>
          <Icon name="file-text" size={40} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No Financial Filings</Text>
          <Text style={styles.emptySub}>
            Your corporate entity has not published any financial reports or audit filings yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
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
                  <Text style={styles.itemTitle}>{item.periodName || item.financialYear || 'FY Financial Statement'}</Text>
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
      )}
    </SafeAreaView>
  );
};

// 2. Returns and Dividends Screen
export const ReturnsAndDividendsScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res: any = await api.get('/company/financials/returns-and-dividends');
      setData(res);
    } catch (err) {
      console.error('Failed to load returns and dividends', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <Loader fullScreen message="Loading Dividends & Returns..." />;

  const companyInvestments = data?.companyInvestments || [];
  const projectInvestments = data?.projectInvestments || [];
  const allObligations = [...companyInvestments, ...projectInvestments];

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
          <Text style={styles.headerSub}>Investor payouts, monthly yield & scheduled obligations</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
            tintColor="#B37400"
          />
        }
      >
        {/* Summary Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>TOTAL CAPITAL RETURNED / DISBURSED</Text>
          <Text style={styles.heroAmount}>{formatCurrency(data?.totalRepaid || 0)}</Text>
          <Text style={styles.heroSub}>
            Total Outstanding Obligations: {formatCurrency(data?.totalObligations || 0)}
          </Text>
        </View>

        <Text style={styles.sectionHeading}>Active Scheduled Return Obligations</Text>

        {allObligations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="trending-up" size={40} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Active Obligations</Text>
            <Text style={styles.emptySub}>
              No capital raises require scheduled payout distributions at this time.
            </Text>
          </View>
        ) : (
          allObligations.map((item, idx) => (
            <View key={item._id || idx} style={styles.card}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title || item.name || 'Capital Allocation'}</Text>
                  <Text style={styles.itemSub}>
                    Model: {item.investmentModel || 'Fixed-Term'} • Return: {item.agreedReturnRate || item.returnRate || 0}% p.a.
                  </Text>
                </View>
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeGreenText}>{item.status || 'Active'}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.rowBetween}>
                <Text style={styles.metaLabel}>Total Raised</Text>
                <Text style={styles.metaValGold}>{formatCurrency(item.raisedAmount || item.amountInvested || 0)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// 3. Documents & Compliance Screen
export const DocumentsComplianceScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocs = useCallback(async () => {
    try {
      const res: any = await api.get('/company/documents');
      setDocuments(res.documents || []);
    } catch (err) {
      console.error('Failed to load documents', err);
      setDocuments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  if (loading) return <Loader fullScreen message="Loading Compliance Documents..." />;

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

      {documents.length === 0 ? (
        <View style={styles.emptyCard}>
          <Icon name="file-text" size={40} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No Documents Uploaded</Text>
          <Text style={styles.emptySub}>
            No corporate compliance filings or statutory documents recorded in database.
          </Text>
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item, i) => item._id || i.toString()}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchDocs();
              }}
              tintColor="#B37400"
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <View style={styles.iconCircle}>
                  <Icon name="file-text" size={18} color="#B37400" />
                </View>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <Text style={styles.itemTitle}>{item.title || item.name || item.documentType}</Text>
                  <Text style={styles.itemSub}>
                    {item.type || item.documentType || 'Statutory Filing'} • {item.createdAt ? formatDate(item.createdAt) : 'Active'}
                  </Text>
                </View>
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeGreenText}>{item.status || 'Verified'}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

// 4. Notifications Screen
export const NotificationsScreen: React.FC<ScreenProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifs = useCallback(async () => {
    try {
      const res: any = await api.get('/investor/notifications');
      setNotifications(res.data || res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  if (loading) return <Loader fullScreen message="Loading Notifications..." />;

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

      {notifications.length === 0 ? (
        <View style={styles.emptyCard}>
          <Icon name="bell" size={40} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptySub}>
            You have no notifications or compliance alerts at this time.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, i) => item._id || i.toString()}
          contentContainerStyle={styles.listPadding}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNotifs();
              }}
              tintColor="#B37400"
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row' }}>
                <View style={[styles.iconCircle, { backgroundColor: '#FFF9ED' }]}>
                  <Icon name="bell" size={18} color="#DE8E0A" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSub}>{item.message || item.desc}</Text>
                  <Text style={styles.notifTime}>{item.createdAt ? formatDate(item.createdAt) : ''}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
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
          <Text style={styles.itemSub}>Role authentication and session parameters</Text>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.metaLabel}>Session Security</Text>
            <View style={styles.badgeGreen}>
              <Text style={styles.badgeGreenText}>Active</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>Backend & Database Connection</Text>
          <Text style={styles.itemSub}>MongoDB persistent transaction ledger</Text>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.metaLabel}>Data Source</Text>
            <Text style={styles.metaValGold}>Live MongoDB Replica</Text>
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
    marginHorizontal: SPACING.md,
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
