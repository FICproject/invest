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
import Icon from '../../components/common/Icon';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import Loader from '../../components/common/Loader';
import transactionService from '../../services/transactionService';
import { useAuthContext } from '../../context/authContext';
import { isValidIfsc } from '../../utils/validators';
import { maskAccountNumber } from '../../utils/formatters';

export const BankAccountsScreen = ({ navigation }: any) => {
  const { user } = useAuthContext();

  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>(user?.name || '');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    transactionService
      .getProfile()
      .then((res) => {
        if (res.success && res.data?.profile?.bankDetails) {
          const b = res.data.profile.bankDetails;
          setBankName(b.bankName || '');
          setAccountNumber(b.accountNumber || '');
          setIfscCode(b.ifscCode || '');
          setAccountHolderName(b.accountHolderName || user?.name || '');
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSaveBank = async () => {
    if (!bankName.trim() || !accountNumber.trim() || !ifscCode.trim() || !accountHolderName.trim()) {
      setError('Please provide complete bank information.');
      return;
    }
    if (!isValidIfsc(ifscCode)) {
      setError('Invalid IFSC format. Expected 4 letters, 0, 6 characters (e.g. HDFC0001234).');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await transactionService.updateBankDetails({
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        accountHolderName: accountHolderName.trim(),
      });
      Alert.alert('Bank Account Saved', 'Your verified payout account has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      setError(e.message || 'Failed to update bank details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loader fullScreen message="Loading bank information..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Profile</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Payout Bank Accounts</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Verified Account Card */}
        {accountNumber ? (
          <View style={styles.currentCard}>
            <View style={styles.currentCardHeader}>
              <Icon name="building" size={22} color={COLORS.gold} />
              <Text style={styles.verifiedTag}>ACTIVE PAYOUT RECIPIENT</Text>
            </View>
            <Text style={styles.currentBank}>{bankName}</Text>
            <Text style={styles.currentNumber}>{maskAccountNumber(accountNumber)}</Text>
            <Text style={styles.currentHolder}>Holder: {accountHolderName}</Text>
          </View>
        ) : null}

        {/* Edit Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configure Bank Account</Text>
          <Text style={styles.cardSub}>
            Distributions and returns from your active investments will automatically credit to this account.
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Icon name="alert-circle" size={16} color={COLORS.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <CustomInput
            label="Account Holder Name"
            placeholder="As per bank passbook / statement"
            value={accountHolderName}
            onChangeText={setAccountHolderName}
            leftIcon={<Icon name="user" size={18} color={COLORS.gold} />}
          />

          <CustomInput
            label="Bank Name"
            placeholder="e.g. HDFC Bank, ICICI Bank, State Bank of India"
            value={bankName}
            onChangeText={setBankName}
            leftIcon={<Icon name="building" size={18} color={COLORS.gold} />}
          />

          <CustomInput
            label="Account Number"
            placeholder="Enter account number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="number-pad"
            leftIcon={<Icon name="credit-card" size={18} color={COLORS.gold} />}
          />

          <CustomInput
            label="IFSC Code"
            placeholder="e.g. HDFC0001234"
            value={ifscCode}
            onChangeText={(v) => setIfscCode(v.toUpperCase())}
            autoCapitalize="characters"
            leftIcon={<Icon name="lock" size={18} color={COLORS.gold} />}
          />

          <CustomButton
            title="Save Bank Details"
            onPress={handleSaveBank}
            variant="gold"
            size="lg"
            loading={saving}
            style={styles.submitBtn}
          />
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
  currentCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 16,
  },
  currentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  verifiedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.goldLight,
    letterSpacing: 1,
  },
  currentBank: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 2,
  },
  currentNumber: {
    fontSize: 14,
    color: COLORS.goldLight,
    marginBottom: 4,
    letterSpacing: 1,
  },
  currentHolder: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
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
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 14,
    lineHeight: 17,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.sm,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: 8,
  },
});

export default BankAccountsScreen;
