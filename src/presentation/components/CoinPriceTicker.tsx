import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useThemeStore } from '../../infrastructure/stores/themeStore';
import { createDynamicDesignSystem } from '../theme/dynamicDesignSystem';

interface CoinPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
}

// 실제로는 API에서 가져올 데이터
const MOCK_COIN_PRICES: CoinPrice[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 58250.30, change24h: 890.50, changePercent24h: 2.1 },
  { symbol: 'ETH', name: 'Ethereum', price: 3650.80, change24h: -45.20, changePercent24h: -1.68 },
  { symbol: 'BNB', name: 'Binance', price: 415.60, change24h: 12.40, changePercent24h: 4.08 },
  { symbol: 'SOL', name: 'Solana', price: 145.30, change24h: 5.20, changePercent24h: 3.71 },
  { symbol: 'XRP', name: 'Ripple', price: 0.65, change24h: -0.05, changePercent24h: -5.56 },
  { symbol: 'ADA', name: 'Cardano', price: 0.48, change24h: 0.02, changePercent24h: 4.34 },
  { symbol: 'AVAX', name: 'Avalanche', price: 38.90, change24h: -1.20, changePercent24h: -2.99 },
  { symbol: 'DOT', name: 'Polkadot', price: 7.85, change24h: 0.35, changePercent24h: 4.67 },
];

export default function CoinPriceTicker() {
  const { currentTheme } = useThemeStore();
  const { colors, typography, spacing } = createDynamicDesignSystem(currentTheme);
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const tickerWidth = useRef(0);
  
  useEffect(() => {
    // 자동 스크롤 애니메이션
    const startScrollAnimation = () => {
      Animated.loop(
        Animated.timing(scrollX, {
          toValue: -tickerWidth.current,
          duration: 30000, // 30초 동안 한 번 스크롤
          useNativeDriver: true,
        }),
        { resetBeforeIteration: true }
      ).start();
    };

    const timer = setTimeout(startScrollAnimation, 1000);
    return () => clearTimeout(timer);
  }, [scrollX]);

  const styles = StyleSheet.create({
    container: {
      height: 24,
      backgroundColor: colors.primary[500],
      overflow: 'hidden',
      justifyContent: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.primary[400],
    },
    scrollContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing[2],
      borderRightWidth: 1,
      borderRightColor: 'rgba(255, 255, 255, 0.15)',
      minWidth: 100,
      overflow: 'hidden',
    },
    coinIcon: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[1],
    },
    coinInfo: {
      flex: 1,
      minWidth: 0,
    },
    symbolRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
    },
    symbol: {
      fontSize: 9,
      color: colors.white,
      fontWeight: typography.fontWeight.bold,
      maxWidth: 28,
    },
    price: {
      fontSize: 9,
      color: colors.primary[100],
      fontWeight: typography.fontWeight.medium,
      maxWidth: 56,
    },
    changeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 0,
    },
    change: {
      fontSize: 8,
      fontWeight: typography.fontWeight.medium,
    },
    positiveChange: {
      color: colors.success[500],
    },
    negativeChange: {
      color: colors.error[500],
    },
    neutralChange: {
      color: colors.primary[200],
    },
    changeIcon: {
      marginRight: 1,
    },
  });

  const getCoinIcon = (symbol: string) => {
    switch(symbol) {
      case 'BTC': return 'bitcoin';
      case 'ETH': return 'ethereum';
      default: return 'circle-outline';
    }
  };

  const formatPrice = (price: number) => {
    if (price > 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else if (price > 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(4)}`;
    }
  };

  const renderTickerItem = (coin: CoinPrice, index: number) => {
    const isPositive = coin.changePercent24h > 0;
    const isNegative = coin.changePercent24h < 0;
    
    return (
      <View key={`${coin.symbol}-${index}`} style={styles.tickerItem}>
        <View style={styles.coinIcon}>
          <Icon 
            name={getCoinIcon(coin.symbol)} 
            size={10} 
            color={colors.white} 
          />
        </View>
        <View style={styles.coinInfo}>
          <View style={styles.symbolRow}>
            <Text style={styles.symbol} numberOfLines={1}>{coin.symbol}</Text>
            <Text style={styles.price} numberOfLines={1} ellipsizeMode="clip">{formatPrice(coin.price)}</Text>
          </View>
          <View style={styles.changeRow}>
            <Icon 
              name={isPositive ? 'trending-up' : isNegative ? 'trending-down' : 'minus'} 
              size={6} 
              color={isPositive ? colors.success[500] : isNegative ? colors.error[500] : colors.primary[200]}
              style={styles.changeIcon}
            />
            <Text style={[
              styles.change,
              isPositive ? styles.positiveChange : 
              isNegative ? styles.negativeChange : styles.neutralChange
            ]}>
              {isPositive ? '+' : ''}{coin.changePercent24h.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // 두 번 반복해서 무한 스크롤 효과
  const tickerItems = [
    ...MOCK_COIN_PRICES,
    ...MOCK_COIN_PRICES, // 두 번째 반복
  ];

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.scrollContainer,
          {
            transform: [{ translateX: scrollX }],
          },
        ]}
        onLayout={(event) => {
          tickerWidth.current = event.nativeEvent.layout.width / 2; // 반복되므로 절반
        }}
      >
        {tickerItems.map((coin, index) => renderTickerItem(coin, index))}
      </Animated.View>
    </View>
  );
}