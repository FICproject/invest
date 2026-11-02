import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import { ROUTES } from '../../constants/routes';
import Icon from '../../components/common/Icon';
import Badge from '../../components/common/Badge';
import OfferCard from '../../components/cards/OfferCard';
import ReturnsChart from '../../components/charts/ReturnsChart';
import InvestModal from '../../components/modals/InvestModal';
import SidebarDrawer from '../../components/modals/SidebarDrawer';
import Loader from '../../components/common/Loader';
import { useAuthContext } from '../../context/authContext';
import { usePortfolioContext } from '../../context/portfolioContext';
import offerService from '../../services/offerService';
import { InvestmentOffer } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const HomeScreen = ({ navigation }: any) => {
  const { user, kycStatus } = useAuthContext();
  const { dashboardData, fetchDashboard, refreshAll, isRefreshing } = usePortfolioContext();

  const [featuredOffers, setFeaturedOffers] = useState<InvestmentOffer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOffer, setSelectedOffer] = useState<InvestmentOffer | null>(null);
  const [investModalVisible, setInvestModalVisible] = useState<boolean>(false);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await fetchDashboard();
      const offersRes = await offerService.getFeaturedOffers();
      if (offersRes.success && offersRes.data) {
        setFeaturedOffers(offersRes.data);
      }
    } catch (e) {
      console.error('Failed to load home screen data', e);
    } finally {
      setLoading(false);
    }
  }, [fetchDashboard]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    await refreshAll();
    const offersRes = await offerService.getFeaturedOffers();
    if (offersRes.success && offersRes.data) {
      setFeaturedOffers(offersRes.data);
    }
  };

  const metrics = dashboardData?.metrics || {
    totalInvested: 0,
    totalReturnsEarned: 0,
    pendingReturns: 0,
    activeInvestments: 0,
    nextPayoutDate: null,
  };

  const getKycVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'danger';
      case 'NOT_STARTED':
      default:
        return 'gold';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary, COLORS.gold]}
          />
        }
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <View style={styles.userProfileHeader}>
            <TouchableOpacity
              style={styles.sidebarBtn}
              onPress={() => setSidebarVisible(true)}
              activeOpacity={0.7}
            >
              <Icon name="menu" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <View>
              <Text style={styles.welcomeSubtitle}>Accredited Portfolio</Text>
              <Text style={styles.userName}>{user?.name || 'Investor'}</Text>
            </View>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.KYC_STATUS)}
              style={styles.kycChipBtn}
            >
              <Badge
                label={kycStatus === 'APPROVED' ? 'KYC Verified' : `KYC: ${kycStatus}`}
                variant={getKycVariant(kycStatus)}
                size="sm"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
              style={styles.bellBtn}
            >
              <Icon name="bell" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Portfolio Summary Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Total Capital Deployed</Text>
              <Text style={styles.heroAmount}>
                {formatCurrency(metrics.totalInvested)}
              </Text>
            </View>
            <View style={styles.investmentsCountBadge}>
              <Icon name="briefcase" size={14} color={COLORS.gold} />
              <Text style={styles.investmentsCountText}>
                {metrics.activeInvestments} Active Deals
              </Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroBottomRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Returns Received</Text>
              <Text style={styles.heroStatValueSuccess}>
                {formatCurrency(metrics.totalReturnsEarned)}
              </Text>
            </View>

            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Upcoming Payout</Text>
              <Text style={styles.heroStatValue}>
                {metrics.nextPayoutDate ? formatDate(metrics.nextPayoutDate) : 'None Scheduled'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Nav Chips */}
        <View style={styles.quickNavRow}>
          <TouchableOpacity
            style={styles.navChip}
            onPress={() => navigation.navigate(ROUTES.TAB_OFFERS)}
          >
            <View style={[styles.navChipIcon, { backgroundColor: COLORS.goldSubtle }]}>
              <Icon name="briefcase" size={18} color={COLORS.goldDark} />
            </View>
            <Text style={styles.navChipText}>Explore Deals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navChip}
            onPress={() => navigation.navigate(ROUTES.TAB_PORTFOLIO)}
          >
            <View style={[styles.navChipIcon, { backgroundColor: COLORS.primarySubtle }]}>
              <Icon name="pie-chart" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.navChipText}>Holdings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navChip}
            onPress={() => navigation.navigate(ROUTES.TAB_WALLET)}
          >
            <View style={[styles.navChipIcon, { backgroundColor: COLORS.successBg }]}>
              <Icon name="wallet" size={18} color={COLORS.success} />
            </View>
            <Text style={styles.navChipText}>Payouts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navChip}
            onPress={() => navigation.navigate(ROUTES.KYC_STATUS)}
          >
            <View style={[styles.navChipIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Icon name="shield" size={18} color={COLORS.info} />
            </View>
            <Text style={styles.navChipText}>KYC Hub</Text>
          </TouchableOpacity>
        </View>

        {/* Monthly Returns Chart */}
        {dashboardData?.monthlyReturns && (
          <ReturnsChart data={dashboardData.monthlyReturns} />
        )}

        {/* Featured Opportunities Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Opportunities</Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.TAB_OFFERS)}>
            <Text style={styles.seeAllText}>View All Deals</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Loader message="Loading curated opportunities..." />
        ) : (
          featuredOffers.map((offer) => (
            <OfferCard
              key={offer._id}
              offer={offer}
              onPress={() => navigation.navigate(ROUTES.OFFER_DETAILS, { offerId: offer._id })}
            />
          ))
        )}
      </ScrollView>

      {/* Invest Modal */}
      <InvestModal
        visible={investModalVisible}
        offer={selectedOffer}
        onClose={() => setInvestModalVisible(false)}
        onSuccess={() => {
          navigation.navigate(ROUTES.TAB_PORTFOLIO);
        }}
        onNavigateToKyc={() => navigation.navigate(ROUTES.KYC_STATUS)}
      />

      <SidebarDrawer
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
        currentRoute="Dashboard"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sidebarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kycChipBtn: {
    paddingVertical: 2,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: 16,
    ...SHADOWS.md,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontSize: 12,
    color: COLORS.goldLight,
    fontWeight: '500',
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  investmentsCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 150, 62, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(200, 150, 62, 0.4)',
    gap: 4,
  },
  investmentsCountText: {
    fontSize: 11,
    color: COLORS.goldLight,
    fontWeight: '600',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 14,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroStat: {
    flex: 1,
  },
  heroStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  heroStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  heroStatValueSuccess: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gold,
  },
  quickNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 8,
  },
  navChip: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  navChipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  navChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.goldDark,
    fontWeight: '700',
  },
});

export default HomeScreen;
