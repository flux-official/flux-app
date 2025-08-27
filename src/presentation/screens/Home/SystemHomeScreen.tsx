import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, StatusBar, RefreshControl, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWalletStore } from '../../../infrastructure/stores/walletStore';
import { useThemeStore } from '../../../infrastructure/stores/themeStore';
import { createDynamicDesignSystem } from '../../theme/dynamicDesignSystem';
import ThemeSelector from '../../components/ThemeSelector';
import CoinPriceTicker from '../../components/CoinPriceTicker';
import { stakingApi, StakingOverview } from '../../../services/api';
import { paymentApi } from '../../../services/api';

export default function SystemHomeScreen() {
  const navigation = useNavigation<any>();
  const { assets, transactions, totalBalance, nativeBalances, address, loadRealBalances, isLoading } = useWalletStore();
  const { currentTheme } = useThemeStore();
  const { colors, semanticColors, typography, spacing, shadows, borderRadius, components } = createDynamicDesignSystem(currentTheme);
  
  const [selectedTab, setSelectedTab] = useState('assets');
  const [selectedChain, setSelectedChain] = useState('all'); // 'all' 또는 체인 ID
  const [showChainDropdown, setShowChainDropdown] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stakingData, setStakingData] = useState<StakingOverview | null>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  // 스테이킹 데이터 로드 함수
  const loadStakingData = async () => {
    if (!address) return;
    
    try {
      console.log('📊 Loading staking data for main screen:', address);
      const response = await stakingApi.getStakingOverview(address);
      
      if (response.success && response.data) {
        setStakingData(response.data);
        console.log('📊 Staking data loaded for main screen:', response.data.totalValueStaked);
      }
    } catch (error) {
      console.error('❌ Failed to load staking data for main screen:', error);
    }
  };

  // 최근 결제 내역 로드
  const loadRecentPayments = async () => {
    if (!address) return;
    try {
      const res = await paymentApi.getUserPayments(address, 20);
      if (res.success && Array.isArray(res.data)) {
        setRecentPayments(res.data);
      }
    } catch (e) {
      console.warn('⚠️ Failed to load recent payments:', e);
    }
  };

  // 잔액 새로고침 함수
  const handleRefresh = async () => {
    if (address) {
      setRefreshing(true);
      try {
        console.log('🔄 Manual refresh for address:', address);
        await Promise.all([
          loadRealBalances(address),
          loadStakingData(),
          loadRecentPayments()
        ]);
      } catch (error) {
        console.error('❌ Refresh failed:', error);
      } finally {
        setRefreshing(false);
      }
    }
  };

  // 컴포넌트 마운트 시 잔액 및 스테이킹 데이터 로드
  useEffect(() => {
    if (address) {
      console.log('🚀 Initial loading balances and staking for address:', address);
      loadRealBalances(address);
      loadStakingData();
      loadRecentPayments();
    }
  }, [address]);

  // 30초마다 자동 새로고침
  useEffect(() => {
    if (!address) return;

    const interval = setInterval(() => {
      console.log('⏰ Auto-refresh balances and staking');
      loadRealBalances(address);
      loadStakingData();
      loadRecentPayments();
    }, 30000); // 30초

    return () => clearInterval(interval);
  }, [address, loadRealBalances]);

  // 앱이 포그라운드로 돌아올 때 새로고침
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && address) {
        console.log('📱 App became active, refreshing balances');
        loadRealBalances(address);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [address, loadRealBalances]);

  const quickActions = [
    {
      id: 'staking',
      icon: 'bank-plus',
      title: '스테이킹',
      subtitle: '수익 창출',
      onPress: () => navigation.navigate('Staking'),
    },
    {
      id: 'swap',
      icon: 'swap-horizontal',
      title: '스왑',
      subtitle: '토큰 교환', 
      onPress: () => navigation.navigate('Swap'),
    },
    {
      id: 'payment',
      icon: 'credit-card',
      title: '결제',
      subtitle: '간편 결제',
      onPress: () => navigation.navigate('Payment'),
    },
    {
      id: 'history',
      icon: 'history',
      title: '내역',
      subtitle: '거래 기록',
      onPress: () => navigation.navigate('PaymentHistory'),
    },
  ];

  // 헬퍼 함수들
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT': return 'credit-card';
      case 'STAKE': return 'bank-plus';
      case 'SWAP': return 'swap-horizontal';
      case 'RECEIVE': return 'arrow-down';
      default: return 'circle';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'PAYMENT': return colors.warning[500];
      case 'STAKE': return colors.success[500];
      case 'SWAP': return colors.secondary[500];
      case 'RECEIVE': return colors.primary[500];
      default: return colors.neutral[400];
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'PAYMENT': return '결제';
      case 'STAKE': return '스테이킹';
      case 'SWAP': return '스왑';
      case 'RECEIVE': return '받기';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return colors.success[50];
      case 'PENDING': return colors.warning[50];
      case 'FAILED': return colors.error[50];
      default: return colors.neutral[100];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return '완료';
      case 'PENDING': return '대기';
      case 'FAILED': return '실패';
      default: return status;
    }
  };

  // 동적 스타일 생성
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primary[500],
    },
    header: {
      paddingBottom: spacing[8],
    },
    headerContent: {
      paddingHorizontal: spacing[6],
      paddingTop: spacing[4],
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing[8],
    },
    greeting: {
      ...typography.styles.body2,
      color: colors.primary[100],
      marginBottom: spacing[1],
    },
    userName: {
      ...typography.styles.h2,
      color: colors.white,
    },
    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    themeButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileButton: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    balanceSection: {
      alignItems: 'center',
    },
    balanceLabel: {
      ...typography.styles.body2,
      color: colors.primary[100],
      marginBottom: spacing[2],
    },
    balanceAmount: {
      ...typography.styles.h1,
      color: colors.white,
      marginBottom: spacing[3],
    },
    balanceChange: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    changeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.base,
      marginRight: spacing[2],
    },
    changeText: {
      ...typography.styles.caption,
      color: colors.white,
      fontWeight: typography.fontWeight.semibold,
      marginLeft: spacing[1],
    },
    changePeriod: {
      ...typography.styles.caption,
      color: colors.primary[200],
    },
    content: {
      flex: 1,
      marginTop: -spacing[5],
      backgroundColor: semanticColors.background.primary,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    quickActionsSection: {
      backgroundColor: 'transparent',
      paddingTop: spacing[6],
      paddingHorizontal: spacing[6],
    },
    sectionTitle: {
      ...typography.styles.h3,
      marginBottom: spacing[4],
    },
    quickActionsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing[8],
    },
    actionWrapper: {
      flex: 1,
      marginHorizontal: spacing[1],
    },
    actionCard: {
      ...components.card,
      alignItems: 'center',
      paddingVertical: spacing[5],
      borderColor: colors.neutral[200],
      borderWidth: 1,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary[50],
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing[3],
    },
    actionTitle: {
      ...typography.styles.label,
      marginBottom: spacing[1],
      fontSize: 12,
    },
    actionSubtitle: {
      ...typography.styles.caption,
      fontSize: 11,
    },
    tabSection: {
      paddingHorizontal: spacing[6],
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: semanticColors.background.tertiary,
      borderRadius: borderRadius.md,
      padding: spacing[1],
      marginBottom: spacing[6],
    },
    tab: {
      flex: 1,
      paddingVertical: spacing[3],
      alignItems: 'center',
      borderRadius: borderRadius.base,
      position: 'relative',
    },
    activeTab: {
      backgroundColor: colors.white,
      ...shadows.sm,
    },
    tabText: {
      ...typography.styles.body2,
      fontWeight: typography.fontWeight.medium,
      color: semanticColors.text.tertiary,
    },
    activeTabText: {
      color: semanticColors.text.primary,
      fontWeight: typography.fontWeight.semibold,
    },
    tabIndicator: {
      position: 'absolute',
      bottom: -spacing[1],
      width: 20,
      height: 2,
      backgroundColor: colors.primary[500],
      borderRadius: borderRadius.full,
    },
    contentSection: {
      paddingHorizontal: spacing[6],
      flex: 1,
      overflow: 'hidden',
    },
    assetsList: {},
    assetCard: {
      ...components.card,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[3],
      borderColor: colors.neutral[200],
      borderWidth: 1,
    },
    assetLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    assetIcon: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary[50],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[3],
    },
    assetSymbol: {
      ...typography.styles.caption,
      color: colors.primary[500],
      fontWeight: typography.fontWeight.bold,
    },
    assetInfo: {
      flex: 1,
    },
    assetName: {
      ...typography.styles.body1,
      fontWeight: typography.fontWeight.semibold,
    },
    assetChain: {
      ...typography.styles.caption,
      marginTop: spacing[1],
    },
    assetRight: {
      alignItems: 'flex-end',
    },
    assetBalance: {
      ...typography.styles.body1,
      fontWeight: typography.fontWeight.semibold,
    },
    assetValue: {
      ...typography.styles.caption,
      marginTop: spacing[1],
    },
    stakingSection: {},
    stakingCard: {
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      ...shadows.base,
    },
    stakingGradient: {
      padding: spacing[5],
    },
    stakingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[5],
    },
    stakingTitle: {
      ...typography.styles.h3,
      color: colors.primary[600],
    },
    apyBadge: {
      backgroundColor: colors.primary[500],
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.base,
    },
    apyText: {
      ...typography.styles.caption,
      color: colors.white,
      fontWeight: typography.fontWeight.semibold,
    },
    stakingStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      ...typography.styles.h2,
      color: colors.primary[600],
      marginBottom: spacing[1],
    },
    statLabel: {
      ...typography.styles.caption,
      color: colors.primary[400],
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.primary[200],
      marginHorizontal: spacing[4],
    },
    historySection: {},
    transactionCard: {
      ...components.card,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[3],
      borderColor: colors.neutral[200],
      borderWidth: 1,
    },
    txLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    txIcon: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[3],
    },
    txInfo: {
      flex: 1,
    },
    txType: {
      ...typography.styles.body1,
      fontWeight: typography.fontWeight.medium,
    },
    txTime: {
      ...typography.styles.caption,
      marginTop: spacing[1],
    },
    txRight: {
      alignItems: 'flex-end',
    },
    txAmount: {
      ...typography.styles.body1,
      fontWeight: typography.fontWeight.semibold,
    },
    statusBadge: {
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.sm,
      marginTop: spacing[1],
    },
    statusText: {
      ...typography.styles.caption,
      fontWeight: typography.fontWeight.medium,
      color: semanticColors.text.secondary,
    },
    nativeBalances: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing[3],
      paddingTop: spacing[3],
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    nativeBalance: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    nativeBalanceDivider: {
      width: 1,
      height: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      marginHorizontal: spacing[4],
    },
    nativeBalanceSymbol: {
      ...typography.styles.body2,
      color: colors.white,
      fontWeight: typography.fontWeight.bold,
      marginRight: spacing[2],
    },
    nativeBalanceText: {
      ...typography.styles.body2,
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
    },
    chainGroup: {
      marginBottom: spacing[6],
    },
    chainHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing[3],
      paddingHorizontal: spacing[2],
    },
    chainIcon: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary[50],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[3],
    },
    chainName: {
      ...typography.styles.h4,
      color: semanticColors.text.primary,
      fontWeight: typography.fontWeight.semibold,
      flex: 1,
    },
    chainBadge: {
      backgroundColor: colors.primary[100],
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.full,
      minWidth: 24,
      alignItems: 'center',
    },
    chainBadgeText: {
      ...typography.styles.caption,
      color: colors.primary[600],
      fontWeight: typography.fontWeight.bold,
    },
    chainAssetCard: {
      marginLeft: spacing[4],
      marginBottom: spacing[2],
    },
    chainDropdownContainer: {
      marginBottom: spacing[4],
      position: 'relative',
      zIndex: 100,
    },
    chainDropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: semanticColors.background.secondary,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      borderWidth: 1,
      borderColor: colors.neutral[200],
      ...shadows.sm,
    },
    chainDropdownLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    chainDropdownIcon: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary[50],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[3],
    },
    chainDropdownText: {
      ...typography.styles.body1,
      color: semanticColors.text.primary,
      fontWeight: typography.fontWeight.medium,
    },
    chainDropdownMenu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: semanticColors.background.primary,
      borderRadius: borderRadius.lg,
      marginTop: spacing[2],
      ...shadows.lg,
      borderWidth: 1,
      borderColor: colors.neutral[200],
      overflow: 'hidden',
      zIndex: 101,
      maxHeight: 200,
    },
    chainDropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.neutral[100],
    },
    selectedChainDropdownItem: {
      backgroundColor: colors.primary[25],
    },
    chainDropdownItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    chainDropdownItemIcon: {
      width: 28,
      height: 28,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary[50],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[3],
    },
    selectedChainDropdownItemIcon: {
      backgroundColor: colors.primary[500],
    },
    chainDropdownItemText: {
      ...typography.styles.body2,
      color: semanticColors.text.primary,
      fontWeight: typography.fontWeight.medium,
    },
    selectedChainDropdownItemText: {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.semibold,
    },
    dropdownOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 99,
      backgroundColor: 'transparent',
    },
  });

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary[500]} />
      
      {/* 브랜드 헤더 */}
      <LinearGradient
        colors={[colors.primary[500], colors.primary[600]]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <Animated.View entering={FadeInUp.delay(100).duration(600)}>
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.greeting}>안녕하세요</Text>
                  <Text style={styles.userName}>사용자님</Text>
                </View>
                <View style={styles.headerButtons}>
                  <TouchableOpacity 
                    style={styles.themeButton}
                    onPress={() => setShowThemeSelector(true)}
                  >
                    <Icon name="palette" size={24} color={colors.white} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.profileButton}>
                    <Icon name="account-circle" size={32} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>총 자산</Text>
                <Text style={styles.balanceAmount}>
                  ₩{totalBalance.toLocaleString('ko-KR')}
                </Text>
                <View style={styles.balanceChange}>
                  <View style={styles.changeBadge}>
                    <Icon name="trending-up" size={12} color={colors.success[500]} />
                    <Text style={styles.changeText}>+0.0%</Text>
                  </View>
                  <Text style={styles.changePeriod}>24시간</Text>
                </View>
                
                {/* 네이티브 토큰 잔액 표시 */}
                <View style={styles.nativeBalances}>
                  <View style={styles.nativeBalance}>
                    <Icon name="ethereum" size={16} color={colors.white} />
                    <Text style={styles.nativeBalanceText}>
                      {(parseFloat(nativeBalances.ethereum) || 0).toFixed(4)} ETH
                    </Text>
                  </View>
                  <View style={styles.nativeBalanceDivider} />
                  <View style={styles.nativeBalance}>
                    <Text style={styles.nativeBalanceSymbol}>K</Text>
                    <Text style={styles.nativeBalanceText}>
                      {(parseFloat(nativeBalances.kaia) || 0).toFixed(4)} KAIA
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      {/* 메인 콘텐츠 */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={() => {
          if (showChainDropdown) {
            setShowChainDropdown(false);
          }
        }}
        scrollEventThrottle={16}
        bounces={false}
        overScrollMode="never"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
            title="잔액 업데이트 중..."
            titleColor={colors.primary[500]}
          />
        }
      >
        {/* 퀵 액션 그리드 */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>빠른 실행</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Animated.View
                key={action.id}
                entering={FadeInUp.delay(300 + index * 100).duration(600)}
                style={styles.actionWrapper}
              >
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={action.onPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionIcon}>
                    <Icon name={action.icon} size={24} color={colors.primary[500]} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* 탭 네비게이션 */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.tabSection}>
          <View style={styles.tabContainer}>
            {[
              { key: 'assets', label: '자산' },
              { key: 'staking', label: '스테이킹' },
              { key: 'history', label: '거래내역' }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
                onPress={() => setSelectedTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.activeTabText
                ]}>
                  {tab.label}
                </Text>
                {selectedTab === tab.key && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* 콘텐츠 섹션 */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.contentSection}>
          {/* 드롭다운 오버레이 */}
          {showChainDropdown && (
            <TouchableOpacity
              style={styles.dropdownOverlay}
              onPress={() => setShowChainDropdown(false)}
              activeOpacity={1}
            />
          )}
          {selectedTab === 'assets' && (
            <View style={styles.assetsList}>
              <Text style={styles.sectionTitle}>내 자산</Text>
              
              {/* 체인 드롭다운 */}
              {(() => {
                // 사용 가능한 체인 목록 생성
                const availableChains = [...new Set(assets.map(asset => asset.chain.id.toString()))];
                const chainOptions = [
                  { id: 'all', name: '전체', icon: 'view-grid' },
                  ...availableChains.map(chainId => {
                    const asset = assets.find(a => a.chain.id.toString() === chainId);
                    const cid = parseInt(chainId, 10);
                    const icon = cid === 11155111 ? 'ethereum' : (cid === 1001 ? 'alpha-k-circle' : 'link-variant');
                    return { 
                      id: chainId, 
                      name: asset?.chain.name || `Chain ${chainId}`,
                      icon
                    };
                  })
                ];

                const selectedOption = chainOptions.find(option => option.id === selectedChain);

                return (
                  <View style={styles.chainDropdownContainer}>
                    <TouchableOpacity
                      style={styles.chainDropdownButton}
                      onPress={() => setShowChainDropdown(!showChainDropdown)}
                    >
                      <View style={styles.chainDropdownLeft}>
                        <View style={styles.chainDropdownIcon}>
                          <Icon 
                            name={selectedOption?.icon || 'view-grid'} 
                            size={18} 
                            color={colors.primary[500]} 
                          />
                        </View>
                        <Text style={styles.chainDropdownText}>
                          {selectedOption?.name || '전체'}
                        </Text>
                      </View>
                      <Icon 
                        name={showChainDropdown ? 'chevron-up' : 'chevron-down'} 
                        size={20} 
                        color={semanticColors.text.secondary} 
                      />
                    </TouchableOpacity>

                    {showChainDropdown && (
                      <Animated.View
                        entering={FadeInDown.duration(200)}
                        style={styles.chainDropdownMenu}
                      >
                        {chainOptions.map((option, index) => (
                          <Animated.View
                            key={option.id}
                            entering={FadeInDown.delay(index * 30).duration(200)}
                          >
                            <TouchableOpacity
                              style={[
                                styles.chainDropdownItem,
                                selectedChain === option.id && styles.selectedChainDropdownItem
                              ]}
                              onPress={() => {
                                setSelectedChain(option.id);
                                setShowChainDropdown(false);
                              }}
                            >
                              <View style={styles.chainDropdownItemLeft}>
                                <View style={[
                                  styles.chainDropdownItemIcon,
                                  selectedChain === option.id && styles.selectedChainDropdownItemIcon
                                ]}>
                                  <Icon 
                                    name={option.icon} 
                                    size={16} 
                                    color={selectedChain === option.id ? colors.white : colors.primary[500]} 
                                  />
                                </View>
                                <Text style={[
                                  styles.chainDropdownItemText,
                                  selectedChain === option.id && styles.selectedChainDropdownItemText
                                ]}>
                                  {option.name}
                                </Text>
                              </View>
                              {selectedChain === option.id && (
                                <Icon name="check" size={16} color={colors.primary[500]} />
                              )}
                            </TouchableOpacity>
                          </Animated.View>
                        ))}
                      </Animated.View>
                    )}
                  </View>
                );
              })()}

              {/* 필터된 자산 목록 */}
              {(() => {
                // 선택된 체인에 따라 자산 필터링
                const filteredAssets = selectedChain === 'all' 
                  ? assets 
                  : assets.filter(asset => asset.chain.id.toString() === selectedChain);

                if (selectedChain === 'all') {
                  // 전체 보기: 체인별로 그룹화
                  const assetsByChain = filteredAssets.reduce((groups, asset) => {
                    const chainId = asset.chain.id;
                    if (!groups[chainId]) {
                      groups[chainId] = {
                        chainName: asset.chain.name,
                        assets: []
                      };
                    }
                    groups[chainId].assets.push(asset);
                    return groups;
                  }, {});

                  let animationIndex = 0;

                  return Object.entries(assetsByChain).map(([chainId, group]) => (
                    <Animated.View
                      key={chainId}
                      entering={FadeInDown.delay(600 + animationIndex++ * 100).duration(600)}
                      style={styles.chainGroup}
                    >
                      <View style={styles.chainHeader}>
                        <View style={styles.chainIcon}>
                          {(() => { const cid = parseInt(chainId as string, 10); const iconName = cid === 11155111 ? 'ethereum' : (cid === 1001 ? 'alpha-k-circle' : 'link-variant'); return (<Icon name={iconName} size={20} color={colors.primary[500]} />); })()}
                        </View>
                        <Text style={styles.chainName}>{group.chainName}</Text>
                        <View style={styles.chainBadge}>
                          <Text style={styles.chainBadgeText}>{group.assets.length}</Text>
                        </View>
                      </View>
                      
                      {group.assets.map((asset) => (
                        <Animated.View
                          key={asset.id}
                          entering={FadeInDown.delay(600 + animationIndex++ * 50).duration(400)}
                          style={styles.chainAssetCard}
                        >
                          <TouchableOpacity style={styles.assetCard}>
                            <View style={styles.assetLeft}>
                              <View style={styles.assetIcon}>
                                <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                              </View>
                              <View style={styles.assetInfo}>
                                <Text style={styles.assetName}>{asset.symbol}</Text>
                                <Text style={styles.assetChain}>{asset.chain.name}</Text>
                              </View>
                            </View>
                            <View style={styles.assetRight}>
                              <Text style={styles.assetBalance}>{Number(asset.balance || 0).toFixed(2)}</Text>
                              <Text style={styles.assetValue}>₩{asset.balanceUSD.toLocaleString('ko-KR')}</Text>
                            </View>
                          </TouchableOpacity>
                        </Animated.View>
                      ))}
                    </Animated.View>
                  ));
                } else {
                  // 특정 체인 보기: 평면 리스트
                  return filteredAssets.map((asset, index) => (
                    <Animated.View
                      key={asset.id}
                      entering={FadeInDown.delay(600 + index * 100).duration(600)}
                    >
                      <TouchableOpacity style={styles.assetCard}>
                        <View style={styles.assetLeft}>
                          <View style={styles.assetIcon}>
                            <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                          </View>
                          <View style={styles.assetInfo}>
                            <Text style={styles.assetName}>{asset.symbol}</Text>
                            <Text style={styles.assetChain}>{asset.chain.name}</Text>
                          </View>
                        </View>
                        <View style={styles.assetRight}>
                          <Text style={styles.assetBalance}>{Number(asset.balance || 0).toFixed(2)}</Text>
                          <Text style={styles.assetValue}>₩{asset.balanceUSD.toLocaleString('ko-KR')}</Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ));
                }
              })()}
            </View>
          )}

          {selectedTab === 'staking' && (
            <View style={styles.stakingSection}>
              <Text style={styles.sectionTitle}>스테이킹 현황</Text>
              <TouchableOpacity 
                style={styles.stakingCard}
                onPress={() => navigation.navigate('Staking')}
              >
                <LinearGradient
                  colors={[colors.primary[50], colors.primary[100]]}
                  style={styles.stakingGradient}
                >
                  <View style={styles.stakingHeader}>
                    <Text style={styles.stakingTitle}>총 스테이킹</Text>
                    <View style={styles.apyBadge}>
                      <Text style={styles.apyText}>0.0% APY</Text>
                    </View>
                  </View>
                  <View style={styles.stakingStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        ₩{stakingData ? stakingData.totalValueStaked.toLocaleString('ko-KR') : '0'}
                      </Text>
                      <Text style={styles.statLabel}>스테이킹 금액</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        ₩{stakingData ? stakingData.totalClaimedRewards.toLocaleString('ko-KR') : '0'}
                      </Text>
                      <Text style={styles.statLabel}>누적 보상</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {selectedTab === 'history' && (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>최근 거래</Text>
              {recentPayments.slice(0, 5).map((p, index) => {
                const mappedStatus = p.status === 'COMPLETED' ? 'CONFIRMED' : (p.status === 'EXECUTING' || p.status === 'QUOTED' || p.status === 'CREATED') ? 'PENDING' : p.status;
                return (
                <Animated.View
                  key={p.id}
                  entering={FadeInDown.delay(600 + index * 100).duration(600)}
                >
                  <TouchableOpacity style={styles.transactionCard}>
                    <View style={styles.txLeft}>
                      <View style={[styles.txIcon, { backgroundColor: getTransactionColor('PAYMENT') }]}>
                        <Icon name={getTransactionIcon('PAYMENT')} size={16} color={colors.white} />
                      </View>
                      <View style={styles.txInfo}>
                        <Text style={styles.txType}>{getTransactionLabel('PAYMENT')}</Text>
                        <Text style={styles.txTime}>
                          {new Date(p.createdAt).toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.txRight}>
                      <Text style={styles.txAmount}>{p.amount} {p.targetToken}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(mappedStatus) }]}>
                        <Text style={styles.statusText}>{getStatusLabel(mappedStatus)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );})}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* 코인 시세 티커 */}
      <CoinPriceTicker />

      {/* 테마 선택 모달 */}
      <ThemeSelector 
        visible={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />
    </SafeAreaView>
  );
}