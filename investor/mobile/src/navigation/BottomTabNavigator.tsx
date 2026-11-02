import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ROUTES } from '../constants/routes';
import { COLORS } from '../constants/colors';
import Icon, { IconName } from '../components/common/Icon';
import HomeStack from './Stacks/HomeStack';
import DealsStack from './Stacks/DealsStack';
import PortfolioStack from './Stacks/PortfolioStack';
import WalletStack from './Stacks/WalletStack';
import ProfileStack from './Stacks/ProfileStack';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.goldDark,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size }) => {
          let iconName: IconName = 'home';

          if (route.name === ROUTES.TAB_HOME) {
            iconName = 'home';
          } else if (route.name === ROUTES.TAB_OFFERS) {
            iconName = 'briefcase';
          } else if (route.name === ROUTES.TAB_PORTFOLIO) {
            iconName = 'pie-chart';
          } else if (route.name === ROUTES.TAB_WALLET) {
            iconName = 'trending-up';
          } else if (route.name === ROUTES.TAB_PROFILE) {
            iconName = 'user';
          }

          return <Icon name={iconName} size={size || 22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name={ROUTES.TAB_HOME}
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name={ROUTES.TAB_OFFERS}
        component={DealsStack}
        options={{ tabBarLabel: 'Opportunities' }}
      />
      <Tab.Screen
        name={ROUTES.TAB_PORTFOLIO}
        component={PortfolioStack}
        options={{ tabBarLabel: 'My Investment' }}
      />
      <Tab.Screen
        name={ROUTES.TAB_WALLET}
        component={WalletStack}
        options={{ tabBarLabel: 'Returns' }}
      />
      <Tab.Screen
        name={ROUTES.TAB_PROFILE}
        component={ProfileStack}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: Platform.OS === 'android' ? 62 : 84,
    paddingBottom: Platform.OS === 'android' ? 8 : 28,
    paddingTop: 8,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default BottomTabNavigator;
