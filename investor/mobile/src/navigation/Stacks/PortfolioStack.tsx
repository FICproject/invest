import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../../constants/routes';
import PortfolioScreen from '../../screens/portfolio/PortfolioScreen';
import InvestmentDetailScreen from '../../screens/portfolio/InvestmentDetailScreen';
import PerformanceAnalyticsScreen from '../../screens/portfolio/PerformanceAnalyticsScreen';

const Stack = createNativeStackNavigator();

export const PortfolioStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.PORTFOLIO} component={PortfolioScreen} />
      <Stack.Screen name={ROUTES.INVESTMENT_DETAIL} component={InvestmentDetailScreen} />
      <Stack.Screen name={ROUTES.PERFORMANCE_ANALYTICS} component={PerformanceAnalyticsScreen} />
    </Stack.Navigator>
  );
};

export default PortfolioStack;
