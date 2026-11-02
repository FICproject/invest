import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';
import {
  CreditCard,
  Search,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  X
} from '../components/Icons';
import Header from '../components/Header';
import { adminApi, formatINR } from '../services/api';

export default function TransactionsScreen({ setActiveTab, onOpenSidebar }) {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalVolumePaise: 0,
    creditsTotalPaise: 0,
    debitsTotalPaise: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchTransactions = async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.getTransactions({
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        search: search.trim() || undefined
      });
      if (res.data?.success) {
        setTransactions(res.data.transactions || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.log('Fetch transactions notice:', err.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter]);

  return (
    <View style={styles.container}>
      <Header
        title="Transactions"
        onOpenSidebar={onOpenSidebar}
        onRefresh={fetchTransactions}
        refreshing={refreshing}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchTransactions} colors={['#0047BA']} />
        }
      >
        {/* Title Bar */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Transactions Ledger</Text>
          <Text style={styles.pageSubtitle}>
            Universal audit log of all capital movements & platform transactions
          </Text>
        </View>

        {/* 3 Metric Summary Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statMiniCard}>
            <Text style={styles.statNum}>{formatINR(stats.totalVolumePaise)}</Text>
            <Text style={styles.statLabel}>Total Volume</Text>
          </View>
          <View style={[styles.statMiniCard, { borderColor: '#BBF7D0' }]}>
            <Text style={[styles.statNum, { color: '#16A34A' }]}>{formatINR(stats.creditsTotalPaise)}</Text>
            <Text style={styles.statLabel}>Total Inflows</Text>
          </View>
          <View style={[styles.statMiniCard, { borderColor: '#FED7AA' }]}>
            <Text style={[styles.statNum, { color: '#EA580C' }]}>{formatINR(stats.debitsTotalPaise)}</Text>
            <Text style={styles.statLabel}>Total Outflows</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search ref, investor, company..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchTransactions}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); fetchTransactions(); }}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipRow}
        >
          {[
            { id: 'ALL', label: 'All' },
            { id: 'CREDIT', label: 'Inflows' },
            { id: 'DEBIT', label: 'Outflows' },
            { id: 'INVESTMENT', label: 'Investments' },
            { id: 'PAYOUT', label: 'Payouts' },
            { id: 'REPAYMENT', label: 'Repayments' },
            { id: 'SUBSCRIPTION', label: 'Subscriptions' }
          ].map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.chip, typeFilter === f.id && styles.chipActive]}
              onPress={() => setTypeFilter(f.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, typeFilter === f.id && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transactions List */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0047BA" />
            <Text style={styles.loadingText}>Loading transactions ledger...</Text>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <CreditCard size={36} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Transactions Found</Text>
            <Text style={styles.emptySubtitle}>
              Transactions will automatically record as investments, repayments, payouts, and fees occur.
            </Text>
          </View>
        ) : (
          transactions.map((tx, idx) => {
            const isCredit = tx.flow === 'CREDIT';

            return (
              <View key={tx.id || `tx-${idx}`} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={styles.serialPill}>
                        <Text style={styles.serialPillText}>#{idx + 1}</Text>
                      </View>
                      <Text style={styles.txRefText}>{tx.txRef}</Text>
                      <View
                        style={[
                          styles.flowBadge,
                          { backgroundColor: isCredit ? '#DCFCE7' : '#FEF3C7' }
                        ]}
                      >
                        <Text
                          style={[
                            styles.flowBadgeText,
                            { color: isCredit ? '#15803D' : '#B45309' }
                          ]}
                        >
                          {isCredit ? 'INFLOW' : 'OUTFLOW'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.txTitle} numberOfLines={1}>
                      {tx.title}
                    </Text>
                  </View>

                  {/* Amount */}
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={[
                        styles.amountText,
                        { color: isCredit ? '#16A34A' : '#EA580C' }
                      ]}
                    >
                      {isCredit ? '+' : '-'}{formatINR(tx.amountPaise)}
                    </Text>
                    <Text style={styles.dateSubtext}>
                      {new Date(tx.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {/* Footer Details */}
                <View style={styles.cardFooter}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.partyText} numberOfLines={1}>
                      {tx.party} • <Text style={styles.partySub}>{tx.partySub}</Text>
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{tx.status}</Text>
                  </View>
                </View>
              </View>
            );
          })
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
    fontSize: 13,
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
    marginBottom: 10,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A'
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
    paddingBottom: 2
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0'
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
  txRefText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
    color: '#0047BA'
  },
  flowBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  flowBadgeText: {
    fontSize: 9,
    fontWeight: '800'
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 3
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800'
  },
  dateSubtext: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8
  },
  partyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155'
  },
  partySub: {
    color: '#64748B',
    fontWeight: '400'
  },
  statusPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569'
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

