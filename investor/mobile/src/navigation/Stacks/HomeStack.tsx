import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../../constants/routes';
import HomeScreen from '../../screens/home/HomeScreen';
import SearchOffersScreen from '../../screens/home/SearchOffersScreen';
import OfferDetailsScreen from '../../screens/offers/OfferDetailsScreen';
import InvestConfirmScreen from '../../screens/offers/InvestConfirmScreen';
import KycStatusScreen from '../../screens/kyc/KycStatusScreen';
import KycUploadScreen from '../../screens/kyc/KycUploadScreen';
import NotificationsScreen from '../../screens/notifications/NotificationsScreen';

const Stack = createNativeStackNavigator();

export const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
      <Stack.Screen name={ROUTES.SEARCH_OFFERS} component={SearchOffersScreen} />
      <Stack.Screen name={ROUTES.OFFER_DETAILS} component={OfferDetailsScreen} />
      <Stack.Screen name={ROUTES.INVEST_CONFIRM} component={InvestConfirmScreen} />
      <Stack.Screen name={ROUTES.KYC_STATUS} component={KycStatusScreen} />
      <Stack.Screen name={ROUTES.KYC_UPLOAD} component={KycUploadScreen} />
      <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

export default HomeStack;
