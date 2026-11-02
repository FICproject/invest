import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import { ROUTES } from '../../constants/routes';
import Icon from '../../components/common/Icon';
import Badge from '../../components/common/Badge';
import CustomButton from '../../components/common/CustomButton';
import Loader from '../../components/common/Loader';
import InvestModal from '../../components/modals/InvestModal';
import offerService from '../../services/offerService';
import { InvestmentOffer } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export const OfferDetailsScreen = ({ route, navigation }: any) => {
  const { offerId } = route.params || {};

  const [offer, setOffer] = useState<InvestmentOffer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [investModalVisible, setInvestModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        setLoading(true);
        const res = await offerService.getOfferById(offerId);
        if (res.success && res.data) {
          setOffer(res.data);
        }
      } catch (err) {
        console.error('Failed to load offer details', err);
      } finally {
        setLoading(false);
      }
    };

    if (offerId) {
      fetchOffer();
    }
  }, [offerId]);

  if (loading || !offer) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loader fullScreen message="Loading opportunity details..." />
      </SafeAreaView>
    );
  }

  const percentRaised = offer.targetAmount > 0
    ? Math.min(100, Math.round((offer.raisedAmount / offer.targetAmount) * 100))
    : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Deals</Text>
        </TouchableOpacity>
        <Badge label={offer.status} variant={offer.status === 'Active' ? 'success' : 'default'} size="sm" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {offer.imageUrl ? (
          <View style={styles.imageBox}>
            <Image source={{ uri: offer.imageUrl }} style={styles.image} resizeMode="cover" />
          </View>
        ) : null}

        {/* Title & Category Header */}
        <View style={styles.mainInfo}>
          <View style={styles.categoryRow}>
            <Badge label={offer.category} variant="gold" size="sm" />
            <Badge label={offer.riskLevel + ' Risk'} variant={offer.riskLevel === 'Low' ? 'success' : 'warning'} size="sm" />
          </View>

          <Text style={styles.companyName}>{offer.companyName}</Text>
          <Text style={styles.title}>{offer.title}</Text>

          {offer.location && (
            <View style={styles.locationRow}>
              <Icon name="building" size={14} color={COLORS.textSecondary} />
              <Text style={styles.locationText}>{offer.location}</Text>
            </View>
          )}
        </View>

        {/* Key Metrics Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricCardLabel}>Target Return</Text>
            <Text style={styles.metricCardValueHighlight}>{offer.returnRate}% p.m.</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricCardLabel}>Tenure</Text>
            <Text style={styles.metricCardValue}>{offer.tenureMonths} Months</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricCardLabel}>Min. Investment</Text>
            <Text style={styles.metricCardValue}>{formatCurrency(offer.minInvestment, true)}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricCardLabel}>Payout Schedule</Text>
            <Text style={styles.metricCardValue}>{offer.payoutFrequency}</Text>
          </View>
        </View>

        {/* Funding Progress Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>Funding Allocation</Text>
          <View style={styles.progressLabels}>
            <Text style={styles.progressRaised}>
              Raised: <Text style={styles.boldText}>{formatCurrency(offer.raisedAmount)}</Text> ({percentRaised}%)
            </Text>
            <Text style={styles.progressTarget}>
              Target: {formatCurrency(offer.targetAmount)}
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${percentRaised}%` }]} />
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>About This Opportunity</Text>
          <Text style={styles.descriptionText}>{offer.description}</Text>
        </View>

        {/* Financial Highlights */}
        {offer.financialHighlights && offer.financialHighlights.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeaderTitle}>Due Diligence & Highlights</Text>
            {offer.financialHighlights.map((highlight, index) => (
              <View key={index} style={styles.highlightRow}>
                <Icon name="check-circle" size={16} color={COLORS.gold} />
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Security & Collateral */}
        {offer.securityType && (
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeaderTitle}>Investor Security & Backing</Text>
            <View style={styles.securityBox}>
              <Icon name="shield" size={20} color={COLORS.primary} />
              <Text style={styles.securityText}>{offer.securityType}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomMinLabel}>Minimum Capital</Text>
          <Text style={styles.bottomMinAmount}>{formatCurrency(offer.minInvestment)}</Text>
        </View>

        <CustomButton
          title="Invest Now"
          onPress={() => setInvestModalVisible(true)}
          variant="gold"
          size="lg"
          style={styles.investBtn}
        />
      </View>

      {/* Invest Modal */}
      <InvestModal
        visible={investModalVisible}
        offer={offer}
        onClose={() => setInvestModalVisible(false)}
        onSuccess={(details) => {
          navigation.navigate(ROUTES.INVEST_CONFIRM, { details, offer });
        }}
        onNavigateToKyc={() => navigation.navigate(ROUTES.KYC_STATUS)}
      />
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
    paddingBottom: 100,
  },
  imageBox: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.surfaceSubtle,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  mainInfo: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 26,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricCardLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  metricCardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  metricCardValueHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressRaised: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  progressTarget: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySubtle,
    borderRadius: RADIUS.sm,
    padding: 12,
    gap: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.lg,
  },
  bottomMinLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  bottomMinAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  investBtn: {
    paddingHorizontal: 28,
  },
});

export default OfferDetailsScreen;
