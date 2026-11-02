import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import Icon from '../../components/common/Icon';
import CustomInput from '../../components/common/CustomInput';
import TransactionItem from '../../components/cards/TransactionItem';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import transactionService from '../../services/transactionService';
import { useDebounce } from '../../hooks/useDebounce';
import { Transaction } from '../../types';

const TYPE_TABS = ['All', 'Investment', 'Payout'];

export const TransactionHistoryScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 300);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await transactionService.getTransactions({
        type: activeTab !== 'All' ? activeTab : undefined,
        search: debouncedSearch.trim() || undefined,
      });
      if (res.success && res.data) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error('Failed to load transaction history', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, debouncedSearch]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Returns</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Ledger</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterSection}>
        <CustomInput
          placeholder="Search by title, reference ID..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Icon name="search" size={16} color={COLORS.gold} />}
          containerStyle={styles.searchBox}
        />

        <View style={styles.tabsRow}>
          {TYPE_TABS.map((tab) => (
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
      </View>

      <View style={styles.content}>
        {loading && !refreshing ? (
          <Loader message="Loading transactions..." />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <TransactionItem transaction={item} />}
            ListEmptyComponent={
              <EmptyState
                icon="file-text"
                title="No Ledger Records"
                description={
                  search
                    ? `No transactions match your search "${search}".`
                    : 'No ledger transactions recorded in this filter view.'
                }
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
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  filterSection: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBox: {
    marginBottom: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
  },
});

export default TransactionHistoryScreen;
