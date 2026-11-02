import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Filter,
  X,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle
} from '../components/Icons';
import Header from '../components/Header';
import { adminApi, formatINR } from '../services/api';

export default function InvestorsScreen({ setActiveTab, onOpenSidebar }) {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, VERIFIED, PENDING, REJECTED

  // Investor Detail Modal
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInvestors = async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.getInvestors();
      if (res.data.success) {
        setInvestors(res.data.investors || []);
      }
    } catch (err) {
      console.log('Fetch investors error:', err.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  const handleToggleBlock = async investor => {
    const isBlocked = investor.userId?.status === 'blocked';
    const newStatus = isBlocked ? 'active' : 'blocked';
    const actionLabel = isBlocked ? 'Unblock' : 'Block';
    const investorName = investor.userId?.name || investor.legalName || 'Investor';
    const targetUserId = investor.userId?._id || investor.userId;

    if (!targetUserId) {
      Alert.alert('Error', 'Unable to resolve user ID for this investor profile.');
      return;
    }

    Alert.alert(
      `${actionLabel} Investor`,
      `Are you sure you want to ${actionLabel.toLowerCase()} ${investorName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabel,
          style: isBlocked ? 'default' : 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await adminApi.setUserBlockStatus(targetUserId, {
                status: newStatus,
                reason: isBlocked ? 'Admin unblocked' : 'Compliance hold'
              });
              Alert.alert('Success', `Investor has been ${newStatus}.`);
              setSelectedInvestor(null);
              fetchInvestors();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || err.message);
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  // Filtered investors
  const filteredInvestors = investors.filter(inv => {
    const name = inv.userId?.name || inv.legalName || '';
    const email = inv.userId?.email || '';
    const mobile = inv.userId?.mobile || '';
    const pan = inv.pan || '';

    const matchesSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      mobile.includes(search) ||
      pan.toLowerCase().includes(search.toLowerCase());

    const kyc = (inv.kycStatus || 'Submitted').trim();
    let matchesStatus = true;
    if (statusFilter === 'VERIFIED') {
      matchesStatus = kyc.toLowerCase() === 'approved' || kyc.toLowerCase() === 'verified';
    } else if (statusFilter === 'PENDING') {
      matchesStatus =
        kyc.toLowerCase() === 'submitted' ||
        kyc.toLowerCase() === 'pending' ||
        kyc.toLowerCase() === 'more info needed';
    } else if (statusFilter === 'REJECTED') {
      matchesStatus = kyc.toLowerCase() === 'rejected';
    }

    return matchesSearch && matchesStatus;
  });

  const verifiedCount = investors.filter(i => {
    const k = (i.kycStatus || '').toLowerCase();
    return k === 'approved' || k === 'verified';
  }).length;

  const pendingCount = investors.filter(i => {
    const k = (i.kycStatus || '').toLowerCase();
    return k === 'submitted' || k === 'pending' || k === 'more info needed';
  }).length;

  return (
    <View style={styles.container}>
      <Header
        title="Investors"
        onOpenSidebar={onOpenSidebar}
        onRefresh={fetchInvestors}
        refreshing={refreshing}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchInvestors} colors={['#0047BA']} />
        }
      >
        {/* Title Bar */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Investor Management</Text>
          <Text style={styles.pageSubtitle}>
            Registered retail & accredited profiles • KYC compliance
          </Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statMiniCard}>
            <Text style={styles.statNum}>{investors.length}</Text>
            <Text style={styles.statLabel}>Total Investors</Text>
          </View>
          <View style={[styles.statMiniCard, { borderColor: '#BBF7D0' }]}>
            <Text style={[styles.statNum, { color: '#16A34A' }]}>{verifiedCount}</Text>
            <Text style={styles.statLabel}>KYC Verified</Text>
          </View>
          <View style={[styles.statMiniCard, { borderColor: '#FED7AA' }]}>
            <Text style={[styles.statNum, { color: '#EA580C' }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending Review</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or mobile..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {['ALL', 'VERIFIED', 'PENDING', 'REJECTED'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
              onPress={() => setStatusFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, statusFilter === f && styles.filterChipTextActive]}>
                {f === 'ALL' ? 'All Profiles' : f === 'VERIFIED' ? 'Approved' : f === 'PENDING' ? 'Pending' : 'Rejected'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Investor Cards List */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0047BA" />
            <Text style={styles.loadingText}>Loading investor profiles...</Text>
          </View>
        ) : filteredInvestors.length === 0 ? (
          <View style={styles.emptyCard}>
            <Users size={36} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Investors Found</Text>
            <Text style={styles.emptySubtitle}>
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or filter.'
                : 'No investors have registered on the platform yet.'}
            </Text>
          </View>
        ) : (
          filteredInvestors.map((inv, idx) => {
            const name = inv.userId?.name || inv.legalName || 'Investor';
            const email = inv.userId?.email || 'No email';
            const mobile = inv.userId?.mobile || inv.mobile || '—';
            const pan = inv.pan || '—';
            const investedPaise = inv.investmentsTotalPaise || inv.totalInvestedPaise || 0;
            const kyc = inv.kycStatus || 'Submitted';
            const kycLower = kyc.toLowerCase();
            const isVerified = kycLower === 'approved' || kycLower === 'verified';
            const isPending = kycLower === 'submitted' || kycLower === 'pending' || kycLower === 'more info needed';
            const isRejected = kycLower === 'rejected';
            const isBlocked = inv.userId?.status === 'blocked' || inv.status === 'blocked';

            return (
              <TouchableOpacity
                key={inv._id || inv.id}
                style={styles.investorCard}
                onPress={() => setSelectedInvestor(inv)}
                activeOpacity={0.7}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.nameGroup}>
                    <View style={styles.serialPill}>
                      <Text style={styles.serialPillText}>#{idx + 1}</Text>
                    </View>
                    <View
                      style={[
                        styles.avatarCircle,
                        { backgroundColor: isBlocked ? '#F1F5F9' : '#EFF6FF' }
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarLetter,
                          { color: isBlocked ? '#94A3B8' : '#0047BA' }
                        ]}
                      >
                        {name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={styles.investorName}>
                          {name}
                        </Text>
                        {isBlocked && (
                          <View style={styles.blockedBadge}>
                            <Text style={styles.blockedBadgeText}>Blocked</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.investorEmail} numberOfLines={1}>{email}</Text>
                    </View>
                  </View>

                  {/* KYC Badge */}
                  <View
                    style={[
                      styles.kycBadge,
                      isVerified && styles.kycBadgeVerified,
                      isPending && styles.kycBadgePending,
                      isRejected && styles.kycBadgeRejected
                    ]}
                  >
                    <Text
                      style={[
                        styles.kycBadgeText,
                        isVerified && styles.kycBadgeTextVerified,
                        isPending && styles.kycBadgeTextPending,
                        isRejected && styles.kycBadgeTextRejected
                      ]}
                    >
                      {kyc}
                    </Text>
                  </View>
                </View>

                {/* Info Pills Row */}
                <View style={styles.infoRow}>
                  <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoVal}>{mobile}</Text>
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>PAN Card</Text>
                    <Text style={[styles.infoVal, { fontFamily: 'monospace' }]}>{pan}</Text>
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Total Invested</Text>
                    <Text style={[styles.infoVal, { fontWeight: '800', color: '#0047BA' }]}>
                      {formatINR(investedPaise)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Investor Details Modal */}
      <Modal visible={!!selectedInvestor} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={[styles.avatarCircle, { backgroundColor: '#EFF6FF' }]}>
                  <Text style={[styles.avatarLetter, { color: '#0047BA' }]}>
                    {(selectedInvestor?.userId?.name || selectedInvestor?.legalName || 'I')
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>
                    {selectedInvestor?.userId?.name || selectedInvestor?.legalName || 'Investor'}
                  </Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    {selectedInvestor?.userId?.email || 'N/A'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedInvestor(null)}
                style={styles.closeBtn}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionHeader}>Profile & Compliance</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>KYC Status</Text>
                  <Text style={[styles.detailValue, { fontWeight: '800' }]}>
                    {selectedInvestor?.kycStatus || 'Submitted'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Status</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: (selectedInvestor?.userId?.status === 'blocked' || selectedInvestor?.status === 'blocked') ? '#DC2626' : '#16A34A' }
                    ]}
                  >
                    {(selectedInvestor?.userId?.status === 'blocked' || selectedInvestor?.status === 'blocked') ? 'BLOCKED' : 'ACTIVE'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Mobile</Text>
                  <Text style={styles.detailValue}>
                    {selectedInvestor?.userId?.mobile || selectedInvestor?.mobile || 'Not provided'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>PAN Number</Text>
                  <Text style={[styles.detailValue, { fontFamily: 'monospace' }]}>
                    {selectedInvestor?.pan || 'Not provided'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total Invested</Text>
                  <Text style={[styles.detailValue, { fontWeight: '800', color: '#0047BA' }]}>
                    {formatINR(selectedInvestor?.investmentsTotalPaise || selectedInvestor?.totalInvestedPaise || 0)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Investments Count</Text>
                  <Text style={styles.detailValue}>
                    {selectedInvestor?.investmentsCount || 0} investments
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionHeader}>Bank & Settlement Details</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bank Name</Text>
                  <Text style={styles.detailValue}>
                    {selectedInvestor?.bankAccount?.bankName || selectedInvestor?.bankDetails?.bankName || 'Not configured'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Number</Text>
                  <Text style={[styles.detailValue, { fontFamily: 'monospace' }]}>
                    {selectedInvestor?.bankAccount?.accountNo || selectedInvestor?.bankDetails?.accountNumber || '—'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>IFSC Code</Text>
                  <Text style={[styles.detailValue, { fontFamily: 'monospace' }]}>
                    {selectedInvestor?.bankAccount?.ifsc || selectedInvestor?.bankDetails?.ifscCode || '—'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bank Verification</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: selectedInvestor?.bankAccount?.verified ? '#16A34A' : '#D97706' }
                  ]}>
                    {selectedInvestor?.bankAccount?.verified ? 'Verified' : 'Unverified'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.blockBtn,
                  (selectedInvestor?.userId?.status === 'blocked' || selectedInvestor?.status === 'blocked') && { backgroundColor: '#16A34A' }
                ]}
                onPress={() => selectedInvestor && handleToggleBlock(selectedInvestor)}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.blockBtnText}>
                    {(selectedInvestor?.userId?.status === 'blocked' || selectedInvestor?.status === 'blocked') ? 'Unblock Investor' : 'Block Investor'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  titleSection: {
    marginBottom: 16
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
  },
  statMiniCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center'
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0047BA'
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A'
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  filterChipActive: {
    backgroundColor: '#0047BA',
    borderColor: '#0047BA'
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B'
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  loadingBox: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 12
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B'
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 32,
    alignItems: 'center',
    marginTop: 10
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16
  },
  investorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  serialPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  serialPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B'
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarLetter: {
    fontSize: 15,
    fontWeight: '800'
  },
  investorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  investorEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  blockedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  blockedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#DC2626'
  },
  kycBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F1F5F9'
  },
  kycBadgeVerified: {
    backgroundColor: '#DCFCE7'
  },
  kycBadgePending: {
    backgroundColor: '#FEF3C7'
  },
  kycBadgeRejected: {
    backgroundColor: '#FEE2E2'
  },
  kycBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B'
  },
  kycBadgeTextVerified: {
    color: '#16A34A'
  },
  kycBadgeTextPending: {
    color: '#D97706'
  },
  kycBadgeTextRejected: {
    color: '#DC2626'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  infoCol: {
    alignItems: 'center'
  },
  infoLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600'
  },
  infoVal: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '600',
    marginTop: 2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A'
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1
  },
  closeBtn: {
    padding: 6
  },
  modalBody: {
    marginBottom: 16
  },
  modalSection: {
    marginBottom: 18
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0047BA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B'
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A'
  },
  modalFooter: {
    paddingTop: 10
  },
  blockBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  blockBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});

