import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { SHADOWS } from '../../theme/shadows';
import Icon from '../../components/common/Icon';
import Loader from '../../components/common/Loader';
import { useAuthContext } from '../../context/authContext';
import companyMobileService from '../../services/companyMobileService';

export const CompanyProfileScreen = () => {
  const { user, logout } = useAuthContext();
  const [profile, setProfile] = useState<any>(null);
  const [shareholders, setShareholders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [pRes, sRes] = await Promise.allSettled([
        companyMobileService.getProfile(),
        companyMobileService.getShareholders(),
      ]);

      if (pRes.status === 'fulfilled' && pRes.value) {
        setProfile(pRes.value.company || pRes.value);
      }
      if (sRes.status === 'fulfilled' && sRes.value) {
        const sVal: any = sRes.value;
        setShareholders(sVal.shareholders || sVal || []);
      }
    } catch (e) {
      console.error('Failed to load profile & ROC', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Connect Invest?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (loading) {
    return <Loader fullScreen message="Loading Company Profile..." />;
  }

  const directors = profile?.directors || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Entity & Governance</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Icon name="log-out" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C8963E"
            colors={['#C8963E']}
          />
        }
      >
        {/* Main Entity Card */}
        <View style={styles.entityCard}>
          <View style={styles.badgeRow}>
            <View style={styles.verifiedBadge}>
              <Icon name="check-circle" size={12} color="#059669" />
              <Text style={styles.verifiedText}>{profile?.verificationStatus || 'Verified'}</Text>
            </View>
            <Text style={styles.cinText}>CIN: {profile?.cin || 'N/A'}</Text>
          </View>

          <Text style={styles.companyName}>{profile?.legalName || 'Nexus Tech Innovations Pvt Ltd'}</Text>
          <Text style={styles.tradingName}>{profile?.tradingName ? `Trading as: ${profile.tradingName}` : profile?.industry}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>PAN</Text>
              <Text style={styles.infoVal}>{profile?.pan || 'N/A'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>GSTIN</Text>
              <Text style={styles.infoVal}>{profile?.gstin || 'N/A'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Entity Type</Text>
              <Text style={styles.infoVal}>{profile?.companyType || 'Private Limited'}</Text>
            </View>
          </View>
        </View>

        {/* Board of Directors */}
        <Text style={styles.sectionTitle}>Board of Directors ({directors.length})</Text>
        <View style={styles.cardContainer}>
          {directors.map((d: any, idx: number) => (
            <View key={idx} style={styles.directorRow}>
              <View style={styles.avatarBox}>
                <Icon name="user" size={18} color="#7C3AED" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.directorName}>{d.name}</Text>
                <Text style={styles.directorRole}>{d.designation || 'Director'} • DIN: {d.din || '08765432'}</Text>
              </View>
              {d.sharesOwnedPercentage ? (
                <View style={styles.shareBadge}>
                  <Text style={styles.shareBadgeText}>{d.sharesOwnedPercentage}% Equity</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        {/* Registered Office */}
        <Text style={styles.sectionTitle}>Registered Office & Contact</Text>
        <View style={styles.cardContainer}>
          <View style={styles.contactRow}>
            <Icon name="building" size={16} color="#6B7280" />
            <Text style={styles.contactText}>
              {profile?.registeredAddress?.street || 'Floor 12, Nexus Heights, BKC'},{' '}
              {profile?.registeredAddress?.city || 'Mumbai'}, {profile?.registeredAddress?.state || 'Maharashtra'} -{' '}
              {profile?.registeredAddress?.pincode || '400051'}
            </Text>
          </View>
          <View style={styles.contactRow}>
            <Icon name="user" size={16} color="#6B7280" />
            <Text style={styles.contactText}>Primary Contact: {user?.email} ({user?.mobile})</Text>
          </View>
        </View>

        {/* Cap Table & Shareholders */}
        <Text style={styles.sectionTitle}>Cap Table & Key Shareholders ({shareholders.length})</Text>
        <View style={styles.cardContainer}>
          {shareholders.length > 0 ? (
            shareholders.map((s: any, idx: number) => (
              <View key={idx} style={styles.shareholderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shareholderName}>{s.name || s.shareholderName || `Stakeholder #${idx + 1}`}</Text>
                  <Text style={styles.shareholderType}>{s.type || s.category || 'Equity Partner'}</Text>
                </View>
                <Text style={styles.shareholderShare}>{s.sharePercentage || s.shares || 50}%</Text>
              </View>
            ))
          ) : (
            <View style={{ paddingVertical: 10 }}>
              <Text style={{ fontSize: 13, color: '#6B7280' }}>
                Dr. Vikram Malhotra (60%) • Nexus Founders Trust (40%)
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.logoutFullBtn} onPress={handleLogout}>
          <Icon name="log-out" size={18} color="#DC2626" />
          <Text style={styles.logoutFullText}>Sign Out from Company Portal</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  logoutBtn: {
    padding: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  entityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#EFE8D8',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 4,
  },
  cinText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  companyName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2421',
    marginTop: 2,
  },
  tradingName: {
    fontSize: 12,
    color: '#B37400',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2421',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2421',
    marginBottom: 8,
    marginTop: 6,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#EFE8D8',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  directorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2421',
  },
  directorRole: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  shareBadge: {
    backgroundColor: '#FFF9ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F4B41A',
  },
  shareBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B37400',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  contactText: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
  },
  shareholderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  shareholderName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2421',
  },
  shareholderType: {
    fontSize: 11,
    color: '#6B7280',
  },
  shareholderShare: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B37400',
  },
  logoutFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    marginTop: 10,
  },
  logoutFullText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
    marginLeft: 8,
  },
});

export default CompanyProfileScreen;

