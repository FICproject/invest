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
  Building2,
  Search,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Briefcase,
  X,
  Phone,
  Mail,
  ExternalLink,
  Layers
} from '../components/Icons';
import Header from '../components/Header';
import { adminApi, formatINR } from '../services/api';

export default function CompaniesScreen({ setActiveTab, onOpenSidebar }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, APPROVED, PENDING, REJECTED

  // Company Details Modal
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Create Company Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    regNo: '',
    ownerName: '',
    ownerEmail: '',
    ownerMobile: '',
    sector: 'Clean Energy & Solar',
    fundingRequired: ''
  });
  const [creating, setCreating] = useState(false);

  const fetchCompanies = async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.getCompanies();
      if (res.data.success) {
        setCompanies(res.data.companies || []);
      }
    } catch (err) {
      console.log('Fetch companies error:', err.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async () => {
    if (!newCompany.name || !newCompany.regNo || !newCompany.ownerEmail) {
      Alert.alert('Required Fields', 'Please enter Company Legal Name, Registration No (CIN/LLPIN), and Owner Email.');
      return;
    }

    try {
      setCreating(true);
      const res = await adminApi.createCompany(newCompany);
      if (res.data.success) {
        Alert.alert('Success', 'Company corporate entity registered successfully.');
        setShowCreateModal(false);
        setNewCompany({
          name: '',
          regNo: '',
          ownerName: '',
          ownerEmail: '',
          ownerMobile: '',
          sector: 'Clean Energy & Solar',
          fundingRequired: ''
        });
        fetchCompanies();
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message);
    } finally {
      setCreating(false);
    }
  };

  // Filtered companies
  const filteredCompanies = companies.filter(c => {
    const matchesSearch =
      !search ||
      (c.legalName || c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.registrationNumber || c.regNo || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.industry || c.sector || '').toLowerCase().includes(search.toLowerCase());

    const kyb = (c.kybStatus || c.status || 'PENDING').toUpperCase();
    let matchesStatus = true;
    if (statusFilter === 'APPROVED') matchesStatus = kyb === 'APPROVED' || kyb === 'VERIFIED';
    else if (statusFilter === 'PENDING') matchesStatus = kyb === 'PENDING' || kyb === 'SUBMITTED';
    else if (statusFilter === 'REJECTED') matchesStatus = kyb === 'REJECTED';

    return matchesSearch && matchesStatus;
  });

  const approvedCount = companies.filter(
    c => (c.kybStatus || c.status || '').toUpperCase() === 'APPROVED'
  ).length;
  const pendingCount = companies.filter(
    c =>
      (c.kybStatus || c.status || '').toUpperCase() === 'PENDING' ||
      (c.kybStatus || c.status || '').toUpperCase() === 'SUBMITTED'
  ).length;

  return (
    <View style={styles.container}>
      <Header
        title="Companies"
        onOpenSidebar={onOpenSidebar}
        onRefresh={fetchCompanies}
        refreshing={refreshing}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchCompanies} colors={['#0047BA']} />
        }
      >
        {/* Title Bar with Add Company Button */}
        <View style={styles.titleSection}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Company Management</Text>
            <Text style={styles.pageSubtitle}>
              Issuer corporate entities • KYB compliance & cap tables
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add Company</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statMiniCard}>
            <Text style={styles.statNum}>{companies.length}</Text>
            <Text style={styles.statLabel}>Total Companies</Text>
          </View>
          <View style={[styles.statMiniCard, { borderColor: '#BBF7D0' }]}>
            <Text style={[styles.statNum, { color: '#16A34A' }]}>{approvedCount}</Text>
            <Text style={styles.statLabel}>KYB Approved</Text>
          </View>
          <View style={[styles.statMiniCard, { borderColor: '#FED7AA' }]}>
            <Text style={[styles.statNum, { color: '#EA580C' }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending KYB</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by legal name, CIN, or sector..."
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
          {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
              onPress={() => setStatusFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, statusFilter === f && styles.filterChipTextActive]}>
                {f === 'ALL' ? 'All Companies' : f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Company Cards List */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0047BA" />
            <Text style={styles.loadingText}>Loading corporate entities...</Text>
          </View>
        ) : filteredCompanies.length === 0 ? (
          <View style={styles.emptyCard}>
            <Building2 size={36} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Companies Found</Text>
            <Text style={styles.emptySubtitle}>
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or filter.'
                : 'No companies registered yet. Tap "Add Company" to register an entity.'}
            </Text>
          </View>
        ) : (
          filteredCompanies.map((c, idx) => {
            const kyb = (c.kybStatus || c.status || 'PENDING').toUpperCase();
            const isApproved = kyb === 'APPROVED' || kyb === 'VERIFIED';
            const isPending = kyb === 'PENDING' || kyb === 'SUBMITTED';
            const isRejected = kyb === 'REJECTED';

            return (
              <TouchableOpacity
                key={c._id || c.id}
                style={styles.companyCard}
                onPress={() => setSelectedCompany(c)}
                activeOpacity={0.7}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.nameGroup}>
                    <View style={styles.serialPill}>
                      <Text style={styles.serialPillText}>#{idx + 1}</Text>
                    </View>
                    <View style={styles.companyIconBox}>
                      <Building2 size={20} color="#0047BA" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.companyName} numberOfLines={1}>
                        {c.legalName || c.name || 'Company Entity'}
                      </Text>
                      <Text style={styles.companySector}>
                        {c.industry || c.sector || 'Commercial Enterprise'}
                      </Text>
                    </View>
                  </View>

                  {/* KYB Badge */}
                  <View
                    style={[
                      styles.kybBadge,
                      isApproved && styles.kybBadgeApproved,
                      isPending && styles.kybBadgePending,
                      isRejected && styles.kybBadgeRejected
                    ]}
                  >
                    <Text
                      style={[
                        styles.kybBadgeText,
                        isApproved && styles.kybBadgeTextApproved,
                        isPending && styles.kybBadgeTextPending,
                        isRejected && styles.kybBadgeTextRejected
                      ]}
                    >
                      {kyb}
                    </Text>
                  </View>
                </View>

                {/* Info Pills Row */}
                <View style={styles.infoRow}>
                  <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Reg. No / CIN</Text>
                    <Text style={styles.infoVal} numberOfLines={1}>
                      {c.registrationNumber || c.regNo || '—'}
                    </Text>
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Offers Active</Text>
                    <Text style={styles.infoVal}>{c.offersCount || c.activeOffers || '1'}</Text>
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={styles.infoLabel}>Funding Target</Text>
                    <Text style={[styles.infoVal, { fontWeight: '800', color: '#0047BA' }]}>
                      {c.fundingRequiredPaise
                        ? formatINR(c.fundingRequiredPaise)
                        : c.fundingRequired || '₹1.75 Cr'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Company Details Modal */}
      <Modal visible={!!selectedCompany} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.companyIconBox}>
                  <Building2 size={22} color="#0047BA" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {selectedCompany?.legalName || selectedCompany?.name}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedCompany?.industry || selectedCompany?.sector}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedCompany(null)}
                style={styles.closeBtn}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionHeader}>Corporate Information</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>KYB Status</Text>
                  <Text style={[styles.detailValue, { fontWeight: '800', color: '#16A34A' }]}>
                    {(selectedCompany?.kybStatus || selectedCompany?.status || 'PENDING').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Registration CIN</Text>
                  <Text style={styles.detailValue}>
                    {selectedCompany?.registrationNumber || selectedCompany?.regNo || '—'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Authorized Owner</Text>
                  <Text style={styles.detailValue}>
                    {selectedCompany?.ownerName || selectedCompany?.signatoryName || 'Executive Director'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Corporate Email</Text>
                  <Text style={styles.detailValue}>
                    {selectedCompany?.ownerEmail || selectedCompany?.email || '—'}
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionHeader}>Escrow & Bank Settlement</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bank Name</Text>
                  <Text style={styles.detailValue}>
                    {selectedCompany?.bankAccount?.bankName || 'HDFC Bank Ltd'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Number</Text>
                  <Text style={styles.detailValue}>
                    {selectedCompany?.bankAccount?.accountNo || '•••• •••• 9812'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>IFSC Code</Text>
                  <Text style={styles.detailValue}>
                    {selectedCompany?.bankAccount?.ifsc || 'HDFC0001234'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.primaryModalBtn}
                onPress={() => {
                  setSelectedCompany(null);
                  setActiveTab && setActiveTab('offers');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryModalBtnText}>View Active Offers</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Company Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register New Company</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Legal Entity Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Apex Renewable Energy Pvt Ltd"
                  placeholderTextColor="#94A3B8"
                  value={newCompany.name}
                  onChangeText={txt => setNewCompany({ ...newCompany, name: txt })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Registration Number (CIN/LLPIN) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. U40106DL2020PTC123456"
                  placeholderTextColor="#94A3B8"
                  value={newCompany.regNo}
                  onChangeText={txt => setNewCompany({ ...newCompany, regNo: txt })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Industry / Sector</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Clean Energy & Solar"
                  placeholderTextColor="#94A3B8"
                  value={newCompany.sector}
                  onChangeText={txt => setNewCompany({ ...newCompany, sector: txt })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Signatory / Owner Email *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="owner@company.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newCompany.ownerEmail}
                  onChangeText={txt => setNewCompany({ ...newCompany, ownerEmail: txt })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Target Funding Requirement</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. ₹1,75,00,000"
                  placeholderTextColor="#94A3B8"
                  value={newCompany.fundingRequired}
                  onChangeText={txt => setNewCompany({ ...newCompany, fundingRequired: txt })}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.primaryModalBtn}
                onPress={handleCreateCompany}
                disabled={creating}
                activeOpacity={0.8}
              >
                {creating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryModalBtnText}>Register Entity</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0047BA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
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
  companyCard: {
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
    flex: 1,
    paddingRight: 8
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
  companyIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  companySector: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  kybBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F1F5F9'
  },
  kybBadgeApproved: {
    backgroundColor: '#DCFCE7'
  },
  kybBadgePending: {
    backgroundColor: '#FEF3C7'
  },
  kybBadgeRejected: {
    backgroundColor: '#FEE2E2'
  },
  kybBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B'
  },
  kybBadgeTextApproved: {
    color: '#16A34A'
  },
  kybBadgeTextPending: {
    color: '#D97706'
  },
  kybBadgeTextRejected: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
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
  inputGroup: {
    marginBottom: 12
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A'
  },
  modalFooter: {
    paddingTop: 10
  },
  primaryModalBtn: {
    backgroundColor: '#0047BA',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  primaryModalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});

