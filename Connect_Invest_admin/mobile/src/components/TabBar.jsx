import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import {
  LayoutGrid,
  ShieldCheck,
  Briefcase,
  TrendingUp,
  User
} from './Icons';

export default function TabBar({ activeTab, setActiveTab, pendingCount = 0 }) {
  // Main 4 Bottom Quick Tabs: Dashboard, Approvals, Offers, Profile
  const bottomTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'worklist', label: 'Approvals', icon: ShieldCheck, badge: pendingCount },
    { id: 'offers', label: 'Offers', icon: Briefcase },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <View style={styles.container}>
      {bottomTabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
              <Icon
                size={19}
                color={isActive ? '#FFFFFF' : '#64748B'}
                strokeWidth={isActive ? 2.4 : 1.8}
              />
              {tab.badge > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative'
  },
  iconWrapperActive: {
    backgroundColor: '#0047BA'
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2
  },
  tabLabelActive: {
    color: '#0047BA',
    fontWeight: '700'
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  }
});
