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
import { SHADOWS } from '../../theme/shadows';
import Icon from '../../components/common/Icon';
import Badge from '../../components/common/Badge';
import CustomButton from '../../components/common/CustomButton';
import { Investment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const InvestmentDetailScreen = ({ route, navigation }: any) => {
  const { investment } = route.params || {};

  if (!investment) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Investment record not found.</Text>
          <CustomButton title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const offer = investment.offerId;
  const companyTitle = offer ? offer.companyName || offer.title : 'Private Asset';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Portfolio</Text>
        </TouchableOpacity>
        <Badge
          label={investment.status}
          variant={investment.status === 'Confirmed' ? 'success' : 'default'}
          size="sm"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Certificate Card Header */}
        <View style={styles.certCard}>
          <View style={styles.certTop}>
            <Icon name="shield" size={32} color={COLORS.gold} />
            <Text style={styles.certLabel}>OFFICIAL INVESTMENT CERTIFICATE</Text>
          </View>
          <Text style={styles.certNumber}>
            {investment.certificateNumber || 'CI-CERT-PENDING'}
          </Text>
          <Text style={styles.certCompany}>{companyTitle}</Text>
        </View>

        {/* Financial Metrics Box */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Holding Breakdown</Text>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Principal Invested</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(investment.amountInvested)}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Target Return</Text>
            <Text style={styles.metricValueGold}>
              {investment.returnRate}% p.m.
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Tenure Period</Text>
            <Text style={styles.metricValue}>
              {investment.tenureMonths} Months
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Expected Total Value</Text>
            <Text style={styles.metricValuePrimary}>
              {formatCurrency(investment.expectedReturns)}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Returns Received to Date</Text>
            <Text style={styles.metricValueSuccess}>
              {formatCurrency(investment.returnsReceived || 0)}
            </Text>
          </View>
        </View>

        {/* Schedule & Dates */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Timeline & Schedule</Text>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Investment Effective Date</Text>
            <Text style={styles.metricValue}>
              {formatDate(investment.startDate)}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Maturity Date</Text>
            <Text style={styles.metricValue}>
              {formatDate(investment.maturityDate)}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Distribution Cycle</Text>
            <Text style={styles.metricValue}>
              {investment.payoutFrequency || 'Monthly'} Distributions
            </Text>
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
  scrollContent: {
    padding: SPACING.md,
  },
  certCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.gold,
  },
  certTop: {
    alignItems: 'center',
    marginBottom: 8,
  },
  certLabel: {
    fontSize: 11,
    color: COLORS.goldLight,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 6,
  },
  certNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  certCompany: {
    fontSize: 14,
    color: COLORS.goldLight,
    fontWeight: '600',
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
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSubtle,
  },
  metricLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  metricValueGold: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.goldDark,
  },
  metricValuePrimary: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  metricValueSuccess: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.success,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    marginBottom: 16,
  },
});

export default InvestmentDetailScreen;
