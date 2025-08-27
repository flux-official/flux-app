import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, StatusBar, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useThemeStore } from '../../../infrastructure/stores/themeStore';
import { useWalletStore } from '../../../infrastructure/stores/walletStore';
import { fluxApi, SwapRequest, SwapQuote } from '../../../services/api';
import { createDynamicDesignSystem } from '../../theme/dynamicDesignSystem';

interface TokenSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (token: any) => void;
  excludeToken?: string;
}

function TokenSelectModal({ visible, onClose, onSelect, excludeToken }: TokenSelectModalProps) {
  const { assets } = useWalletStore();
  const { currentTheme } = useThemeStore();
  const { colors, semanticColors, typography, spacing, borderRadius } = createDynamicDesignSystem(currentTheme);

  if (!visible) return null;

  const availableTokens = assets.filter(asset => 
    asset.symbol !== excludeToken && 
    ['MTK1', 'MTK2', 'MTK3'].includes(asset.symbol)
  );

  return (
    <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
      <View style={[styles.modalContent, { backgroundColor: semanticColors.background.primary }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: semanticColors.text.primary }]}>토큰 선택</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={semanticColors.text.secondary} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.tokenList}>
          {availableTokens.map((token) => (
            <TouchableOpacity
              key={token.id}
              style={[styles.tokenItem, { borderColor: semanticColors.border.light }]}
              onPress={() => {
                onSelect(token);
                onClose();
              }}
            >
              <View style={styles.tokenLeft}>
                <View style={[styles.tokenIcon, { backgroundColor: colors.primary[50] }]}>
                  <Text style={[styles.tokenSymbol, { color: colors.primary[600] }]}>{token.symbol}</Text>
                </View>
                <View style={styles.tokenInfo}>
                  <Text style={[styles.tokenName, { color: semanticColors.text.primary }]}>{token.name}</Text>
                  <Text style={[styles.tokenChain, { color: semanticColors.text.secondary }]}>{token.chain.name}</Text>
                </View>
              </View>
              <View style={styles.tokenRight}>
                <Text style={[styles.tokenBalance, { color: semanticColors.text.primary }]}>{token.balance}</Text>
                <Text style={[styles.tokenValue, { color: semanticColors.text.secondary }]}>${token.balanceUSD.toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export default function SwapScreen() {
  const navigation = useNavigation<any>();
  const { currentTheme } = useThemeStore();
  const { address, assets } = useWalletStore();
  const { colors, semanticColors, typography, spacing, shadows, borderRadius, components } = createDynamicDesignSystem(currentTheme);

  // 상태 관리
  const [tokenIn, setTokenIn] = useState<any>(null);
  const [tokenOut, setTokenOut] = useState<any>(null);
  const [amountIn, setAmountIn] = useState<string>('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenInModal, setShowTokenInModal] = useState(false);
  const [showTokenOutModal, setShowTokenOutModal] = useState(false);

  // 초기 토큰 설정
  useEffect(() => {
    const mtkTokens = assets.filter(asset => ['MTK1', 'MTK2', 'MTK3'].includes(asset.symbol));
    if (mtkTokens.length >= 2) {
      setTokenIn(mtkTokens[0]);
      setTokenOut(mtkTokens[1]);
    }
  }, [assets]);

  // 스왑 견적 조회
  const getSwapQuote = async () => {
    if (!tokenIn || !tokenOut || !amountIn || !address || parseFloat(amountIn) <= 0) {
      setQuote(null);
      return;
    }

    try {
      setIsLoading(true);
      
      const request: SwapRequest = {
        chainId: tokenIn.chain.id,
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        amountIn: amountIn,
        userAddress: address,
      };

      const result = await fluxApi.getSwapQuote(request);
      
      if (result.success) {
        setQuote(result.data);
        console.log('✅ Swap quote received:', result.data);
      } else {
        console.error('❌ Failed to get swap quote:', result.error);
        Alert.alert('오류', '스왑 견적을 가져올 수 없습니다.');
        setQuote(null);
      }
    } catch (error) {
      console.error('❌ Error getting swap quote:', error);
      Alert.alert('오류', '네트워크 오류가 발생했습니다.');
      setQuote(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 토큰 교환
  const swapTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setQuote(null);
  };

  // 최대값 설정
  const setMaxAmount = () => {
    if (tokenIn) {
      setAmountIn(tokenIn.balance);
    }
  };

  // 스왑 실행
  const executeSwap = async () => {
    if (!quote || !tokenIn || !tokenOut) {
      Alert.alert('오류', '스왑 정보가 없습니다.');
      return;
    }

    Alert.alert(
      '스왑 확인',
      `${amountIn} ${tokenIn.symbol}을(를) ${quote.amountOut} ${tokenOut.symbol}로 교환하시겠습니까?\n\n수수료: ${quote.inTokenFee} ${tokenIn.symbol}`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '확인', 
          onPress: () => {
            Alert.alert('개발 중', '실제 스왑 기능은 개발 중입니다.\n현재는 견적 조회만 가능합니다.');
          }
        }
      ]
    );
  };

  // 금액 입력 시 견적 업데이트
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tokenIn && tokenOut && amountIn) {
        getSwapQuote();
      }
    }, 500); // 0.5초 디바운싱

    return () => clearTimeout(timer);
  }, [tokenIn, tokenOut, amountIn, address]);

  // 동적 스타일 생성
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: semanticColors.background.primary,
    },
    header: {
      backgroundColor: colors.primary[500],
      paddingBottom: spacing[4],
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[4],
    },
    headerTitle: {
      ...typography.styles.h2,
      color: colors.white,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      padding: spacing[6],
    },
    swapContainer: {
      position: 'relative',
    },
    tokenContainer: {
      ...components.card,
      padding: spacing[5],
      marginBottom: spacing[4],
      borderColor: colors.neutral[200],
      borderWidth: 1,
    },
    tokenHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[3],
    },
    tokenLabel: {
      ...typography.styles.body2,
      color: semanticColors.text.secondary,
    },
    maxButton: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
      backgroundColor: colors.primary[100],
      borderRadius: borderRadius.sm,
    },
    maxButtonText: {
      ...typography.styles.caption,
      color: colors.primary[600],
      fontWeight: typography.fontWeight.semibold,
    },
    tokenSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    tokenInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    tokenIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary[50],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[3],
    },
    tokenSymbol: {
      ...typography.styles.caption,
      color: colors.primary[600],
      fontWeight: typography.fontWeight.bold,
    },
    tokenDetails: {
      flex: 1,
    },
    tokenName: {
      ...typography.styles.body1,
      fontWeight: typography.fontWeight.semibold,
    },
    tokenBalance: {
      ...typography.styles.caption,
      color: semanticColors.text.secondary,
    },
    amountInput: {
      ...typography.styles.h3,
      color: semanticColors.text.primary,
      textAlign: 'right',
      padding: 0,
      minWidth: 100,
    },
    swapButton: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -20,
      marginLeft: -20,
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary[500],
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
      ...shadows.md,
    },
    quoteContainer: {
      ...components.card,
      padding: spacing[5],
      marginBottom: spacing[6],
      backgroundColor: colors.primary[50],
      borderColor: colors.primary[200],
      borderWidth: 1,
    },
    quoteTitle: {
      ...typography.styles.body1,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primary[700],
      marginBottom: spacing[3],
    },
    quoteRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing[2],
    },
    quoteLabel: {
      ...typography.styles.body2,
      color: colors.primary[600],
    },
    quoteValue: {
      ...typography.styles.body2,
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[700],
    },
    executeButton: {
      backgroundColor: colors.success[500],
      paddingVertical: spacing[4],
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      ...shadows.base,
    },
    executeButtonDisabled: {
      backgroundColor: colors.neutral[300],
    },
    executeButtonText: {
      ...typography.styles.body1,
      fontWeight: typography.fontWeight.semibold,
      color: colors.white,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing[4],
    },
    loadingText: {
      ...typography.styles.body2,
      color: semanticColors.text.secondary,
      marginLeft: spacing[2],
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      width: '90%',
      maxHeight: '70%',
      borderRadius: borderRadius.lg,
      padding: spacing[5],
      ...shadows.lg,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    modalTitle: {
      ...typography.styles.h3,
    },
    tokenList: {
      maxHeight: 400,
    },
    tokenItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing[4],
      borderBottomWidth: 1,
    },
    tokenLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    tokenRight: {
      alignItems: 'flex-end',
    },
    tokenChain: {
      ...typography.styles.caption,
      marginTop: spacing[1],
    },
    tokenValue: {
      ...typography.styles.caption,
      marginTop: spacing[1],
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary[500]} />
      
      {/* 헤더 */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>토큰 스왑</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 스왑 컨테이너 */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.swapContainer}>
          {/* 입력 토큰 */}
          <View style={styles.tokenContainer}>
            <View style={styles.tokenHeader}>
              <Text style={styles.tokenLabel}>보내는 토큰</Text>
              {tokenIn && (
                <TouchableOpacity style={styles.maxButton} onPress={setMaxAmount}>
                  <Text style={styles.maxButtonText}>최대</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.tokenSelector}
              onPress={() => setShowTokenInModal(true)}
            >
              <View style={styles.tokenInfo}>
                {tokenIn ? (
                  <>
                    <View style={styles.tokenIcon}>
                      <Text style={styles.tokenSymbol}>{tokenIn.symbol}</Text>
                    </View>
                    <View style={styles.tokenDetails}>
                      <Text style={styles.tokenName}>{tokenIn.name}</Text>
                      <Text style={styles.tokenBalance}>보유: {tokenIn.balance}</Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.tokenName}>토큰 선택</Text>
                )}
              </View>
              
              <TextInput
                style={styles.amountInput}
                value={amountIn}
                onChangeText={setAmountIn}
                placeholder="0.0"
                keyboardType="numeric"
                editable={!!tokenIn}
              />
            </TouchableOpacity>
          </View>

          {/* 스왑 버튼 */}
          <TouchableOpacity style={styles.swapButton} onPress={swapTokens}>
            <Icon name="swap-vertical" size={20} color={colors.white} />
          </TouchableOpacity>

          {/* 출력 토큰 */}
          <View style={styles.tokenContainer}>
            <View style={styles.tokenHeader}>
              <Text style={styles.tokenLabel}>받는 토큰</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.tokenSelector}
              onPress={() => setShowTokenOutModal(true)}
            >
              <View style={styles.tokenInfo}>
                {tokenOut ? (
                  <>
                    <View style={styles.tokenIcon}>
                      <Text style={styles.tokenSymbol}>{tokenOut.symbol}</Text>
                    </View>
                    <View style={styles.tokenDetails}>
                      <Text style={styles.tokenName}>{tokenOut.name}</Text>
                      <Text style={styles.tokenBalance}>보유: {tokenOut.balance}</Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.tokenName}>토큰 선택</Text>
                )}
              </View>
              
              <Text style={styles.amountInput}>
                {quote ? parseFloat(quote.amountOut).toFixed(4) : '0.0'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* 견적 정보 */}
        {isLoading && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
            <Text style={styles.loadingText}>견적 조회 중...</Text>
          </Animated.View>
        )}

        {quote && !isLoading && (
          <Animated.View entering={FadeInDown.duration(600)} style={styles.quoteContainer}>
            <Text style={styles.quoteTitle}>스왑 정보</Text>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>수수료</Text>
              <Text style={styles.quoteValue}>{parseFloat(quote.inTokenFee).toFixed(6)} {tokenIn?.symbol}</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>최소 수신량</Text>
              <Text style={styles.quoteValue}>{parseFloat(quote.amountOut).toFixed(4)} {tokenOut?.symbol}</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>교환 비율</Text>
              <Text style={styles.quoteValue}>1 {tokenIn?.symbol} = ~1 {tokenOut?.symbol}</Text>
            </View>
          </Animated.View>
        )}

        {/* 실행 버튼 */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          <TouchableOpacity
            style={[
              styles.executeButton,
              (!quote || !tokenIn || !tokenOut || !amountIn) && styles.executeButtonDisabled
            ]}
            onPress={executeSwap}
            disabled={!quote || !tokenIn || !tokenOut || !amountIn}
          >
            <Text style={styles.executeButtonText}>
              {!tokenIn || !tokenOut ? '토큰을 선택하세요' :
               !amountIn ? '금액을 입력하세요' :
               !quote ? '견적 조회 중...' : '스왑 실행'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* 토큰 선택 모달 */}
      <TokenSelectModal
        visible={showTokenInModal}
        onClose={() => setShowTokenInModal(false)}
        onSelect={setTokenIn}
        excludeToken={tokenOut?.symbol}
      />
      <TokenSelectModal
        visible={showTokenOutModal}
        onClose={() => setShowTokenOutModal(false)}
        onSelect={setTokenOut}
        excludeToken={tokenIn?.symbol}
      />
    </View>
  );
}