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
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ investment, onPress, onProspectus }) => {
  const offer = investment.offerId;
  const companyTitle = offer ? offer.companyName || offer.title : 'Nexus Diagnostics Ltd.';
  const offerSubtitle = offer ? offer.title || 'Private Asset Round' : 'Nexus Advanced Healthcare Diagnostics';

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Confirmed':
      case 'Active':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Completed':
      case 'Matured':
        return 'info';
      default:
        return 'default';
    }
  };

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
            Cert: <Text style={styles.certNumber}>{investment.certificateNumber || 'CI-CERT-235078'}</Text>
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

      {/* Company Name & Sector Subtitle */}
      <Text style={styles.companyName} numberOfLines={1}>
        {companyTitle}
      </Text>
      <Text style={styles.offerSubtitle} numberOfLines={1}>
        {offerSubtitle}
      </Text>

      {/* Metrics Row: Invested Amount, Return Rate, Expected Returns, Maturity Date */}
      <View style={styles.metricsRow}>
        <View style={styles.metricColumn}>
          <Text style={styles.metricLabel}>Invested Amount</Text>
          <Text style={styles.metricValue}>
            {formatCurrency(investment.amountInvested)}
          </Text>
        </View>

        <View style={styles.metricColumn}>
          <Text style={styles.metricLabel}>Return Rate</Text>
          <Text style={styles.metricValueGold}>
            {investment.returnRate}% p.m.
          </Text>
        </View>

        <View style={styles.metricColumn}>
          <Text style={styles.metricLabel}>Expected Returns</Text>
          <Text style={styles.metricValueSuccess}>
            {formatCurrency(investment.expectedReturns)}
          </Text>
        </View>

        <View style={styles.metricColumn}>
          <Text style={styles.metricLabel}>Maturity Date</Text>
          <Text style={styles.metricValueDate}>
            {formatDate(investment.maturityDate)}
          </Text>
        </View>
      </View>
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
});

export default PortfolioCard;
