import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { ROUTES } from '../../constants/routes';
import Icon from '../../components/common/Icon';
import CustomButton from '../../components/common/CustomButton';
import BiometricPrompt from '../../components/modals/BiometricPrompt';
import useBiometrics from '../../hooks/useBiometrics';

export const SecuritySettingsScreen = ({ navigation }: any) => {
  const { isEnabled, toggleBiometrics, isPromptVisible, handleBiometricResult } = useBiometrics();
  const [testingBiometrics, setTestingBiometrics] = useState<boolean>(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Profile</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Security & Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Biometrics Toggle Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Biometric Authentication</Text>
          <Text style={styles.cardSub}>
            Protect your investment deals and payout authorization with fingerprint or biometric credentials.
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="fingerprint" size={22} color={COLORS.gold} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Fingerprint / Biometrics</Text>
                <Text style={styles.settingDesc}>
                  {isEnabled ? 'Enabled for sign in and transaction confirmation' : 'Currently disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={toggleBiometrics}
              trackColor={{ false: COLORS.border, true: COLORS.gold }}
              thumbColor={isEnabled ? COLORS.primary : COLORS.white}
            />
          </View>

          {isEnabled && (
            <CustomButton
              title="Test Biometric Prompt"
              variant="outline"
              size="sm"
              onPress={() => setTestingBiometrics(true)}
              style={styles.testBtn}
            />
          )}
        </View>

        {/* Change Password */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Credentials Management</Text>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
          >
            <View style={styles.linkLeft}>
              <Icon name="lock" size={20} color={COLORS.primary} />
              <Text style={styles.linkText}>Reset / Change Password via OTP</Text>
            </View>
            <Icon name="chevron-right" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Biometric Simulation Modal */}
      <BiometricPrompt
        visible={testingBiometrics}
        onSuccess={() => {
          setTestingBiometrics(false);
          Alert.alert('Authenticated', 'Biometric identity match confirmed successfully.');
        }}
        onCancel={() => setTestingBiometrics(false)}
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  settingText: {
    marginLeft: 10,
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  testBtn: {
    marginTop: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btnHalf: {
    flex: 1,
  },
});

export default SecuritySettingsScreen;
