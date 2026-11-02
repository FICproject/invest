import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import {
  Briefcase,
  TrendingUp,
  Building2,
  Calendar,
  CheckCircle2,
  Zap,
  Tag,
  Filter,
  Plus,
  X,
  ChevronDown
} from '../components/Icons';
import Header from '../components/Header';
import { adminApi, formatINR, rupeesToPaise } from '../services/api';
import { initMobileRealTimeSync } from '../services/realTimeSync';

export default function OffersScreen({ onOpenSidebar }) {
  const [offers, setOffers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'project', 'company'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Modal State for Adding an Opportunity
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);

  // Form State (Debt/Project Only - Equity removed)
  const [form, setForm] = useState({
    kind: 'project', // 'project' | 'company'
    companyId: '',
    title: '',
    description: '',
    useOfFunds: '',
    targetRupees: '',
    minTargetRupees: '',
    rateBps: '300', // 3%
    tenuresString: '12, 18, 24',
    fundingWindowDays: '30'
  });

  const fetchOffers = async () => {
    try {
      setRefreshing(true);
      const [resOffers, resCompanies] = await Promise.all([
        adminApi.getOffers(),
        adminApi.getCompanies().catch(() => ({ data: { companies: [] } }))
      ]);

      if (resOffers.data?.success) {
        // Exclude equity from the opportunities list
        const nonEquityOffers = (resOffers.data.offers || []).filter(o => o.kind !== 'equity');
        setOffers(nonEquityOffers);
      }
      if (resCompanies.data?.companies) {
        setCompanies(resCompanies.data.companies || []);
      }
    } catch (err) {
      console.warn('Offers fetch notice:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOffers();

    const unsubscribe = initMobileRealTimeSync(event => {
      console.log('[Offers Live Sync Event]:', event);
      fetchOffers();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleActivate = async (offerId, title) => {
    Alert.alert(
      'Activate Offer',
      `Are you sure you want to activate "${title}" for public investment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate Now',
          style: 'default',
          onPress: async () => {
            try {
              setActionLoadingId(offerId);
              await adminApi.activateOffer(offerId);
              Alert.alert('Success', 'Offer is now active for investors.');
              fetchOffers();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || err.message || 'Failed to activate offer');
            } finally {
              setActionLoadingId(null);
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setForm({
      kind: 'project',
      companyId: companies.length > 0 ? companies[0]._id : '',
      title: '',
      description: '',
      useOfFunds: '',
      targetRupees: '',
      minTargetRupees: '',
      rateBps: '300',
      tenuresString: '12, 18, 24',
      fundingWindowDays: '30'
    });
    setCompanyDropdownOpen(false);
  };

  const handleOpenAddModal = () => {
    resetForm();
    if (companies.length > 0) {
      setForm(prev => ({ ...prev, companyId: companies[0]._id }));
    }
    setShowAddModal(true);
  };

  const handleCreateOpportunity = async () => {
    if (!form.title.trim()) {
      Alert.alert('Validation Error', 'Opportunity title is required.');
      return;
    }
    if (!form.companyId) {
      Alert.alert('Validation Error', 'Please select an eligible borrowing company.');
      return;
    }
    const targetRupeesNum = Number(form.targetRupees);
    if (!targetRupeesNum || targetRupeesNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid target amount.');
      return;
    }

    const rateBpsNum = Number(form.rateBps);
    const tenuresArr = form.tenuresString
      .split(',')
      .map(t => parseInt(t.trim(), 10))
      .filter(t => !isNaN(t) && t > 0);

    if (tenuresArr.length === 0) {
      Alert.alert('Validation Error', 'Please specify at least one valid tenure (months).');
      return;
    }

    try {
      setSubmitting(true);
      const targetPaise = rupeesToPaise(targetRupeesNum);
      const minTargetPaise = form.minTargetRupees
        ? rupeesToPaise(Number(form.minTargetRupees))
        : targetPaise;

      const payload = {
        kind: form.kind,
        companyId: form.companyId,
        title: form.title.trim(),
        description: form.description.trim(),
        useOfFunds: form.useOfFunds.trim(),
        targetPaise,
        minTargetPaise,
        rateBps: rateBpsNum,
        tenures: tenuresArr,
        fundingWindowDays: Number(form.fundingWindowDays) || 30
      };

      const res = await adminApi.createOffer(payload);
      if (res.data?.success) {
        Alert.alert('Opportunity Created', 'The new investment opportunity has been created and set to Active.');
        setShowAddModal(false);
        fetchOffers();
      } else {
        Alert.alert('Error', res.data?.error || 'Failed to create opportunity');
      }
    } catch (err) {
      Alert.alert('Creation Failed', err.response?.data?.error || err.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOffers = offers.filter(o => {
    if (selectedFilter === 'all') return true;
    return o.kind === selectedFilter;
  });

  const activeCount = offers.filter(o => o.status === 'Active' || o.status === 'Open').length;
  const projectCount = offers.filter(o => o.kind === 'project').length;

  const selectedCompanyName =
    companies.find(c => c._id === form.companyId)?.name || 'Select Company';

  return (
    <View style={styles.container}>
      <Header
        title="Opportunities"
        onOpenSidebar={onOpenSidebar}
        onRefresh={fetchOffers}
        refreshing={refreshing}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchOffers} colors={['#0047BA']} />
        }
      >
        {/* KPI Strip & Add Action */}
        <View style={styles.topActionRow}>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>TOTAL OFFERS</Text>
              <Text style={styles.metricValue}>{offers.length}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>ACTIVE (OPEN)</Text>
              <Text style={[styles.metricValue, { color: '#059669' }]}>{activeCount}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>PROJECTS</Text>
              <Text style={[styles.metricValue, { color: '#0047BA' }]}>{projectCount}</Text>
            </View>
          </View>

          {/* Quick Add Opportunity Button */}
          <TouchableOpacity
            style={styles.addOpportunityBtn}
            onPress={handleOpenAddModal}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addOpportunityText}>Add Opportunity</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills (Equity Filter Removed) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {[
            { id: 'all', label: 'All Opportunities' },
            { id: 'project', label: 'Project Investment' },
            { id: 'company', label: 'Company Debt' }
          ].map(f => {
            const isActive = selectedFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setSelectedFilter(f.id)}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Loading Spinner */}
        {loading && !refreshing && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0047BA" />
            <Text style={styles.loadingText}>Loading investment opportunities...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && filteredOffers.length === 0 && (
          <View style={styles.emptyContainer}>
            <Briefcase size={44} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Opportunities Found</Text>
            <Text style={styles.emptySubtitle}>No offers match your current filter.</Text>
            <TouchableOpacity
              style={[styles.addOpportunityBtn, { marginTop: 16 }]}
              onPress={handleOpenAddModal}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addOpportunityText}>Create First Opportunity</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Offer Cards */}
        {filteredOffers.map((offer, idx) => {
          const target = offer.targetAmountPaise || offer.targetPaise || 0;
          const raised = offer.raisedPaise || 0;
          const progressPct = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;
          const isHold = offer.status === 'Hold' || offer.status === 'Paused';
          const isActive = offer.status === 'Active' || offer.status === 'Open';

          return (
            <View key={offer._id} style={styles.offerCard}>
              {/* Top Banner Row */}
              <View style={styles.cardHeader}>
                <View style={styles.titleArea}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <View style={styles.serialPill}>
                      <Text style={styles.serialPillText}>#{idx + 1}</Text>
                    </View>
                    <View style={styles.kindBadge}>
                      <Text style={styles.kindBadgeText}>
                        {offer.kind === 'company' ? 'CORP DEBT' : 'PROJECT'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.offerTitle} numberOfLines={2}>
                    {offer.title}
                  </Text>
                  <View style={styles.companyRow}>
                    <Building2 size={13} color="#64748B" />
                    <Text style={styles.companyName}>
                      {offer.companyId?.name || 'Verified Corporate Borrower'}
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    isActive && styles.statusActive,
                    isHold && styles.statusHold
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      isActive && styles.statusTextActive,
                      isHold && styles.statusTextHold
                    ]}
                  >
                    {offer.status || 'Draft'}
                  </Text>
                </View>
              </View>

              {/* Raised Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressAmountText}>
                    {formatINR(raised)}{' '}
                    <Text style={styles.progressSubtext}>raised of {formatINR(target)}</Text>
                  </Text>
                  <Text style={styles.progressPercent}>{progressPct}%</Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progressPct}%`, backgroundColor: '#0047BA' }
                    ]}
                  />
                </View>
              </View>

              {/* Financial Metrics */}
              <View style={styles.debtMetaBox}>
                <View style={styles.equityMetaCol}>
                  <Text style={styles.metaSubLabel}>EXP. RETURN</Text>
                  <Text style={[styles.metaValueHighlight, { color: '#059669' }]}>
                    {((offer.rateBps || 0) / 100).toFixed(1)}% p.a.
                  </Text>
                </View>
                <View style={styles.equityMetaCol}>
                  <Text style={styles.metaSubLabel}>TENURES</Text>
                  <Text style={styles.metaValueHighlight}>
                    {offer.tenures?.length ? `${offer.tenures.join(', ')} mo` : 'Flexible'}
                  </Text>
                </View>
                <View style={styles.equityMetaCol}>
                  <Text style={styles.metaSubLabel}>PAYOUT FREQ.</Text>
                  <Text style={styles.metaValueHighlight}>Monthly</Text>
                </View>
              </View>

              {/* Bottom Actions Row */}
              <View style={styles.bottomRow}>
                <View style={styles.tagsContainer}>
                  <View style={styles.smallTag}>
                    <Text style={styles.smallTagText}>SECURED</Text>
                  </View>
                  <View style={styles.smallTag}>
                    <Text style={styles.smallTagText}>ESCROWED</Text>
                  </View>
                </View>

                {offer.status === 'Draft' || offer.status === 'Submitted' ? (
                  <TouchableOpacity
                    style={styles.activateButton}
                    onPress={() => handleActivate(offer._id, offer.title)}
                    disabled={actionLoadingId === offer._id}
                    activeOpacity={0.8}
                  >
                    {actionLoadingId === offer._id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Zap size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.activateButtonText}>Activate</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ========================================================================= */}
      {/* ADD OPPORTUNITY MODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Opportunity</Text>
                <Text style={styles.modalSubtitle}>Create a new investment product</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <X size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Product Kind Selector (Equity removed) */}
              <Text style={styles.inputLabel}>OPPORTUNITY TYPE *</Text>
              <View style={styles.typeSelectorRow}>
                {[
                  { id: 'project', label: 'Project Investment' },
                  { id: 'company', label: 'Company Debt' }
                ].map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.typeOption,
                      form.kind === item.id && styles.typeOptionActive
                    ]}
                    onPress={() => setForm(prev => ({ ...prev, kind: item.id }))}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        form.kind === item.id && styles.typeOptionTextActive
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Borrowing / Issuer Company */}
              <Text style={styles.inputLabel}>ISSUER COMPANY *</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownTriggerText} numberOfLines={1}>
                  {selectedCompanyName}
                </Text>
                <ChevronDown size={18} color="#64748B" />
              </TouchableOpacity>

              {companyDropdownOpen && (
                <View style={styles.dropdownList}>
                  {companies.length === 0 ? (
                    <Text style={styles.dropdownEmptyText}>No companies available. Please register one first.</Text>
                  ) : (
                    companies.map(c => (
                      <TouchableOpacity
                        key={c._id}
                        style={[
                          styles.dropdownItem,
                          form.companyId === c._id && styles.dropdownItemActive
                        ]}
                        onPress={() => {
                          setForm(prev => ({ ...prev, companyId: c._id }));
                          setCompanyDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            form.companyId === c._id && styles.dropdownItemTextActive
                          ]}
                        >
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {/* Title */}
              <Text style={styles.inputLabel}>OPPORTUNITY TITLE *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Solar Farm Expansion Phase 2"
                placeholderTextColor="#94A3B8"
                value={form.title}
                onChangeText={val => setForm(prev => ({ ...prev, title: val }))}
              />

              {/* Target & Min Target Amount */}
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>TARGET (₹) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 5000000"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={form.targetRupees}
                    onChangeText={val => setForm(prev => ({ ...prev, targetRupees: val }))}
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>MIN TARGET (₹)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Optional threshold"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={form.minTargetRupees}
                    onChangeText={val => setForm(prev => ({ ...prev, minTargetRupees: val }))}
                  />
                </View>
              </View>

              {/* Debt / Fixed-Yield Terms */}
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>EXPECTED RETURN (BPS) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="300 = 3.0%"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={form.rateBps}
                    onChangeText={val => setForm(prev => ({ ...prev, rateBps: val }))}
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.inputLabel}>TENURES (MONTHS) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 12, 18, 24"
                    placeholderTextColor="#94A3B8"
                    value={form.tenuresString}
                    onChangeText={val => setForm(prev => ({ ...prev, tenuresString: val }))}
                  />
                </View>
              </View>

              {/* Brief Description */}
              <Text style={styles.inputLabel}>DESCRIPTION</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="High-level overview of this investment opportunity..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={form.description}
                onChangeText={val => setForm(prev => ({ ...prev, description: val }))}
              />

              {/* Use of Funds */}
              <Text style={styles.inputLabel}>USE OF FUNDS</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Capital expenditure, procurement, runway..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={2}
                value={form.useOfFunds}
                onChangeText={val => setForm(prev => ({ ...prev, useOfFunds: val }))}
              />
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddModal(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreateOpportunity}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Create Opportunity</Text>
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40
  },
  topActionRow: {
    marginBottom: 16
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.5
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A'
  },
  addOpportunityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0047BA',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: '#0047BA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },
  addOpportunityText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  filterScroll: {
    marginBottom: 16
  },
  filterContainer: {
    gap: 8
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  filterPillActive: {
    backgroundColor: '#0047BA',
    borderColor: '#0047BA'
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  filterPillTextActive: {
    color: '#FFFFFF'
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B'
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  titleArea: {
    flex: 1,
    paddingRight: 10
  },
  kindBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginBottom: 6
  },
  kindBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5
  },
  offerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 4
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  companyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9'
  },
  statusActive: {
    backgroundColor: '#DCFCE7'
  },
  statusHold: {
    backgroundColor: '#FEF3C7'
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B'
  },
  statusTextActive: {
    color: '#166534'
  },
  statusTextHold: {
    color: '#92400E'
  },
  progressSection: {
    marginBottom: 12
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6
  },
  progressAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A'
  },
  progressSubtext: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B'
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0047BA'
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3
  },
  debtMetaBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12
  },
  equityMetaCol: {
    flex: 1,
    alignItems: 'center'
  },
  metaSubLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 3
  },
  metaValueHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A'
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6
  },
  smallTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4
  },
  smallTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569'
  },
  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  activateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    paddingBottom: 24
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0'
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A'
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9'
  },
  modalBody: {
    padding: 16
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
    letterSpacing: 0.5
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  typeOptionActive: {
    borderColor: '#0047BA',
    backgroundColor: '#EFF6FF'
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  typeOptionTextActive: {
    color: '#0047BA',
    fontWeight: '800'
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF'
  },
  dropdownTriggerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A'
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    maxHeight: 140
  },
  dropdownEmptyText: {
    padding: 12,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center'
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9'
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF'
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#334155'
  },
  dropdownItemTextActive: {
    color: '#0047BA',
    fontWeight: '700'
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#FFFFFF'
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top'
  },
  formRow: {
    flexDirection: 'row',
    gap: 10
  },
  formCol: {
    flex: 1
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center'
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B'
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0047BA',
    alignItems: 'center'
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
