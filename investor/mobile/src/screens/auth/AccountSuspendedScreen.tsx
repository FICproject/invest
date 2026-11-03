import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import Icon from '../../components/common/Icon';
import CustomButton from '../../components/common/CustomButton';
import { useAuthContext } from '../../context/authContext';
import { initMobileRealTimeSync } from '../../services/realTimeSync';

export const AccountSuspendedScreen = () => {
  const { user, logout, refreshUser } = useAuthContext();
  const [checking, setChecking] = useState<boolean>(false);

  const accountStatus = user?.accountStatus || 'Suspended';
  const isRevoked = accountStatus === 'Revoked';
  const reason = user?.accountSuspendedReason || 'Account suspended pending administrative compliance review.';

  // Real-time listener for account reactivation or status updates
  useEffect(() => {
    const cleanup = initMobileRealTimeSync(event => {
      if (
        event?.type === 'DATA_SYNC' &&
        (event.entity === 'ACCOUNT_STATUS_CHANGED' || event.entity === 'FUNDING_STATUS_CHANGED')
      ) {
        const payload = event.payload || {};
        const currentId = user?.id || user?._id;
        if (!currentId || String(payload.userId) === String(currentId) || String(payload.id) === String(currentId)) {
          console.log('[Mobile AccountSuspended] Real-time event received:', payload);
          refreshUser();
        }
      }
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [user, refreshUser]);

  const handleRefresh = async () => {
    try {
      setChecking(true);
      await refreshUser();
    } catch (err) {
      console.warn('Failed to refresh user:', err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>CI</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>CONNECT INVEST</Text>
            <Text style={styles.brandSub}>Compliance & Governance</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Icon name="log-out" size={16} color="#F87171" />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Hero Card */}
        <View style={styles.card}>
          <View style={[styles.iconCircle, isRevoked ? styles.iconCircleRevoked : styles.iconCircleSuspended]}>
            <Icon
              name={isRevoked ? 'x-circle' : 'alert-triangle'}
              size={36}
              color={isRevoked ? '#EF4444' : '#F59E0B'}
            />
          </View>

          <View style={[styles.statusPill, isRevoked ? styles.pillRevoked : styles.pillSuspended]}>
            <Text style={styles.statusPillText}>
              ACCOUNT {accountStatus.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.title}>
            {isRevoked ? 'Account Access Revoked' : 'Account Temporarily Suspended'}
          </Text>
          <Text style={styles.subtitle}>
            Your {user?.role === 'company_admin' || user?.role === 'company_member' ? 'corporate' : 'investor'} account on Connect Invest has been {accountStatus.toLowerCase()} by Platform Administration.
          </Text>

          {/* Reason Box */}
          <View style={styles.reasonCard}>
            <View style={styles.reasonHeader}>
              <Icon name="shield" size={14} color="#EF4444" />
              <Text style={styles.reasonLabel}>Administrative Reason</Text>
            </View>
            <Text style={styles.reasonText}>"{reason}"</Text>
          </View>

          {/* Grievance Assistance Info */}
          <View style={styles.helpBox}>
            <Text style={styles.helpTitle}>Have Questions or Need Assistance?</Text>
            <Text style={styles.helpDesc}>
              Contact our platform compliance officers to address this matter or request account reactivation.
            </Text>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL('mailto:compliance@connectinvest.in')}
            >
              <Icon name="mail" size={14} color={COLORS.primaryLight} />
              <Text style={styles.contactText}>compliance@connectinvest.in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL('tel:+9118005728899')}
            >
              <Icon name="phone" size={14} color={COLORS.primaryLight} />
              <Text style={styles.contactText}>+91 1800 572 8899 (Toll Free)</Text>
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <CustomButton
              title={checking ? 'Checking Status...' : 'Check Status Again'}
              onPress={handleRefresh}
              variant="outline"
              loading={checking}
              style={styles.checkBtn}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  logoBadgeText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 14
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5
  },
  brandSub: {
    fontSize: 10,
    color: '#94A3B8'
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)'
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F87171'
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center'
  },
  card: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    ...SHADOWS.md
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  iconCircleSuspended: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)'
  },
  iconCircleRevoked: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)'
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 12
  },
  pillSuspended: {
    backgroundColor: '#F59E0B'
  },
  pillRevoked: {
    backgroundColor: '#EF4444'
  },
  statusPillText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20
  },
  reasonCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 18
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  reasonText: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18
  },
  helpBox: {
    width: '100%',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    marginBottom: 20
  },
  helpTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#93C5FD',
    marginBottom: 4
  },
  helpDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 8
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  contactText: {
    fontSize: 12,
    color: '#60A5FA',
    fontWeight: '600'
  },
  actionRow: {
    width: '100%'
  },
  checkBtn: {
    width: '100%'
  }
});

export default AccountSuspendedScreen;

