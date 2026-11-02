import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../../constants/routes';
import OfferListScreen from '../../screens/offers/OfferListScreen';
import OfferDetailsScreen from '../../screens/offers/OfferDetailsScreen';
import InvestConfirmScreen from '../../screens/offers/InvestConfirmScreen';
import SearchOffersScreen from '../../screens/home/SearchOffersScreen';
import KycStatusScreen from '../../screens/kyc/KycStatusScreen';
import KycUploadScreen from '../../screens/kyc/KycUploadScreen';

const Stack = createNativeStackNavigator();

export const DealsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.OFFER_LIST} component={OfferListScreen} />
      <Stack.Screen name={ROUTES.OFFER_DETAILS} component={OfferDetailsScreen} />
      <Stack.Screen name={ROUTES.INVEST_CONFIRM} component={InvestConfirmScreen} />
      <Stack.Screen name={ROUTES.SEARCH_OFFERS} component={SearchOffersScreen} />
      <Stack.Screen name={ROUTES.KYC_STATUS} component={KycStatusScreen} />
      <Stack.Screen name={ROUTES.KYC_UPLOAD} component={KycUploadScreen} />
    </Stack.Navigator>
  );
};

export default DealsStack;
