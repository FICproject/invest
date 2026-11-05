import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import Badge from '../common/Badge';
import Icon from '../common/Icon';
import { Investment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface PortfolioCardProps {
  investment: Investment;
  onPress: () => void;
  onProspectus?: () => void;
  onPay?: () => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ investment, onPress, onProspectus, onPay }) => {
  const offer = investment.offerId;
  const projectTitle = offer?.title || 'Investment Project';
  const projectSubtitle = offer
    ? `${offer.type ? offer.type + ' Investment' : 'Project Investment'}${offer.category ? ' • ' + offer.category : ''}${offer.location ? ' • ' + offer.location : ''}`
    : 'Project Asset';

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Confirmed':
      case 'Active':
        return 'success';
      case 'Approved':
        return 'success';
      case 'Pending Review':
      case 'Pending':
        return 'warning';
      case 'Changes Requested':
        return 'warning';
      case 'Completed':
      case 'Matured':
        return 'info';
      case 'Rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  const returnRateDisplay = investment.returnRate || offer?.returnRate || 3;
  const tenureMonthsDisplay = investment.tenureMonths || offer?.tenureMonths || 12;
  const expectedReturnsDisplay = investment.expectedReturns || (
    investment.amountInvested
      ? Math.round(investment.amountInvested + (investment.amountInvested * (returnRateDisplay / 100) * (tenureMonthsDisplay / 12)))
      : 0
  );

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.card}
    >
      {/* Top Row: Status badge & Certificate number */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <Badge
            label={investment.status}
            variant={getStatusVariant(investment.status)}
            size="sm"
          />
          <Text style={styles.certText}>
            Cert: <Text style={styles.certNumber}>{investment.certificateNumber || investment.certificateNo || ('GEN-' + investment._id.slice(-6).toUpperCase())}</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.prospectusBtn}
          onPress={onProspectus || onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.prospectusText}>Offer Prospectus</Text>
        </TouchableOpacity>
      </View>

      {/* Project Title & Sector Subtitle */}
      <Text style={styles.companyName} numberOfLines={1}>
        {projectTitle}
      </Text>
      <Text style={styles.offerSubtitle} numberOfLines={1}>
        {projectSubtitle}
      </Text>

      {/* Metrics Row: Invested Amount, Return Rate, Expected Returns, Maturity Date */}
      <View style={styles.metricsRow}>
        <View style={styles.metricColumn}>
          <Text style={styles.metricLabel}>Invested Amount</Text>
          <Text style={styles.metricValue}>
            {formatCurrency(investment.amountInvested || investment.amount)}
          </Text>
        </View>

        <View style={styles.metricColumn}>
          <Text style={styles.metricLabel}>Return Rate</Text>
          <Text style={styles.metricValueGold}>
            {returnRateDisplay}% p.a.
          </Text>
        </View>

        <View style={styles.metricColumn}>
          <Text style={styles.metricLabel}>Expected Returns</Text>
          <Text style={styles.metricValueSuccess}>
            {formatCurrency(expectedReturnsDisplay)}
          </Text>
        </View>

        <View style={styles.metricColumn}>
          <Text style={styles.metricLabel}>Maturity Date</Text>
          <Text style={styles.metricValueDate}>
            {formatDate(investment.maturityDate)}
          </Text>
        </View>
      </View>

      {/* Pay Now Button if Approved */}
      {investment.status === 'Approved' && (
        <View style={styles.payActionContainer}>
          <View style={styles.payNoticeRow}>
            <Icon name="check-circle" size={14} color="#16A34A" />
            <Text style={styles.payNoticeText}>Approved by Admin. Ready for payment.</Text>
          </View>
          <TouchableOpacity
            style={styles.payNowBtn}
            onPress={onPay}
            activeOpacity={0.8}
          >
            <Icon name="credit-card" size={15} color="#FFFFFF" />
            <Text style={styles.payNowBtnText}>
              Pay {formatCurrency(investment.amountInvested || investment.amount)} via Razorpay
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEAE2',
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  certText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  certNumber: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  prospectusBtn: {
    borderWidth: 1,
    borderColor: '#E2D9CC',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceSubtle,
  },
  prospectusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  offerSubtitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.goldDark,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  metricColumn: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 3,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  metricValueGold: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.goldDark,
  },
  metricValueSuccess: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.success,
  },
  metricValueDate: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  payActionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFEAE2',
  },
  payNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  payNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  payNowBtn: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    ...SHADOWS.sm,
  },
  payNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default PortfolioCard;
