import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import { ROUTES } from '../../constants/routes';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import Icon from '../../components/common/Icon';
import { useAuthContext } from '../../context/authContext';
import { getErrorMessage } from '../../utils/errorHandler';

export const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuthContext();

  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async () => {
    if (!identifier.trim()) {
      setError('Please enter your registered email or mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await login(identifier.trim(), password);
      if (!res.success) {
        setError(res.message);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Sign in failed. Please verify credentials.'));
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Icon name="shield" size={36} color={COLORS.gold} />
            </View>
            <Text style={styles.brandName}>CONNECT INVEST</Text>
            <Text style={styles.brandSubtitle}>Private Asset & Opportunity Portal</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>
              Sign in with your investor credentials to access deals and portfolio returns.
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Icon name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Email or Mobile Number"
              placeholder="e.g. investor@example.com or 9876543210"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                setError('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={<Icon name="user" size={18} color={COLORS.gold} />}
            />

            <CustomInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              isPassword
              leftIcon={<Icon name="lock" size={18} color={COLORS.gold} />}
            />

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Quick Demo Credentials Autofill */}
            <View style={styles.demoCard}>
              <Text style={styles.demoTitle}>QUICK DEMO AUTOFILL:</Text>
              <View style={styles.demoBtnRow}>
                <TouchableOpacity
                  style={styles.demoBtn}
                  onPress={() => {
                    setIdentifier('rahul.sharma@investor.com');
                    setPassword('Password@123');
                    setError('');
                  }}
                  activeOpacity={0.8}
                >
                  <Icon name="user" size={14} color={COLORS.goldDark} />
                  <Text style={styles.demoBtnText}>Investor Demo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.demoBtn}
                  onPress={() => {
                    setIdentifier('contact@nexustech.in');
                    setPassword('Password123!');
                    setError('');
                  }}
                  activeOpacity={0.8}
                >
                  <Icon name="building" size={14} color={COLORS.goldDark} />
                  <Text style={styles.demoBtnText}>Company Demo</Text>
                </TouchableOpacity>
              </View>
            </View>

            <CustomButton
              title="Sign In"
              onPress={handleLogin}
              variant="gold"
              size="lg"
              loading={loading}
              style={styles.submitBtn}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
                <Text style={styles.signupText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    padding: SPACING.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.gold,
    ...SHADOWS.gold,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: COLORS.goldLight,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 18,
    lineHeight: 18,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.goldDark,
    fontWeight: '600',
  },
  submitBtn: {
    marginBottom: 18,
  },
  demoCard: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderStyle: 'dashed',
    padding: 10,
    marginBottom: 16,
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.goldDark,
    letterSpacing: 0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  signupText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;
