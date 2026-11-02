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
  PieChart,
  Percent,
  Building2,
  CheckCircle2,
  Edit3,
  X,
  FileText
} from '../components/Icons';
import Header from '../components/Header';
import { adminApi, formatINR } from '../services/api';

export default function ShareholdersScreen() {
  const [shareholders, setShareholders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Allotment Modal
  const [selectedShareholder, setSelectedShareholder] = useState(null);
  const [editOwnershipPct, setEditOwnershipPct] = useState('');
  const [editCertNo, setEditCertNo] = useState('');
  const [editStatus, setEditStatus] = useState('Allotted');
  const [submitting, setSubmitting] = useState(false);

  const fetchShareholders = async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.getShareholders();
      if (res.data.success) {
        setShareholders(res.data.shareholders || []);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.warn('Shareholder fetch notice:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShareholders();
  }, []);

  const handleOpenEdit = sh => {
    setSelectedShareholder(sh);
    setEditOwnershipPct((sh.ownershipPercentage || 0).toString());
    setEditCertNo(sh.certificateNo === 'PENDING' ? '' : sh.certificateNo || '');
    setEditStatus(sh.allotmentStatus || 'Allotted');
  };

  const handleSaveAllotment = async () => {
    if (!selectedShareholder) return;

    try {
      setSubmitting(true);
      const res = await adminApi.updateShareholderAllotment(selectedShareholder.id, {
        certificateNo: editCertNo.trim() || 'PENDING',
        allotmentStatus: editStatus,
        ownershipPercentage: Number(editOwnershipPct) || 0
      });

      if (res.data.success) {
        Alert.alert('Updated', 'Shareholder allotment details updated successfully.');
        setSelectedShareholder(null);
        fetchShareholders();
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update allotment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Shareholders"
        onRefresh={fetchShareholders}
        refreshing={refreshing}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchShareholders} colors={['#6D28D9']} />}
      >
        {/* KPI Strip */}
        <View style={styles.kpiRow}>
          <View style={styles.miniKpi}>
            <Text style={styles.miniKpiLabel}>SHAREHOLDERS</Text>
            <Text style={styles.miniKpiValue}>{summary?.totalShareholdersCount || shareholders.length}</Text>
          </View>
          <View style={styles.miniKpi}>
            <Text style={styles.miniKpiLabel}>TOTAL SHARES</Text>
            <Text style={[styles.miniKpiValue, { color: '#0047BA' }]}>
              {summary?.totalSharesIssued?.toLocaleString('en-IN') || '0'}
            </Text>
          </View>
          <View style={styles.miniKpi}>
            <Text style={styles.miniKpiLabel}>AVG HOLDING</Text>
            <Text style={[styles.miniKpiValue, { color: '#6D28D9' }]}>
              {summary?.avgOwnershipPct || '0'}%
            </Text>
          </View>
        </View>

        {/* Shareholder Cards List */}
        <Text style={styles.sectionTitle}>
          VERIFIED SHAREHOLDERS ({shareholders.length})
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#6D28D9" style={{ marginTop: 40 }} />
        ) : shareholders.length === 0 ? (
          <View style={styles.emptyCard}>
            <PieChart size={36} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Equity Shareholdings</Text>
            <Text style={styles.emptyText}>Create an Equity / Shareholder Investment offer to issue shares.</Text>
          </View>
        ) : (
          shareholders.map(sh => {
            const pct = Number(sh.ownershipPercentage || 0);
            const barWidth = Math.min(100, Math.max(8, pct * 6));

            return (
              <View key={sh.id} style={styles.shareholderCard}>
                {/* Header: Name + Ownership % */}
                <View style={styles.cardHeader}>
                  <View style={styles.shareholderInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{sh.investor.name.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text style={styles.investorName}>{sh.investor.name}</Text>
                      <Text style={styles.investorEmail}>{sh.investor.email}</Text>
                    </View>
                  </View>

                  {/* PROMINENT SHAREHOLDING PERCENTAGE */}
                  <View style={styles.pctPill}>
                    <Percent size={12} color="#6D28D9" />
                    <Text style={styles.pctText}>{pct.toFixed(2)}%</Text>
                  </View>
                </View>

                {/* Ownership Progress Bar */}
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: `${barWidth}%` }]} />
                </View>

                {/* Company & Offer Info */}
                <View style={styles.companyRow}>
                  <Building2 size={13} color="#0047BA" />
                  <Text style={styles.companyName}>{sh.company.name}</Text>
                  <View style={styles.instrumentTag}>
                    <Text style={styles.instrumentText}>
                      {(sh.offer.instrument || 'EQUITY').replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Stats Breakdown */}
                <View style={styles.metricsStrip}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>SHARES HELD</Text>
                    <Text style={styles.sharesValue}>
                      {sh.sharesAllotted.toLocaleString('en-IN')} shares
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>INVESTED AMOUNT</Text>
                    <Text style={styles.capitalValue}>
                      {formatINR(sh.amountInvestedPaise)}
                    </Text>
                  </View>
                </View>

                {/* Allotment & Action */}
                <View style={styles.cardFooter}>
                  <View style={styles.allotmentBadgeGroup}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: sh.allotmentStatus === 'Allotted' ? '#10B981' : '#F59E0B' }
                    ]} />
                    <Text style={styles.allotmentStatusText}>
                      {sh.allotmentStatus} • {sh.certificateNo || 'PENDING'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleOpenEdit(sh)}
                    style={styles.editButton}
                    activeOpacity={0.7}
                  >
                    <Edit3 size={12} color="#6D28D9" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Edit Allotment Modal */}
      {selectedShareholder && (
        <Modal
          visible={!!selectedShareholder}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedShareholder(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Manage Allotment</Text>
                <TouchableOpacity onPress={() => setSelectedShareholder(null)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                {selectedShareholder.investor.name} • {selectedShareholder.company.name}
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ownership Percentage (%)</Text>
                <TextInput
                  style={styles.formInput}
                  value={editOwnershipPct}
                  onChangeText={setEditOwnershipPct}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 2.50"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Share Certificate Number</Text>
                <TextInput
                  style={styles.formInput}
                  value={editCertNo}
                  onChangeText={setEditCertNo}
                  placeholder="e.g. CERT-APEX-EQ-2026-001"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Allotment Status</Text>
                <View style={styles.statusButtons}>
                  {['Allotted', 'Pending'].map(st => (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setEditStatus(st)}
                      style={[styles.statusToggle, editStatus === st && styles.statusToggleActive]}
                    >
                      <Text style={[styles.statusToggleText, editStatus === st && styles.statusToggleTextActive]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSaveAllotment}
                disabled={submitting}
                style={styles.modalSaveBtn}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Save Allotment</Text>
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
  scrollContent: {
    padding: 16
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20
  },
  miniKpi: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center'
  },
  miniKpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3
  },
  miniKpiValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 10,
    letterSpacing: 0.5
  },
  shareholderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  shareholderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6D28D9'
  },
  investorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A'
  },
  investorEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  pctPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE'
  },
  pctText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#6D28D9'
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginVertical: 12,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12
  },
  companyName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0047BA',
    flex: 1
  },
  instrumentTag: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  instrumentText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6D28D9'
  },
  metricsStrip: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12
  },
  metricItem: {
    flex: 1
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B'
  },
  sharesValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6D28D9',
    marginTop: 2
  },
  capitalValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  allotmentBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  allotmentStatusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600'
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE'
  },
  editButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6D28D9'
  },
  emptyCard: {
    alignItems: 'center',
    padding: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed'
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
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
    marginBottom: 16
  },
  formGroup: {
    marginBottom: 14
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A'
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8
  },
  statusToggle: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC'
  },
  statusToggleActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6'
  },
  statusToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  statusToggleTextActive: {
    color: '#6D28D9',
    fontWeight: '800'
  },
  modalSaveBtn: {
    backgroundColor: '#0047BA',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});

