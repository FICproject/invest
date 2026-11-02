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

export const RegisterScreen = ({ navigation, route }: any) => {
  const { register, registerCompany } = useAuthContext();

  const initialRole = route?.params?.role === 'company' ? 'company' : 'investor';
  const [activeRole, setActiveRole] = useState<'investor' | 'company'>(initialRole);
  const [investorStep, setInvestorStep] = useState(1);
  const [companyStep, setCompanyStep] = useState(1);

  // 1. INVESTOR 5-STEP FORM STATE
  // Step 1: Basic Details
  const [invName, setInvName] = useState('');
  const [invEmail, setInvEmail] = useState('');
  const [invMobile, setInvMobile] = useState('');
  const [invPassword, setInvPassword] = useState('');
  const [invConfirmPassword, setInvConfirmPassword] = useState('');
  const [invDob, setInvDob] = useState('1990-01-01');

  // Step 2: Personal & KYC Details
  const [invPan, setInvPan] = useState('');
  const [invAadhaar, setInvAadhaar] = useState('');
  const [invAddress, setInvAddress] = useState('');
  const [invCity, setInvCity] = useState('');
  const [invState, setInvState] = useState('');
  const [invPincode, setInvPincode] = useState('');
  const [invNationality, setInvNationality] = useState('Indian');
  const [invOccupation, setInvOccupation] = useState('Salaried Professional');
  const [invIncome, setInvIncome] = useState('₹10 Lakh - ₹25 Lakh');
  const [invSourceOfFunds, setInvSourceOfFunds] = useState('Salary / Business Income');

  // Step 3: Bank Details
  const [invAccHolder, setInvAccHolder] = useState('');
  const [invBankName, setInvBankName] = useState('');
  const [invAccNum, setInvAccNum] = useState('');
  const [invIfsc, setInvIfsc] = useState('');

  // Step 4: Investment Profile
  const [invExp, setInvExp] = useState('1-3 Years');
  const [invPrefType, setInvPrefType] = useState('Fixed-Term & Equity');
  const [invRisk, setInvRisk] = useState('Moderate');
  const [invExpectedAmt, setInvExpectedAmt] = useState('₹5,00,000 - ₹25,00,000');
  const [invGoals, setInvGoals] = useState('Regular cash flow & yield');

  // Step 5: Consent
  const [invTerms, setInvTerms] = useState(true);

  // 2. COMPANY 5-STEP FORM STATE
  // Step 1: Company Details
  const [compLegalName, setCompLegalName] = useState('');
  const [compBrandName, setCompBrandName] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compMobile, setCompMobile] = useState('');
  const [compPassword, setCompPassword] = useState('');
  const [compConfirmPassword, setCompConfirmPassword] = useState('');
  const [compWebsite, setCompWebsite] = useState('');
  const [compIndustry, setCompIndustry] = useState('Technology');
  const [compType, setCompType] = useState('Private Limited');

  // Step 2: Business Info
  const [compCin, setCompCin] = useState('');
  const [compPan, setCompPan] = useState('');
  const [compGst, setCompGst] = useState('');
  const [compIncorpDate, setCompIncorpDate] = useState('2021-04-15');
  const [compAddress, setCompAddress] = useState('');
  const [compCity, setCompCity] = useState('');
  const [compState, setCompState] = useState('');
  const [compPincode, setCompPincode] = useState('');
  const [compDescription, setCompDescription] = useState('');

  // Step 3: Auth Representative
  const [compRepName, setCompRepName] = useState('');
  const [compRepDesignation, setCompRepDesignation] = useState('Managing Director / Founder');
  const [compRepEmail, setCompRepEmail] = useState('');
  const [compRepMobile, setCompRepMobile] = useState('');
  const [compRepPan, setCompRepPan] = useState('');

  // Step 4: Bank Details
  const [compAccHolder, setCompAccHolder] = useState('');
  const [compBankName, setCompBankName] = useState('');
  const [compAccNum, setCompAccNum] = useState('');
  const [compIfsc, setCompIfsc] = useState('');

  // Step 5: Consent
  const [compTerms, setCompTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentStep = activeRole === 'investor' ? investorStep : companyStep;

  // Validation
  const validateInvestor = (step: number) => {
    setError('');
    if (step === 1) {
      if (!invName.trim()) return 'Please enter your Full Legal Name.';
      if (!isValidEmail(invEmail)) return 'Please enter a valid Email Address.';
      if (!isValidMobile(invMobile)) return 'Please enter a valid 10-digit Mobile Number.';
      if (!isValidPassword(invPassword)) return 'Password must be at least 6 characters.';
      if (invPassword !== invConfirmPassword) return 'Passwords do not match.';
    }
    if (step === 2) {
      if (!invPan.trim() || invPan.trim().length !== 10) return 'Please enter a valid 10-character PAN.';
      if (!invAddress.trim()) return 'Please enter your Residential Address.';
      if (!invCity.trim() || !invState.trim() || !invPincode.trim()) return 'Please enter City, State, and Pincode.';
    }
    if (step === 3) {
      if (!invAccHolder.trim()) return 'Please enter Account Holder Name.';
      if (!invBankName.trim()) return 'Please enter Bank Name.';
      if (!invAccNum.trim()) return 'Please enter Account Number.';
      if (!invIfsc.trim()) return 'Please enter IFSC Code.';
    }
    return null;
  };

  const validateCompany = (step: number) => {
    setError('');
    if (step === 1) {
      if (!compLegalName.trim()) return 'Please enter Registered Company Name.';
      if (!isValidEmail(compEmail)) return 'Please enter valid Company Email.';
      if (!isValidMobile(compMobile)) return 'Please enter Official Mobile Number.';
      if (!isValidPassword(compPassword)) return 'Password must be at least 6 characters.';
      if (compPassword !== compConfirmPassword) return 'Passwords do not match.';
    }
    if (step === 2) {
      if (!compPan.trim() || compPan.trim().length !== 10) return 'Please enter a valid 10-character Company PAN.';
      if (!compAddress.trim()) return 'Please enter Registered Office Address.';
      if (!compCity.trim() || !compState.trim() || !compPincode.trim()) return 'Please enter City, State, and Pincode.';
    }
    if (step === 3) {
      if (!compRepName.trim()) return 'Please enter Representative Full Name.';
      if (!isValidEmail(compRepEmail)) return 'Please enter Representative Email.';
      if (!isValidMobile(compRepMobile)) return 'Please enter Representative Mobile.';
    }
    if (step === 4) {
      if (!compAccHolder.trim()) return 'Please enter Bank Account Holder Name.';
      if (!compBankName.trim()) return 'Please enter Bank Name.';
      if (!compAccNum.trim()) return 'Please enter Account Number.';
      if (!compIfsc.trim()) return 'Please enter IFSC Code.';
    }
    return null;
  };

  const handleNext = () => {
    if (activeRole === 'investor') {
      const err = validateInvestor(investorStep);
      if (err) {
        setError(err);
        return;
      }
      setInvestorStep(s => Math.min(s + 1, 5));
    } else {
      const err = validateCompany(companyStep);
      if (err) {
        setError(err);
        return;
      }
      setCompanyStep(s => Math.min(s + 1, 5));
    }
    setError('');
  };

  const handleBack = () => {
    setError('');
    if (activeRole === 'investor') {
      setInvestorStep(s => Math.max(s - 1, 1));
    } else {
      setCompanyStep(s => Math.max(s - 1, 1));
    }
  };

  // Submit Investor
  const submitInvestor = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await register({
        name: invName.trim(),
        email: invEmail.trim().toLowerCase(),
        mobile: invMobile.trim(),
        password: invPassword,
        dateOfBirth: invDob,
        pan: invPan.trim().toUpperCase(),
        aadhaarNumber: invAadhaar.trim(),
        residentialAddress: invAddress.trim(),
        city: invCity.trim(),
        state: invState.trim(),
        pincode: invPincode.trim(),
        nationality: invNationality,
        occupation: invOccupation,
        annualIncomeRange: invIncome,
        sourceOfFunds: invSourceOfFunds,
        accountHolderName: invAccHolder.trim(),
        bankName: invBankName.trim(),
        accountNumber: invAccNum.trim(),
        ifscCode: invIfsc.trim().toUpperCase(),
        investmentExperience: invExp,
        preferredInvestmentType: invPrefType,
        riskTolerance: invRisk,
        expectedInvestmentAmount: invExpectedAmt,
        investmentGoals: invGoals,
        termsAccepted: invTerms
      });

      navigation.navigate(ROUTES.OTP_VERIFICATION, {
        email: invEmail,
        mobile: invMobile,
        otpCode: res.otpCode
      });
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Company
  const submitCompany = async () => {
    setLoading(true);
    setError('');
    try {
      await registerCompany({
        companyLegalName: compLegalName.trim(),
        brandName: compBrandName.trim() || compLegalName.trim(),
        companyEmail: compEmail.trim().toLowerCase(),
        companyMobile: compMobile.trim(),
        password: compPassword,
        website: compWebsite.trim(),
        industry: compIndustry,
        companyType: compType,
        cin: compCin.trim().toUpperCase() || undefined,
        pan: compPan.trim().toUpperCase(),
        gstin: compGst.trim().toUpperCase() || undefined,
        incorporationDate: compIncorpDate,
        registeredAddress: compAddress.trim(),
        city: compCity.trim(),
        state: compState.trim(),
        pincode: compPincode.trim(),
        description: compDescription.trim() || `${compLegalName} registered on Connect Invest.`,
        name: compRepName.trim(),
        repDesignation: compRepDesignation.trim(),
        email: (compRepEmail || compEmail).trim().toLowerCase(),
        mobile: (compRepMobile || compMobile).trim(),
        repPan: compRepPan.trim().toUpperCase(),
        repIdentityVerified: true,
        accountHolderName: compAccHolder.trim() || compLegalName.trim(),
        bankName: compBankName.trim(),
        accountNumber: compAccNum.trim(),
        ifscCode: compIfsc.trim().toUpperCase()
      });
    } catch (err: any) {
      setError(err?.message || 'Company registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepsLabels = activeRole === 'investor'
    ? ['Basic Details', 'Personal & KYC', 'Bank Details', 'Investment Profile', 'Verification & Consent']
    : ['Company Details', 'Business Info', 'Auth Representative', 'Bank Details', 'Company Documents'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF7" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (currentStep > 1 ? handleBack() : navigation.navigate(ROUTES.LOGIN))}
        >
          <Icon name="chevron-left" size={22} color="#1F2421" />
          <Text style={styles.backBtnText}>{currentStep > 1 ? 'Back' : 'Sign In'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeRole === 'investor' ? 'Investor' : 'Company'} • Step {currentStep} of 5
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Role Switcher */}
          <View style={styles.roleToggle}>
            <TouchableOpacity
              style={[styles.roleBtn, activeRole === 'investor' && styles.roleBtnActive]}
              onPress={() => {
                setActiveRole('investor');
                setError('');
              }}
            >
              <Icon name="user" size={16} color={activeRole === 'investor' ? '#1F2421' : '#6B7280'} />
              <Text style={[styles.roleBtnText, activeRole === 'investor' && styles.roleBtnTextActive]}>
                1. Investor Registration
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleBtn, activeRole === 'company' && styles.roleBtnActive]}
              onPress={() => {
                setActiveRole('company');
                setError('');
              }}
            >
              <Icon name="briefcase" size={16} color={activeRole === 'company' ? '#1F2421' : '#6B7280'} />
              <Text style={[styles.roleBtnText, activeRole === 'company' && styles.roleBtnTextActive]}>
                2. Company Registration
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stepper Progress Card */}
          <View style={styles.stepperCard}>
            <View style={styles.stepHeaderRow}>
              <Text style={styles.stepTitle}>
                Step {currentStep}: {stepsLabels[currentStep - 1]}
              </Text>
              <Text style={styles.stepPercent}>{Math.round((currentStep / 5) * 100)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(currentStep / 5) * 100}%` }]} />
            </View>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBox}>
              <Icon name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* ==================== INVESTOR 5 STEPS ==================== */}
          {activeRole === 'investor' && (
            <View style={styles.formCard}>
              {/* Step 1: Basic Details */}
              {investorStep === 1 && (
                <>
                  <Text style={styles.sectionHeader}>Step 1: Basic Details</Text>
                  <CustomInput
                    label="Full Name"
                    value={invName}
                    onChangeText={setInvName}
                    placeholder="As per PAN Card"
                    leftIcon="user"
                  />
                  <CustomInput
                    label="Email Address"
                    value={invEmail}
                    onChangeText={setInvEmail}
                    placeholder="name@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="mail"
                  />
                  <CustomInput
                    label="Mobile Number"
                    value={invMobile}
                    onChangeText={setInvMobile}
                    placeholder="10-digit mobile"
                    keyboardType="phone-pad"
                    leftIcon="phone"
                  />
                  <CustomInput
                    label="Password"
                    value={invPassword}
                    onChangeText={setInvPassword}
                    placeholder="Min 6 characters"
                    secureTextEntry
                    leftIcon="lock"
                  />
                  <CustomInput
                    label="Confirm Password"
                    value={invConfirmPassword}
                    onChangeText={setInvConfirmPassword}
                    placeholder="Re-enter password"
                    secureTextEntry
                    leftIcon="lock"
                  />
                  <CustomInput
                    label="Date of Birth"
                    value={invDob}
                    onChangeText={setInvDob}
                    placeholder="YYYY-MM-DD (e.g. 1990-05-15)"
                    leftIcon="calendar"
                  />
                </>
              )}

              {/* Step 2: Personal & KYC Details */}
              {investorStep === 2 && (
                <>
                  <Text style={styles.sectionHeader}>Step 2: Personal & KYC Details</Text>
                  <CustomInput
                    label="PAN Number"
                    value={invPan}
                    onChangeText={setInvPan}
                    placeholder="10-character PAN (ABCDE1234F)"
                    autoCapitalize="characters"
                    leftIcon="file-text"
                  />
                  <CustomInput
                    label="Aadhaar Verification (Where permitted)"
                    value={invAadhaar}
                    onChangeText={setInvAadhaar}
                    placeholder="12-digit Aadhaar number"
                    keyboardType="numeric"
                    leftIcon="shield"
                  />
                  <CustomInput
                    label="Residential Address"
                    value={invAddress}
                    onChangeText={setInvAddress}
                    placeholder="Flat / Building, Street"
                    leftIcon="home"
                  />
                  <CustomInput
                    label="City"
                    value={invCity}
                    onChangeText={setInvCity}
                    placeholder="City"
                  />
                  <CustomInput
                    label="State"
                    value={invState}
                    onChangeText={setInvState}
                    placeholder="State"
                  />
                  <CustomInput
                    label="Pincode"
                    value={invPincode}
                    onChangeText={setInvPincode}
                    placeholder="6-digit PIN"
                    keyboardType="numeric"
                  />
                  <CustomInput
                    label="Nationality"
                    value={invNationality}
                    onChangeText={setInvNationality}
                    placeholder="Nationality"
                  />
                  <CustomInput
                    label="Occupation"
                    value={invOccupation}
                    onChangeText={setInvOccupation}
                    placeholder="e.g. Salaried, Business, CA"
                  />
                  <CustomInput
                    label="Annual Income Range"
                    value={invIncome}
                    onChangeText={setInvIncome}
                    placeholder="e.g. ₹10 Lakh - ₹25 Lakh"
                  />
                  <CustomInput
                    label="Source of Funds"
                    value={invSourceOfFunds}
                    onChangeText={setInvSourceOfFunds}
                    placeholder="Salary / Business Income"
                  />
                </>
              )}

              {/* Step 3: Bank Details */}
              {investorStep === 3 && (
                <>
                  <Text style={styles.sectionHeader}>Step 3: Bank Details</Text>
                  <CustomInput
                    label="Account Holder Name"
                    value={invAccHolder}
                    onChangeText={setInvAccHolder}
                    placeholder="As registered with your bank"
                    leftIcon="user"
                  />
                  <CustomInput
                    label="Bank Name"
                    value={invBankName}
                    onChangeText={setInvBankName}
                    placeholder="e.g. HDFC Bank, ICICI Bank"
                    leftIcon="briefcase"
                  />
                  <CustomInput
                    label="Account Number"
                    value={invAccNum}
                    onChangeText={setInvAccNum}
                    placeholder="Bank account number"
                    keyboardType="numeric"
                    leftIcon="credit-card"
                  />
                  <CustomInput
                    label="IFSC Code"
                    value={invIfsc}
                    onChangeText={setInvIfsc}
                    placeholder="11-character IFSC (e.g. HDFC0001234)"
                    autoCapitalize="characters"
                    leftIcon="file-text"
                  />
                  <View style={styles.proofCard}>
                    <Icon name="file-text" size={24} color="#B37400" />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.proofTitle}>Cancelled Cheque or Bank Proof</Text>
                      <Text style={styles.proofSub}>Will be verified digitally or via document upload during onboarding.</Text>
                    </View>
                  </View>
                </>
              )}

              {/* Step 4: Investment Profile */}
              {investorStep === 4 && (
                <>
                  <Text style={styles.sectionHeader}>Step 4: Investment Profile</Text>
                  <CustomInput
                    label="Investment Experience"
                    value={invExp}
                    onChangeText={setInvExp}
                    placeholder="e.g. 1-3 Years / 5+ Years"
                  />
                  <CustomInput
                    label="Preferred Investment Type"
                    value={invPrefType}
                    onChangeText={setInvPrefType}
                    placeholder="Fixed-Term Returns / Equity"
                  />
                  <CustomInput
                    label="Risk Tolerance"
                    value={invRisk}
                    onChangeText={setInvRisk}
                    placeholder="Conservative / Moderate / Aggressive"
                  />
                  <CustomInput
                    label="Expected Investment Amount"
                    value={invExpectedAmt}
                    onChangeText={setInvExpectedAmt}
                    placeholder="e.g. ₹5,00,000 - ₹25,00,000"
                  />
                  <CustomInput
                    label="Investment Goals"
                    value={invGoals}
                    onChangeText={setInvGoals}
                    placeholder="Capital appreciation / regular yield"
                  />
                </>
              )}

              {/* Step 5: Verification & Consent */}
              {investorStep === 5 && (
                <>
                  <Text style={styles.sectionHeader}>Step 5: Verification & Consent</Text>
                  <View style={styles.infoCard}>
                    <Icon name="shield" size={22} color="#059669" />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.infoTitle}>PAN & Identity Verification</Text>
                      <Text style={styles.infoSub}>Your credentials will be securely cross-verified with NSDL/MCA database.</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setInvTerms(!invTerms)}
                  >
                    <Icon
                      name={invTerms ? 'check-circle' : 'circle'}
                      size={20}
                      color={invTerms ? '#059669' : '#9CA3AF'}
                    />
                    <Text style={styles.checkboxLabel}>
                      I accept the <Text style={{ fontWeight: '700' }}>Terms & Conditions</Text>, <Text style={{ fontWeight: '700' }}>Privacy Policy</Text>, and acknowledge the <Text style={{ fontWeight: '700' }}>Risk Disclosures</Text>.
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {/* ==================== COMPANY 5 STEPS ==================== */}
          {activeRole === 'company' && (
            <View style={styles.formCard}>
              {/* Step 1: Company Details */}
              {companyStep === 1 && (
                <>
                  <Text style={styles.sectionHeader}>Step 1: Company Details</Text>
                  <CustomInput
                    label="Registered Company Name"
                    value={compLegalName}
                    onChangeText={setCompLegalName}
                    placeholder="As registered with MCA"
                    leftIcon="briefcase"
                  />
                  <CustomInput
                    label="Brand / Business Name"
                    value={compBrandName}
                    onChangeText={setCompBrandName}
                    placeholder="Trading name"
                    leftIcon="award"
                  />
                  <CustomInput
                    label="Company Email Address"
                    value={compEmail}
                    onChangeText={setCompEmail}
                    placeholder="official@company.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="mail"
                  />
                  <CustomInput
                    label="Official Mobile Number"
                    value={compMobile}
                    onChangeText={setCompMobile}
                    placeholder="10-digit phone"
                    keyboardType="phone-pad"
                    leftIcon="phone"
                  />
                  <CustomInput
                    label="Company Website (Optional)"
                    value={compWebsite}
                    onChangeText={setCompWebsite}
                    placeholder="https://example.com"
                    autoCapitalize="none"
                    leftIcon="globe"
                  />
                  <CustomInput
                    label="Business Category / Industry"
                    value={compIndustry}
                    onChangeText={setCompIndustry}
                    placeholder="Technology / Healthcare / Fintech"
                    leftIcon="layers"
                  />
                  <CustomInput
                    label="Password"
                    value={compPassword}
                    onChangeText={setCompPassword}
                    placeholder="Min 6 characters"
                    secureTextEntry
                    leftIcon="lock"
                  />
                  <CustomInput
                    label="Confirm Password"
                    value={compConfirmPassword}
                    onChangeText={setCompConfirmPassword}
                    placeholder="Re-enter password"
                    secureTextEntry
                    leftIcon="lock"
                  />
                </>
              )}

              {/* Step 2: Business Information */}
              {companyStep === 2 && (
                <>
                  <Text style={styles.sectionHeader}>Step 2: Business Information</Text>
                  <CustomInput
                    label="Company PAN Number"
                    value={compPan}
                    onChangeText={setCompPan}
                    placeholder="10-character PAN"
                    autoCapitalize="characters"
                    leftIcon="file-text"
                  />
                  <CustomInput
                    label="Company Registration Number (CIN)"
                    value={compCin}
                    onChangeText={setCompCin}
                    placeholder="21-character CIN"
                    autoCapitalize="characters"
                    leftIcon="file"
                  />
                  <CustomInput
                    label="GST Number (Optional)"
                    value={compGst}
                    onChangeText={setCompGst}
                    placeholder="15-character GSTIN"
                    autoCapitalize="characters"
                  />
                  <CustomInput
                    label="Date of Incorporation"
                    value={compIncorpDate}
                    onChangeText={setCompIncorpDate}
                    placeholder="YYYY-MM-DD"
                    leftIcon="calendar"
                  />
                  <CustomInput
                    label="Registered Office Address"
                    value={compAddress}
                    onChangeText={setCompAddress}
                    placeholder="Floor, Building, Road"
                    leftIcon="home"
                  />
                  <CustomInput
                    label="City"
                    value={compCity}
                    onChangeText={setCompCity}
                    placeholder="City"
                  />
                  <CustomInput
                    label="State"
                    value={compState}
                    onChangeText={setCompState}
                    placeholder="State"
                  />
                  <CustomInput
                    label="Pincode"
                    value={compPincode}
                    onChangeText={setCompPincode}
                    placeholder="6-digit Pincode"
                    keyboardType="numeric"
                  />
                  <CustomInput
                    label="Business Description"
                    value={compDescription}
                    onChangeText={setCompDescription}
                    placeholder="Summary of business & revenue model"
                    multiline
                  />
                </>
              )}

              {/* Step 3: Authorized Representative */}
              {companyStep === 3 && (
                <>
                  <Text style={styles.sectionHeader}>Step 3: Authorized Representative</Text>
                  <CustomInput
                    label="Representative Full Name"
                    value={compRepName}
                    onChangeText={setCompRepName}
                    placeholder="Managing Director / Founder"
                    leftIcon="user"
                  />
                  <CustomInput
                    label="Designation"
                    value={compRepDesignation}
                    onChangeText={setCompRepDesignation}
                    placeholder="e.g. Director, CEO"
                    leftIcon="award"
                  />
                  <CustomInput
                    label="Email Address"
                    value={compRepEmail}
                    onChangeText={setCompRepEmail}
                    placeholder="rep@company.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="mail"
                  />
                  <CustomInput
                    label="Mobile Number"
                    value={compRepMobile}
                    onChangeText={setCompRepMobile}
                    placeholder="10-digit mobile"
                    keyboardType="phone-pad"
                    leftIcon="phone"
                  />
                  <CustomInput
                    label="PAN Details"
                    value={compRepPan}
                    onChangeText={setCompRepPan}
                    placeholder="Personal PAN of signatory"
                    autoCapitalize="characters"
                    leftIcon="file-text"
                  />
                </>
              )}

              {/* Step 4: Bank Details */}
              {companyStep === 4 && (
                <>
                  <Text style={styles.sectionHeader}>Step 4: Bank Details</Text>
                  <CustomInput
                    label="Account Holder Name"
                    value={compAccHolder}
                    onChangeText={setCompAccHolder}
                    placeholder="Corporate account title"
                    leftIcon="user"
                  />
                  <CustomInput
                    label="Bank Name"
                    value={compBankName}
                    onChangeText={setCompBankName}
                    placeholder="e.g. Axis Bank, HDFC Bank"
                    leftIcon="briefcase"
                  />
                  <CustomInput
                    label="Account Number"
                    value={compAccNum}
                    onChangeText={setCompAccNum}
                    placeholder="Corporate current account number"
                    keyboardType="numeric"
                    leftIcon="credit-card"
                  />
                  <CustomInput
                    label="IFSC Code"
                    value={compIfsc}
                    onChangeText={setCompIfsc}
                    placeholder="11-character IFSC"
                    autoCapitalize="characters"
                    leftIcon="file-text"
                  />
                </>
              )}

              {/* Step 5: Company Documents */}
              {companyStep === 5 && (
                <>
                  <Text style={styles.sectionHeader}>Step 5: Company Documents & Declaration</Text>
                  <View style={styles.proofCard}>
                    <Icon name="file-text" size={24} color="#B37400" />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.proofTitle}>Statutory Verification Documents</Text>
                      <Text style={styles.proofSub}>
                        Certificate of Incorporation, Company PAN, GST Certificate, MOA & AOA are submitted for ROC validation.
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setCompTerms(!compTerms)}
                  >
                    <Icon
                      name={compTerms ? 'check-circle' : 'circle'}
                      size={20}
                      color={compTerms ? '#059669' : '#9CA3AF'}
                    />
                    <Text style={styles.checkboxLabel}>
                      I affirm that all business details, authorized signatory filings, and statutory declarations are authentic and conform with MCA regulations.
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {/* Stepper Navigation Buttons */}
          <View style={styles.buttonRow}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.backStepBtn} onPress={handleBack}>
                <Icon name="arrow-left" size={16} color="#1F2421" />
                <Text style={styles.backStepText}>Back</Text>
              </TouchableOpacity>
            )}

            {currentStep < 5 ? (
              <TouchableOpacity style={styles.nextStepBtn} onPress={handleNext}>
                <Text style={styles.nextStepText}>Next Step</Text>
                <Icon name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={activeRole === 'investor' ? submitInvestor : submitCompany}
                disabled={loading}
              >
                <Text style={styles.submitBtnText}>
                  {loading
                    ? 'Registering...'
                    : activeRole === 'investor'
                    ? 'Complete Investor Registration'
                    : 'Submit Company Registration'}
                </Text>
                <Icon name="check-circle" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Footer Login Link */}
          <View style={styles.footerLinkRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8D8',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2421',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B37400',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 10, 17, 0.05)',
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE8D8',
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  roleBtnActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  roleBtnTextActive: {
    color: '#1F2421',
    fontWeight: '800',
  },
  stepperCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE8D8',
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2421',
  },
  stepPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B37400',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#B37400',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#EFE8D8',
    ...SHADOWS.sm,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2421',
    marginBottom: 12,
  },
  proofCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9ED',
    borderWidth: 1,
    borderColor: '#F4E9CD',
    borderRadius: RADIUS.md,
    padding: 12,
    marginVertical: 8,
  },
  proofTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2421',
  },
  proofSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 14,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  infoSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  backStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  backStepText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2421',
    marginLeft: 6,
  },
  nextStepBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    backgroundColor: '#B37400',
    marginLeft: 12,
    ...SHADOWS.md,
  },
  nextStepText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 6,
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    backgroundColor: '#059669',
    marginLeft: 12,
    ...SHADOWS.md,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginLeft: 8,
    flex: 1,
  },
  footerLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B37400',
  },
});

export default RegisterScreen;
