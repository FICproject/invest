import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import Icon from '../../components/common/Icon';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import { useAuthContext } from '../../context/authContext';
import { kycService } from '../../services/notificationService';
import { isValidPan, isValidIfsc } from '../../utils/validators';
import { getErrorMessage } from '../../utils/errorHandler';

export const KycUploadScreen = ({ route, navigation }: any) => {
  const { user, refreshKycStatus, setKycStatusDirectly } = useAuthContext();
  const { kycData } = route.params || {};

  const [fullName, setFullName] = useState<string>(kycData?.fullName || user?.name || '');
  const [panNumber, setPanNumber] = useState<string>(kycData?.panNumber || '');
  const [addressProofType, setAddressProofType] = useState<string>(kycData?.addressProofType || 'Aadhaar Card');
  const [addressProofNumber, setAddressProofNumber] = useState<string>(kycData?.addressProofNumber || '');
  const [bankName, setBankName] = useState<string>(kycData?.bankName || '');
  const [accountNumber, setAccountNumber] = useState<string>(kycData?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState<string>(kycData?.ifscCode || '');
  const [instantApproval, setInstantApproval] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!isValidPan(panNumber)) {
      setError('Invalid PAN number. Must be 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).');
      return;
    }
    if (ifscCode && !isValidIfsc(ifscCode)) {
      setError('Invalid IFSC code format (e.g. HDFC0001234).');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await kycService.submitKyc({
        fullName: fullName.trim(),
        panNumber: panNumber.trim().toUpperCase(),
        addressProofType,
        addressProofNumber: addressProofNumber.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        autoApprove: instantApproval,
      });

      if (res.success && res.data) {
        setKycStatusDirectly(res.data.status);
        await refreshKycStatus();
        Alert.alert(
          instantApproval ? 'KYC Approved!' : 'KYC Submitted',
          res.message || 'Your documents have been processed.',
          [{ text: 'Continue', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Submission failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Submit KYC Documents</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'android' ? undefined : 'padding'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {error ? (
            <View style={styles.errorBox}>
              <Icon name="alert-circle" size={16} color={COLORS.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Section: Identity Proof */}
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>1. Tax & Identity Verification</Text>

            <CustomInput
              label="Full Legal Name"
              placeholder="As registered with Income Tax Dept."
              value={fullName}
              onChangeText={setFullName}
              leftIcon={<Icon name="user" size={18} color={COLORS.gold} />}
            />

            <CustomInput
              label="Permanent Account Number (PAN)"
              placeholder="e.g. ABCDE1234F"
              value={panNumber}
              onChangeText={(val) => setPanNumber(val.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
              leftIcon={<Icon name="shield" size={18} color={COLORS.gold} />}
            />
          </View>

          {/* Section: Address Proof */}
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>2. Residence Proof</Text>

            <Text style={styles.subLabel}>Document Category</Text>
            <View style={styles.docTypeRow}>
              {['Aadhaar Card', 'Passport', 'Voter ID'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.docTypeChip,
                    addressProofType === type && styles.docTypeChipActive,
                  ]}
                  onPress={() => setAddressProofType(type)}
                >
                  <Text
                    style={[
                      styles.docTypeText,
                      addressProofType === type && styles.docTypeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <CustomInput
              label="Document Number / ID"
              placeholder="e.g. 12-digit Aadhaar or Passport ID"
              value={addressProofNumber}
              onChangeText={setAddressProofNumber}
              leftIcon={<Icon name="file-text" size={18} color={COLORS.gold} />}
            />
          </View>

          {/* Section: Bank Account Details */}
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>3. Payout Bank Verification</Text>

            <CustomInput
              label="Bank Name"
              placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
              value={bankName}
              onChangeText={setBankName}
              leftIcon={<Icon name="building" size={18} color={COLORS.gold} />}
            />

            <CustomInput
              label="Bank Account Number"
              placeholder="Enter savings or current account number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="number-pad"
              leftIcon={<Icon name="credit-card" size={18} color={COLORS.gold} />}
            />

            <CustomInput
              label="Bank IFSC Code"
              placeholder="e.g. HDFC0001234"
              value={ifscCode}
              onChangeText={(val) => setIfscCode(val.toUpperCase())}
              autoCapitalize="characters"
              leftIcon={<Icon name="lock" size={18} color={COLORS.gold} />}
            />
          </View>

          {/* Instant Verification Checkbox */}
          <TouchableOpacity
            style={styles.instantBox}
            onPress={() => setInstantApproval(!instantApproval)}
          >
            <View style={[styles.checkbox, instantApproval && styles.checkboxActive]}>
              {instantApproval && <Icon name="check-circle" size={16} color={COLORS.white} />}
            </View>
            <View style={styles.instantTextCol}>
              <Text style={styles.instantTitle}>Simulate Instant AI Approval (Testing Mode)</Text>
              <Text style={styles.instantDesc}>
                Automatically verifies and marks KYC as APPROVED immediately upon submission.
              </Text>
            </View>
          </TouchableOpacity>

          <CustomButton
            title="Submit Verification"
            onPress={handleSubmit}
            variant="gold"
            size="lg"
            loading={loading}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  docTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  docTypeChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  docTypeChipActive: {
    backgroundColor: COLORS.primarySubtle,
    borderColor: COLORS.gold,
  },
  docTypeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  docTypeTextActive: {
    color: COLORS.goldDark,
    fontWeight: '700',
  },
  instantBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.goldSubtle,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 150, 62, 0.3)',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
    backgroundColor: COLORS.surface,
  },
  checkboxActive: {
    backgroundColor: COLORS.gold,
  },
  instantTextCol: {
    flex: 1,
  },
  instantTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.goldDark,
    marginBottom: 2,
  },
  instantDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  submitBtn: {
    marginBottom: 30,
  },
});

export default KycUploadScreen;
