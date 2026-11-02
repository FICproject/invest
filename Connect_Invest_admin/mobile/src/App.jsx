import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Text
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import WorkListScreen from './screens/WorkListScreen';
import OffersScreen from './screens/OffersScreen';
import InvestorsScreen from './screens/InvestorsScreen';
import CompaniesScreen from './screens/CompaniesScreen';
import PayoutsScreen from './screens/PayoutsScreen';
import ProfileScreen from './screens/ProfileScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import GenericModuleScreen from './screens/GenericModuleScreen';
import SidebarDrawer from './components/SidebarDrawer';
import TabBar from './components/TabBar';
import { adminApi } from './services/api';

function MainApp() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Poll / fetch pending count whenever switching tabs or mounting
  const refreshPendingCount = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await adminApi.getWorkList();
      if (res.data.success) {
        const kycCount = (res.data.pendingKyc || []).length;
        const kybCount = (res.data.pendingKyb || []).length;
        setPendingApprovalsCount(kycCount + kybCount);
      }
    } catch (err) {
      // Non-critical background count
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshPendingCount();
    }
  }, [isAuthenticated, activeTab]);

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#0047BA" />
        <Text style={styles.splashText}>Connecting to Forge Connect Admin...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.screenContainer}>
        {activeTab === 'dashboard' && (
          <DashboardScreen setActiveTab={setActiveTab} onOpenSidebar={handleOpenSidebar} />
        )}
        {activeTab === 'worklist' && (
          <WorkListScreen onOpenSidebar={handleOpenSidebar} />
        )}
        {activeTab === 'offers' && (
          <OffersScreen onOpenSidebar={handleOpenSidebar} />
        )}
        {activeTab === 'investors' && (
          <InvestorsScreen setActiveTab={setActiveTab} onOpenSidebar={handleOpenSidebar} />
        )}
        {activeTab === 'companies' && (
          <CompaniesScreen setActiveTab={setActiveTab} onOpenSidebar={handleOpenSidebar} />
        )}
        {activeTab === 'payouts' && (
          <PayoutsScreen setActiveTab={setActiveTab} onOpenSidebar={handleOpenSidebar} />
        )}
        {activeTab === 'profile' && (
          <ProfileScreen setActiveTab={setActiveTab} onOpenSidebar={handleOpenSidebar} />
        )}
        {activeTab === 'transactions' && (
          <TransactionsScreen setActiveTab={setActiveTab} onOpenSidebar={handleOpenSidebar} />
        )}

        {/* Modules navigated to via Sidebar (Identical to Website) */}
        {[
          'investments_portfolio',
          'releases',
          'subscriptions',
          'queries',
          'notifications',
          'settings'
        ].includes(activeTab) && (
          <GenericModuleScreen
            tabId={activeTab}
            setActiveTab={setActiveTab}
            onOpenSidebar={handleOpenSidebar}
          />
        )}
      </View>

      {/* Slide-out Sidebar Drawer with exact website tabs */}
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingKycCount={pendingApprovalsCount}
      />

      {/* Bottom Tab Bar with quick switcher & menu trigger */}
      <TabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingApprovalsCount}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  splashText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600'
  }
});
