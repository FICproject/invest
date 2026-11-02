import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import {
  User,
  Mail,
  Shield,
  Phone,
  Calendar,
  LogOut,
  CheckCircle2,
  Lock,
  Building2,
  Briefcase
} from '../components/Icons';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ onOpenSidebar, setActiveTab }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of the Admin Console?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout }
    ]);
  };

  const adminName = user?.name || 'System Administrator';
  const adminEmail = user?.email || 'admin@connectinvest.in';
  const adminRole = (user?.role || 'System Administrator').toUpperCase();
  const adminStatus = user?.status || 'Active';

  return (
    <View style={styles.container}>
      <Header title="Admin Profile" onOpenSidebar={onOpenSidebar} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Identity Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {adminName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.nameText}>{adminName}</Text>
          <Text style={styles.emailText}>{adminEmail}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Shield size={12} color="#0047BA" />
              <Text style={styles.roleBadgeText}>{adminRole}</Text>
            </View>
            <View style={styles.activeBadge}>
              <CheckCircle2 size={12} color="#16A34A" />
              <Text style={styles.activeBadgeText}>{adminStatus}</Text>
            </View>
          </View>
        </View>

        {/* Security & Access Level */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account & Permissions</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Mail size={16} color="#64748B" />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>Primary Email</Text>
              <Text style={styles.infoValue}>{adminEmail}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Shield size={16} color="#64748B" />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>Access Role</Text>
              <Text style={styles.infoValue}>Platform Administrator (Superuser)</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Lock size={16} color="#64748B" />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>Authentication Mode</Text>
              <Text style={styles.infoValue}>JWT Session • Encrypted Local Vault</Text>
            </View>
          </View>
        </View>

        {/* System Scope */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Administrative Scope</Text>

          <View style={styles.scopeRow}>
            <CheckCircle2 size={15} color="#16A34A" />
            <Text style={styles.scopeText}>KYC & KYB Verifications & Onboarding</Text>
          </View>

          <View style={styles.scopeRow}>
            <CheckCircle2 size={15} color="#16A34A" />
            <Text style={styles.scopeText}>Investment Offer Creation & Publishing</Text>
          </View>

          <View style={styles.scopeRow}>
            <CheckCircle2 size={15} color="#16A34A" />
            <Text style={styles.scopeText}>Escrow Releases & Investor Payouts</Text>
          </View>

          <View style={styles.scopeRow}>
            <CheckCircle2 size={15} color="#16A34A" />
            <Text style={styles.scopeText}>Audit Logging & Compliance Enforcement</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Sign Out from Console</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0047BA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800'
  },
  nameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3
  },
  emailText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0047BA'
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7'
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A'
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0047BA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  infoTextBox: {
    flex: 1
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600'
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1
  },
  scopeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8
  },
  scopeText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600'
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626'
  }
});

