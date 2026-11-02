import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import { ROUTES } from '../../constants/routes';
import Icon from '../../components/common/Icon';
import Badge from '../../components/common/Badge';
import TransactionItem from '../../components/cards/TransactionItem';
import CustomButton from '../../components/common/CustomButton';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { usePortfolioContext } from '../../context/portfolioContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const WalletScreen = ({ navigation }: any) => {
  const {
    transactions,
    upcomingPayouts,
    completedPayouts,
    fetchTransactions,
    fetchPayouts,
    isRefreshing,
    refreshAll,
  } = usePortfolioContext();

  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([fetchTransactions(), fetchPayouts()]);
    setLoading(false);
  }, [fetchTransactions, fetchPayouts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalReceivedPayouts = completedPayouts.reduce((acc, p) => acc + p.amount, 0);
  const totalUpcomingPayouts = upcomingPayouts.reduce((acc, p) => acc + p.amount, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Capital & Yield</Text>
          <Text style={styles.headerTitle}>Returns & Payouts</Text>
        </View>

        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate(ROUTES.TRANSACTION_HISTORY)}
        >
          <Icon name="file-text" size={18} color={COLORS.goldDark} />
          <Text style={styles.historyBtnText}>Ledger</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshAll}
            colors={[COLORS.primary, COLORS.gold]}
          />
        }
      >
        {/* Wallet Balance Hero Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <Text style={styles.walletLabel}>Cumulative Yield Disbursed</Text>
            <View style={styles.escrowBadge}>
              <Icon name="shield" size={13} color={COLORS.gold} />
              <Text style={styles.escrowText}>Escrow Protected</Text>
            </View>
          </View>

          <Text style={styles.walletAmount}>
            {formatCurrency(totalReceivedPayouts)}
          </Text>

          <View style={styles.upcomingRow}>
            <Text style={styles.upcomingLabel}>Upcoming Scheduled Yield:</Text>
            <Text style={styles.upcomingAmount}>{formatCurrency(totalUpcomingPayouts)}</Text>
          </View>
        </View>

        {/* Upcoming Scheduled Distributions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Scheduled Payouts</Text>
          {loading ? (
            <Loader message="Loading payouts..." />
          ) : upcomingPayouts.length > 0 ? (
            upcomingPayouts.slice(0, 4).map((payout) => (
              <View key={payout._id} style={styles.payoutCard}>
                <View style={styles.payoutLeft}>
                  <Text style={styles.payoutCompany} numberOfLines={1}>
                    {payout.offerTitle}
                  </Text>
                  <Text style={styles.payoutDate}>
                    Due: {formatDate(payout.scheduledDate)} • {payout.payoutType}
                  </Text>
                </View>
                <View style={styles.payoutRight}>
                  <Text style={styles.payoutAmount}>
                    {formatCurrency(payout.amount)}
                  </Text>
                  <Badge label="Scheduled" variant="warning" size="sm" />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyPayoutsBox}>
              <Text style={styles.emptyPayoutsText}>
                No upcoming distributions scheduled. Active investments will automatically schedule monthly returns.
              </Text>
            </View>
          )}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Ledger Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.TRANSACTION_HISTORY)}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Loader />
          ) : transactions.length > 0 ? (
            transactions.slice(0, 5).map((txn) => (
              <TransactionItem key={txn._id} transaction={txn} />
            ))
          ) : (
            <EmptyState
              icon="wallet"
              title="No Transactions Yet"
              description="Your capital investments and payout receipts will be tracked in real-time here."
            />
          )}
        </View>
      </ScrollView>
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
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.goldSubtle,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(200, 150, 62, 0.4)',
    gap: 4,
  },
  historyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.goldDark,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  walletCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: 20,
    ...SHADOWS.md,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  walletLabel: {
    fontSize: 12,
    color: COLORS.goldLight,
    fontWeight: '500',
  },
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 150, 62, 0.2)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  escrowText: {
    fontSize: 10,
    color: COLORS.goldLight,
    fontWeight: '600',
  },
  walletAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  upcomingLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  upcomingAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gold,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
  },
  actionBtnOutline: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.goldDark,
    fontWeight: '700',
  },
  payoutCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  payoutLeft: {
    flex: 1,
    marginRight: 8,
  },
  payoutCompany: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  payoutDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  payoutRight: {
    alignItems: 'flex-end',
  },
  payoutAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  emptyPayoutsBox: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    padding: 16,
    alignItems: 'center',
  },
  emptyPayoutsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default WalletScreen;
