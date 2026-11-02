import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import { ROUTES } from '../../constants/routes';
import Icon from '../../components/common/Icon';
import CustomButton from '../../components/common/CustomButton';

export const RegisterRoleScreen = ({ navigation }: any) => {
  const [selectedRole, setSelectedRole] = useState<'investor' | 'company'>('investor');

  const handleContinue = () => {
    if (selectedRole === 'investor') {
      navigation.navigate(ROUTES.REGISTER_INVESTOR);
    } else {
      navigation.navigate(ROUTES.REGISTER_COMPANY);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate(ROUTES.LOGIN)}
        >
          <Icon name="chevron-left" size={20} color={COLORS.gold} />
          <Text style={styles.backBtnText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Banner */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Icon name="shield" size={32} color={COLORS.gold} />
          </View>
          <Text style={styles.brandTitle}>Join Connect Invest</Text>
          <Text style={styles.brandSubtitle}>
            Select your account type to proceed with registration
          </Text>
        </View>

        {/* Selection Cards */}
        <View style={styles.cardsContainer}>
          {/* Investor Option */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.roleCard,
              selectedRole === 'investor' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('investor')}
          >
            <View style={styles.cardHeaderRow}>
              <View
                style={[
                  styles.iconBox,
                  selectedRole === 'investor' && styles.iconBoxActive,
                ]}
              >
                <Icon
                  name="shield"
                  size={24}
                  color={selectedRole === 'investor' ? COLORS.goldDark : COLORS.gold}
                />
              </View>
              <View style={styles.badgeTag}>
                <Text style={styles.badgeTagText}>FOR INVESTORS</Text>
              </View>
            </View>

            <Text style={styles.roleTitle}>Investor Account</Text>
            <Text style={styles.roleDescription}>
              Invest in vetted private opportunities, fixed-payout debentures, and high-growth equity rounds.
            </Text>

            <View style={styles.bulletsList}>
              <View style={styles.bulletRow}>
                <Icon name="check-circle" size={14} color={COLORS.gold} />
                <Text style={styles.bulletText}>Minimum entry starting at ₹10,000</Text>
              </View>
              <View style={styles.bulletRow}>
                <Icon name="check-circle" size={14} color={COLORS.gold} />
                <Text style={styles.bulletText}>Verified monthly / quarterly payouts</Text>
              </View>
              <View style={styles.bulletRow}>
                <Icon name="check-circle" size={14} color={COLORS.gold} />
                <Text style={styles.bulletText}>Institutional due diligence & reports</Text>
              </View>
            </View>

            <View style={styles.radioRow}>
              <View
                style={[
                  styles.radioOuter,
                  selectedRole === 'investor' && styles.radioOuterActive,
                ]}
              >
                {selectedRole === 'investor' && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[
                  styles.radioLabel,
                  selectedRole === 'investor' && styles.radioLabelActive,
                ]}
              >
                Register as Investor
              </Text>
            </View>
          </TouchableOpacity>

          {/* Company Option */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.roleCard,
              selectedRole === 'company' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('company')}
          >
            <View style={styles.cardHeaderRow}>
              <View
                style={[
                  styles.iconBox,
                  selectedRole === 'company' && styles.iconBoxActive,
                ]}
              >
                <Icon
                  name="building"
                  size={24}
                  color={selectedRole === 'company' ? COLORS.goldDark : COLORS.gold}
                />
              </View>
              <View style={[styles.badgeTag, styles.badgeTagCompany]}>
                <Text style={styles.badgeTagCompanyText}>FOR COMPANIES</Text>
              </View>
            </View>

            <Text style={styles.roleTitle}>Company / Issuer</Text>
            <Text style={styles.roleDescription}>
              Raise capital, structure fixed-term corporate offerings, and connect with accredited investors.
            </Text>

            <View style={styles.bulletsList}>
              <View style={styles.bulletRow}>
                <Icon name="check-circle" size={14} color={COLORS.gold} />
                <Text style={styles.bulletText}>Fast-track fundraising for growth capital</Text>
              </View>
              <View style={styles.bulletRow}>
                <Icon name="check-circle" size={14} color={COLORS.gold} />
                <Text style={styles.bulletText}>Customizable debenture & equity structures</Text>
              </View>
              <View style={styles.bulletRow}>
                <Icon name="check-circle" size={14} color={COLORS.gold} />
                <Text style={styles.bulletText}>Comprehensive investor management tools</Text>
              </View>
            </View>

            <View style={styles.radioRow}>
              <View
                style={[
                  styles.radioOuter,
                  selectedRole === 'company' && styles.radioOuterActive,
                ]}
              >
                {selectedRole === 'company' && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[
                  styles.radioLabel,
                  selectedRole === 'company' && styles.radioLabelActive,
                ]}
              >
                Register as Company
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* CTA Button */}
        <CustomButton
          title={
            selectedRole === 'investor'
              ? 'Continue to Investor Registration'
              : 'Continue to Company Registration'
          }
          onPress={handleContinue}
          variant="gold"
          size="lg"
          style={styles.continueBtn}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.goldLight,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.gold,
    ...SHADOWS.gold,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    fontSize: 13,
    color: COLORS.goldLight,
    marginTop: 4,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  roleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.md,
  },
  roleCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#FFFFFF',
    ...SHADOWS.gold,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: COLORS.goldSubtle,
    borderColor: COLORS.gold,
  },
  badgeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.goldSubtle,
  },
  badgeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.goldDark,
    letterSpacing: 0.6,
  },
  badgeTagCompany: {
    backgroundColor: 'rgba(59, 10, 17, 0.1)',
  },
  badgeTagCompanyText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  roleDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  bulletsList: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    marginBottom: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletText: {
    fontSize: 12.5,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: COLORS.gold,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
  },
  radioLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  radioLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  continueBtn: {
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  loginLink: {
    fontSize: 13,
    color: COLORS.goldLight,
    fontWeight: '700',
  },
});

export default RegisterRoleScreen;

