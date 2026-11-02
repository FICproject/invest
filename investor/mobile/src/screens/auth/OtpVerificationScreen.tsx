import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import Icon from '../../components/common/Icon';
import { useAuthContext } from '../../context/authContext';
import { getErrorMessage } from '../../utils/errorHandler';

export const OtpVerificationScreen = ({ route, navigation }: any) => {
  const { verifyOtp } = useAuthContext();
  const { email, mobile, otpCode: devOtp } = route.params || {};

  const [otp, setOtp] = useState<string>(devOtp || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleVerify = async () => {
    if (!otp.trim() || otp.trim().length < 4) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await verifyOtp({
        email,
        mobile,
        otp: otp.trim(),
      });

      if (!res.success) {
        setError(res.message);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'OTP verification failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Icon name="lock" size={32} color={COLORS.primary} />
            </View>

            <Text style={styles.title}>Security Verification</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit one-time password dispatched to your registered contact{' '}
              <Text style={styles.highlight}>{email || mobile}</Text>.
            </Text>

            {devOtp ? (
              <View style={styles.devBanner}>
                <Icon name="alert-circle" size={16} color={COLORS.goldDark} />
                <Text style={styles.devText}>
                  Dev Testing OTP: <Text style={styles.devBold}>{devOtp}</Text>
                </Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorBox}>
                <Icon name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <CustomInput
              label="6-Digit OTP"
              placeholder="e.g. 123456"
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.otpInput}
            />

            <CustomButton
              title="Verify & Continue"
              onPress={handleVerify}
              variant="gold"
              size="lg"
              loading={loading}
              style={styles.submitBtn}
            />
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
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  highlight: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  devBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.goldSubtle,
    borderRadius: RADIUS.sm,
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  devText: {
    fontSize: 12,
    color: COLORS.goldDark,
  },
  devBold: {
    fontWeight: '800',
    letterSpacing: 1,
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
  otpInput: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 6,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 8,
  },
});

export default OtpVerificationScreen;
