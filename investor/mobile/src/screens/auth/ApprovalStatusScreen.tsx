import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import Icon from '../../components/common/Icon';
import CustomButton from '../../components/common/CustomButton';
import { useAuthContext } from '../../context/authContext';
import { initMobileRealTimeSync } from '../../services/realTimeSync';

export const ApprovalStatusScreen = () => {
  const { user, logout, refreshUser } = useAuthContext();
  const [checking, setChecking] = useState<boolean>(false);

  const registrationStatus = user?.registrationStatus || 'Pending Approval';
  const rejectionReason = user?.rejectionReason || user?.adminRemarks || '';

  // Real-time listener for decisions
  useEffect(() => {
    const cleanup = initMobileRealTimeSync(event => {
      if (
        event?.type === 'DATA_SYNC' &&
        event.entity === 'REGISTRATION_DECISION'
      ) {
        const payload = event.payload || {};
        const currentId = user?.id || user?._id;
        if (String(payload.userId) === String(currentId) || String(payload.id) === String(currentId)) {
          console.log('[Mobile ApprovalStatus] Real-time decision event received:', payload);
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

  const isCompany =
    user?.role === 'company_admin' || user?.role === 'company_member' || !!user?.companyId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>CI</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>CONNECT INVEST</Text>
            <Text style={styles.brandSub}>Compliance Verification</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
          <Icon name="log-out" size={16} color={COLORS.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Status Card */}
        <View style={styles.card}>
          {/* Status Badge Icon */}
          {registrationStatus === 'Approved' ? (
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
              <Icon name="check-circle" size={42} color={COLORS.success} />
            </View>
          ) : registrationStatus === 'Rejected' ? (
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Icon name="x-circle" size={42} color={COLORS.danger} />
            </View>
          ) : registrationStatus === 'Resubmission Required' ? (
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Icon name="alert-triangle" size={42} color={COLORS.goldDark} />
            </View>
          ) : (
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(0, 71, 186, 0.15)' }]}>
              <Icon name="clock" size={42} color={COLORS.primary} />
            </View>
          )}

          {/* Heading */}
          <Text style={styles.statusTitle}>
            {registrationStatus === 'Approved'
              ? 'Registration Approved!'
              : registrationStatus === 'Rejected'
              ? 'Application Ineligible'
              : registrationStatus === 'Resubmission Required'
              ? 'Updates Required'
              : 'Under Compliance Review'}
          </Text>

          <Text style={styles.statusDescription}>
            {registrationStatus === 'Approved'
              ? 'Your account has been fully verified. You can now access investment opportunities and manage your portfolio.'
              : registrationStatus === 'Rejected'
              ? 'Your application could not be verified by compliance.'
              : registrationStatus === 'Resubmission Required'
              ? 'Our compliance team reviewed your submission and requested updates to your details or document uploads.'
              : `Thank you for registering! Your ${isCompany ? 'corporate entity' : 'investor'} details and documents are currently awaiting admin review.`}
          </Text>

          {/* Rejection / Remarks Box */}
          {rejectionReason ? (
            <View
              style={[
                styles.remarksBox,
                {
                  borderColor:
                    registrationStatus === 'Rejected' ? COLORS.danger : COLORS.goldDark,
                  backgroundColor:
                    registrationStatus === 'Rejected'
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(245, 158, 11, 0.1)'
                }
              ]}
            >
              <Text
                style={[
                  styles.remarksHeader,
                  {
                    color:
                      registrationStatus === 'Rejected' ? COLORS.danger : COLORS.goldDark
                  }
                ]}
              >
                Compliance Officer Remarks:
              </Text>
              <Text style={styles.remarksText}>{rejectionReason}</Text>
            </View>
          ) : null}

          {/* Details Summary */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryHeader}>Submitted Details</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Applicant:</Text>
              <Text style={styles.summaryValue}>{user?.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Email:</Text>
              <Text style={styles.summaryValue}>{user?.email}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mobile:</Text>
              <Text style={styles.summaryValue}>{user?.mobile || 'N/A'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Role:</Text>
              <Text style={styles.summaryValue}>
                {isCompany ? 'Corporate Representative' : 'Investor'}
              </Text>
            </View>
          </View>

          {/* Live Sync Banner */}
          <View style={styles.liveBanner}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>
              Real-time approval sync active. This screen will auto-refresh the moment an Admin verifies your account.
            </Text>
          </View>

          {/* Refresh Action Button */}
          <CustomButton
            title={checking ? 'Checking Status...' : 'Check Status Now'}
            onPress={handleRefresh}
            variant="gold"
            size="md"
            loading={checking}
            style={styles.refreshBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoBadgeText: {
    fontWeight: '800',
    fontSize: 14,
    color: COLORS.primaryDark
  },
  brandTitle: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: -0.2
  },
  brandSub: {
    color: COLORS.textMuted,
    fontSize: 10
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  signOutText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600'
  },
  content: {
    padding: SPACING.lg,
    flexGrow: 1,
    justifyContent: 'center'
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.md
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8
  },
  statusDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: SPACING.lg
  },
  remarksBox: {
    width: '100%',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.lg
  },
  remarksHeader: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  remarksText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18
  },
  summaryBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: SPACING.md,
    marginBottom: SPACING.lg
  },
  summaryHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: 13
  },
  summaryValue: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600'
  },
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.lg
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981'
  },
  liveText: {
    flex: 1,
    color: '#A7F3D0',
    fontSize: 11,
    lineHeight: 15
  },
  refreshBtn: {
    width: '100%'
  }
});

