import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { useWalletStore } from '../../infrastructure/stores/walletStore';
import { WalletOnboardingScreen, ImportWalletScreen } from '../screens/Wallet';
import ModernRootNavigator from './ModernRootNavigator';

const Stack = createStackNavigator();

export const WalletNavigator = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { hasWallet, loadActiveWallet } = useWalletStore();

  useEffect(() => {
    const initializeWallet = async () => {
      try {
        await loadActiveWallet();
      } catch (error) {
        console.error('Failed to load active wallet:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeWallet();
  }, []);

  // hasWallet 변화 감지
  useEffect(() => {
    console.log('📱 hasWallet changed:', hasWallet);
  }, [hasWallet]);

  // 지갑 초기화 중 로딩 화면
  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 지갑이 있으면 메인 앱, 없으면 온보딩
  if (hasWallet) {
    return <ModernRootNavigator />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="WalletOnboarding" 
        component={WalletOnboardingScreen} 
      />
      <Stack.Screen 
        name="ImportWallet" 
        component={ImportWalletScreen}
        options={{
          headerShown: true,
          title: '지갑 가져오기',
          headerStyle: {
            backgroundColor: '#f8f9fa',
          },
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen 
        name="Main" 
        component={ModernRootNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};