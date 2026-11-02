import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import Icon from '../common/Icon';
import CustomInput from '../common/CustomInput';
import CustomButton from '../common/CustomButton';
import Badge from '../common/Badge';
import { InvestmentOffer, ReturnCalculation } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { validateInvestmentAmount } from '../../utils/validators';
import offerService from '../../services/offerService';
import investmentService from '../../services/investmentService';
import { useAuthContext } from '../../context/authContext';
import { usePortfolioContext } from '../../context/portfolioContext';

interface InvestModalProps {
  visible: boolean;
  offer: InvestmentOffer | null;
  onClose: () => void;
  onSuccess: (details: any) => void;
  onNavigateToKyc?: () => void;
}

export const InvestModal: React.FC<InvestModalProps> = ({
  visible,
  offer,
  onClose,
  onSuccess,
  onNavigateToKyc,
}) => {
  const { kycStatus } = useAuthContext();
  const { refreshAll } = usePortfolioContext();

  const [amount, setAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('UPI / Net Banking');
  const [calculation, setCalculation] = useState<ReturnCalculation | null>(null);
  const [loadingCalc, setLoadingCalc] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (offer) {
      setAmount(offer.minInvestment.toString());
      setError('');
    }
  }, [offer]);

  // Recalculate projections when amount changes
  useEffect(() => {
    if (!offer) return;
    const num = Number(amount);
    if (!isNaN(num) && num >= offer.minInvestment) {
      setLoadingCalc(true);
      offerService
        .calculateReturns(offer._id, num)
        .then((res) => {
          if (res.success) setCalculation(res.data);
        })
        .catch(() => {})
        .finally(() => setLoadingCalc(false));
    } else {
      setCalculation(null);
    }
  }, [amount, offer]);

  if (!offer) return null;

  const quickAmounts = [
    offer.minInvestment,
    offer.minInvestment * 2,
    offer.minInvestment * 5,
    offer.minInvestment * 10,
  ];

  const handleInvest = async () => {
    setError('');

    // Check KYC
    if (kycStatus !== 'APPROVED') {
      Alert.alert(
        'KYC Verification Required',
        'In compliance with regulatory guidelines, your KYC must be approved before placing an investment.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete KYC',
            onPress: () => {
              onClose();
              if (onNavigateToKyc) onNavigateToKyc();
            },
          },
        ]
      );
      return;
    }

    const numAmount = Number(amount);
    const validation = validateInvestmentAmount(numAmount, offer.minInvestment, offer.maxInvestment);
    if (!validation.valid) {
      setError(validation.error || 'Invalid amount');
      return;
    }

    try {
      setSubmitting(true);
      // 1. Create order
      const orderRes = await investmentService.createPaymentOrder(offer._id, numAmount, selectedMethod);
      if (orderRes.success && orderRes.data) {
        // 2. Verify payment callback
        const verifyRes = await investmentService.verifyPayment(orderRes.data.orderId);
        if (verifyRes.success) {
          await refreshAll();
          onClose();
          onSuccess(verifyRes.data);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.modalTitle}>Execute Investment</Text>
              <Text style={styles.companySub}>{offer.companyName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Offer snapshot */}
            <View style={styles.snapshotCard}>
              <View style={styles.snapshotRow}>
                <Text style={styles.snapLabel}>Target Return</Text>
                <Text style={styles.snapGold}>{offer.returnRate}% p.m.</Text>
              </View>
              <View style={styles.snapshotRow}>
                <Text style={styles.snapLabel}>Investment Tenure</Text>
                <Text style={styles.snapValue}>{offer.tenureMonths} Months</Text>
              </View>
              <View style={styles.snapshotRow}>
                <Text style={styles.snapLabel}>Distribution</Text>
                <Text style={styles.snapValue}>{offer.payoutFrequency} Payouts</Text>
              </View>
            </View>

            {/* KYC Notice if pending */}
            {kycStatus !== 'APPROVED' && (
              <View style={styles.kycWarningBox}>
                <Icon name="alert-circle" size={16} color={COLORS.warning} />
                <Text style={styles.kycWarningText}>
                  Your KYC is currently {kycStatus.replace('_', ' ')}. Approval is needed to execute investments.
                </Text>
              </View>
            )}

            {/* Amount input */}
            <CustomInput
              label="Investment Amount (INR)"
              value={amount}
              onChangeText={(val) => {
                setAmount(val.replace(/\D/g, ''));
                setError('');
              }}
              keyboardType="numeric"
              placeholder={`Min. ${formatCurrency(offer.minInvestment)}`}
              error={error}
              leftIcon={<Icon name="dollar-sign" size={18} color={COLORS.gold} />}
            />

            {/* Quick Chips */}
            <View style={styles.quickChipsRow}>
              {quickAmounts.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[
                    styles.chip,
                    Number(amount) === q && styles.chipActive,
                  ]}
                  onPress={() => setAmount(q.toString())}
                >
                  <Text
                    style={[
                      styles.chipText,
                      Number(amount) === q && styles.chipTextActive,
                    ]}
                  >
                    {formatCurrency(q, true)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Projected Returns Box */}
            {calculation && (
              <View style={styles.projectionBox}>
                <Text style={styles.projTitle}>Estimated Financial Summary</Text>
                <View style={styles.projRow}>
                  <Text style={styles.projLabel}>Monthly Payout</Text>
                  <Text style={styles.projValueHighlight}>
                    {formatCurrency(calculation.monthlyPayout)}
                  </Text>
                </View>
                <View style={styles.projRow}>
                  <Text style={styles.projLabel}>Total Interest Earned</Text>
                  <Text style={styles.projValue}>
                    {formatCurrency(calculation.totalExpectedInterest)}
                  </Text>
                </View>
                <View style={[styles.projRow, styles.projRowTotal]}>
                  <Text style={styles.projTotalLabel}>Total Maturity Value</Text>
                  <Text style={styles.projTotalValue}>
                    {formatCurrency(calculation.totalMaturityAmount)}
                  </Text>
                </View>
              </View>
            )}

            {/* Payment Method Selector */}
            <Text style={styles.sectionHeading}>Payment Gateway / Method</Text>
            {['UPI / Net Banking', 'IMPS / NEFT Escrow Transfer', 'Connect Investor Wallet'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.methodItem,
                  selectedMethod === method && styles.methodItemActive,
                ]}
                onPress={() => setSelectedMethod(method)}
              >
                <View style={styles.methodRadio}>
                  {selectedMethod === method && <View style={styles.methodRadioInner} />}
                </View>
                <Text style={styles.methodLabel}>{method}</Text>
              </TouchableOpacity>
            ))}

            <CustomButton
              title={`Confirm & Invest ${amount ? formatCurrency(Number(amount)) : ''}`}
              onPress={handleInvest}
              variant="gold"
              size="lg"
              loading={submitting}
              style={styles.submitBtn}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '90%',
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  companySub: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  snapshotCard: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  snapLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  snapValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  snapGold: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  kycWarningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.warningBg,
    borderRadius: RADIUS.sm,
    padding: 10,
    marginBottom: 14,
    alignItems: 'center',
    gap: 8,
  },
  kycWarningText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '500',
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.primarySubtle,
    borderColor: COLORS.gold,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.goldDark,
  },
  projectionBox: {
    backgroundColor: COLORS.primarySubtle,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 10, 17, 0.1)',
  },
  projTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  projRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  projRowTotal: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(59, 10, 17, 0.15)',
  },
  projLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  projValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  projValueHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.goldDark,
  },
  projTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  projTotalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    backgroundColor: COLORS.surface,
  },
  methodItemActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.surfaceSubtle,
  },
  methodRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  methodRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  methodLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: 16,
    marginBottom: 20,
  },
});

export default InvestModal;
