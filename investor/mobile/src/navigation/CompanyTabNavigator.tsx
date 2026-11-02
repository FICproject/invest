import React, { useState } from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon, { IconName } from '../components/common/Icon';
import CompanyDashboardScreen from '../screens/home/CompanyDashboardScreen';
import CompanyRequestsScreen from '../screens/home/CompanyRequestsScreen';
import CompanyFinancialsScreen from '../screens/home/CompanyFinancialsScreen';
import CompanySidebarDrawer from '../components/common/CompanySidebarDrawer';
import {
  FinancialReportsScreen,
  ReturnsAndDividendsScreen,
  DocumentsComplianceScreen,
  NotificationsScreen,
  SettingsScreen,
} from '../screens/home/CompanySubScreens';

const Tab = createBottomTabNavigator();

// Dummy empty component for More Tab since it triggers drawer
const DummyMoreScreen = () => <View style={{ flex: 1, backgroundColor: '#FFFDF7' }} />;

export const CompanyTabNavigator = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [currentSubScreen, setCurrentSubScreen] = useState<string | null>(null);

  const handleNavigate = (routeKey: string) => {
    setActiveTab(routeKey);
    setDrawerVisible(false);

    if (routeKey === 'Dashboard') {
      setCurrentSubScreen(null);
    } else if (routeKey === 'Request') {
      setCurrentSubScreen('Request');
    } else if (routeKey === 'FinancialReports') {
      setCurrentSubScreen('FinancialReports');
    } else if (routeKey === 'ReturnsAndDividends') {
      setCurrentSubScreen('ReturnsAndDividends');
    } else if (routeKey === 'Transactions') {
      setCurrentSubScreen('Transactions');
    } else if (routeKey === 'DocumentsAndCompliance') {
      setCurrentSubScreen('DocumentsAndCompliance');
    } else if (routeKey === 'Notifications') {
      setCurrentSubScreen('Notifications');
    } else if (routeKey === 'Settings') {
      setCurrentSubScreen('Settings');
    }
  };

  // Render Sub Screens with Back button directly to Dashboard
  if (currentSubScreen === 'Request') {
    return <CompanyRequestsScreen onBack={() => setCurrentSubScreen(null)} />;
  }
  if (currentSubScreen === 'FinancialReports') {
    return <FinancialReportsScreen onBack={() => setCurrentSubScreen(null)} />;
  }
  if (currentSubScreen === 'ReturnsAndDividends') {
    return <ReturnsAndDividendsScreen onBack={() => setCurrentSubScreen(null)} />;
  }
  if (currentSubScreen === 'Transactions') {
    return <CompanyFinancialsScreen onBack={() => setCurrentSubScreen(null)} />;
  }
  if (currentSubScreen === 'DocumentsAndCompliance') {
    return <DocumentsComplianceScreen onBack={() => setCurrentSubScreen(null)} />;
  }
  if (currentSubScreen === 'Notifications') {
    return <NotificationsScreen onBack={() => setCurrentSubScreen(null)} />;
  }
  if (currentSubScreen === 'Settings') {
    return <SettingsScreen onBack={() => setCurrentSubScreen(null)} />;
  }

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#B37400',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ color, size }) => {
            let iconName: IconName = 'home';
            if (route.name === 'CompanyDashboard') {
              iconName = 'dashboard';
            } else if (route.name === 'CompanyRequests') {
              iconName = 'briefcase';
            } else if (route.name === 'CompanyFinancials') {
              iconName = 'wallet';
            } else if (route.name === 'CompanyMore') {
              iconName = 'menu';
            }
            return <Icon name={iconName} size={size || 22} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="CompanyDashboard"
          component={CompanyDashboardScreen}
          options={{ tabBarLabel: 'Dashboard' }}
          listeners={{
            focus: () => setActiveTab('Dashboard'),
          }}
        />
        <Tab.Screen
          name="CompanyRequests"
          component={CompanyRequestsScreen}
          options={{ tabBarLabel: 'Requests' }}
          listeners={{
            focus: () => setActiveTab('Request'),
          }}
        />
        <Tab.Screen
          name="CompanyFinancials"
          component={CompanyFinancialsScreen}
          options={{ tabBarLabel: 'Transactions' }}
          listeners={{
            focus: () => setActiveTab('Transactions'),
          }}
        />
        <Tab.Screen
          name="CompanyMore"
          component={DummyMoreScreen}
          options={{ tabBarLabel: 'More' }}
          listeners={() => ({
            tabPress: (e) => {
              // Open side drawer
              e.preventDefault();
              setDrawerVisible(true);
            },
          })}
        />
      </Tab.Navigator>

      {/* Website Matching Left Slide Drawer */}
      <CompanySidebarDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeRoute={activeTab}
        onNavigate={handleNavigate}
      />
    </>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#EFE8D8',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 70,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});

export default CompanyTabNavigator;
