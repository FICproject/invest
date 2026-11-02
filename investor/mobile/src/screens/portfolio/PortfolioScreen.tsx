import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import { ROUTES } from '../../constants/routes';
import Icon from '../../components/common/Icon';
import PortfolioCard from '../../components/cards/PortfolioCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { usePortfolioContext } from '../../context/portfolioContext';
import { formatCurrency } from '../../utils/formatters';

const STATUS_TABS = ['All', 'Confirmed', 'Pending', 'Completed'];

export const PortfolioScreen = ({ navigation }: any) => {
  const {
    myInvestments,
    dashboardData,
    fetchInvestments,
    fetchDashboard,
    isRefreshing,
    refreshAll,
  } = usePortfolioContext();

  const [activeTab, setActiveTab] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([
      fetchInvestments(activeTab !== 'All' ? activeTab : undefined),
      fetchDashboard(),
    ]);
    setLoading(false);
  }, [activeTab, fetchInvestments, fetchDashboard]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredInvestments = myInvestments.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const company = (item.offerId?.companyName || item.offerId?.title || '').toLowerCase();
    const cert = (item.certificateNumber || '').toLowerCase();
    return company.includes(q) || cert.includes(q);
  });

  const metrics = dashboardData?.metrics || {
    totalInvested: 0,
    totalReturnsEarned: 0,
    pendingReturns: 0,
    activeInvestments: 0,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* Header matching Website: Title + New Investment button */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>My Investments</Text>
          <Text style={styles.headerSubtitle}>
            Manage your active asset allocations, certificate numbers, and maturity schedules.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.newInvestmentBtn}
          onPress={() => navigation.navigate(ROUTES.TAB_OFFERS)}
          activeOpacity={0.8}
        >
          <Text style={styles.newInvestmentText}>New Investment</Text>
        </TouchableOpacity>
      </View>

      {/* Filter and Search Container matching Website card */}
      <View style={styles.filterCard}>
        {/* Status Pill Tabs */}
        <View style={styles.tabsRow}>
          {STATUS_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar matching website */}
        <View style={styles.searchBar}>
          <Icon name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            placeholder="Search by company or certificate..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Investments List */}
      <View style={styles.listWrapper}>
        {loading && !isRefreshing ? (
          <Loader message="Loading investment records..." />
        ) : (
          <FlatList
            data={filteredInvestments}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <PortfolioCard
                investment={item}
                onPress={() => navigation.navigate(ROUTES.INVESTMENT_DETAIL, { investmentId: item._id, investment: item })}
                onProspectus={() => {
                  if (item.offerId?._id) {
                    navigation.navigate(ROUTES.OFFER_DETAILS, { offerId: item.offerId._id, offer: item.offerId });
                  } else {
                    navigation.navigate(ROUTES.INVESTMENT_DETAIL, { investmentId: item._id, investment: item });
                  }
                }}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="pie-chart"
                title="No Investments Yet"
                description={
                  activeTab === 'All'
                    ? "You haven't invested in any private opportunities yet. Explore live rounds to start earning returns."
                    : `No investments currently under "${activeTab}" status.`
                }
                actionTitle="Explore Deals"
                onAction={() => navigation.navigate(ROUTES.TAB_OFFERS)}
              />
            }
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refreshAll}
                colors={[COLORS.primary, COLORS.gold]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
    gap: 12,
  },
  headerTitleGroup: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  newInvestmentBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    ...SHADOWS.sm,
  },
  newInvestmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  filterCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEAE2',
    gap: 12,
    ...SHADOWS.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0D8CB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E1D5',
    paddingHorizontal: 10,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 24,
  },
});

export default PortfolioScreen;
