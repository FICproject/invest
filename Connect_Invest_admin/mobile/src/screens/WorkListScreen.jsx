import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import {
  ShieldCheck,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X
} from '../components/Icons';
import Header from '../components/Header';
import { adminApi } from '../services/api';
import { initMobileRealTimeSync } from '../services/realTimeSync';

export default function WorkListScreen({ onOpenSidebar }) {
  const [workList, setWorkList] = useState({ pendingKyc: [], pendingKyb: [], submittedOffers: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveFilter] = useState('kyc'); // 'kyc' or 'kyb'

  // Decision Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [decisionType, setDecisionType] = useState('Approved'); // 'Approved' | 'Rejected' | 'More info needed'
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkList = async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.getWorkList();
      if (res.data.success) {
        setWorkList({
          pendingKyc: res.data.pendingKyc || [],
          pendingKyb: res.data.pendingKyb || [],
          submittedOffers: res.data.submittedOffers || []
        });
      }
    } catch (err) {
      console.warn('WorkList fetch notice:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkList();

    const unsubscribe = initMobileRealTimeSync((event) => {
      console.log('[Mobile WorkList Real-Time Sync Event]:', event);
      fetchWorkList();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleOpenDecision = (item, type) => {
    setSelectedItem(item);
    setDecisionType(type);
    setReason(
      type === 'Approved'
        ? 'All identity and corporate records verified successfully.'
        : ''
    );
  };

  const handleExecuteDecision = async () => {
    if (!reason.trim()) {
      Alert.alert('Required', 'A written reason is required per Connect Invest compliance rules.');
      return;
    }

    try {
      setSubmitting(true);
      if (activeTab === 'kyc') {
        await adminApi.decideKyc(selectedItem.id, {
          decision: decisionType,
          reason: reason.trim()
        });
        Alert.alert('Success', `KYC decision recorded as ${decisionType}`);
      } else {
        await adminApi.decideKyb(selectedItem.id, {
          decision: decisionType,
          reason: reason.trim()
        });
        Alert.alert('Success', `KYB decision recorded as ${decisionType}`);
      }
      setSelectedItem(null);
      fetchWorkList();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to record decision');
    } finally {
      setSubmitting(false);
    }
  };

  const currentItems = activeTab === 'kyc' ? workList.pendingKyc : workList.pendingKyb;

  return (
    <View style={styles.container}>
      <Header
        title="Approvals"
        onOpenSidebar={onOpenSidebar}
        onRefresh={fetchWorkList}
        refreshing={refreshing}
      />

      {/* Filter Tabs */}
      <View style={styles.tabStrip}>
        <TouchableOpacity
          onPress={() => setActiveFilter('kyc')}
          style={[styles.filterTab, activeTab === 'kyc' && styles.filterTabActive]}
        >
          <User size={14} color={activeTab === 'kyc' ? '#0047BA' : '#64748B'} />
          <Text style={[styles.filterTabText, activeTab === 'kyc' && styles.filterTabTextActive]}>
            Investor KYC ({workList.pendingKyc.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveFilter('kyb')}
          style={[styles.filterTab, activeTab === 'kyb' && styles.filterTabActive]}
        >
          <Building2 size={14} color={activeTab === 'kyb' ? '#0047BA' : '#64748B'} />
          <Text style={[styles.filterTabText, activeTab === 'kyb' && styles.filterTabTextActive]}>
            Company KYB ({workList.pendingKyb.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchWorkList} colors={['#0047BA']} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#0047BA" style={{ marginTop: 40 }} />
        ) : currentItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <CheckCircle2 size={36} color="#10B981" />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptyText}>
              No pending {activeTab === 'kyc' ? 'investor KYC' : 'company KYB'} submissions in the queue.
            </Text>
          </View>
        ) : (
          currentItems.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.itemName}>
                    {activeTab === 'kyc' ? item.investorName : item.companyName}
                  </Text>
                  <Text style={styles.itemSub}>
                    {activeTab === 'kyc' ? `PAN: ${item.pan || 'N/A'}` : `CIN: ${item.regNo || 'N/A'}`}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Submitted</Text>
                </View>
              </View>

              <Text style={styles.reasonText}>
                {item.reason || 'Verification documents submitted and awaiting administrator review.'}
              </Text>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={() => handleOpenDecision(item, 'Approved')}
                  style={[styles.actionBtn, styles.approveBtn]}
                  activeOpacity={0.8}
                >
                  <CheckCircle2 size={14} color="#FFFFFF" />
                  <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleOpenDecision(item, 'Rejected')}
                  style={[styles.actionBtn, styles.rejectBtn]}
                  activeOpacity={0.8}
                >
                  <XCircle size={14} color="#DC2626" />
                  <Text style={[styles.btnText, { color: '#DC2626' }]}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Decision Modal */}
      {selectedItem && (
        <Modal
          visible={!!selectedItem}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedItem(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {decisionType} {activeTab === 'kyc' ? 'Investor KYC' : 'Company KYB'}
                </Text>
                <TouchableOpacity onPress={() => setSelectedItem(null)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Entity: {activeTab === 'kyc' ? selectedItem.investorName : selectedItem.companyName}
              </Text>

              <Text style={styles.formLabel}>
                Mandatory Written Reason (PRD Compliance Rule):
              </Text>
              <TextInput
                style={styles.textArea}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
                placeholder="State verified records or specific rejection reason..."
                placeholderTextColor="#94A3B8"
              />

              <TouchableOpacity
                onPress={handleExecuteDecision}
                disabled={submitting}
                style={[
                  styles.modalSubmitBtn,
                  decisionType === 'Rejected' && { backgroundColor: '#DC2626' }
                ]}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Confirm {decisionType}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  tabStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9'
  },
  filterTabActive: {
    backgroundColor: '#E0EDFD'
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  filterTabTextActive: {
    color: '#0047BA',
    fontWeight: '800'
  },
  scrollContent: {
    padding: 16
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A'
  },
  itemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706'
  },
  reasonText: {
    fontSize: 12,
    color: '#475569',
    marginVertical: 12,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10
  },
  approveBtn: {
    backgroundColor: '#10B981'
  },
  rejectBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5'
  },
  btnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 20
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A'
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
    height: 80,
    marginBottom: 14
  },
  modalSubmitBtn: {
    backgroundColor: '#0047BA',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});

