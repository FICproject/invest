import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import Badge from '../common/Badge';
import Icon from '../common/Icon';
import { InvestmentOffer } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface OfferCardProps {
  offer: InvestmentOffer;
  onPress: () => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, onPress }) => {
  const isCompany = offer.type === 'Company';
  const minPeriod = isCompany ? '5 Years' : '2 Years';

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={styles.card}
    >
      {/* Header Image with Project / Company Badge */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              offer.imageUrl ||
              'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80',
          }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.badgeOverlay}>
          <View
            style={[
              styles.typeBadge,
              isCompany ? styles.companyBadge : styles.projectBadge,
            ]}
          >
            <Icon
              name={isCompany ? 'building' : 'layers'}
              size={12}
              color={isCompany ? '#92400E' : '#9B1C1C'}
            />
            <Text
              style={[
                styles.typeBadgeText,
                isCompany ? styles.companyBadgeText : styles.projectBadgeText,
              ]}
            >
              {offer.type || 'Company'}
            </Text>
          </View>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {offer.companyName || offer.title}
        </Text>

        {/* Category · Location */}
        <Text style={styles.categoryLocation} numberOfLines={1}>
          {offer.category}
          {offer.location ? ` · ${offer.location}` : ''}
        </Text>

        {/* Description Snippet */}
        <Text style={styles.description} numberOfLines={2}>
          {offer.description || 'Institutional-grade asset allocation opportunity with high security.'}
        </Text>

        {/* 2x2 Financial Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* Row 1: Min Investment & Max Investment */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Min. Investment</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(offer.minInvestment || 1000)}
              </Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Max. Investment</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(offer.maxInvestment || 10000000)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 2: Return Rate & Min. Period */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Return Rate</Text>
              <Text style={styles.metricValueGold}>
                {offer.returnRate || 3}% / Month
              </Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricLabel}>Min. Period</Text>
              <Text style={styles.metricValue}>
                {minPeriod}
              </Text>
            </View>
          </View>
        </View>

        {/* View Details Action Button */}
        <TouchableOpacity
          style={styles.viewDetailsBtn}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  imageContainer: {
    height: 150,
    width: '100%',
    position: 'relative',
    backgroundColor: '#EAE5DE',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  companyBadge: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  projectBadge: {
    backgroundColor: '#FDE8E8',
    borderColor: '#FBD5D5',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  companyBadgeText: {
    color: '#92400E',
  },
  projectBadgeText: {
    color: '#9B1C1C',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2421',
    marginBottom: 4,
  },
  categoryLocation: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#C8963E',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 14,
  },
  metricsGrid: {
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  metricCell: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 3,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1F2421',
  },
  metricValueGold: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#C8963E',
  },
  divider: {
    height: 1,
    backgroundColor: '#ECE5DE',
    marginVertical: 10,
  },
  viewDetailsBtn: {
    width: '100%',
    backgroundColor: '#4A0E17',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  viewDetailsText: {
    color: COLORS.white,
    fontSize: 13.5,
    fontWeight: '700',
  },
});

export default OfferCard;
