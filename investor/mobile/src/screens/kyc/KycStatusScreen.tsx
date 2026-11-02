import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import { ROUTES } from '../../constants/routes';
import Icon from '../../components/common/Icon';
import Badge from '../../components/common/Badge';
import CustomButton from '../../components/common/CustomButton';
import Loader from '../../components/common/Loader';
import { useAuthContext } from '../../context/authContext';
import { kycService } from '../../services/notificationService';
import { KYC, KycStatus } from '../../types';
import { formatDate, maskPan } from '../../utils/formatters';

export const KycStatusScreen = ({ navigation }: any) => {
  const { kycStatus, refreshKycStatus, setKycStatusDirectly } = useAuthContext();
  const [kycData, setKycData] = useState<KYC | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toggling, setToggling] = useState<boolean>(false);

  const fetchKyc = async () => {
    try {
      setLoading(true);
      const res = await kycService.getKycStatus();
      if (res.success && res.data) {
        setKycData(res.data);
      }
    } catch (err) {
      console.error('Failed to get KYC status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKyc();
  }, [kycStatus]);

  const handleDevToggle = async (status: KycStatus) => {
    try {
      setToggling(true);
      const res = await kycService.toggleStatus(status);
      if (res.success && res.data) {
        setKycData(res.data);
        setKycStatusDirectly(res.data.status);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to toggle status');
    } finally {
      setToggling(false);
    }
  };

  const getStatusCard = () => {
    switch (kycStatus) {
      case 'APPROVED':
        return {
          icon: 'check-circle' as const,
          color: COLORS.success,
          bg: COLORS.successBg,
          title: 'KYC Verified & Approved',
          description:
            'Your identity and bank credentials have been approved. You are accredited to execute private investments and receive yield distributions.',
          badge: 'success' as const,
        };
      case 'PENDING':
        return {
          icon: 'alert-circle' as const,
          color: COLORS.warning,
          bg: COLORS.warningBg,
          title: 'Verification In Progress',
          description:
            'Your documents have been submitted and are under automated compliance review. Approvals typically finalize within 2-4 hours.',
          badge: 'warning' as const,
        };
      case 'REJECTED':
        return {
          icon: 'alert-circle' as const,
          color: COLORS.danger,
          bg: COLORS.dangerBg,
          title: 'Document Resubmission Required',
          description:
            kycData?.rejectionReason ||
            'The uploaded document image was unreadable or details mismatched government records. Please re-upload.',
          badge: 'danger' as const,
        };
      case 'NOT_STARTED':
      default:
        return {
          icon: 'shield' as const,
          color: COLORS.gold,
          bg: COLORS.goldSubtle,
          title: 'KYC Not Started',
          description:
            'Regulatory compliance requires identity verification prior to placing investments or collecting maturity distributions.',
          badge: 'gold' as const,
        };
    }
  };

  const statusCard = getStatusCard();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>KYC Compliance</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Banner Card */}
        <View style={[styles.statusBanner, { backgroundColor: statusCard.bg }]}>
          <View style={styles.statusBannerTop}>
            <Icon name={statusCard.icon} size={32} color={statusCard.color} />
            <Badge label={kycStatus.replace('_', ' ')} variant={statusCard.badge} size="sm" />
          </View>
          <Text style={[styles.statusTitle, { color: statusCard.color }]}>
            {statusCard.title}
          </Text>
          <Text style={styles.statusDesc}>{statusCard.description}</Text>
        </View>

        {/* Identity Snapshot */}
        {kycData && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Document Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Full Legal Name</Text>
              <Text style={styles.detailValue}>{kycData.fullName || '—'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>PAN Card Number</Text>
              <Text style={styles.detailValue}>
                {kycData.panNumber ? maskPan(kycData.panNumber) : 'Not Provided'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address Proof</Text>
              <Text style={styles.detailValue}>
                {kycData.addressProofType || 'Aadhaar / Passport'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Submission Date</Text>
              <Text style={styles.detailValue}>
                {kycData.submittedAt ? formatDate(kycData.submittedAt) : 'Pending Submission'}
              </Text>
            </View>
          </View>
        )}

        {/* Upload / Re-submit Button */}
        {kycStatus !== 'APPROVED' ? (
          <CustomButton
            title={kycStatus === 'NOT_STARTED' ? 'Complete KYC Verification' : 'Update / Re-submit KYC'}
            onPress={() => navigation.navigate(ROUTES.KYC_UPLOAD, { kycData })}
            variant="gold"
            size="lg"
            style={styles.actionBtn}
          />
        ) : (
          <CustomButton
            title="Update KYC Records"
            onPress={() => navigation.navigate(ROUTES.KYC_UPLOAD, { kycData })}
            variant="secondary"
            size="md"
            style={styles.actionBtn}
          />
        )}

        {/* Developer Instant Test Switcher */}
        <View style={styles.devBox}>
          <Text style={styles.devTitle}>DEV ENVIRONMENT TEST TOGGLES</Text>
          <Text style={styles.devSub}>
            Instantly switch KYC state to test investment restrictions or approval gates:
          </Text>
          <View style={styles.devButtonsRow}>
            {(['APPROVED', 'PENDING', 'NOT_STARTED', 'REJECTED'] as KycStatus[]).map((st) => (
              <TouchableOpacity
                key={st}
                style={[
                  styles.devBtn,
                  kycStatus === st && styles.devBtnActive,
                ]}
                disabled={toggling}
                onPress={() => handleDevToggle(st)}
              >
                <Text
                  style={[
                    styles.devBtnText,
                    kycStatus === st && styles.devBtnTextActive,
                  ]}
                >
                  {st.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  statusBanner: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  statusBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  statusDesc: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSubtle,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionBtn: {
    marginBottom: 20,
  },
  devBox: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  devTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  devSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
    marginBottom: 10,
  },
  devButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  devBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  devBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  devBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  devBtnTextActive: {
    color: COLORS.white,
  },
});

export default KycStatusScreen;
