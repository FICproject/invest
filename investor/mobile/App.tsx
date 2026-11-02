import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/authContext';
import { PortfolioProvider } from './src/context/portfolioContext';
import { ThemeProvider } from './src/context/themeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <PortfolioProvider>
            <StatusBar barStyle="light-content" />
            <AppNavigator />
          </PortfolioProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
