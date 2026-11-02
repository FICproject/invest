import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { useAuthContext } from '../../context/authContext';
import companyMobileService, { CompanyDashboardOverview } from '../../services/companyMobileService';
import { formatCurrency } from '../../utils/formatters';

export const CompanyDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuthContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [overview, setOverview] = useState<CompanyDashboardOverview | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      const [ovRes, prRes] = await Promise.allSettled([
        companyMobileService.getOverview(),
        companyMobileService.getProfile(),
      ]);

      if (ovRes.status === 'fulfilled' && ovRes.value) {
        setOverview(ovRes.value);
      }
      if (prRes.status === 'fulfilled' && prRes.value) {
        setProfile(prRes.value.company || prRes.value);
      }
    } catch (e) {
      console.error('Failed to load company dashboard data', e);
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

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Connect Invest?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (loading) {
    return <Loader fullScreen message="Loading Company Portal..." />;
  }

  const kpi = overview?.kpi || {
    totalFundsRequested: 0,
    totalFundsRaised: 0,
    activeRequestsCount: 0,
    totalInvestors: 0,
    totalShareholders: 0,
    fundingProgress: 0,
    availableFunds: 0,
    pendingApprovals: 0,
  };

  const companyName = profile?.legalName || 'Company Entity';
  const industry = profile?.industry || 'Corporate Partner';
  const verified = profile?.verificationStatus === 'Verified';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header - Light Theme Matching Web */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.companyBadge}>
            <Icon name="building" size={22} color="#B37400" />
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.roleTagRow}>
              <Text style={styles.roleTag}>COMPANY PORTAL</Text>
              {verified && (
                <View style={styles.verifiedChip}>
                  <Icon name="check-circle" size={11} color="#059669" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            <Text style={styles.companyTitle} numberOfLines={1}>
              {companyName}
            </Text>
            <Text style={styles.userName}>
              {user?.name || 'Admin'} • {industry}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Icon name="log-out" size={18} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C8963E"
            colors={['#C8963E']}
          />
        }
      >
        {/* Banner sync */}
        <View style={styles.liveBanner}>
          <Icon name="trending-up" size={16} color="#B37400" />
          <Text style={styles.liveBannerText}>
            Unified Corporate Desk: Real-time sync with Web Dashboard
          </Text>
        </View>

        {/* Hero Funds Card - Matching Web Card styling */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroLabel}>TOTAL FUNDS RAISED</Text>
            <View style={styles.progressPill}>
              <Text style={styles.progressPillText}>{kpi.fundingProgress}% Funded</Text>
            </View>
          </View>

          <Text style={styles.heroAmount}>{formatCurrency(kpi.totalFundsRaised)}</Text>

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, Math.max(0, kpi.fundingProgress))}%` },
              ]}
            />
          </View>

          <View style={styles.heroMetaRow}>
            <View>
              <Text style={styles.metaLabel}>Total Target</Text>
              <Text style={styles.metaValue}>{formatCurrency(kpi.totalFundsRequested)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.metaLabel}>Available Capital</Text>
              <Text style={styles.metaValueGold}>{formatCurrency(kpi.availableFunds)}</Text>
            </View>
          </View>
        </View>

        {/* 4 Metric Cards */}
        <Text style={styles.sectionTitle}>Key Operational Metrics</Text>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="briefcase" size={18} color="#D97706" />
            </View>
            <Text style={styles.kpiValue}>{kpi.activeRequestsCount}</Text>
            <Text style={styles.kpiLabel}>Active Rounds</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#EDE9FE' }]}>
              <Icon name="user" size={18} color="#7C3AED" />
            </View>
            <Text style={styles.kpiValue}>{kpi.totalShareholders}</Text>
            <Text style={styles.kpiLabel}>Shareholders</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#D1FAE5' }]}>
              <Icon name="dollar-sign" size={18} color="#059669" />
            </View>
            <Text style={styles.kpiValue}>{kpi.totalInvestors}</Text>
            <Text style={styles.kpiLabel}>Direct Investors</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#E0E7FF' }]}>
              <Icon name="shield" size={18} color="#4F46E5" />
            </View>
            <Text style={styles.kpiValue}>
              {profile?.verificationStatus === 'Verified' ? 'Active' : 'Pending'}
            </Text>
            <Text style={styles.kpiLabel}>Entity Status</Text>
          </View>
        </View>

        {/* Capital Models Breakdown */}
        {overview?.charts?.modelDistribution && overview.charts.modelDistribution.length > 0 && (
          <View style={styles.modelSection}>
            <Text style={styles.sectionTitle}>Capital Structure Breakdown</Text>
            <View style={styles.cardContainer}>
              {overview.charts.modelDistribution.map((item, index) => (
                <View key={index} style={styles.modelRow}>
                  <View style={styles.modelLeft}>
                    <View style={[styles.colorDot, { backgroundColor: item.color || '#F4B41A' }]} />
                    <Text style={styles.modelName}>{item.name}</Text>
                  </View>
                  <Text style={styles.modelAmount}>{formatCurrency(item.value)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Company Legal Profile Info */}
        <Text style={styles.sectionTitle}>Registered Entity Details</Text>
        <View style={styles.cardContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Company Type</Text>
            <Text style={styles.detailValue}>{profile?.companyType || 'Private Limited'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>PAN / Tax ID</Text>
            <Text style={styles.detailValue}>{profile?.pan || 'N/A'}</Text>
          </View>
          {profile?.cin && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>CIN Number</Text>
              <Text style={styles.detailValue}>{profile.cin}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Headquarters</Text>
            <Text style={styles.detailValue}>
              {profile?.registeredAddress?.city || 'India'}, {profile?.registeredAddress?.state || ''}
            </Text>
          </View>
        </View>

        {/* Sync Note */}
        <View style={styles.syncFooter}>
          <Icon name="check-circle" size={16} color="#059669" />
          <Text style={styles.syncFooterText}>
            Synced with Web Platform • Real-time updates active
          </Text>
        </View>

        <View style={{ height: 40 }} />
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8D8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF9ED',
    borderWidth: 1.5,
    borderColor: '#F4B41A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  roleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  roleTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B37400',
    letterSpacing: 0.8,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
    marginLeft: 3,
  },
  companyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2421',
  },
  userName: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9ED',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    marginTop: 14,
    marginBottom: 14,
  },
  liveBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
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
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B37400',
    letterSpacing: 0.8,
  },
  progressPill: {
    backgroundColor: '#FFF9ED',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F4B41A',
  },
  progressPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B37400',
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2421',
    marginTop: 8,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F4B41A',
    borderRadius: 4,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  metaLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2421',
  },
  metaValueGold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B37400',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2421',
    marginBottom: 10,
    marginTop: 6,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFE8D8',
    ...SHADOWS.sm,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2421',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  modelSection: {
    marginBottom: SPACING.md,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#EFE8D8',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  modelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  modelName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  modelAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2421',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2421',
  },
  syncFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  syncFooterText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default CompanyDashboardScreen;
