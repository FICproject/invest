import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { ROUTES } from '../../constants/routes';
import Icon from '../../components/common/Icon';
import OfferCard from '../../components/cards/OfferCard';
import FilterModal from '../../components/modals/FilterModal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import offerService from '../../services/offerService';
import { InvestmentOffer } from '../../types';

const TYPE_TABS = [
  { label: 'All', value: 'All' },
  { label: 'Companies', value: 'Company' },
  { label: 'Projects', value: 'Project' },
];

const CATEGORIES = [
  'All',
  'Renewable Energy',
  'Real Estate',
  'Technology',
  'Healthcare',
  'Food & Agriculture',
];

export const OfferListScreen = ({ navigation }: any) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [filters, setFilters] = useState<{ category: string; type: string; sort: string }>({
    category: 'All',
    type: 'All',
    sort: 'createdAt_desc',
  });
  const [offers, setOffers] = useState<InvestmentOffer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const effectiveType = selectedType !== 'All' ? selectedType : (filters.type !== 'All' ? filters.type : undefined);
      const res = await offerService.getAllOffers({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        type: effectiveType,
        sort: filters.sort,
      });
      if (res.success && res.data) {
        setOffers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch offers', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedType, selectedCategory, filters]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOffers();
  };

  const handleApplyFilters = (newFilters: { category: string; type: string; sort: string }) => {
    setFilters(newFilters);
    setSelectedCategory(newFilters.category);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Verified Opportunities</Text>
          <Text style={styles.headerTitle}>Investment Rounds</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate(ROUTES.SEARCH_OFFERS)}
          >
            <Icon name="search" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, styles.filterBtn]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Icon name="filter" size={20} color={COLORS.goldDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Primary Type Tabs: All, Companies, Projects */}
      <View style={styles.typeTabsRow}>
        {TYPE_TABS.map((tab) => {
          const isActive = selectedType === tab.value;
          return (
            <TouchableOpacity
              key={tab.value}
              style={[styles.typeTab, isActive && styles.typeTabActive]}
              onPress={() => setSelectedType(tab.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.typeTabText, isActive && styles.typeTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Offers List */}
      <View style={styles.listWrapper}>
        {loading && !refreshing ? (
          <Loader message="Fetching opportunities..." />
        ) : (
          <FlatList
            data={offers}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <OfferCard
                offer={item}
                onPress={() => navigation.navigate(ROUTES.OFFER_DETAILS, { offerId: item._id })}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="briefcase"
                title="No Opportunities Found"
                description="There are currently no active deals matching your selected criteria."
                actionTitle="Reset Filters"
                onAction={() => {
                  setSelectedCategory('All');
                  setFilters({ category: 'All', type: 'All', sort: 'createdAt_desc' });
                }}
              />
            }
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary, COLORS.gold]}
              />
            }
          />
        )}
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtn: {
    backgroundColor: COLORS.goldSubtle,
    borderColor: 'rgba(200, 150, 62, 0.4)',
  },
  typeTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: COLORS.surface,
    gap: 8,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E2D9CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  typeTabTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
  },
});

export default OfferListScreen;
