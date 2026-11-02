import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import Icon, { IconName } from './Icon';
import { useAuthContext } from '../../context/authContext';

interface CompanySidebarProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (routeKey: string) => void;
  activeRoute?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: IconName;
}

// Exactly 1:1 identical to website menuItems in Sidebar.tsx:
// 1. Dashboard
// 2. Request
// 3. Financial Reports
// 4. Returns and Dividends
// 5. Transactions
// 6. Documents & Compliance
// 7. Notifications
// 8. Settings
const WEBSITE_MENU_ITEMS: MenuItem[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'Request', label: 'Request', icon: 'briefcase' },
  { id: 'FinancialReports', label: 'Financial Reports', icon: 'file-text' },
  { id: 'ReturnsAndDividends', label: 'Returns and Dividends', icon: 'trending-up' },
  { id: 'Transactions', label: 'Transactions', icon: 'wallet' },
  { id: 'DocumentsAndCompliance', label: 'Documents & Compliance', icon: 'shield' },
  { id: 'Notifications', label: 'Notifications', icon: 'bell' },
  { id: 'Settings', label: 'Settings', icon: 'settings' },
];

export const CompanySidebarDrawer: React.FC<CompanySidebarProps> = ({
  visible,
  onClose,
  onNavigate,
  activeRoute = 'Dashboard',
}) => {
  const { logout } = useAuthContext();

  const handleSignOut = () => {
    onClose();
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* 1:1 Left Drawer matching website */}
        <SafeAreaView style={styles.drawerContainer} edges={['top', 'bottom', 'left']}>
          {/* Header matching Website Sidebar */}
          <View style={styles.drawerHeader}>
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <Icon name="layers" size={20} color="#DE8E0A" />
              </View>
              <View>
                <Text style={styles.brandTitle}>
                  Connect<Text style={{ color: '#DE8E0A' }}>Invest</Text>
                </Text>
                <Text style={styles.brandSubtitle}>COMPANY PORTAL</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Navigation list matching website exactly */}
          <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
            <View style={{ height: 10 }} />
            {WEBSITE_MENU_ITEMS.map((item) => {
              const isActive = activeRoute === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={item.icon}
                    size={18}
                    color={isActive ? '#1F2421' : '#556171'}
                  />
                  <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Logout Action matching website footer */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
              <Icon name="log-out" size={17} color="#556171" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  drawerContainer: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#EFE8D8',
    height: '100%',
    ...SHADOWS.lg,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EBD9',
    backgroundColor: 'rgba(255, 249, 237, 0.6)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF9ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2421',
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B37400',
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 6,
  },
  menuList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: '#F4B41A',
    ...SHADOWS.sm,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#556171',
    marginLeft: 12,
  },
  menuTextActive: {
    color: '#1F2421',
    fontWeight: '700',
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2EBD9',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#556171',
    marginLeft: 8,
  },
});

export default CompanySidebarDrawer;
