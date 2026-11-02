import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import {
  Wallet,
  Coins,
  Send,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  AlertCircle,
  PlusCircle,
  Check,
  ShieldCheck,
  CheckCheck,
  Info
} from '../components/Icons';
import Header from '../components/Header';
import { adminApi, formatINR } from '../services/api';

export default function PayoutsScreen({ setActiveTab, onOpenSidebar }) {
  const [payouts, setPayouts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('verification'); // 'verification' or 'batches'
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, READY, PAID
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [pRes, bRes] = await Promise.all([
        adminApi.getPayouts().catch(() => ({ data: { payouts: [] } })),
        adminApi.getBatches().catch(() => ({ data: { batches: [] } }))
      ]);

      if (pRes.data?.success || pRes.data?.payouts) {
        setPayouts(pRes.data.payouts || []);
      }
      if (bRes.data?.success || bRes.data?.batches) {
        setBatches(bRes.data.batches || []);
      }
    } catch (err) {
      console.log('Fetch payouts notice:', err.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingVerification = payouts.filter(
    p => (p.status || '').toLowerCase() === 'calculated' || (p.status || '').toLowerCase() === 'failed'
  );
  const readyPayouts = payouts.filter(
    p => (p.status || '').toLowerCase() === 'ready'
  );
  const readyTotalPaise = readyPayouts.reduce(
    (acc, p) => acc + (p.amountPaise || p.amount || 0),
    0
  );
  const pendingTotalPaise = pendingVerification.reduce(
    (acc, p) => acc + (p.amountPaise || p.amount || 0),
    0
  );

  const filteredPayouts = payouts.filter(p => {
    const s = (p.status || '').toLowerCase();
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return s === 'calculated' || s === 'failed';
    if (statusFilter === 'READY') return s === 'ready';
    if (statusFilter === 'PAID') return s === 'paid' || s === 'completed';
    return true;
  });

  // Verify single return
  const handleVerifySingle = async (payoutId, amount) => {
    Alert.alert(
      'Verify Investor Return',
      `Confirm and approve return calculation of ${formatINR(amount)} for release into next bank batch?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify & Approve',
          onPress: async () => {
            try {
              setSubmitting(true);
              const res = await adminApi.verifyPayout(payoutId, { remarks: 'Verified by Mobile Admin' });
              if (res.data?.success) {
                Alert.alert('Verified', `Return of ${formatINR(amount)} approved and marked READY.`);
                fetchData();
              }
            } catch (err) {
              Alert.alert('Verification Failed', err.response?.data?.error || err.message);
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  // Verify all pending returns
  const handleVerifyAll = async () => {
    if (pendingVerification.length === 0) {
      Alert.alert('Notice', 'No returns currently awaiting verification.');
      return;
    }

    Alert.alert(
      'Verify All Returns',
      `Verify and mark all ${pendingVerification.length} calculated returns (${formatINR(pendingTotalPaise)}) as READY for batch creation?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify All',
          onPress: async () => {
            try {
              setSubmitting(true);
              const res = await adminApi.verifyAllPayouts();
              if (res.data?.success) {
                Alert.alert('Success', `All ${pendingVerification.length} returns verified!`);
                fetchData();
              }
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || err.message);
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const handleCreateBatch = async () => {
    if (readyPayouts.length === 0) {
      Alert.alert(
        'No Ready Returns',
        'No return disbursements are currently in READY status. Please verify calculated returns first.'
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminApi.createPayoutBatch();
      if (res.data.success) {
        Alert.alert('Batch Created', `Payout batch created with ${readyPayouts.length} verified returns.`);
        fetchData();
        setActiveSubTab('batches');
      }
    } catch (err) {
      Alert.alert('Batch Failed', err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveBatch = async batchId => {
    Alert.alert(
      'Authorize Bank Batch',
      'Authorize transfer and release payment instructions to escrow settlement gateway?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Authorize & Release',
          onPress: async () => {
            try {
              setSubmitting(true);
              const res = await adminApi.approveAndSendBatch(batchId);
              if (res.data.success) {
                Alert.alert('Dispatched', 'Batch instructions authorized and marked Paid with UTR.');
                fetchData();
              }
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || err.message);
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Returns & Payouts"
        onOpenSidebar={onOpenSidebar}
        onRefresh={fetchData}
        refreshing={refreshing}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} colors={['#0047BA']} />
        }
      >
        {/* Title Bar */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Returns & Payouts</Text>
          <Text style={styles.pageSubtitle}>
            Verify investor returns from company repayments • Authorize bank batches
          </Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsRow}>
          <View style={[styles.statMiniCard, { borderColor: '#FED7AA' }]}>
            <Text style={[styles.statNum, { color: '#D97706' }]}>{pendingVerification.length}</Text>
            <Text style={styles.statLabel}>To Verify</Text>
          </View>
          <View style={[styles.statMiniCard, { borderColor: '#BBF7D0' }]}>
            <Text style={[styles.statNum, { color: '#16A34A' }]}>{readyPayouts.length}</Text>
            <Text style={styles.statLabel}>Verified Ready</Text>
          </View>
          <View style={[styles.statMiniCard, { borderColor: '#E0E7FF' }]}>
            <Text style={[styles.statNum, { color: '#4338CA' }]}>{batches.length}</Text>
            <Text style={styles.statLabel}>Batches</Text>
          </View>
        </View>

        {/* Sub-tab Navigation */}
        <View style={styles.tabSwitchContainer}>
          <TouchableOpacity
            style={[styles.switchTab, activeSubTab === 'verification' && styles.switchTabActive]}
            onPress={() => setActiveSubTab('verification')}
            activeOpacity={0.7}
          >
            <Text style={[styles.switchTabText, activeSubTab === 'verification' && styles.switchTabTextActive]}>
              Verify Returns ({payouts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switchTab, activeSubTab === 'batches' && styles.switchTabActive]}
            onPress={() => setActiveSubTab('batches')}
            activeOpacity={0.7}
          >
            <Text style={[styles.switchTabText, activeSubTab === 'batches' && styles.switchTabTextActive]}>
              Bank Batches ({batches.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* View 1: Return Verification List */}
        {activeSubTab === 'verification' && (
          <>
            {/* Filter Chips */}
            <View style={styles.filterChipRow}>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'PENDING', label: `Pending (${pendingVerification.length})` },
                { id: 'READY', label: `Verified (${readyPayouts.length})` },
                { id: 'PAID', label: 'Paid' }
              ].map(f => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.chip, statusFilter === f.id && styles.chipActive]}
                  onPress={() => setStatusFilter(f.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, statusFilter === f.id && styles.chipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Action Banner */}
            {pendingVerification.length > 0 && (
              <View style={styles.actionBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerTitle}>
                    {pendingVerification.length} Returns Awaiting Verification
                  </Text>
                  <Text style={styles.bannerSub}>
                    Total {formatINR(pendingTotalPaise)} calculated returns
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.verifyAllBtn}
                  onPress={handleVerifyAll}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  <Text style={styles.verifyAllBtnText}>Verify All</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Batch Creation Prompt if items are ready */}
            {readyPayouts.length > 0 && (
              <View style={[styles.actionBanner, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bannerTitle, { color: '#166534' }]}>
                    {readyPayouts.length} Returns Ready for Batch
                  </Text>
                  <Text style={[styles.bannerSub, { color: '#15803D' }]}>
                    Total {formatINR(readyTotalPaise)} verified funds
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.verifyAllBtn, { backgroundColor: '#16A34A' }]}
                  onPress={handleCreateBatch}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  <Text style={styles.verifyAllBtnText}>Create Batch</Text>
                </TouchableOpacity>
              </View>
            )}

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#0047BA" />
                <Text style={styles.loadingText}>Loading investor returns...</Text>
              </View>
            ) : filteredPayouts.length === 0 ? (
              <View style={styles.emptyCard}>
                <Coins size={36} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Returns Found</Text>
                <Text style={styles.emptySubtitle}>
                  Investor return calculations will appear here after company repayment cycles are confirmed.
                </Text>
              </View>
            ) : (
              filteredPayouts.map((p, idx) => {
                const s = (p.status || '').toLowerCase();
                const isPending = s === 'calculated' || s === 'failed';
                const isReady = s === 'ready';
                const isPaid = s === 'paid' || s === 'completed';
                const isInBatch = s === 'in batch' || s === 'approved';

                const investorName = p.investorId?.name || p.investorName || 'Verified Investor';
                const investorEmail = p.investorId?.email || 'N/A';
                const offerTitle = p.offerId?.title || p.offerTitle || 'Project Investment';
                const amount = p.amountPaise || 0;

                return (
                  <View key={p._id || `payout-${idx}`} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <View style={styles.serialPill}>
                            <Text style={styles.serialPillText}>#{idx + 1}</Text>
                          </View>
                          <Text style={styles.investorTitle} numberOfLines={1}>
                            {investorName}
                          </Text>
                        </View>
                        <Text style={styles.investorEmail} numberOfLines={1}>
                          {investorEmail}
                        </Text>
                        <Text style={styles.offerSubtitle} numberOfLines={1}>
                          {offerTitle}
                        </Text>
                      </View>

                      {/* Status Badge */}
                      <View
                        style={[
                          styles.badge,
                          isPending && styles.badgePending,
                          isReady && styles.badgeReady,
                          isPaid && styles.badgeCompleted,
                          isInBatch && styles.badgeInBatch
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            isPending && styles.badgeTextPending,
                            isReady && styles.badgeTextReady,
                            isPaid && styles.badgeTextCompleted,
                            isInBatch && styles.badgeTextInBatch
                          ]}
                        >
                          {isPending ? 'TO VERIFY' : isReady ? 'VERIFIED' : isInBatch ? 'IN BATCH' : 'PAID'}
                        </Text>
                      </View>
                    </View>

                    {/* Amount & Cycle Row */}
                    <View style={styles.infoRow}>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Calculated Return</Text>
                        <Text style={[styles.infoVal, { color: '#0047BA', fontWeight: '800' }]}>
                          {formatINR(amount)}
                        </Text>
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Repayment Status</Text>
                        <Text style={[styles.infoVal, { color: '#16A34A', fontWeight: '700' }]}>
                          Received
                        </Text>
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Bank Reference</Text>
                        <Text style={styles.infoVal}>
                          {p.bankRef ? p.bankRef.slice(-10) : isPending ? 'Pending verify' : 'Queued'}
                        </Text>
                      </View>
                    </View>

                    {/* Verification Action Button */}
                    {isPending && (
                      <TouchableOpacity
                        style={styles.verifyActionBtn}
                        onPress={() => handleVerifySingle(p._id, amount)}
                        disabled={submitting}
                        activeOpacity={0.8}
                      >
                        <ShieldCheck size={16} color="#FFFFFF" />
                        <Text style={styles.verifyActionBtnText}>Verify Return to Investors</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </>
        )}

        {/* View 2: Bank Batches */}
        {activeSubTab === 'batches' && (
          <>
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#0047BA" />
                <Text style={styles.loadingText}>Loading bank batches...</Text>
              </View>
            ) : batches.length === 0 ? (
              <View style={styles.emptyCard}>
                <Layers size={36} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Bank Batches Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Verify calculated investor returns and tap "Create Batch" to prepare disbursement batches.
                </Text>
              </View>
            ) : (
              batches.map((b, idx) => {
                const isPaid = b.status === 'Paid';

                return (
                  <View key={b._id || `batch-${idx}`} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <View style={styles.serialPill}>
                            <Text style={styles.serialPillText}>#{idx + 1}</Text>
                          </View>
                          <Text style={[styles.batchIdText, { flex: 1 }]} numberOfLines={1}>
                            {b._id}
                          </Text>
                        </View>
                        <Text style={styles.offerSubtitle}>
                          {b.payoutCount || 1} Verified Returns Bundled
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.badge,
                          isPaid ? styles.badgeCompleted : styles.badgePending
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            isPaid ? styles.badgeTextCompleted : styles.badgeTextPending
                          ]}
                        >
                          {isPaid ? 'PAID & SETTLED' : 'READY TO SEND'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Total Batch Value</Text>
                        <Text style={[styles.infoVal, { color: '#0047BA', fontWeight: '800' }]}>
                          {formatINR(b.totalPaise || 0)}
                        </Text>
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Reference</Text>
                        <Text style={styles.infoVal}>
                          {b.reference || 'Pending Release'}
                        </Text>
                      </View>
                    </View>

                    {!isPaid && (
                      <TouchableOpacity
                        style={styles.approveBatchBtn}
                        onPress={() => handleApproveBatch(b._id)}
                        disabled={submitting}
                        activeOpacity={0.8}
                      >
                        <Check size={16} color="#FFFFFF" />
                        <Text style={styles.approveBatchBtnText}>Authorize & Release to Gateway</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </>
        )}
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
  tabSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14
  },
  switchTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  switchTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2
  },
  switchTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  switchTabTextActive: {
    color: '#0047BA',
    fontWeight: '800'
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0047BA'
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B'
  },
  chipTextActive: {
    color: '#0047BA',
    fontWeight: '700'
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E'
  },
  bannerSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 1
  },
  verifyAllBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  verifyAllBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  card: {
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
    marginBottom: 10
  },
  investorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  investorEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  offerSubtitle: {
    fontSize: 11,
    color: '#0047BA',
    fontWeight: '600',
    marginTop: 2
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
  batchIdText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'monospace'
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F1F5F9'
  },
  badgePending: {
    backgroundColor: '#FEF3C7'
  },
  badgeReady: {
    backgroundColor: '#DCFCE7'
  },
  badgeCompleted: {
    backgroundColor: '#F0FDF4'
  },
  badgeInBatch: {
    backgroundColor: '#E0E7FF'
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B'
  },
  badgeTextPending: {
    color: '#D97706'
  },
  badgeTextReady: {
    color: '#16A34A'
  },
  badgeTextCompleted: {
    color: '#15803D'
  },
  badgeTextInBatch: {
    color: '#4338CA'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 4
  },
  infoCol: {
    alignItems: 'center',
    flex: 1
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
  verifyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10
  },
  verifyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  approveBatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0047BA',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10
  },
  approveBatchBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
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
  }
});
