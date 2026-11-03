import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  Linking,
  Image,
  Dimensions
} from 'react-native';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  X,
  Clock,
  User,
  Building2,
  ExternalLink,
  Eye,
  FileText,
  ShieldCheck,
  RefreshCw
} from '../components/Icons';
import Header from '../components/Header';
import { adminApi, resolveDocumentUrl } from '../services/api';
import { initMobileRealTimeSync } from '../services/realTimeSync';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WorkListScreen({ onOpenSidebar }) {
  const [approvals, setApprovals] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, resubmission: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'investor' | 'company'
  const [statusFilter, setStatusFilter] = useState('Pending Approval'); // 'Pending Approval' | 'Approved' | 'Rejected' | 'Resubmission Required' | 'all'
  const [search, setSearch] = useState('');

  // Decision Modal
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [decisionType, setDecisionType] = useState('Approved'); // 'Approved' | 'Rejected' | 'Resubmission Required'
  const [decisionReason, setDecisionReason] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  // Suspend / Revoke Modal
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendItem, setSuspendItem] = useState(null);
  const [suspendType, setSuspendType] = useState('funding'); // 'funding' | 'account'
  const [suspendTargetStatus, setSuspendTargetStatus] = useState('Suspended');
  const [suspendReason, setSuspendReason] = useState('');
  const [submittingSuspend, setSubmittingSuspend] = useState(false);

  // Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchApprovals = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.getApprovals({
        type: typeFilter,
        status: statusFilter,
        search: search.trim()
      });
      if (res.data?.success) {
        setApprovals(res.data.approvals || res.data.applications || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.warn('[Approvals Fetch Error]:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [typeFilter, statusFilter, search]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  // Real-time synchronization
  useEffect(() => {
    const unsubscribe = initMobileRealTimeSync(event => {
      if (
        event?.type === 'DATA_SYNC' &&
        (event.entity === 'REGISTRATION' || event.entity === 'REGISTRATION_DECISION')
      ) {
        console.log('[Mobile WorkList Real-Time Event]:', event);
        fetchApprovals();
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [fetchApprovals]);

  const handleOpenDecision = (item, type) => {
    setSelectedItem(item);
    setDecisionType(type);
    if (type === 'Approved') {
      setDecisionReason('All identity, registration and compliance documents verified successfully.');
    } else if (type === 'Resubmission Required') {
      setDecisionReason('Please re-upload a clearer copy of your verification documents.');
    } else {
      setDecisionReason('');
    }
    setDecisionModalOpen(true);
  };

  const handleExecuteDecision = async () => {
    if (!decisionReason.trim()) {
      Alert.alert('Required', 'A written reason is required per regulatory compliance rules.');
      return;
    }

    try {
      setSubmittingDecision(true);
      const res = await adminApi.decideApproval(selectedItem.id, {
        decision: decisionType,
        reason: decisionReason.trim()
      });

      if (res.data?.success) {
        Alert.alert('Success', `Application successfully marked as ${decisionType}.`);
        setDecisionModalOpen(false);
        setSelectedItem(null);
        fetchApprovals();
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message || 'Failed to record decision');
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleOpenSuspend = item => {
    setSuspendItem(item);
    setSuspendType('funding');
    setSuspendTargetStatus('Suspended');
    setSuspendReason('');
    setSuspendModalOpen(true);
  };

  const handleSubmitSuspend = async () => {
    if (!suspendReason.trim()) {
      Alert.alert('Reason Required', 'Please enter a written reason for this suspension or revocation.');
      return;
    }
    try {
      setSubmittingSuspend(true);
      const isInvestor = suspendItem.entityType === 'Investor';
      const targetId = suspendItem.id || suspendItem._id;
      if (isInvestor) {
        if (suspendType === 'funding') {
          await adminApi.suspendInvestorFunding(targetId, {
            status: suspendTargetStatus,
            reason: suspendReason.trim()
          });
        } else {
          await adminApi.suspendInvestorAccount(targetId, {
            status: suspendTargetStatus,
            reason: suspendReason.trim()
          });
        }
      } else {
        if (suspendType === 'funding') {
          await adminApi.suspendCompanyFunding(targetId, {
            status: suspendTargetStatus,
            reason: suspendReason.trim()
          });
        } else {
          await adminApi.suspendCompanyAccount(targetId, {
            status: suspendTargetStatus,
            reason: suspendReason.trim()
          });
        }
      }

      Alert.alert('Status Updated', `Successfully updated ${suspendType} status to ${suspendTargetStatus}.`);
      setSuspendModalOpen(false);
      setSuspendItem(null);
      fetchApprovals();
    } catch (err) {
      Alert.alert('Action Failed', err.response?.data?.error || err.message || 'Failed to update status');
    } finally {
      setSubmittingSuspend(false);
    }
  };

  const handleOpenExternal = async url => {
    const fullUrl = resolveDocumentUrl(url);
    if (!fullUrl) return;
    try {
      const supported = await Linking.canOpenURL(fullUrl);
      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        Alert.alert('Unable to Open', `Cannot open file: ${fullUrl}`);
      }
    } catch (err) {
      Alert.alert('Open Error', err.message);
    }
  };

  const handlePreviewDoc = doc => {
    setPreviewDoc(doc);
  };

  const isImageFile = url => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp');
  };

  const getStatusBadgeStyle = status => {
    switch (status) {
      case 'Approved':
        return { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' };
      case 'Rejected':
        return { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' };
      case 'Resubmission Required':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FCD34D' };
      default:
        return { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' };
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Registration Approvals"
        onOpenSidebar={onOpenSidebar}
        onRefresh={fetchApprovals}
        refreshing={refreshing}
      />

      {/* KPI Stats Strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{stats.pending}</Text>
          <Text style={styles.statLbl}>Pending</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#16A34A' }]}>
          <Text style={[styles.statVal, { color: '#16A34A' }]}>{stats.approved}</Text>
          <Text style={styles.statLbl}>Approved</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#D97706' }]}>
          <Text style={[styles.statVal, { color: '#D97706' }]}>{stats.resubmission}</Text>
          <Text style={styles.statLbl}>Resubmit</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#DC2626' }]}>
          <Text style={[styles.statVal, { color: '#DC2626' }]}>{stats.rejected}</Text>
          <Text style={styles.statLbl}>Rejected</Text>
        </View>
      </View>

      {/* Entity Type Filter Tabs */}
      <View style={styles.typeTabStrip}>
        <TouchableOpacity
          onPress={() => setTypeFilter('all')}
          style={[styles.typeTab, typeFilter === 'all' && styles.typeTabActive]}
        >
          <Text style={[styles.typeTabText, typeFilter === 'all' && styles.typeTabTextActive]}>
            All ({stats.total})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTypeFilter('investor')}
          style={[styles.typeTab, typeFilter === 'investor' && styles.typeTabActive]}
        >
          <User size={13} color={typeFilter === 'investor' ? '#0047BA' : '#64748B'} />
          <Text style={[styles.typeTabText, typeFilter === 'investor' && styles.typeTabTextActive]}>
            Investors
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTypeFilter('company')}
          style={[styles.typeTab, typeFilter === 'company' && styles.typeTabActive]}
        >
          <Building2 size={13} color={typeFilter === 'company' ? '#0047BA' : '#64748B'} />
          <Text style={[styles.typeTabText, typeFilter === 'company' && styles.typeTabTextActive]}>
            Companies
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Chips */}
      <View style={styles.chipsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {[
            { id: 'Pending Approval', label: 'Pending Review' },
            { id: 'Approved', label: 'Approved' },
            { id: 'Resubmission Required', label: 'Resubmission' },
            { id: 'Rejected', label: 'Rejected' },
            { id: 'all', label: 'All Statuses' }
          ].map(chip => (
            <TouchableOpacity
              key={chip.id}
              onPress={() => setStatusFilter(chip.id)}
              style={[styles.chip, statusFilter === chip.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, statusFilter === chip.id && styles.chipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={15} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, PAN, CIN..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={15} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* List Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchApprovals} colors={['#0047BA']} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#0047BA" style={{ marginTop: 40 }} />
        ) : approvals.length === 0 ? (
          <View style={styles.emptyCard}>
            <CheckCircle2 size={40} color="#10B981" />
            <Text style={styles.emptyTitle}>Queue Cleared</Text>
            <Text style={styles.emptySub}>
              No registrations found matching the selected filter criteria.
            </Text>
          </View>
        ) : (
          approvals.map(item => {
            const statusStyle = getStatusBadgeStyle(item.registrationStatus);
            const isInvestor = item.entityType === 'Investor';
            const docs = item.documents || [];

            return (
              <View key={item.id} style={styles.card}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: isInvestor ? '#EFF6FF' : '#F0FDF4' }
                      ]}
                    >
                      {isInvestor ? (
                        <User size={18} color="#0047BA" />
                      ) : (
                        <Building2 size={18} color="#16A34A" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>
                      <Text style={styles.itemRoleText}>
                        {isInvestor ? 'Retail & Accredited Investor' : 'Corporate Entity'}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: statusStyle.bg,
                        borderColor: statusStyle.border
                      }
                    ]}
                  >
                    <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
                      {item.registrationStatus}
                    </Text>
                  </View>
                </View>

                {/* Details Grid */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoCell}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {item.email || '—'}
                    </Text>
                  </View>
                  <View style={styles.infoCell}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{item.mobile || '—'}</Text>
                  </View>
                  <View style={styles.infoCell}>
                    <Text style={styles.infoLabel}>
                      {isInvestor ? 'PAN Number' : 'CIN / Reg No'}
                    </Text>
                    <Text style={[styles.infoValue, { fontFamily: 'monospace' }]}>
                      {item.details?.pan || item.details?.registrationNumber || item.details?.cin || '—'}
                    </Text>
                  </View>
                  <View style={styles.infoCell}>
                    <Text style={styles.infoLabel}>Submitted</Text>
                    <Text style={styles.infoValue}>
                      {item.submittedAt
                        ? new Date(item.submittedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : '—'}
                    </Text>
                  </View>
                </View>

                {/* Remarks if any */}
                {item.rejectionReason ? (
                  <View style={styles.remarksBox}>
                    <Text style={styles.remarksTitle}>Officer Remarks:</Text>
                    <Text style={styles.remarksText}>{item.rejectionReason}</Text>
                  </View>
                ) : null}

                {/* Uploaded Documents */}
                <View style={styles.docSection}>
                  <Text style={styles.docSectionTitle}>
                    Submitted Documents ({docs.length})
                  </Text>
                  {docs.length === 0 ? (
                    <Text style={styles.noDocsText}>No documents uploaded yet</Text>
                  ) : (
                    <View style={styles.docsWrap}>
                      {docs.map((doc, idx) => {
                        const isImg = isImageFile(doc.url);
                        return (
                          <View key={idx} style={styles.docItem}>
                            <View style={styles.docItemLeft}>
                              <FileText size={14} color="#0047BA" />
                              <Text style={styles.docItemName} numberOfLines={1}>
                                {doc.label || doc.type || 'Document'}
                              </Text>
                            </View>
                            <View style={styles.docItemActions}>
                              <TouchableOpacity
                                style={styles.docActionBtn}
                                onPress={() => handlePreviewDoc(doc)}
                              >
                                <Eye size={12} color="#0047BA" />
                                <Text style={styles.docActionBtnText}>Preview</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.docActionBtn, { backgroundColor: '#F1F5F9' }]}
                                onPress={() => handleOpenExternal(doc.url)}
                              >
                                <ExternalLink size={12} color="#475569" />
                                <Text style={[styles.docActionBtnText, { color: '#475569' }]}>
                                  Open
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.approveBtn]}
                    onPress={() => handleOpenDecision(item, 'Approved')}
                    activeOpacity={0.8}
                  >
                    <CheckCircle2 size={14} color="#FFFFFF" />
                    <Text style={styles.btnTextWhite}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btn, styles.resubmitBtn]}
                    onPress={() => handleOpenDecision(item, 'Resubmission Required')}
                    activeOpacity={0.8}
                  >
                    <AlertTriangle size={14} color="#B45309" />
                    <Text style={[styles.btnText, { color: '#B45309' }]}>Resubmit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btn, styles.rejectBtn]}
                    onPress={() => handleOpenDecision(item, 'Rejected')}
                    activeOpacity={0.8}
                  >
                    <XCircle size={14} color="#DC2626" />
                    <Text style={[styles.btnText, { color: '#DC2626' }]}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B', borderWidth: 1 }]}
                    onPress={() => handleOpenSuspend(item)}
                    activeOpacity={0.8}
                  >
                    <ShieldCheck size={14} color="#D97706" />
                    <Text style={[styles.btnText, { color: '#D97706' }]}>Privileges</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Decision Modal */}
      {decisionModalOpen && selectedItem && (
        <Modal
          visible={decisionModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDecisionModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {decisionType === 'Approved'
                    ? 'Approve Registration'
                    : decisionType === 'Resubmission Required'
                    ? 'Request Resubmission'
                    : 'Reject Application'}
                </Text>
                <TouchableOpacity onPress={() => setDecisionModalOpen(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Entity: {selectedItem.name} ({selectedItem.entityType})
              </Text>

              <Text style={styles.formLabel}>
                {decisionType === 'Approved'
                  ? 'Verification Notes & Approval Record:'
                  : decisionType === 'Resubmission Required'
                  ? 'Specify Correction & Resubmission Instructions:'
                  : 'Mandatory Non-Compliance Rejection Reason:'}
              </Text>

              <TextInput
                style={styles.textArea}
                value={decisionReason}
                onChangeText={setDecisionReason}
                multiline
                numberOfLines={4}
                placeholder={
                  decisionType === 'Resubmission Required'
                    ? 'e.g. Please re-upload clearer Certificate of Incorporation...'
                    : 'Enter regulatory notes or justification...'
                }
                placeholderTextColor="#94A3B8"
              />

              <TouchableOpacity
                onPress={handleExecuteDecision}
                disabled={submittingDecision}
                style={[
                  styles.modalSubmitBtn,
                  decisionType === 'Approved' && { backgroundColor: '#16A34A' },
                  decisionType === 'Resubmission Required' && { backgroundColor: '#D97706' },
                  decisionType === 'Rejected' && { backgroundColor: '#DC2626' }
                ]}
                activeOpacity={0.8}
              >
                {submittingDecision ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>
                    Confirm {decisionType}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Suspend / Revoke Modal */}
      {suspendModalOpen && suspendItem && (
        <Modal
          visible={suspendModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setSuspendModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Manage Access & Funding</Text>
                <TouchableOpacity onPress={() => setSuspendModalOpen(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Entity: {suspendItem.name} ({suspendItem.entityType})
              </Text>

              {/* Scope Selection */}
              <Text style={styles.formLabel}>Action Scope:</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    { flex: 1, paddingVertical: 8, borderRadius: 6, borderWidth: 1, alignItems: 'center' },
                    suspendType === 'funding'
                      ? { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }
                      : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }
                  ]}
                  onPress={() => {
                    setSuspendType('funding');
                    setSuspendTargetStatus('Suspended');
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: suspendType === 'funding' ? '#B45309' : '#64748B' }}>
                    Funding
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    { flex: 1, paddingVertical: 8, borderRadius: 6, borderWidth: 1, alignItems: 'center' },
                    suspendType === 'account'
                      ? { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }
                      : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }
                  ]}
                  onPress={() => {
                    setSuspendType('account');
                    setSuspendTargetStatus('Suspended');
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: suspendType === 'account' ? '#B91C1C' : '#64748B' }}>
                    Account Login
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Status Selection */}
              <Text style={styles.formLabel}>Set Target Status:</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
                {(suspendType === 'funding' ? ['Allowed', 'Suspended', 'Revoked'] : ['Active', 'Suspended', 'Revoked']).map(st => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      { flex: 1, paddingVertical: 6, borderRadius: 6, borderWidth: 1, alignItems: 'center' },
                      suspendTargetStatus === st
                        ? { backgroundColor: '#0047BA', borderColor: '#0047BA' }
                        : { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1' }
                    ]}
                    onPress={() => setSuspendTargetStatus(st)}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: suspendTargetStatus === st ? '#FFFFFF' : '#475569' }}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Written Reason (Mandatory):</Text>
              <TextInput
                style={styles.textArea}
                value={suspendReason}
                onChangeText={setSuspendReason}
                multiline
                numberOfLines={3}
                placeholder="Enter justification for administrative status change..."
              />

              <TouchableOpacity
                onPress={handleSubmitSuspend}
                disabled={submittingSuspend}
                style={[
                  styles.modalSubmitBtn,
                  suspendTargetStatus === 'Revoked'
                    ? { backgroundColor: '#DC2626' }
                    : suspendTargetStatus === 'Suspended'
                    ? { backgroundColor: '#D97706' }
                    : { backgroundColor: '#16A34A' }
                ]}
                activeOpacity={0.8}
              >
                {submittingSuspend ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>
                    Set to {suspendTargetStatus}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <Modal
          visible={!!previewDoc}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewDoc(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '90%', padding: 16 }]}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {previewDoc.label || 'Document Preview'}
                  </Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    {previewDoc.type?.toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setPreviewDoc(null)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Preview Box */}
              <View style={styles.previewBox}>
                {isImageFile(previewDoc.url) ? (
                  <Image
                    source={{ uri: resolveDocumentUrl(previewDoc.url) }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.pdfPlaceholder}>
                    <FileText size={48} color="#0047BA" />
                    <Text style={styles.pdfTitle}>PDF Document</Text>
                    <Text style={styles.pdfSubtitle}>
                      PDF files can be viewed or downloaded in the device browser
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.openExternalBtn}
                onPress={() => handleOpenExternal(previewDoc.url)}
                activeOpacity={0.8}
              >
                <ExternalLink size={16} color="#FFFFFF" />
                <Text style={styles.openExternalBtnText}>Open in Device Browser</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Suspend / Revoke Modal */}
      {suspendModalOpen && suspendItem && (
        <Modal
          visible={suspendModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setSuspendModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Manage Access & Funding</Text>
                <TouchableOpacity onPress={() => setSuspendModalOpen(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Entity: {suspendItem.name} ({suspendItem.entityType})
              </Text>

              {/* Scope Selection */}
              <Text style={styles.formLabel}>Action Scope:</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    { flex: 1, paddingVertical: 8, borderRadius: 6, borderWidth: 1, alignItems: 'center' },
                    suspendType === 'funding'
                      ? { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }
                      : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }
                  ]}
                  onPress={() => {
                    setSuspendType('funding');
                    setSuspendTargetStatus('Suspended');
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: suspendType === 'funding' ? '#B45309' : '#64748B' }}>
                    Funding
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    { flex: 1, paddingVertical: 8, borderRadius: 6, borderWidth: 1, alignItems: 'center' },
                    suspendType === 'account'
                      ? { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }
                      : { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }
                  ]}
                  onPress={() => {
                    setSuspendType('account');
                    setSuspendTargetStatus('Suspended');
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: suspendType === 'account' ? '#B91C1C' : '#64748B' }}>
                    Account Login
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Status Selection */}
              <Text style={styles.formLabel}>Set Target Status:</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
                {(suspendType === 'funding' ? ['Allowed', 'Suspended', 'Revoked'] : ['Active', 'Suspended', 'Revoked']).map(st => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      { flex: 1, paddingVertical: 6, borderRadius: 6, borderWidth: 1, alignItems: 'center' },
                      suspendTargetStatus === st
                        ? { backgroundColor: '#0047BA', borderColor: '#0047BA' }
                        : { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1' }
                    ]}
                    onPress={() => setSuspendTargetStatus(st)}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: suspendTargetStatus === st ? '#FFFFFF' : '#475569' }}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Written Reason (Mandatory):</Text>
              <TextInput
                style={styles.textArea}
                value={suspendReason}
                onChangeText={setSuspendReason}
                multiline
                numberOfLines={3}
                placeholder="Enter justification for administrative status change..."
              />

              <TouchableOpacity
                onPress={handleSubmitSuspend}
                disabled={submittingSuspend}
                style={[
                  styles.modalSubmitBtn,
                  suspendTargetStatus === 'Revoked'
                    ? { backgroundColor: '#DC2626' }
                    : suspendTargetStatus === 'Suspended'
                    ? { backgroundColor: '#D97706' }
                    : { backgroundColor: '#16A34A' }
                ]}
                activeOpacity={0.8}
              >
                {submittingSuspend ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>
                    Set to {suspendTargetStatus}
                  </Text>
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
  statsStrip: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 6
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#0047BA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center'
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0047BA'
  },
  statLbl: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2
  },
  typeTabStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8
  },
  typeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9'
  },
  typeTabActive: {
    backgroundColor: '#E0EDFD'
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  typeTabTextActive: {
    color: '#0047BA',
    fontWeight: '800'
  },
  chipsRow: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  chipsScroll: {
    paddingHorizontal: 14,
    gap: 6
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1'
  },
  chipActive: {
    backgroundColor: '#0047BA',
    borderColor: '#0047BA'
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B'
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 8,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A'
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 40
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  itemRoleText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800'
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10
  },
  infoCell: {
    width: '47%'
  },
  infoLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600'
  },
  infoValue: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '700',
    marginTop: 1
  },
  remarksBox: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FCD34D'
  },
  remarksTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309'
  },
  remarksText: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2
  },
  docSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  docSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6
  },
  noDocsText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic'
  },
  docsWrap: {
    gap: 6
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  docItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 6
  },
  docItemName: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '600'
  },
  docItemActions: {
    flexDirection: 'row',
    gap: 6
  },
  docActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0EDFD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  docActionBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0047BA'
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 6
  },
  approveBtn: {
    backgroundColor: '#16A34A'
  },
  resubmitBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D'
  },
  rejectBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5'
  },
  btnText: {
    fontSize: 11,
    fontWeight: '800'
  },
  btnTextWhite: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 16
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A'
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#F8FAFC',
    marginBottom: 14
  },
  modalSubmitBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  previewBox: {
    width: '100%',
    height: 320,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12
  },
  previewImage: {
    width: '100%',
    height: '100%'
  },
  pdfPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  pdfTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10
  },
  pdfSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6
  },
  openExternalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0047BA',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 4
  },
  openExternalBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF'
  }
});
