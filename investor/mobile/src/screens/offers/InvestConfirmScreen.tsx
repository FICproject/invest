import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import { ROUTES } from '../../constants/routes';
import Icon from '../../components/common/Icon';
import CustomButton from '../../components/common/CustomButton';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const InvestConfirmScreen = ({ route, navigation }: any) => {
  const { details, offer } = route.params || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.checkCircle}>
            <Icon name="check-circle" size={48} color={COLORS.success} />
          </View>

          <Text style={styles.congratsTitle}>Investment Confirmed!</Text>
          <Text style={styles.congratsSubtitle}>
            Your allocation in {offer?.companyName || 'the opportunity'} has been successfully registered on the investor ledger.
          </Text>

          <View style={styles.detailsBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Certificate Number</Text>
              <Text style={styles.valueHighlight}>
                {details?.certificateNumber || 'CI-CERT-PENDING'}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Amount Invested</Text>
              <Text style={styles.value}>
                {formatCurrency(details?.amountInvested)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Expected Maturity Value</Text>
              <Text style={styles.valueGold}>
                {formatCurrency(details?.expectedReturns)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Maturity Date</Text>
              <Text style={styles.value}>
                {formatDate(details?.maturityDate)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Transaction Reference</Text>
              <Text style={styles.valueSmall}>
                {details?.transactionRef || 'TXN-CONFIRMED'}
              </Text>
            </View>
          </View>

          <CustomButton
            title="Go to My Portfolio"
            onPress={() => navigation.navigate(ROUTES.TAB_PORTFOLIO)}
            variant="gold"
            size="lg"
            style={styles.actionBtn}
          />

          <CustomButton
            title="Browse More Deals"
            onPress={() => navigation.navigate(ROUTES.TAB_OFFERS)}
            variant="secondary"
            size="md"
            style={styles.secondaryBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  congratsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  congratsSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  detailsBox: {
    width: '100%',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  valueHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  valueGold: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.goldDark,
  },
  valueSmall: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  actionBtn: {
    width: '100%',
    marginBottom: 10,
  },
  secondaryBtn: {
    width: '100%',
  },
});

export default InvestConfirmScreen;
