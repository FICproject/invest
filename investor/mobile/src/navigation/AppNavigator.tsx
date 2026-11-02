import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './navigationRef';
import AuthNavigator from './AuthNavigator';
import BottomTabNavigator from './BottomTabNavigator';
import CompanyTabNavigator from './CompanyTabNavigator';
import Loader from '../components/common/Loader';
import { useAuthContext } from '../context/authContext';

export const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuthContext();

  if (isLoading) {
    return <Loader fullScreen message="Connecting to secure network..." />;
  }

  const isCompanyUser =
    user?.role === 'company_admin' || user?.role === 'company_member' || !!user?.companyId;

  return (
    <NavigationContainer ref={navigationRef}>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : isCompanyUser ? (
        <CompanyTabNavigator />
      ) : (
        <BottomTabNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
