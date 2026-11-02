import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import {
  LayoutGrid,
  Users,
  Building2,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Wallet,
  MessageSquare,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  X,
  ChevronRight
} from './Icons';
import { ForgeIndiaBrandHeader } from './ForgeIndiaLogo';
import { useAuth } from '../context/AuthContext';

/**
 * Mobile Sidebar Drawer Component
 * Contains the EXACT navigation items as the Website console:
 * 1. Dashboard
 * 2. Investor Management
 * 3. Company Management
 * 4. Investment Management
 * 5. KYC Management
 * 6. Investments
 * 7. Payments & Transactions
 * 8. Subscriptions
 * 9. Returns & Payouts
 * 10. Queries & Support
 * 11. Notifications
 * 12. Settings
 * Plus Sign Out
 */
export default function SidebarDrawer({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  pendingKycCount = 0
}) {
  const { user, logout } = useAuth();

  // Exact tabs matching frontend/src/components/Sidebar.jsx
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'investors', label: 'Investor Management', icon: Users },
    { id: 'companies', label: 'Company Management', icon: Building2 },
    { id: 'offers', label: 'Investment Management', icon: Briefcase },
    { id: 'kyc', label: 'KYC Management', icon: ShieldCheck, badge: pendingKycCount },
    { id: 'investments_portfolio', label: 'Investments', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'releases', label: 'Payments & Transactions', icon: CreditCard },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'payouts', label: 'Returns & Payouts', icon: Wallet },
    { id: 'queries', label: 'Queries & Support', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: 3, badgeColor: '#FAB800' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  const handleSelect = id => {
    onClose();
    // Maps 'kyc' to 'worklist' screen if using worklist component
    setActiveTab(id === 'kyc' ? 'worklist' : id);
  };

  const handleLogout = () => {
    onClose();
    Alert.alert('Sign Out', 'Are you sure you want to log out of the Admin Console?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Sidebar Panel positioned at LEFT */}
        <View style={styles.sidebar}>
          {/* Header with Forge Brand and Close */}
          <View style={styles.brandHeader}>
            <ForgeIndiaBrandHeader size={36} />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* User Info Strip */}
          <View style={styles.userStrip}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </Text>
            </View>
            <View style={styles.userTextCol}>
              <Text style={styles.userName}>{user?.name || 'Administrator'}</Text>
              <Text style={styles.userRole}>System Admin Console</Text>
            </View>
          </View>

          {/* Nav Items List */}
          <ScrollView
            style={styles.navScroll}
            contentContainerStyle={styles.navContainer}
            showsVerticalScrollIndicator={false}
          >
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id || (item.id === 'kyc' && activeTab === 'worklist');

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => handleSelect(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.navItemLeft}>
                    <Icon
                      size={19}
                      color={isActive ? '#FFFFFF' : '#64748B'}
                    />
                    <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                      {item.label}
                    </Text>
                  </View>

                  {item.badge && item.badge > 0 ? (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: item.badgeColor || '#EF4444' }
                      ]}
                    >
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sign Out Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LogOut size={18} color="#DC2626" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Backdrop dismiss (at right side) */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.55)'
  },
  backdrop: {
    flex: 1
  },
  sidebar: {
    width: 290,
    backgroundColor: '#FFFFFF',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 16
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9'
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC'
  },
  userStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0047BA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16
  },
  userTextCol: {
    flex: 1
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A'
  },
  userRole: {
    fontSize: 11,
    color: '#64748B'
  },
  navScroll: {
    flex: 1
  },
  navContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'transparent'
  },
  navItemActive: {
    backgroundColor: '#0047BA'
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569'
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderColor: '#F1F5F9'
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626'
  }
});

