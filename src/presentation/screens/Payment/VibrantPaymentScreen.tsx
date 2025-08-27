import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, StatusBar, Alert, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWalletStore } from '../../../infrastructure/stores/walletStore';
import { useThemeStore } from '../../../infrastructure/stores/themeStore';
import { createDynamicDesignSystem } from '../../theme/dynamicDesignSystem';
import { paymentApi } from '../../../services/api';

export default function VibrantPaymentScreen() {
  const navigation = useNavigation<any>();
  const { assets, address, loadRealBalances } = useWalletStore();
  const { currentTheme } = useThemeStore();
  const { colors, semanticColors, typography, spacing, shadows, borderRadius, components } = createDynamicDesignSystem(currentTheme);
  
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  const handlePaymentStart = async () => {
    setShowAssetSelector(true);
    try {
      if (address) {
        setLoadingAssets(true);
        await loadRealBalances(address);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoadingAssets(false);
    }
  };

  // 최근 결제 내역 로드
  const loadRecentPayments = async () => {
    try {
      if (!address) return;
      const res = await paymentApi.getUserPayments(address, 10);
      if (res.success && Array.isArray(res.data)) {
        setRecentPayments(res.data);
      }
    } catch (e) {
      console.warn('⚠️ Failed to load recent payments:', e);
    }
  };

  useEffect(() => {
    if (address) {
      loadRecentPayments();
    }
  }, [address]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRecentPayments();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAssetSelect = (asset) => {
    setShowAssetSelector(false);
    
    // 랜덤 상점 선택하여 실제 상품 가격 사용
    const { getRandomMerchant } = require('../../../shared/constants/merchants');
    const selectedMerchant = getRandomMerchant();
    const merchantAmount = parseInt(selectedMerchant.amount); // 상점의 실제 가격 (원)
    
    const balanceTokens = parseFloat(asset.balance || '0');
    
    // 잔액 확인 (1 토큰 = 1 원)
    if (balanceTokens < merchantAmount) {
      Alert.alert('잔액 부족', `${selectedMerchant.name}에서 ${selectedMerchant.product} 구매에 ${merchantAmount.toLocaleString()}원이 필요하지만, 잔액이 ${Math.floor(balanceTokens).toLocaleString()}원만 있습니다.`);
      return;
    }
    
    console.log(`💰 Selected payment: ${merchantAmount.toLocaleString()}원 for ${selectedMerchant.product} at ${selectedMerchant.name}`);
    
    navigation.navigate('QRPayment', {
      amount: merchantAmount.toString(), // 실제 상품 가격
      selectedAsset: asset,
      merchantInfo: selectedMerchant, // 상점 정보도 전달
      targetChainId: selectedMerchant.preferredChainId, // 상점의 선호 체인
      targetToken: selectedMerchant.preferredToken // 상점의 선호 토큰
    });
  };


  // 동적 스타일 생성
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: semanticColors.background.primary,
    },
    header: {
      paddingBottom: spacing[8],
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing[6],
      paddingTop: spacing[4],
    },
    backButton: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      ...typography.styles.h2,
      color: colors.white,
    },
    helpButton: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      marginTop: -spacing[5],
      backgroundColor: semanticColors.background.primary,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
    },
    mainSection: {
      backgroundColor: semanticColors.background.primary,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      paddingTop: spacing[6],
      paddingHorizontal: spacing[6],
      marginBottom: spacing[8],
    },
    sectionTitle: {
      ...typography.styles.h3,
      marginBottom: spacing[4],
    },
    sectionSubtitle: {
      ...typography.styles.body2,
      marginBottom: spacing[8],
    },
    paymentButton: {
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      ...shadows.lg,
    },
    paymentGradient: {
      padding: spacing[8],
      alignItems: 'center',
    },
    paymentButtonContent: {
      alignItems: 'center',
    },
    paymentIcon: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing[6],
    },
    paymentButtonTitle: {
      ...typography.styles.h2,
      color: colors.white,
      fontWeight: typography.fontWeight.extrabold,
      marginBottom: spacing[2],
    },
    paymentButtonSubtitle: {
      ...typography.styles.body1,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    historySection: {
      paddingHorizontal: spacing[6],
      marginBottom: spacing[8],
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[6],
    },
    viewAllText: {
      ...typography.styles.body2,
      color: colors.primary[500],
      fontWeight: typography.fontWeight.semibold,
    },
    historyCard: {
      ...components.card,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
      borderColor: colors.neutral[200],
      borderWidth: 1,
    },
    historyLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    merchantIcon: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[4],
    },
    historyInfo: {
      flex: 1,
    },
    merchantName: {
      ...typography.styles.body1,
      fontWeight: typography.fontWeight.bold,
    },
    paymentTime: {
      ...typography.styles.caption,
      marginTop: spacing[1],
    },
    historyRight: {
      alignItems: 'flex-end',
    },
    paymentAmount: {
      ...typography.styles.body1,
      fontWeight: typography.fontWeight.bold,
    },
    paymentAsset: {
      ...typography.styles.caption,
      marginTop: spacing[1],
    },
    featuresSection: {
      paddingHorizontal: spacing[6],
      marginBottom: spacing[20],
    },
    featureCard: {
      ...components.card,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing[4],
      borderColor: colors.neutral[200],
      borderWidth: 1,
    },
    featureIcon: {
      width: 56,
      height: 56,
      borderRadius: borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[6],
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      ...typography.styles.body1,
      fontWeight: typography.fontWeight.bold,
      marginBottom: spacing[1],
    },
    featureDescription: {
      ...typography.styles.body2,
    },
    
    // 모달 스타일
    modalContainer: {
      flex: 1,
      backgroundColor: semanticColors.background.primary,
    },
    modalHeader: {
      paddingBottom: spacing[6],
    },
    modalHeaderContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing[6],
      paddingTop: spacing[4],
    },
    modalCloseButton: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalTitle: {
      ...typography.styles.h2,
      color: colors.white,
    },
    modalContent: {
      flex: 1,
      padding: spacing[6],
    },
    modalSubtitle: {
      ...typography.styles.body1,
      textAlign: 'center',
      marginBottom: spacing[8],
    },
    assetOption: {
      ...components.card,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
      borderColor: colors.neutral[200],
      borderWidth: 1,
    },
    assetLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    assetIcon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[4],
    },
    assetSymbol: {
      ...typography.styles.caption,
      color: colors.white,
      fontWeight: typography.fontWeight.extrabold,
      fontSize: 11,
    },
    assetInfo: {
      flex: 1,
    },
    assetName: {
      ...typography.styles.body1,
      fontWeight: typography.fontWeight.bold,
    },
    assetChain: {
      ...typography.styles.caption,
      marginTop: spacing[1],
    },
    assetRight: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    assetRightTexts: {
      alignItems: 'flex-end',
      marginRight: spacing[2],
    },
    assetBalance: {
      ...typography.styles.body1,
      fontWeight: typography.fontWeight.bold,
      marginRight: spacing[2],
    },
    assetValue: {
      ...typography.styles.caption,
      marginRight: spacing[2],
    },
    
    // 결제 코드 모달 스타일
    codeModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[6],
    },
    codeModalContent: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      width: '100%',
      maxWidth: 350,
      ...shadows.lg,
    },
    codeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing[6],
    },
    codeTitle: {
      ...typography.styles.h3,
      color: colors.white,
      fontWeight: typography.fontWeight.extrabold,
    },
    codeCloseButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    codeContent: {
      padding: spacing[8],
      alignItems: 'center',
    },
    codeContainer: {
      marginBottom: spacing[6],
    },
    codeBox: {
      padding: spacing[8],
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 200,
      minHeight: 100,
    },
    paymentCode: {
      ...typography.styles.h2,
      color: colors.white,
      fontWeight: typography.fontWeight.extrabold,
      letterSpacing: 2,
      fontFamily: typography.fontFamily.mono,
    },
    codeInfo: {
      alignItems: 'center',
      marginBottom: spacing[8],
    },
    codeAsset: {
      ...typography.styles.h3,
      fontWeight: typography.fontWeight.extrabold,
      marginBottom: spacing[1],
    },
    codeAmount: {
      ...typography.styles.h2,
      color: colors.primary[500],
      fontWeight: typography.fontWeight.extrabold,
      marginBottom: spacing[4],
    },
    codeDescription: {
      ...typography.styles.body2,
      textAlign: 'center',
    },
    codeActions: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
    },
    copyButton: {
      flex: 0.48,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    copyGradient: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing[4],
    },
    copyText: {
      ...typography.styles.button,
      marginLeft: spacing[1],
    },
    shareButton: {
      flex: 0.48,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    shareGradient: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing[4],
    },
    shareText: {
      ...typography.styles.button,
      marginLeft: spacing[1],
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary[500]} />
      
      {/* 브랜드 헤더 */}
      <LinearGradient
        colors={[colors.primary[500], colors.primary[600]]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>간편 결제</Text>
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => Alert.alert('도움말', 'FLUX 자동 스왑 결제 시스템입니다.')}
            >
              <Icon name="help-circle" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
            title="새로고침 중..."
            titleColor={colors.primary[500]}
          />
        }
      >
        {/* 메인 결제 버튼 */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.mainSection}>
          <Text style={styles.sectionTitle}>FLUX 자동 스왑 결제</Text>
          <Text style={styles.sectionSubtitle}>
            어떤 스테이블코인이든 자동으로 변환하여 결제합니다
          </Text>
          
          <TouchableOpacity 
            style={styles.paymentButton}
            onPress={handlePaymentStart}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary[500], colors.primary[600]]}
              style={styles.paymentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.paymentButtonContent}>
                <View style={styles.paymentIcon}>
                  <Icon name="credit-card-plus" size={32} color={colors.white} />
                </View>
                <Text style={styles.paymentButtonTitle}>결제 시작</Text>
                <Text style={styles.paymentButtonSubtitle}>탭하여 자산을 선택하세요</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* 최근 결제 내역 */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>최근 결제</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PaymentHistory')}>
              <Text style={styles.viewAllText}>전체보기</Text>
            </TouchableOpacity>
          </View>
          
          {recentPayments.slice(0, 3).map((p, index) => (
            <Animated.View
              key={p.id || index}
              entering={FadeInDown.delay(500 + index * 100).duration(600)}
            >
              <TouchableOpacity style={styles.historyCard}>
                <View style={styles.historyLeft}>
                  <LinearGradient
                    colors={[colors.primary[500], colors.primary[600]]}
                    style={styles.merchantIcon}
                  >
                    <Icon name="store" size={20} color={colors.white} />
                  </LinearGradient>
                  <View style={styles.historyInfo}>
                    <Text style={styles.merchantName}>{p.memo || '결제'}</Text>
                    <Text style={styles.paymentTime}>{new Date(p.createdAt).toLocaleString('ko-KR')}</Text>
                  </View>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.paymentAmount}>₩{parseInt(p.amount || '0').toLocaleString('ko-KR')}</Text>
                  <Text style={styles.paymentAsset}>{p.targetToken}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        {/* 기능 설명 */}
        <Animated.View entering={FadeInUp.delay(700).duration(600)} style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>FLUX의 특별함</Text>
          
          {[
            {
              icon: 'swap-horizontal',
              title: '자동 스왑',
              description: '보유한 코인을 자동으로 필요한 코인으로 변환',
              gradient: [colors.secondary[500], colors.secondary[600]],
            },
            {
              icon: 'flash',
              title: '즉시 결제',
              description: '복잡한 과정 없이 간단한 코드로 결제 완료',
              gradient: [colors.primary[500], colors.primary[600]],
            },
            {
              icon: 'shield-check',
              title: '안전한 거래',
              description: '블록체인 기반 보안으로 안전하게 보호',
              gradient: [colors.success[500], colors.success[600]],
            },
          ].map((feature, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(800 + index * 100).duration(600)}
            >
              <View style={styles.featureCard}>
                <LinearGradient
                  colors={feature.gradient}
                  style={styles.featureIcon}
                >
                  <Icon name={feature.icon} size={24} color={colors.white} />
                </LinearGradient>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* 자산 선택 모달 */}
      <Modal
        visible={showAssetSelector}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAssetSelector(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[colors.primary[500], colors.primary[600]]}
            style={styles.modalHeader}
          >
            <SafeAreaView edges={['top']}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  onPress={() => setShowAssetSelector(false)}
                  style={styles.modalCloseButton}
                >
                  <Icon name="close" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>결제 자산 선택</Text>
                <View style={{ width: 24 }} />
              </View>
            </SafeAreaView>
          </LinearGradient>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              결제에 사용할 스테이블코인을 선택하세요
            </Text>
            {loadingAssets && (
              <View style={{ paddingVertical: spacing[6], alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary[500]} />
                <Text style={{ marginTop: spacing[2], color: semanticColors.text.secondary }}>잔액 불러오는 중...</Text>
              </View>
            )}
            {!loadingAssets && (() => {
              const supportedSymbols = ['MTK1', 'MTK2', 'MTK3'];
              const supportedChainIds = [1001, 11155111];
              const paymentAssets = assets.filter(a => supportedSymbols.includes(a.symbol) && supportedChainIds.includes(a.chain.id));
              return paymentAssets.map((asset, index) => (
                <Animated.View
                  key={asset.id}
                  entering={FadeInDown.delay(index * 100).duration(600)}
                >
                  <TouchableOpacity 
                    style={styles.assetOption}
                    onPress={() => handleAssetSelect(asset)}
                  >
                    <View style={styles.assetLeft}>
                      <LinearGradient
                        colors={[colors.primary[400], colors.primary[500]]}
                        style={styles.assetIcon}
                      >
                        <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                      </LinearGradient>
                      <View style={styles.assetInfo}>
                        <Text style={styles.assetName}>{asset.symbol}</Text>
                        <Text style={styles.assetChain}>{asset.chain.name}</Text>
                      </View>
                    </View>
                    <View style={styles.assetRight}>
                      <View style={styles.assetRightTexts}>
                        <Text style={styles.assetBalance}>{Number(asset.balance || 0).toFixed(2)}</Text>
                        <Text style={styles.assetValue}>{asset.balanceUSD.toLocaleString()}원</Text>
                      </View>
                      <Icon name="chevron-right" size={20} color={semanticColors.text.tertiary} />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ));
            })()}
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

