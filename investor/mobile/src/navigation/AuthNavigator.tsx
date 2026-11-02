import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/routes';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterRoleScreen from '../screens/auth/RegisterRoleScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import CompanyRegisterScreen from '../screens/auth/CompanyRegisterScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
      <Stack.Screen name={ROUTES.REGISTER_ROLE} component={RegisterRoleScreen} />
      <Stack.Screen name={ROUTES.REGISTER_INVESTOR} component={RegisterScreen} />
      <Stack.Screen name={ROUTES.REGISTER_COMPANY} component={CompanyRegisterScreen} />
      <Stack.Screen name={ROUTES.OTP_VERIFICATION} component={OtpVerificationScreen} />
      <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
