import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../../constants/routes';
import WalletScreen from '../../screens/wallet/WalletScreen';
import AddFundsScreen from '../../screens/wallet/AddFundsScreen';
import RequestPayoutScreen from '../../screens/wallet/RequestPayoutScreen';
import TransactionHistoryScreen from '../../screens/wallet/TransactionHistoryScreen';
import BankAccountsScreen from '../../screens/profile/BankAccountsScreen';

const Stack = createNativeStackNavigator();

export const WalletStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.WALLET} component={WalletScreen} />
      <Stack.Screen name={ROUTES.ADD_FUNDS} component={AddFundsScreen} />
      <Stack.Screen name={ROUTES.REQUEST_PAYOUT} component={RequestPayoutScreen} />
      <Stack.Screen name={ROUTES.TRANSACTION_HISTORY} component={TransactionHistoryScreen} />
      <Stack.Screen name={ROUTES.BANK_ACCOUNTS} component={BankAccountsScreen} />
    </Stack.Navigator>
  );
};

export default WalletStack;
