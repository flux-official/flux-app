import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import SystemHomeScreen from '../screens/Home/SystemHomeScreen';
import ModernStakingScreen from '../screens/Staking/ModernStakingScreen';
import VibrantPaymentScreen from '../screens/Payment/VibrantPaymentScreen';
import QRPaymentScreen from '../screens/Payment/QRPaymentScreen';
import PaymentHistoryScreen from '../screens/Payment/PaymentHistoryScreen';
import ModernProfileScreen from '../screens/Profile/ModernProfileScreen';
import SwapScreen from '../screens/Swap/SwapScreen';
import { useThemeStore } from '../../infrastructure/stores/themeStore';
import { createDynamicDesignSystem } from '../theme/dynamicDesignSystem';

export type RootStackParamList = {
  MainTabs: undefined;
  StakingRegister: { poolId: string };
  StakingPoolDetail: { poolId: string };
  PaymentHistory: undefined;
  Swap: undefined;
  QRPayment: {
    amount: string;
    selectedAsset: {
      symbol: string;
      chain: { id: number; name: string };
      address: string;
    };
  };
};

export type MainTabParamList = {
  Home: undefined;
  Staking: undefined;
  Payment: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { currentTheme } = useThemeStore();
  const { colors, semanticColors, spacing } = createDynamicDesignSystem(currentTheme);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Staking':
              iconName = focused ? 'bank' : 'bank-outline';
              break;
            case 'Payment':
              iconName = focused ? 'credit-card' : 'credit-card-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
          }

          return <Icon name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: semanticColors.text.tertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: semanticColors.background.primary,
          borderTopWidth: 1,
          borderTopColor: semanticColors.border.light,
          height: 84,
          paddingBottom: spacing[6],
          paddingTop: spacing[2],
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={SystemHomeScreen}
        options={{ title: '홈' }}
      />
      <Tab.Screen 
        name="Staking" 
        component={ModernStakingScreen}
        options={{ title: '스테이킹' }}
      />
      <Tab.Screen 
        name="Payment" 
        component={VibrantPaymentScreen}
        options={{ title: '결제' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ModernProfileScreen}
        options={{ title: '프로필' }}
      />
    </Tab.Navigator>
  );
}

export default function ModernRootNavigator() {
  const { currentTheme } = useThemeStore();
  const { semanticColors } = createDynamicDesignSystem(currentTheme);
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: semanticColors.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: semanticColors.border.light,
        },
        headerTintColor: semanticColors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="QRPayment" 
        component={QRPaymentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PaymentHistory" 
        component={PaymentHistoryScreen}
        options={{ 
          title: '결제 내역',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="Swap" 
        component={SwapScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}