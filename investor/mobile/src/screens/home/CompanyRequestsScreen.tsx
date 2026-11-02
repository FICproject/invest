import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import Icon from '../../components/common/Icon';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import companyMobileService from '../../services/companyMobileService';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const CompanyRequestsScreen = ({ onBack }: { onBack?: () => void }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [minInvestment, setMinInvestment] = useState('');
  const [investmentType, setInvestmentType] = useState('Fixed-Term');
  const [tenureMonths, setTenureMonths] = useState('12');
  const [expectedReturnRate, setExpectedReturnRate] = useState('15');
  const [description, setDescription] = useState('');

  const loadRequests = useCallback(async () => {
    try {
      const res = await companyMobileService.getRequests();
      if (res && res.requests) {
        setRequests(res.requests);
      } else if (Array.isArray(res)) {
        setRequests(res);
      }
    } catch (e) {
      console.error('Failed to load company requests', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const handleCreateRequest = async () => {
    if (!title.trim() || !targetAmount.trim() || !minInvestment.trim()) {
      Alert.alert('Required Fields', 'Please fill in Title, Target Amount, and Minimum Investment.');
      return;
    }

    try {
      setSubmitting(true);
      await companyMobileService.createRequest({
        title: title.trim(),
        targetAmount: Number(targetAmount),
        minInvestment: Number(minInvestment),
        investmentType,
        tenureMonths: Number(tenureMonths) || 12,
        expectedReturnRate: Number(expectedReturnRate) || 12,
        description: description.trim() || `${title} funding campaign on Connect Invest.`,
      });

      Alert.alert('Success', 'Investment request submitted successfully!');
      setModalVisible(false);
      setTitle('');
      setTargetAmount('');
      setMinInvestment('');
      setDescription('');
      loadRequests();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit investment request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen message="Loading Investment Requests..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ marginRight: 10, padding: 4 }}>
            <Icon name="chevron-left" size={24} color="#1F2421" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Investment Requests</Text>
          <Text style={styles.headerSub}>Manage your fundraising rounds & offerings</Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Icon name="arrow-up-right" size={16} color="#1F2421" />
          <Text style={styles.createBtnText}>New Round</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item._id || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C8963E"
            colors={['#C8963E']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Icon name="briefcase" size={40} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Investment Requests Yet</Text>
            <Text style={styles.emptySub}>
              Create your first capital raise round to invite vetted investors from Connect Invest.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.emptyBtnText}>Create Investment Request</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const raised = item.raisedAmount || 0;
          const target = item.targetAmount || 1;
          const progress = Math.min(100, Math.round((raised / target) * 100));

          return (
            <View style={styles.requestCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title || 'Capital Offering'}</Text>
                  <Text style={styles.cardType}>
                    {item.investmentType || 'Fixed-Term'} • {item.tenureMonths || 12} Months
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === 'ACTIVE' || item.status === 'Approved'
                          ? '#ECFDF5'
                          : '#FEF3C7',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color:
                          item.status === 'ACTIVE' || item.status === 'Approved'
                            ? '#059669'
                            : '#D97706',
                      },
                    ]}
                  >
                    {item.status || 'Active'}
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Raised: {formatCurrency(raised)}</Text>
                  <Text style={styles.progressPercent}>{progress}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.footerLabel}>Target Capital</Text>
                  <Text style={styles.footerValue}>{formatCurrency(item.targetAmount || 0)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.footerLabel}>Expected Return / IRR</Text>
                  <Text style={styles.footerValueGold}>
                    {item.expectedReturnRate || item.interestRate || 14}% p.a.
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Create Request Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Launch Investment Round</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={22} color="#1F2421" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
              <Text style={styles.inputLabel}>Round Title / Project Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Series A Expansion / High-Yield Debenture"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Target Capital (₹)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 5000000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={targetAmount}
                    onChangeText={setTargetAmount}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>Min. Ticket (₹)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 100000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={minInvestment}
                    onChangeText={setMinInvestment}
                  />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Return Rate (% p.a.)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 15"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={expectedReturnRate}
                    onChangeText={setExpectedReturnRate}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>Tenure (Months)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 18"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={tenureMonths}
                    onChangeText={setTenureMonths}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Offering Description</Text>
              <TextInput
                style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
                placeholder="Key highlights, purpose of funds, security structure..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={description}
                onChangeText={setDescription}
              />

              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleCreateRequest}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Submitting...' : 'Submit & Publish Round'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8D8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2421',
  },
  headerSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4B41A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  createBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2421',
    marginLeft: 4,
  },
  listContainer: {
    padding: SPACING.md,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#EFE8D8',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2421',
  },
  cardType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B37400',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F4B41A',
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  footerLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2421',
    marginTop: 2,
  },
  footerValueGold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B37400',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE8D8',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2421',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 8,
    lineHeight: 18,
  },
  emptyBtn: {
    backgroundColor: '#F4B41A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    marginTop: 10,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2421',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2421',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1F2421',
    backgroundColor: '#F9FAFB',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  submitBtn: {
    backgroundColor: '#F4B41A',
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
    ...SHADOWS.sm,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2421',
  },
});

export default CompanyRequestsScreen;
