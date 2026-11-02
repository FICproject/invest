import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import Icon from '../../components/common/Icon';
import ReturnsChart from '../../components/charts/ReturnsChart';
import { usePortfolioContext } from '../../context/portfolioContext';
import { formatCurrency } from '../../utils/formatters';

export const PerformanceAnalyticsScreen = ({ navigation }: any) => {
  const { dashboardData } = usePortfolioContext();

  const metrics = dashboardData?.metrics || {
    totalInvested: 0,
    totalReturnsEarned: 0,
    pendingReturns: 0,
    activeInvestments: 0,
  };

  const sectors = dashboardData?.portfolioOverview || [];
  const statusStats = dashboardData?.investmentStatus || {
    confirmed: 0,
    pending: 0,
    completed: 0,
    total: 0,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Portfolio</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Analytics & Allocation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Aggregate Return Card */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiLabel}>Capital Deployed</Text>
            <Text style={styles.kpiValue}>{formatCurrency(metrics.totalInvested)}</Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiItem}>
            <Text style={styles.kpiLabel}>Realized Return</Text>
            <Text style={styles.kpiValueGold}>{formatCurrency(metrics.totalReturnsEarned)}</Text>
          </View>
        </View>

        {/* Monthly Progression */}
        {dashboardData?.monthlyReturns && (
          <ReturnsChart data={dashboardData.monthlyReturns} title="Monthly Return Realization" />
        )}

        {/* Sector Diversification */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Asset Sector Diversification</Text>
          {sectors.map((sector, index) => (
            <View key={index} style={styles.sectorRow}>
              <View style={styles.sectorHeader}>
                <Text style={styles.sectorName}>{sector.category}</Text>
                <Text style={styles.sectorPercent}>{sector.percentage}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${sector.percentage}%`,
                      backgroundColor:
                        index === 0
                          ? COLORS.primary
                          : index === 1
                          ? COLORS.gold
                          : index === 2
                          ? COLORS.info
                          : COLORS.success,
                    },
                  ]}
                />
              </View>
              <Text style={styles.sectorAmount}>
                Allocated: {formatCurrency(sector.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Status Distribution */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Round Status Distribution</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusBox}>
              <Text style={styles.statusCount}>{statusStats.confirmed}</Text>
              <Text style={styles.statusLabel}>Confirmed</Text>
            </View>
            <View style={styles.statusBox}>
              <Text style={styles.statusCount}>{statusStats.pending}</Text>
              <Text style={styles.statusLabel}>Pending</Text>
            </View>
            <View style={styles.statusBox}>
              <Text style={styles.statusCount}>{statusStats.completed}</Text>
              <Text style={styles.statusLabel}>Matured</Text>
            </View>
          </View>
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
  navBar: {
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
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  kpiCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  kpiLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  kpiValueGold: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.goldDark,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  sectorRow: {
    marginBottom: 14,
  },
  sectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectorName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectorPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectorAmount: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statusBox: {
    flex: 1,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.sm,
    padding: 12,
    alignItems: 'center',
  },
  statusCount: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default PerformanceAnalyticsScreen;
