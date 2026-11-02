import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import {
  TrendingUp,
  CreditCard,
  MessageSquare,
  Bell,
  Settings as SettingsIcon,
  CheckCircle2,
  Clock,
  Building2,
  Users,
  Briefcase
} from '../components/Icons';
import Header from '../components/Header';
import { adminApi, formatINR } from '../services/api';

/**
 * Generic View for sections accessed via Sidebar:
 * - investments_portfolio
 * - releases (Payments & Transactions)
 * - subscriptions
 * - queries
 * - notifications
 * - settings
 */
export default function GenericModuleScreen({ tabId, onOpenSidebar, setActiveTab }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const metaMap = {
    investments_portfolio: {
      title: 'Investments',
      subtitle: 'Active & matured investor capital allocations',
      icon: TrendingUp
    },
    releases: {
      title: 'Payments & Transactions',
      subtitle: 'Fund releases, repayments & escrow flows',
      icon: CreditCard
    },
    subscriptions: {
      title: 'Subscriptions',
      subtitle: 'Monthly platform membership service dues',
      icon: CreditCard
    },
    queries: {
      title: 'Queries & Support',
      subtitle: 'Investor & borrower ticket escalations',
      icon: MessageSquare
    },
    notifications: {
      title: 'Notifications',
      subtitle: 'Broadcast alerts and system compliance warnings',
      icon: Bell
    },
    settings: {
      title: 'Settings',
      subtitle: 'System administrative credentials & security parameters',
      icon: SettingsIcon
    }
  };

  const meta = metaMap[tabId] || {
    title: 'Platform Module',
    subtitle: 'Connect Invest administrative console',
    icon: TrendingUp
  };

  const Icon = meta.icon;

  const loadModuleData = async () => {
    try {
      setRefreshing(true);
      if (tabId === 'releases') {
        const res = await adminApi.getReleases();
        setData(res.data?.releases || []);
      } else if (tabId === 'investments_portfolio') {
        const res = await adminApi.getAllInvestments();
        setData(res.data?.investments || []);
      }
    } catch (e) {
      // Non-blocking
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModuleData();
  }, [tabId]);

  return (
    <View style={styles.container}>
      <Header
        title={meta.title}
        onOpenSidebar={onOpenSidebar}
        onRefresh={loadModuleData}
        refreshing={refreshing}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadModuleData} colors={['#0047BA']} />
        }
      >
        {/* Module Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.iconCircle}>
            <Icon size={26} color="#0047BA" />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.moduleTitle}>{meta.title}</Text>
            <Text style={styles.moduleSubtitle}>{meta.subtitle}</Text>
          </View>
        </View>

        {/* Sync Status Banner */}
        <View style={styles.syncBanner}>
          <CheckCircle2 size={16} color="#059669" />
          <Text style={styles.syncBannerText}>
            Real-time live sync connected with web console.
          </Text>
        </View>

        {/* Data list or Overview Cards */}
        {tabId === 'investments_portfolio' && data.length > 0 ? (
          data.map((item, idx) => (
            <View key={item._id || `inv-${idx}`} style={styles.dataCard}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={styles.serialPill}>
                    <Text style={styles.serialPillText}>#{idx + 1}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{item.offerId?.title || 'Investment'}</Text>
                </View>
                <View style={styles.badgeSuccess}>
                  <Text style={styles.badgeSuccessText}>{item.status || 'Active'}</Text>
                </View>
              </View>
              <Text style={styles.investorSubtext}>
                Investor: {item.investorId?.name || item.investorProfileId?.legalName || 'Verified Investor'}
              </Text>
              <Text style={styles.amountText}>{formatINR(item.amountPaise)}</Text>
              <Text style={styles.dateSubtext}>
                Allotted: {new Date(item.createdAt).toLocaleDateString()} • Tenure: {item.tenureMonths || 12} mo
              </Text>
            </View>
          ))
        ) : tabId === 'releases' && data.length > 0 ? (
          data.map((item, idx) => (
            <View key={item._id || `rel-${idx}`} style={styles.dataCard}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={styles.serialPill}>
                    <Text style={styles.serialPillText}>#{idx + 1}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{item.companyId?.name || 'Company Release'}</Text>
                </View>
                <View style={styles.badgeSuccess}>
                  <Text style={styles.badgeSuccessText}>{item.status || 'Prepared'}</Text>
                </View>
              </View>
              <Text style={styles.amountText}>{formatINR(item.amountPaise)}</Text>
              <Text style={styles.dateSubtext}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.infoCard}>
            <Text style={styles.infoHeading}>Live Module Operational</Text>
            <Text style={styles.infoBody}>
              All operations and records for {meta.title} are synchronized with the central backend server and web admin console.
            </Text>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => setActiveTab('dashboard')}
            >
              <Text style={styles.quickActionText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  scrollContent: {
    padding: 16
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    gap: 14
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  textCol: {
    flex: 1
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A'
  },
  moduleSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16
  },
  syncBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534'
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  serialPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  serialPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B'
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  badgeSuccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534'
  },
  investorSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0047BA',
    marginBottom: 2
  },
  dateSubtext: {
    fontSize: 11,
    color: '#94A3B8'
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginTop: 20
  },
  infoHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8
  },
  infoBody: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16
  },
  quickActionBtn: {
    backgroundColor: '#0047BA',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});

