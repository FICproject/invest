import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import {
  Bell,
  RefreshCw,
  ChevronRight,
  LogOut,
  User,
  Shield,
  Menu,
  X
} from './Icons';
import { useAuth } from '../context/AuthContext';
import { ForgeIndiaBrandHeader } from './ForgeIndiaLogo';

export default function Header({
  title = 'Dashboard',
  onOpenSidebar,
  onRefresh,
  refreshing = false
}) {
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    setShowProfileModal(false);
    Alert.alert('Sign Out', 'Are you sure you want to log out of the Admin Console?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <View style={styles.headerRoot}>
      {/* Top Navbar Row */}
      <View style={styles.topRow}>
        {/* Left: Hamburger Menu + Brand Logo & Wordmark matching Website */}
        <View style={styles.leftBrandGroup}>
          {onOpenSidebar && (
            <TouchableOpacity
              onPress={onOpenSidebar}
              style={styles.hamburgerBtn}
              activeOpacity={0.7}
            >
              <Menu size={20} color="#0047BA" />
            </TouchableOpacity>
          )}
          <ForgeIndiaBrandHeader size={34} />
        </View>

        {/* Right Controls matching Website Screenshot */}
        <View style={styles.rightControls}>
          {/* Bell with Red Badge '3' */}
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
            <Bell size={18} color="#1D4ED8" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>

          {/* Admin Avatar Pill */}
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => setShowProfileModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <User size={16} color="#FFFFFF" />
            </View>
            <View style={styles.profileTextCol}>
              <Text style={styles.adminName}>Admin</Text>
              <Text style={styles.adminRole}>System Administrator</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Breadcrumb Sub-bar: Portal > [Current Page] */}
      <View style={styles.breadcrumbRow}>
        <Text style={styles.breadcrumbPortal}>Portal</Text>
        <ChevronRight size={13} color="#CBD5E1" style={{ marginHorizontal: 4 }} />
        <Text style={styles.breadcrumbActive}>{title}</Text>
      </View>

      {/* Profile / Logout Modal */}
      <Modal visible={showProfileModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalUserRow}>
                <View style={styles.modalAvatar}>
                  <User size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.modalUserName}>System Admin</Text>
                  <Text style={styles.modalUserEmail}>{user?.email || 'admin@connectinvest.com'}</Text>
                  <View style={styles.roleTag}>
                    <Shield size={11} color="#0047BA" />
                    <Text style={styles.roleTagText}>SUPER ADMINISTRATOR</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowProfileModal(false)} style={styles.closeBtn}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            <TouchableOpacity style={styles.logoutRow} onPress={handleLogout} activeOpacity={0.7}>
              <LogOut size={18} color="#EF4444" />
              <Text style={styles.logoutText}>Sign Out from Console</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRoot: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  leftBrandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  circleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bellBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6
  },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0047BA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileTextCol: {
    display: 'none' // Hidden on ultra-compact mobile; displayed inside profile modal
  },
  adminName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A'
  },
  adminRole: {
    fontSize: 9,
    fontWeight: '500',
    color: '#64748B'
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  breadcrumbPortal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8'
  },
  breadcrumbActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 54,
    paddingRight: 16
  },
  modalCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  modalUserRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  },
  modalAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0047BA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalUserName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A'
  },
  modalUserEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    gap: 4
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0047BA'
  },
  closeBtn: {
    padding: 4
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2'
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444'
  }
});
