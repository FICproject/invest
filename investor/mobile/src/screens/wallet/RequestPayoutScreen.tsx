import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { ROUTES } from '../../constants/routes';
import Icon from '../../components/common/Icon';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import transactionService from '../../services/transactionService';
import { usePortfolioContext } from '../../context/portfolioContext';
import { formatCurrency, maskAccountNumber } from '../../utils/formatters';

export const RequestPayoutScreen = ({ navigation }: any) => {
  const { completedPayouts } = usePortfolioContext();
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const availableBalance = completedPayouts.reduce((acc, p) => acc + p.amount, 0);

  useEffect(() => {
    transactionService.getProfile().then((res) => {
      if (res.success && res.data?.profile?.bankDetails) {
        setBankDetails(res.data.profile.bankDetails);
      }
    });
  }, []);

  const handleWithdraw = () => {
    if (!bankDetails || !bankDetails.accountNumber) {
      Alert.alert(
        'Bank Details Required',
        'Please add and verify your bank account details before requesting a payout disbursement.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Bank Account', onPress: () => navigation.navigate(ROUTES.BANK_ACCOUNTS) },
        ]
      );
      return;
    }

    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payout amount.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Payout Request Submitted',
        `Disbursement of ${formatCurrency(num)} scheduled to your verified account (${maskAccountNumber(bankDetails.accountNumber)}). Expected transfer within 24-48 business hours.`,
        [{ text: 'Done', onPress: () => navigation.goBack() }]
      );
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Returns</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Request Payout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Available Balance Box */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Realized Yield</Text>
          <Text style={styles.balanceValue}>{formatCurrency(availableBalance)}</Text>
        </View>

        {/* Amount Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payout Amount</Text>
          <CustomInput
            placeholder="Enter disbursement amount"
            value={amount}
            onChangeText={(val) => setAmount(val.replace(/\D/g, ''))}
            keyboardType="numeric"
            leftIcon={<Icon name="dollar-sign" size={18} color={COLORS.gold} />}
          />

          <TouchableOpacity
            style={styles.maxBtn}
            onPress={() => setAmount(availableBalance.toString())}
          >
            <Text style={styles.maxBtnText}>Withdraw All ({formatCurrency(availableBalance)})</Text>
          </TouchableOpacity>
        </View>

        {/* Destination Bank Account */}
        <View style={styles.card}>
          <View style={styles.bankHeader}>
            <Text style={styles.cardTitle}>Destination Bank Account</Text>
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.BANK_ACCOUNTS)}>
              <Text style={styles.editBankText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {bankDetails?.accountNumber ? (
            <View style={styles.bankBox}>
              <Icon name="building" size={24} color={COLORS.primary} />
              <View style={styles.bankInfo}>
                <Text style={styles.bankName}>{bankDetails.bankName || 'Verified Bank'}</Text>
                <Text style={styles.bankAccount}>
                  A/C: {maskAccountNumber(bankDetails.accountNumber)} • IFSC: {bankDetails.ifscCode}
                </Text>
                <Text style={styles.bankHolder}>
                  Holder: {bankDetails.accountHolderName}
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addBankPrompt}
              onPress={() => navigation.navigate(ROUTES.BANK_ACCOUNTS)}
            >
              <Icon name="credit-card" size={20} color={COLORS.gold} />
              <Text style={styles.addBankText}>+ Add Verified Bank Account for Payouts</Text>
            </TouchableOpacity>
          )}
        </View>

        <CustomButton
          title="Submit Payout Request"
          onPress={handleWithdraw}
          variant="gold"
          size="lg"
          loading={loading}
          style={styles.submitBtn}
        />
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
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 12,
    color: COLORS.goldLight,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
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
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  maxBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  maxBtnText: {
    fontSize: 12,
    color: COLORS.goldDark,
    fontWeight: '700',
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editBankText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  bankBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.sm,
    padding: 12,
    gap: 12,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  bankAccount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  bankHolder: {
    fontSize: 11,
    color: COLORS.goldDark,
    fontWeight: '600',
  },
  addBankPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.gold,
    gap: 8,
  },
  addBankText: {
    fontSize: 13,
    color: COLORS.goldDark,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 8,
  },
});

export default RequestPayoutScreen;
