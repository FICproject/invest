import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../../constants/routes';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import EditProfileScreen from '../../screens/profile/EditProfileScreen';
import BankAccountsScreen from '../../screens/profile/BankAccountsScreen';
import SecuritySettingsScreen from '../../screens/profile/SecuritySettingsScreen';
import KycStatusScreen from '../../screens/kyc/KycStatusScreen';
import KycUploadScreen from '../../screens/kyc/KycUploadScreen';
import ForgotPasswordScreen from '../../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

export const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
      <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} />
      <Stack.Screen name={ROUTES.BANK_ACCOUNTS} component={BankAccountsScreen} />
      <Stack.Screen name={ROUTES.SECURITY_SETTINGS} component={SecuritySettingsScreen} />
      <Stack.Screen name={ROUTES.KYC_STATUS} component={KycStatusScreen} />
      <Stack.Screen name={ROUTES.KYC_UPLOAD} component={KycUploadScreen} />
      <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
