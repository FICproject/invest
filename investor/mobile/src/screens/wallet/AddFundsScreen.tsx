import React, { useState } from 'react';
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
import { SHADOWS } from '../../theme/shadows';
import Icon from '../../components/common/Icon';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import { formatCurrency } from '../../utils/formatters';

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000];

export const AddFundsScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState<string>('25000');
  const [selectedMethod, setSelectedMethod] = useState<string>('UPI Direct');
  const [loading, setLoading] = useState<boolean>(false);

  const handleDeposit = () => {
    const num = Number(amount);
    if (isNaN(num) || num < 1000) {
      Alert.alert('Invalid Amount', 'Minimum wallet funding amount is ₹1,000.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Deposit Request Initiated',
        `An allocation request for ${formatCurrency(num)} has been routed through ${selectedMethod}. Escrow reference: ESC_${Date.now()}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
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
        <Text style={styles.navTitle}>Add Capital</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>Deposit Amount (INR)</Text>
          <CustomInput
            placeholder="Enter amount"
            value={amount}
            onChangeText={(val) => setAmount(val.replace(/\D/g, ''))}
            keyboardType="numeric"
            leftIcon={<Icon name="dollar-sign" size={18} color={COLORS.gold} />}
          />

          <View style={styles.presetGrid}>
            {PRESET_AMOUNTS.map((val) => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.presetChip,
                  Number(amount) === val && styles.presetChipActive,
                ]}
                onPress={() => setAmount(val.toString())}
              >
                <Text
                  style={[
                    styles.presetText,
                    Number(amount) === val && styles.presetTextActive,
                  ]}
                >
                  {formatCurrency(val, true)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transfer Methods */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Funding Channel</Text>
          {[
            { id: 'UPI Direct', label: 'UPI / Instant QR', sub: 'Instant transfer via Google Pay, PhonePe, Paytm' },
            { id: 'Net Banking', label: 'Internet Banking', sub: 'HDFC, ICICI, SBI, Axis & major banks' },
            { id: 'RTGS/NEFT', label: 'Escrow Virtual Account', sub: 'Large allocation via direct RTGS transfer' },
          ].map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodItem,
                selectedMethod === method.id && styles.methodItemActive,
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.radio}>
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>{method.label}</Text>
                <Text style={styles.methodSub}>{method.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <CustomButton
          title={`Proceed with ${amount ? formatCurrency(Number(amount)) : 'Deposit'}`}
          onPress={handleDeposit}
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  presetChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetChipActive: {
    backgroundColor: COLORS.primarySubtle,
    borderColor: COLORS.gold,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  presetTextActive: {
    color: COLORS.goldDark,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
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
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  methodSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  submitBtn: {
    marginTop: 8,
  },
});

export default AddFundsScreen;
