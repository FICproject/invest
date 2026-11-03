import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Modal
} from 'react-native';
import {
  Users,
  ShieldCheck,
  Building2,
  Rocket,
  Calendar,
  ChevronDown,
  BarChart3,
  Layers,
  UserPlus,
  PlusCircle,
  Wallet,
  Check,
  TrendingUp,
  Clock,
  ArrowRight
} from '../components/Icons';
import Header from '../components/Header';
import InteractivePieChart from '../components/InteractivePieChart';
import InvestmentOverviewChart from '../components/InvestmentOverviewChart';
import { adminApi, formatINR } from '../services/api';
import { initMobileRealTimeSync } from '../services/realTimeSync';

export default function DashboardScreen({ setActiveTab, onOpenSidebar }) {
  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [recentData, setRecentData] = useState({
    recentInvestors: [],
    recentCompanies: []
  });
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('30D');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const periodOptions = [
    { id: '7D', label: 'Last 7 days' },
    { id: '30D', label: 'Last 30 days' },
    { id: '90D', label: 'Last 90 days' },
    { id: '1Y', label: 'Last 1 year' },
    { id: 'ALL', label: 'All time' }
  ];

  const trendsByPeriod = {
    '7D': [
      { month: 'Mon', invested: 0.22, returnVal: 0.12 },
      { month: 'Tue', invested: 0.35, returnVal: 0.20 },
      { month: 'Wed', invested: 0.48, returnVal: 0.30 },
      { month: 'Thu', invested: 0.65, returnVal: 0.42 },
      { month: 'Fri', invested: 0.88, returnVal: 0.55 },
      { month: 'Sat', invested: 1.10, returnVal: 0.75 },
      { month: 'Sun', invested: 1.25, returnVal: 0.90 }
    ],
    '30D': [
      { month: 'Jan', invested: 0.52, returnVal: 0.28 },
      { month: 'Feb', invested: 0.68, returnVal: 0.45 },
      { month: 'Mar', invested: 0.85, returnVal: 0.52 },
      { month: 'Apr', invested: 1.05, returnVal: 0.65 },
      { month: 'May', invested: 1.25, returnVal: 0.82 },
      { month: 'Jun', invested: 1.35, returnVal: 0.95 },
      { month: 'Jul', invested: 1.45, returnVal: 1.30 }
    ],
    '90D': [
      { month: 'Nov', invested: 0.40, returnVal: 0.20 },
      { month: 'Dec', invested: 0.65, returnVal: 0.38 },
      { month: 'Jan', invested: 0.95, returnVal: 0.58 },
      { month: 'Feb', invested: 1.20, returnVal: 0.80 },
      { month: 'Mar', invested: 1.40, returnVal: 1.05 },
      { month: 'Apr', invested: 1.65, returnVal: 1.25 },
      { month: 'May', invested: 1.85, returnVal: 1.50 }
    ]
  };

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.getDashboard();
      if (res.data.success) {
        setStats(res.data.stats);
        setDistribution(res.data.distribution || []);
        setRecentData({
          recentInvestors: res.data.recentInvestors || [],
          recentCompanies: res.data.recentCompanies || []
        });
      }
    } catch (err) {
      console.log('Dashboard fetch notice:', err.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Listen to real-time events triggered from website or backend
    const unsubscribe = initMobileRealTimeSync((event) => {
      console.log('[Mobile Dashboard Real-Time Sync Event]:', event);
      fetchStats();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const s = stats || {};
  const currentTrends = trendsByPeriod[period] || trendsByPeriod['30D'];

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard"
        onOpenSidebar={onOpenSidebar}
        onRefresh={fetchStats}
        refreshing={refreshing}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchStats} colors={['#0047BA']} />
        }
      >
        {/* Title & Date Filter Pill (Identical to Website) */}
        <View style={styles.titleSection}>
          <View style={styles.titleTextCol}>
            <Text style={styles.dashboardTitle}>Dashboard</Text>
            <Text style={styles.dashboardSubtitle}>
              Welcome back! Here's what's happening today.
            </Text>
          </View>

          {/* Interactive Date Filter Pill */}
          <TouchableOpacity
            style={styles.dateFilterPill}
            onPress={() => setDropdownOpen(true)}
            activeOpacity={0.7}
          >
            <Calendar size={13} color="#64748B" />
            <Text style={styles.dateFilterText}>
              {periodOptions.find(p => p.id === period)?.label || 'Last 30 days'}
            </Text>
            <ChevronDown size={13} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* 2x2 Balanced KPI Metrics Grid (Identical to Web 4 Cards) */}
        <View style={styles.kpiGrid}>
          {/* Card 1: Total Investors (Blue) */}
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => setActiveTab && setActiveTab('investors')}
            activeOpacity={0.7}
          >
            <View style={[styles.kpiIconCircle, { backgroundColor: '#0047BA' }]}>
              <Users size={18} color="#FFFFFF" />
            </View>
            <View style={styles.kpiContentCol}>
              <Text style={styles.kpiLabel} numberOfLines={1}>Total Investors</Text>
              <Text style={styles.kpiValue}>
                {s.totalInvestorsCount !== undefined ? s.totalInvestorsCount.toLocaleString('en-IN') : '3'}
              </Text>
              <Text style={styles.kpiSub} numberOfLines={1}>Active registered profiles</Text>
            </View>
          </TouchableOpacity>

          {/* Card 2: Verified Investors (Green) */}
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => setActiveTab && setActiveTab('investors')}
            activeOpacity={0.7}
          >
            <View style={[styles.kpiIconCircle, { backgroundColor: '#10B981' }]}>
              <ShieldCheck size={18} color="#FFFFFF" />
            </View>
            <View style={styles.kpiContentCol}>
              <Text style={styles.kpiLabel} numberOfLines={1}>Verified Investors</Text>
              <Text style={styles.kpiValue}>
                {s.verifiedInvestorsCount !== undefined ? s.verifiedInvestorsCount.toLocaleString('en-IN') : '1'}
              </Text>
              <Text style={styles.kpiSub} numberOfLines={1}>KYC Approved</Text>
            </View>
          </TouchableOpacity>

          {/* Card 3: Registered Companies (Purple) */}
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => setActiveTab && setActiveTab('companies')}
            activeOpacity={0.7}
          >
            <View style={[styles.kpiIconCircle, { backgroundColor: '#8B5CF6' }]}>
              <Building2 size={18} color="#FFFFFF" />
            </View>
            <View style={styles.kpiContentCol}>
              <Text style={styles.kpiLabel} numberOfLines={1} adjustsFontSizeToFit>Registered Companies</Text>
              <Text style={styles.kpiValue}>
                {s.registeredCompaniesCount !== undefined ? s.registeredCompaniesCount.toLocaleString('en-IN') : '3'}
              </Text>
              <Text style={styles.kpiSub} numberOfLines={1}>Corporate entities</Text>
            </View>
          </TouchableOpacity>

          {/* Card 4: Active Opportunities (Amber/Gold) */}
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => setActiveTab && setActiveTab('offers')}
            activeOpacity={0.7}
          >
            <View style={[styles.kpiIconCircle, { backgroundColor: '#F59E0B' }]}>
              <Rocket size={18} color="#FFFFFF" />
            </View>
            <View style={styles.kpiContentCol}>
              <Text style={styles.kpiLabel} numberOfLines={1} adjustsFontSizeToFit>Active Opportunities</Text>
              <Text style={styles.kpiValue}>
                {s.activeOffersCount !== undefined ? s.activeOffersCount.toLocaleString('en-IN') : '4'}
              </Text>
              <Text style={styles.kpiSub} numberOfLines={1}>Currently raising</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Card 1: Investment Overview (Bar + Line Hybrid Chart) */}
        <View style={styles.contentCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleGroup}>
              <BarChart3 size={17} color="#0047BA" />
              <Text style={styles.cardTitle}>Investment Overview</Text>
            </View>
          </View>
          <InvestmentOverviewChart trends={currentTrends} />
        </View>

        {/* Card 2: Investment Distribution (Donut Chart) */}
        <View style={styles.contentCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleGroup}>
              <Layers size={17} color="#0047BA" />
              <Text style={styles.cardTitle}>Investment Distribution</Text>
            </View>
          </View>
          <InteractivePieChart
            data={distribution}
            centerLabel={formatINR(s.totalRaisedPaise || s.totalInvestedPaise || 0)}
            centerSublabel="Total Invested"
          />
        </View>

        {/* Card 3: Quick Actions (2x2 Grid) */}
        <View style={styles.contentCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleGroup}>
              <Rocket size={17} color="#0047BA" />
              <Text style={styles.cardTitle}>Quick Actions</Text>
            </View>
          </View>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setActiveTab && setActiveTab('investors')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
                <UserPlus size={18} color="#0047BA" />
              </View>
              <Text style={styles.actionBtnText}>Add Investor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setActiveTab && setActiveTab('companies')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#F8FAFC' }]}>
                <Building2 size={18} color="#475569" />
              </View>
              <Text style={styles.actionBtnText}>Add Company</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setActiveTab && setActiveTab('offers')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#F0FDF4' }]}>
                <PlusCircle size={18} color="#10B981" />
              </View>
              <Text style={styles.actionBtnText}>Create Offer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setActiveTab && setActiveTab('payouts')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#FFFBEB' }]}>
                <Wallet size={18} color="#D97706" />
              </View>
              <Text style={styles.actionBtnText}>Returns & Payouts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Platform Registrations (KYC & KYB) */}
        <View style={styles.contentCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleGroup}>
              <Clock size={17} color="#0047BA" />
              <Text style={styles.cardTitle}>Recent Activity</Text>
            </View>
            <TouchableOpacity
              onPress={() => setActiveTab && setActiveTab('worklist')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All ›</Text>
            </TouchableOpacity>
          </View>

          {recentData.recentInvestors.length === 0 && recentData.recentCompanies.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>All pending registrations up to date</Text>
            </View>
          ) : (
            <View style={styles.activityList}>
              {recentData.recentInvestors.slice(0, 3).map((inv, idx) => (
                <View key={`inv-${idx}`} style={styles.activityRow}>
                  <View style={[styles.activityDot, { backgroundColor: '#0047BA' }]} />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{inv.fullName || 'New Investor'}</Text>
                    <Text style={styles.activitySub}>KYC: {inv.kycStatus || 'SUBMITTED'}</Text>
                  </View>
                  <Text style={styles.activityBadge}>Investor</Text>
                </View>
              ))}
              {recentData.recentCompanies.slice(0, 2).map((comp, idx) => (
                <View key={`comp-${idx}`} style={styles.activityRow}>
                  <View style={[styles.activityDot, { backgroundColor: '#8B5CF6' }]} />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{comp.legalName || 'Corporate Entity'}</Text>
                    <Text style={styles.activitySub}>KYB: {comp.status || 'SUBMITTED'}</Text>
                  </View>
                  <Text style={[styles.activityBadge, { backgroundColor: '#F3E8FF', color: '#7E22CE' }]}>
                    Company
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Date Filter Modal */}
      <Modal visible={dropdownOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View style={styles.filterMenu}>
            <Text style={styles.filterMenuTitle}>Filter Time Range</Text>
            {periodOptions.map(opt => {
              const isSelected = opt.id === period;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.filterMenuItem, isSelected && styles.filterMenuItemSelected]}
                  onPress={() => {
                    setPeriod(opt.id);
                    setDropdownOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterMenuText, isSelected && styles.filterMenuTextActive]}>
                    {opt.label}
                  </Text>
                  {isSelected && <Check size={16} color="#0047BA" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  titleTextCol: {
    flex: 1,
    paddingRight: 8
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3
  },
  dashboardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  dateFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  dateFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B'
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1
  },
  kpiIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  kpiContentCol: {
    width: '100%'
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24
  },
  kpiSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  cardTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0047BA'
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  actionBtn: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6
  },
  actionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B'
  },
  activityList: {
    gap: 10
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC'
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10
  },
  activityContent: {
    flex: 1
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B'
  },
  activitySub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1
  },
  activityBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0047BA',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  emptyState: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  filterMenu: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8
  },
  filterMenuTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    paddingHorizontal: 4
  },
  filterMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10
  },
  filterMenuItemSelected: {
    backgroundColor: '#EFF6FF'
  },
  filterMenuText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155'
  },
  filterMenuTextActive: {
    color: '#0047BA',
    fontWeight: '800'
  }
});
