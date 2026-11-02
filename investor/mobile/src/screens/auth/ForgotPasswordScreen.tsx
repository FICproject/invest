import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import Icon from '../../components/common/Icon';
import authService from '../../services/authService';
import { isValidEmail } from '../../utils/validators';
import { getErrorMessage } from '../../utils/errorHandler';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [devOtp, setDevOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleRequestOtp = async () => {
    if (!isValidEmail(email)) {
      setError('Please provide a valid registered email.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await authService.forgotPassword(email.trim().toLowerCase());
      if (res.data?.otpCode) {
        setDevOtp(res.data.otpCode);
        setOtp(res.data.otpCode);
      }
      setStep('reset');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not trigger reset OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim()) {
      setError('Please enter the reset OTP code.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await authService.resetPassword(email.trim().toLowerCase(), otp.trim(), newPassword);
      Alert.alert('Success', res.message || 'Password reset successfully.', [
        { text: 'Log In', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(getErrorMessage(err, 'Password reset failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'android' ? undefined : 'padding'}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={24} color={COLORS.gold} />
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.title}>Reset Investor Password</Text>
            <Text style={styles.subtitle}>
              {step === 'request'
                ? 'Enter your registered email address to receive password reset instructions.'
                : 'Enter the verification OTP and choose your new password.'}
            </Text>

            {devOtp ? (
              <View style={styles.devBanner}>
                <Icon name="alert-circle" size={16} color={COLORS.goldDark} />
                <Text style={styles.devText}>
                  Testing OTP: <Text style={styles.devBold}>{devOtp}</Text>
                </Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorBox}>
                <Icon name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {step === 'request' ? (
              <>
                <CustomInput
                  label="Registered Email"
                  placeholder="investor@domain.com"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    setError('');
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  leftIcon={<Icon name="file-text" size={18} color={COLORS.gold} />}
                />
                <CustomButton
                  title="Send Reset Code"
                  onPress={handleRequestOtp}
                  variant="gold"
                  size="lg"
                  loading={loading}
                />
              </>
            ) : (
              <>
                <CustomInput
                  label="6-Digit OTP"
                  placeholder="Enter OTP"
                  value={otp}
                  onChangeText={(val) => {
                    setOtp(val);
                    setError('');
                  }}
                  keyboardType="number-pad"
                  leftIcon={<Icon name="lock" size={18} color={COLORS.gold} />}
                />
                <CustomInput
                  label="New Password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChangeText={(val) => {
                    setNewPassword(val);
                    setError('');
                  }}
                  isPassword
                  leftIcon={<Icon name="shield" size={18} color={COLORS.gold} />}
                />
                <CustomButton
                  title="Update Password"
                  onPress={handleResetPassword}
                  variant="gold"
                  size="lg"
                  loading={loading}
                />
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    padding: SPACING.lg,
    flex: 1,
    justifyContent: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 18,
    lineHeight: 18,
  },
  devBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.goldSubtle,
    borderRadius: RADIUS.sm,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  devText: {
    fontSize: 12,
    color: COLORS.goldDark,
  },
  devBold: {
    fontWeight: '800',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.sm,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;
