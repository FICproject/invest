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
  Alert,
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
import { isValidEmail, isValidMobile, isValidPassword } from '../../utils/validators';
import { getErrorMessage } from '../../utils/errorHandler';

const COMPANY_TYPES = [
  'Private Limited',
  'Public Limited',
  'LLP',
  'Partnership',
];

export const CompanyRegisterScreen = ({ navigation }: any) => {
  const { registerCompany } = useAuthContext();

  // Representative Details
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Company Entity Details
  const [companyLegalName, setCompanyLegalName] = useState<string>('');
  const [companyType, setCompanyType] = useState<string>('Private Limited');
  const [industry, setIndustry] = useState<string>('Technology');
  const [pan, setPan] = useState<string>('');
  const [cin, setCin] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleRegister = async () => {
    // Validations matching website
    if (!name.trim()) {
      setError('Please provide representative legal name.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (!isValidMobile(mobile)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!isValidPassword(password)) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!companyLegalName.trim()) {
      setError('Please provide company legal name as per MCA records.');
      return;
    }
    if (!pan.trim() || pan.trim().length !== 10) {
      setError('Please provide a valid 10-character Company PAN.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const res = await registerCompany({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        password,
        companyLegalName: companyLegalName.trim(),
        companyType,
        industry: industry.trim() || 'Technology',
        pan: pan.trim().toUpperCase(),
        cin: cin.trim() ? cin.trim().toUpperCase() : undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        pincode: pincode.trim() || undefined,
        description: description.trim() || undefined,
      });

      if (res.success) {
        setSuccessMessage('Company registration successful! Your corporate account has been created.');
        Alert.alert(
          'Registration Successful',
          'Your company profile has been created successfully.',
          [
            {
              text: 'Go to Sign In',
              onPress: () => navigation.navigate(ROUTES.LOGIN),
            },
          ]
        );
      } else {
        setError(res.message || 'Registration failed. Please check inputs.');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please check your inputs.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate(ROUTES.REGISTER_ROLE)}
        >
          <Icon name="chevron-left" size={20} color={COLORS.gold} />
          <Text style={styles.backBtnText}>Change Role</Text>
        </TouchableOpacity>

        {/* Tab switch between Investor & Company */}
        <View style={styles.roleToggleContainer}>
          <TouchableOpacity
            style={styles.roleToggleTab}
            onPress={() => navigation.navigate(ROUTES.REGISTER_INVESTOR)}
          >
            <Text style={styles.roleToggleText}>Investor</Text>
          </TouchableOpacity>
          <View style={[styles.roleToggleTab, styles.roleToggleTabActive]}>
            <Text style={[styles.roleToggleText, styles.roleToggleTextActive]}>Company</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'android' ? undefined : 'padding'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand & Title */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Icon name="building" size={28} color={COLORS.gold} />
            </View>
            <Text style={styles.brandName}>CONNECT INVEST</Text>
            <Text style={styles.pageTitle}>Register Your Company</Text>
            <Text style={styles.brandSubtitle}>
              Set up your corporate profile to unlock Fixed-Term and Equity fundraising
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {error ? (
              <View style={styles.errorBox}>
                <Icon name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View style={styles.successBox}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            {/* SECTION 1: Authorized Representative */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBadge}>
                <Icon name="user" size={16} color={COLORS.goldDark} />
              </View>
              <Text style={styles.sectionTitle}>
                1. Authorized Representative / Primary Admin
              </Text>
            </View>

            <CustomInput
              label="Full Legal Name *"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError('');
              }}
              leftIcon={<Icon name="user" size={18} color={COLORS.gold} />}
            />

            <CustomInput
              label="Work Email Address *"
              placeholder="name@company.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={<Icon name="file-text" size={18} color={COLORS.gold} />}
            />

            <CustomInput
              label="Mobile Number *"
              placeholder="10-digit mobile number"
              value={mobile}
              onChangeText={(text) => {
                setMobile(text.replace(/\D/g, '').slice(0, 10));
                setError('');
              }}
              keyboardType="phone-pad"
              leftIcon={<Icon name="shield" size={18} color={COLORS.gold} />}
            />

            <CustomInput
              label="Portal Password *"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              isPassword
              leftIcon={<Icon name="lock" size={18} color={COLORS.gold} />}
            />

            <CustomInput
              label="Confirm Password *"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError('');
              }}
              isPassword
              leftIcon={<Icon name="lock" size={18} color={COLORS.gold} />}
            />

            {/* SECTION 2: Company Entity Details */}
            <View style={[styles.sectionHeader, { marginTop: SPACING.md }]}>
              <View style={styles.sectionIconBadge}>
                <Icon name="building" size={16} color={COLORS.goldDark} />
              </View>
              <Text style={styles.sectionTitle}>
                2. Business Entity Information
              </Text>
            </View>

            <CustomInput
              label="Company Legal Name (as per MCA) *"
              placeholder="e.g. Acme Innovations Private Limited"
              value={companyLegalName}
              onChangeText={(text) => {
                setCompanyLegalName(text);
                setError('');
              }}
              leftIcon={<Icon name="building" size={18} color={COLORS.gold} />}
            />

            {/* Company Constitution / Type */}
            <View style={styles.chipSection}>
              <Text style={styles.fieldLabel}>Constitution / Type *</Text>
              <View style={styles.chipRow}>
                {COMPANY_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      companyType === type && styles.chipActive,
                    ]}
                    onPress={() => setCompanyType(type)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        companyType === type && styles.chipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <CustomInput
              label="Industry Sector *"
              placeholder="e.g. CleanTech, SaaS, Healthcare"
              value={industry}
              onChangeText={(text) => {
                setIndustry(text);
                setError('');
              }}
              leftIcon={<Icon name="briefcase" size={18} color={COLORS.gold} />}
            />

            <CustomInput
              label="Company PAN *"
              placeholder="ABCDE1234F"
              value={pan}
              onChangeText={(text) => {
                setPan(text.toUpperCase());
                setError('');
              }}
              autoCapitalize="characters"
              maxLength={10}
              leftIcon={<Icon name="file-text" size={18} color={COLORS.gold} />}
            />

            <CustomInput
              label="CIN (Corporate ID Number)"
              placeholder="U72900KA2022PTC158941"
              value={cin}
              onChangeText={(text) => setCin(text.toUpperCase())}
              autoCapitalize="characters"
              leftIcon={<Icon name="shield" size={18} color={COLORS.gold} />}
            />

            <CustomInput
              label="City"
              placeholder="e.g. Bengaluru"
              value={city}
              onChangeText={(text) => setCity(text)}
              leftIcon={<Icon name="home" size={18} color={COLORS.gold} />}
            />

            <View style={styles.twoColumnRow}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="State"
                  placeholder="Karnataka"
                  value={state}
                  onChangeText={(text) => setState(text)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="Pincode"
                  placeholder="560001"
                  value={pincode}
                  onChangeText={(text) => setPincode(text.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <CustomInput
              label="Brief Business Description"
              placeholder="Briefly state your core operations and value proposition..."
              value={description}
              onChangeText={(text) => setDescription(text)}
              multiline
              numberOfLines={3}
              style={{ minHeight: 65, textAlignVertical: 'top' }}
            />

            <CustomButton
              title="Complete Registration & Go to Sign In"
              onPress={handleRegister}
              variant="gold"
              size="lg"
              loading={loading}
              style={styles.submitBtn}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
                <Text style={styles.loginText}>Sign In</Text>
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
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.goldLight,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: RADIUS.full,
    padding: 3,
  },
  roleToggleTab: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
  },
  roleToggleTabActive: {
    backgroundColor: COLORS.gold,
  },
  roleToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.goldLight,
  },
  roleToggleTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: COLORS.gold,
    ...SHADOWS.gold,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.goldLight,
    letterSpacing: 2,
  },
  pageTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: 2,
  },
  brandSubtitle: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  sectionIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.goldSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.goldDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  chipSection: {
    marginBottom: SPACING.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSubtle,
  },
  chipActive: {
    backgroundColor: COLORS.goldSubtle,
    borderColor: COLORS.gold,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: COLORS.goldDark,
    fontWeight: '700',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
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
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS.sm,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  successText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: SPACING.md,
    marginBottom: 16,
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
  loginText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default CompanyRegisterScreen;

