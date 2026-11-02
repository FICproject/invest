import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import { ROUTES } from '../../constants/routes';
import Icon from '../../components/common/Icon';
import Badge from '../../components/common/Badge';
import { useAuthContext } from '../../context/authContext';
import { maskMobile } from '../../utils/formatters';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, kycStatus, logout } = useAuthContext();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Connect Invest?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const menuItems = [
    {
      title: 'Personal & Contact Details',
      subtitle: 'View and update investor profile info',
      icon: 'user' as const,
      route: ROUTES.EDIT_PROFILE,
    },
    {
      title: 'Disbursement Bank Accounts',
      subtitle: 'Bank accounts configured for return payouts',
      icon: 'building' as const,
      route: ROUTES.BANK_ACCOUNTS,
    },
    {
      title: 'KYC & Regulatory Compliance',
      subtitle: `Status: ${kycStatus.replace('_', ' ')}`,
      icon: 'shield' as const,
      route: ROUTES.KYC_STATUS,
    },
    {
      title: 'Security, PIN & Biometrics',
      subtitle: 'Fingerprint unlock and session security',
      icon: 'fingerprint' as const,
      route: ROUTES.SECURITY_SETTINGS,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Investor Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'IN'}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || 'Investor'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.mobile}>{maskMobile(user?.mobile)}</Text>
          </View>

          <Badge
            label={kycStatus === 'APPROVED' ? 'Verified' : kycStatus.replace('_', ' ')}
            variant={kycStatus === 'APPROVED' ? 'success' : 'gold'}
            size="sm"
          />
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.menuItem,
                idx !== menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.menuIconBox}>
                <Icon name={item.icon} size={20} color={COLORS.primary} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSub}>{item.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="log-out" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>
          Connect Invest Mobile v1.0.0 (Build 2026.10) • Android
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.gold,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  mobile: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  menuSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
  versionText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default ProfileScreen;
