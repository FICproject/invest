import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { ROUTES } from '../../constants/routes';
import Icon, { IconName } from '../common/Icon';
import { useAuthContext } from '../../context/authContext';

interface SidebarDrawerProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  currentRoute?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: IconName;
  route: string;
  badge?: number | string;
}

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.78, 310);

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  visible,
  onClose,
  navigation,
  currentRoute = 'Dashboard',
}) => {
  const { user, logout } = useAuthContext();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: ROUTES.TAB_HOME,
    },
    {
      id: 'investments',
      label: 'My Investments',
      icon: 'briefcase',
      route: ROUTES.TAB_PORTFOLIO,
    },
    {
      id: 'portfolio',
      label: 'Portfolio & Returns',
      icon: 'trending-up',
      route: ROUTES.TAB_PORTFOLIO,
    },
    {
      id: 'transactions',
      label: 'Transactions & Payments',
      icon: 'credit-card',
      route: ROUTES.TAB_WALLET,
    },
    {
      id: 'statements',
      label: 'Statements & Report',
      icon: 'file-text',
      route: ROUTES.TAB_PORTFOLIO,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'bell',
      route: ROUTES.NOTIFICATIONS,
      badge: 3,
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: 'help-circle',
      route: ROUTES.TAB_PROFILE,
    },
    {
      id: 'profile',
      label: 'Profile & Settings',
      icon: 'settings',
      route: ROUTES.TAB_PROFILE,
    },
  ];

  const handleNavigate = (item: MenuItem) => {
    onClose();
    if (navigation && item.route) {
      navigation.navigate(item.route);
    }
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop touchable to close */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Sidebar Drawer Panel */}
        <SafeAreaView style={styles.drawerContainer}>
          <View style={styles.drawerInner}>
            {/* Brand Header */}
            <View style={styles.brandHeader}>
              <View style={styles.brandRow}>
                <View style={styles.logoBadge}>
                  <Text style={styles.logoBadgeText}>CI</Text>
                </View>
                <Text style={styles.brandTitle}>Connect Invest</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* User Profile Mini Banner */}
            <View style={styles.userBanner}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {(user?.name || 'I')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name || 'Investor'}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user?.email || 'investor@connectinvest.com'}
                </Text>
              </View>
            </View>

            {/* Navigation Menu List */}
            <ScrollView
              style={styles.menuScroll}
              contentContainerStyle={styles.menuContent}
              showsVerticalScrollIndicator={false}
            >
              {menuItems.map((item) => {
                const isActive =
                  item.label.toLowerCase() === currentRoute.toLowerCase() ||
                  (item.id === 'dashboard' && currentRoute === 'Home');

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.menuItem, isActive && styles.menuItemActive]}
                    onPress={() => handleNavigate(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <Icon
                        name={item.icon}
                        size={20}
                        color={isActive ? COLORS.goldLight : '#C5A880'}
                      />
                      <Text
                        style={[
                          styles.menuItemText,
                          isActive && styles.menuItemTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>

                    {item.badge ? (
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Bottom Logout Button */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Icon name="log-out" size={20} color="#FF6B6B" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#1E0505', // Deep rich wine burgundy matching website sidebar
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  drawerInner: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 8,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.gold,
  },
  logoBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E0505',
    letterSpacing: 0.5,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    padding: 12,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E0505',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  userEmail: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: 'rgba(200, 150, 62, 0.12)',
    borderColor: COLORS.gold,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemText: {
    fontSize: 14,
    color: '#E8D5C4',
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  badgeContainer: {
    backgroundColor: '#E53E3E',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B6B',
  },
});

export default SidebarDrawer;
