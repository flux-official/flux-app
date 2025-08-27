import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, StatusBar, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useThemeStore } from '../../../infrastructure/stores/themeStore';
import { useWalletStore } from '../../../infrastructure/stores/walletStore';
import { createDynamicDesignSystem } from '../../theme/dynamicDesignSystem';
import { stakingApi, StakingOverview, StakingPoolInfo } from '../../../services/api';
import { Web3Provider } from '../../../services/wallet/web3Provider';
import { ethers } from 'ethers';
import { FLUX_ADDRESSES } from '../../../shared/constants/contracts';

export default function ModernStakingScreen() {
  const navigation = useNavigation<any>();
  const { currentTheme } = useThemeStore();
  const { address } = useWalletStore();
  const { colors, semanticColors, typography, spacing, shadows, borderRadius, components } = createDynamicDesignSystem(currentTheme);

  const [stakingData, setStakingData] = useState<StakingOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChain, setSelectedChain] = useState<'all' | number>('all');
  const [showChainDropdown, setShowChainDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pauseUntilRef = useRef<number>(0);

  // On-chain interaction ABIs and addresses
  const ERC20_ABI = [
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function decimals() view returns (uint8)'
  ];
  const FLUX_ABI = [
    'function stake(address token, uint256 amount)',
    'function unstake(address token, uint256 amount)',
    'function claimRewards(address token)'
  ];
  const FLUX_READ_ABI = [
    'function getUserStakedAmount(address user, address token) view returns (uint256)'
  ];
  // Flux addresses imported from shared constants

  useEffect(() => {
    if (address) {
      loadStakingData();
    }
  }, [address]);

  const loadStakingData = async () => {
    if (!address) return;
    
    try {
      setIsLoading(true);
      console.log('📊 Loading staking overview for address:', address);
      
      // 실제 API 호출
      const response = await stakingApi.getStakingOverview(address);
      console.log('📊 API Response:', response);
      
      if (response.success && response.data) {
        setStakingData(response.data);
        console.log('📊 Staking data loaded successfully. Total value:', response.data.totalValueStaked);
        console.log('📊 Active pools:', response.data.pools.filter(p => p.isActive).length);
      } else {
        console.error('❌ Failed to load staking data:', response.error);
        Alert.alert('API 연결 오류', `스테이킹 정보를 불러올 수 없습니다.\n\n오류: ${response.error}\n\n네트워크 연결을 확인해주세요.`);
      }
      
    } catch (error: any) {
      console.error('❌ Network error loading staking data:', error);
      Alert.alert('네트워크 오류', `API 서버에 연결할 수 없습니다.\n\n${(error as Error).message}\n\n백엔드 서버가 실행중인지 확인해주세요.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Polling refresh every 15s when screen has address
  useEffect(() => {
    if (!address) return;
    const id = setInterval(() => {
      if (Date.now() >= pauseUntilRef.current) {
        loadStakingData();
      }
    }, 15000);
    return () => clearInterval(id);
  }, [address]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadStakingData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleStakeTokens = async (pool: StakingPoolInfo) => {
    Alert.prompt(
      `${pool.tokenSymbol} 스테이킹`,
      `스테이킹할 ${pool.tokenSymbol} 수량을 입력하세요\n\n현재 APY: ${pool.estimatedApy}%`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '스테이킹', 
          onPress: async (amount) => {
            if (!amount || parseFloat(amount) <= 0) {
              Alert.alert('오류', '올바른 수량을 입력해주세요.');
              return;
            }
            
            try {
              console.log(`🔒 Staking ${amount} ${pool.tokenSymbol} on chain ${pool.chainId}`);
              setIsSubmitting(true);
              const signer = await Web3Provider.getSigner(pool.chainId);
              if (!signer) {
                Alert.alert('오류', '지갑 서명자를 찾을 수 없습니다.');
                setIsSubmitting(false);
                return;
              }

              const token = new ethers.Contract(pool.tokenAddress, ERC20_ABI, signer);
              const decimals: number = await token.decimals();
              const fluxAddress = FLUX_ADDRESSES[pool.chainId];
              if (!fluxAddress) {
                Alert.alert('오류', `Flux 주소가 설정되지 않았습니다 (chain ${pool.chainId}).`);
                setIsSubmitting(false);
                return;
              }
              const amountWei = ethers.parseUnits(amount, decimals);

              // Ensure allowance
              const owner = await signer.getAddress();
              const allowance: bigint = await token.allowance(owner, fluxAddress);
              if (allowance < amountWei) {
                const approveTx = await token.approve(fluxAddress, amountWei);
                await approveTx.wait();
              }

              // Stake via Flux proxy
              const flux = new ethers.Contract(fluxAddress, FLUX_ABI, signer);
              const tx = await flux.stake(pool.tokenAddress, amountWei);
              Alert.alert('스테이킹 전송됨', `Tx: ${tx.hash.substring(0, 10)}...`);
              await tx.wait();
              Alert.alert('스테이킹 완료', `${amount} ${pool.tokenSymbol} 스테이킹이 완료되었습니다.`);
              // 즉시 on-chain으로 해당 풀만 갱신
              try {
                const readProvider = Web3Provider.getProvider(pool.chainId);
                if (readProvider) {
                  const fluxRead = new ethers.Contract(fluxAddress, FLUX_READ_ABI, readProvider);
                  const updated = await fluxRead.getUserStakedAmount(owner, pool.tokenAddress);
                  setStakingData(prev => {
                    if (!prev) return prev;
                    const pools = prev.pools.map(p => {
                      if (p.tokenAddress.toLowerCase() === pool.tokenAddress.toLowerCase() && p.chainId === pool.chainId) {
                        return {
                          ...p,
                          userStakedWei: updated.toString(),
                          userStaked: ethers.formatUnits(updated, decimals),
                        };
                      }
                      return p;
                    });
                    return { ...prev, pools } as StakingOverview;
                  });
                }
              } catch {}
              await loadStakingData();
              // RPC/인덱싱 지연 보정: 3초 후 한 번 더 재조회
              setTimeout(() => {
                loadStakingData();
              }, 3000);
              setIsSubmitting(false);
            } catch (error: any) {
              console.error('❌ Staking failed:', error);
              Alert.alert('오류', error?.message || '스테이킹에 실패했습니다.');
              setIsSubmitting(false);
            }
          }
        }
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleUnstake = async (pool: StakingPoolInfo) => {
    if (parseFloat(pool.userStaked) === 0) {
      Alert.alert('알림', '스테이킹된 토큰이 없습니다.');
      return;
    }

    Alert.prompt(
      `${pool.tokenSymbol} 언스테이킹`,
      `출금할 ${pool.tokenSymbol} 수량을 입력하세요\n\n스테이킹된 수량: ${pool.userStaked} ${pool.tokenSymbol}`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '출금', 
          style: 'destructive',
          onPress: async (amount) => {
            if (!amount || parseFloat(amount) <= 0) {
              Alert.alert('오류', '올바른 수량을 입력해주세요.');
              return;
            }
            
            if (parseFloat(amount) > parseFloat(pool.userStaked)) {
              Alert.alert('오류', '스테이킹된 수량보다 많이 출금할 수 없습니다.');
              return;
            }
            
            try {
              console.log(`🔓 Unstaking ${amount} ${pool.tokenSymbol} on chain ${pool.chainId}`);
              const signer = await Web3Provider.getSigner(pool.chainId);
              if (!signer) { Alert.alert('오류', '지갑 서명자를 찾을 수 없습니다.'); return; }
              const fluxAddress = FLUX_ADDRESSES[pool.chainId];
              const flux = new ethers.Contract(fluxAddress, FLUX_ABI, signer);
              const decimals = await (new ethers.Contract(pool.tokenAddress, ERC20_ABI, signer)).decimals();
              const amountWei = ethers.parseUnits(amount, decimals);
              setIsSubmitting(true);
              const tx = await flux.unstake(pool.tokenAddress, amountWei);
              Alert.alert('언스테이킹 전송됨', `Tx: ${tx.hash.substring(0, 10)}...`);
              await tx.wait();
              Alert.alert('언스테이킹 완료', `${amount} ${pool.tokenSymbol} 출금 완료.`);
              await loadStakingData();
              setTimeout(() => loadStakingData(), 3000);
              setIsSubmitting(false);
            } catch (error: any) {
              console.error('❌ Unstaking failed:', error);
              Alert.alert('오류', error?.message || '언스테이킹에 실패했습니다.');
              setIsSubmitting(false);
            }
          }
        }
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleClaimRewards = async (pool: StakingPoolInfo) => {
    if (parseFloat(pool.pendingRewards) === 0) {
      Alert.alert('알림', '청구할 보상이 없습니다.');
      return;
    }

    Alert.alert(
      `${pool.tokenSymbol} 보상 청구`,
      `${pool.pendingRewards} ${pool.tokenSymbol} 보상을 청구하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '청구', 
          onPress: async () => {
            try {
              console.log(`💰 Claiming rewards for ${pool.tokenSymbol} on chain ${pool.chainId}`);
              const signer = await Web3Provider.getSigner(pool.chainId);
              if (!signer) { Alert.alert('오류', '지갑 서명자를 찾을 수 없습니다.'); return; }
              const fluxAddress = FLUX_ADDRESSES[pool.chainId];
              const flux = new ethers.Contract(fluxAddress, FLUX_ABI, signer);
              setIsSubmitting(true);
              const tx = await flux.claimRewards(pool.tokenAddress);
              Alert.alert('보상 청구 전송됨', `Tx: ${tx.hash.substring(0, 10)}...`);
              await tx.wait();
              Alert.alert('보상 청구 완료', `${pool.pendingRewards} ${pool.tokenSymbol} 보상이 청구되었습니다.`);
              // 청구 직후 단기 폴링 일시정지 및 디바운스 재조회
              pauseUntilRef.current = Date.now() + 3000;
              setTimeout(() => loadStakingData(), 2000);
              setTimeout(() => loadStakingData(), 5000);
              setIsSubmitting(false);
            } catch (error: any) {
              console.error('❌ Claim rewards failed:', error);
              Alert.alert('오류', error?.message || '보상 청구에 실패했습니다.');
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  // 체인별 필터링된 풀 데이터
  const filteredPools = stakingData?.pools?.filter(pool => {
    if (selectedChain === 'all') return true;
    return pool.chainId === selectedChain;
  }) || [];

  // 사용 가능한 체인 목록
  const availableChains = stakingData?.pools?.reduce((chains, pool) => {
    if (!chains.find(c => c.chainId === pool.chainId)) {
      chains.push({
        chainId: pool.chainId,
        chainName: pool.chainName,
      });
    }
    return chains;
  }, [] as { chainId: number; chainName: string }[]) || [];

  const getChainDisplayName = (chainId: 'all' | number) => {
    if (chainId === 'all') return '모든 체인';
    const chain = availableChains.find(c => c.chainId === chainId);
    return chain?.chainName || `Chain ${chainId}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: semanticColors.background.primary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[4],
      zIndex: 2000,
      backgroundColor: semanticColors.background.primary,
    },
    headerTitle: {
      ...typography.styles.h2,
      color: semanticColors.text.primary,
      fontWeight: 600,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    chainSelectorContainer: {
      position: 'relative',
      zIndex: 3000,
    },
    chainSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary[50],
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary[200],
      minWidth: 120,
    },
    chainSelectorText: {
      ...typography.styles.body2,
      color: colors.primary[600],
      flex: 1,
      marginRight: spacing[2],
      fontWeight: 400,
    },
    chainDropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: semanticColors.background.primary,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.neutral[200],
      ...shadows.lg,
      zIndex: 3001,
      marginTop: spacing[1],
      elevation: 8,
    },
    chainDropdownItem: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.neutral[100],
    },
    chainDropdownItemSelected: {
      backgroundColor: colors.primary[50],
    },
    chainDropdownItemText: {
      ...typography.styles.body2,
      color: semanticColors.text.primary,
      fontWeight: 400,
    },
    chainDropdownItemTextSelected: {
      color: colors.primary[600],
      fontWeight: 600 as any,
    },
    refreshButton: {
      padding: spacing[2],
    },
    overviewCard: {
      margin: spacing[6],
      marginBottom: spacing[4],
      ...components.card,
      backgroundColor: colors.primary[50],
    },
    overviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    overviewTitle: {
      ...typography.styles.h3,
      color: colors.primary[600],
      fontWeight: 600,
    },
    overviewStats: {
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
      fontWeight: 600,
      fontSize: 20,
    },
    statLabel: {
      ...typography.styles.caption,
      color: colors.primary[400],
      fontWeight: 400,
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.primary[200],
      marginHorizontal: spacing[4],
    },
    sectionTitle: {
      ...typography.styles.h3,
      marginHorizontal: spacing[6],
      marginBottom: spacing[4],
      marginTop: spacing[2],
      fontWeight: 600,
    },
    poolCard: {
      marginHorizontal: spacing[6],
      marginBottom: spacing[4],
      ...components.card,
      borderColor: colors.neutral[200],
      borderWidth: 1,
    },
    poolHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    poolTokenInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tokenIcon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary[100],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[3],
    },
    tokenSymbol: {
      ...typography.styles.h3,
      color: colors.primary[600],
      fontWeight: 700,
      fontSize: 18,
    },
    tokenName: {
      ...typography.styles.body2,
      color: semanticColors.text.secondary,
      marginTop: spacing[1],
      fontWeight: 400,
    },
    apyBadge: {
      backgroundColor: colors.success[500],
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.base,
    },
    apyText: {
      ...typography.styles.caption,
      color: colors.white,
      fontWeight: 600 as any,
    },
    poolStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing[5],
    },
    poolStatItem: {
      flex: 1,
      alignItems: 'center',
    },
    poolStatValue: {
      ...typography.styles.body1,
      fontWeight: 600 as any,
      color: semanticColors.text.primary,
      marginBottom: spacing[1],
      fontSize: 13,
    },
    poolStatLabel: {
      ...typography.styles.caption,
      color: semanticColors.text.secondary,
      fontWeight: 400,
    },
    poolActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing[3],
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      borderRadius: borderRadius.md,
      borderWidth: 1,
    },
    stakeButton: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    unstakeButton: {
      backgroundColor: 'transparent',
      borderColor: colors.neutral[300],
    },
    claimButton: {
      backgroundColor: colors.success[500],
      borderColor: colors.success[500],
    },
    actionButtonText: {
      ...typography.styles.body2,
      fontWeight: 600 as any,
      marginLeft: spacing[2],
    },
    stakeButtonText: {
      color: colors.white,
    },
    unstakeButtonText: {
      color: semanticColors.text.primary,
    },
    claimButtonText: {
      color: colors.white,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing[10],
    },
    emptyStateIcon: {
      marginBottom: spacing[4],
    },
    emptyStateTitle: {
      ...typography.styles.h3,
      color: semanticColors.text.secondary,
      marginBottom: spacing[2],
      fontWeight: 600,
    },
    emptyStateDescription: {
      ...typography.styles.body2,
      color: semanticColors.text.tertiary,
      textAlign: 'center',
      paddingHorizontal: spacing[8],
      fontWeight: 400,
    },
  });

  if (!address) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={semanticColors.background.primary} />
        <SafeAreaView style={styles.container}>
          <View style={styles.emptyState}>
            <Icon name="account-alert" size={64} color={semanticColors.text.tertiary} style={styles.emptyStateIcon} />
            <Text style={styles.emptyStateTitle}>지갑 연결 필요</Text>
            <Text style={styles.emptyStateDescription}>
              스테이킹을 이용하려면 먼저 지갑을 연결해주세요.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={semanticColors.background.primary} />
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>스테이킹</Text>
          <View style={styles.headerActions}>
            {/* 체인 선택 드롭다운 */}
            {availableChains.length > 0 && (
              <View style={styles.chainSelectorContainer}>
                <TouchableOpacity
                  style={styles.chainSelector}
                  onPress={() => setShowChainDropdown(!showChainDropdown)}
                >
                  <Text style={styles.chainSelectorText}>
                    {getChainDisplayName(selectedChain)}
                  </Text>
                  <Icon 
                    name={showChainDropdown ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.primary[500]} 
                  />
                </TouchableOpacity>
                
                {showChainDropdown && (
                  <View style={styles.chainDropdown}>
                    <TouchableOpacity
                      style={[
                        styles.chainDropdownItem,
                        selectedChain === 'all' && styles.chainDropdownItemSelected
                      ]}
                      onPress={() => {
                        setSelectedChain('all');
                        setShowChainDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.chainDropdownItemText,
                        selectedChain === 'all' && styles.chainDropdownItemTextSelected
                      ]}>
                        모든 체인
                      </Text>
                    </TouchableOpacity>
                    
                    {availableChains.map((chain) => (
                      <TouchableOpacity
                        key={chain.chainId}
                        style={[
                          styles.chainDropdownItem,
                          selectedChain === chain.chainId && styles.chainDropdownItemSelected
                        ]}
                        onPress={() => {
                          setSelectedChain(chain.chainId);
                          setShowChainDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.chainDropdownItemText,
                          selectedChain === chain.chainId && styles.chainDropdownItemTextSelected
                        ]}>
                          {chain.chainName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <Icon 
                name="refresh" 
                size={24} 
                color={refreshing ? colors.neutral[400] : colors.primary[500]} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
          }
        >
          {/* 스테이킹 현황 카드 */}
          {stakingData && (
            <Animated.View entering={FadeInUp.delay(100).duration(600)}>
              <View style={styles.overviewCard}>
                <View style={styles.overviewHeader}>
                  <Text style={styles.overviewTitle}>내 스테이킹 현황</Text>
                </View>
                <View style={styles.overviewStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      ₩{stakingData.totalValueStaked.toLocaleString('ko-KR')}
                    </Text>
                    <Text style={styles.statLabel}>총 스테이킹</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      ₩{stakingData.totalPendingRewards.toLocaleString('ko-KR')}
                    </Text>
                    <Text style={styles.statLabel}>대기 보상</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      ₩{stakingData.totalClaimedRewards.toLocaleString('ko-KR')}
                    </Text>
                    <Text style={styles.statLabel}>총 수익</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {/* 스테이킹 풀 목록 */}
          <Text style={styles.sectionTitle}>
            스테이킹 풀 {selectedChain !== 'all' && `(${getChainDisplayName(selectedChain)})`}
          </Text>
          
          {filteredPools.map((pool, index) => (
            <Animated.View 
              key={`${pool.chainId}-${pool.tokenAddress}`}
              entering={FadeInDown.delay(200 + index * 100).duration(600)}
            >
              <View style={styles.poolCard}>
                {/* 풀 헤더 */}
                <View style={styles.poolHeader}>
                  <View style={styles.poolTokenInfo}>
                    <View style={styles.tokenIcon}>
                      <Text style={[styles.tokenSymbol, { fontSize: 14 }]}>
                        {pool.tokenSymbol}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.tokenSymbol}>{pool.tokenSymbol}</Text>
                      <Text style={styles.tokenName}>{pool.chainName}</Text>
                    </View>
                  </View>
                  <View style={styles.apyBadge}>
                    <Text style={styles.apyText}>{pool.estimatedApy}% APY</Text>
                  </View>
                </View>

                {/* 풀 통계 */}
                <View style={styles.poolStats}>
                  <View style={styles.poolStatItem}>
                    <Text style={styles.poolStatValue}>{pool.totalStaked}</Text>
                    <Text style={styles.poolStatLabel}>총 예치</Text>
                  </View>
                  <View style={styles.poolStatItem}>
                    <Text style={styles.poolStatValue}>{pool.userStaked}</Text>
                    <Text style={styles.poolStatLabel}>내 예치</Text>
                  </View>
                  <View style={styles.poolStatItem}>
                    <Text style={styles.poolStatValue}>{pool.pendingRewards}</Text>
                    <Text style={styles.poolStatLabel}>대기 보상</Text>
                  </View>
                  <View style={styles.poolStatItem}>
                    <Text style={styles.poolStatValue}>{pool.userSharePercentage}%</Text>
                    <Text style={styles.poolStatLabel}>내 지분</Text>
                  </View>
                </View>

                {/* 액션 버튼들 */}
                <View style={styles.poolActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.stakeButton]}
                    onPress={() => handleStakeTokens(pool)}
                  >
                    <Icon name="plus" size={16} color={colors.white} />
                    <Text style={[styles.actionButtonText, styles.stakeButtonText]}>
                      스테이킹
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.unstakeButton]}
                    onPress={() => handleUnstake(pool)}
                  >
                    <Icon name="minus" size={16} color={semanticColors.text.primary} />
                    <Text style={[styles.actionButtonText, styles.unstakeButtonText]}>
                      출금
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.claimButton]}
                    onPress={() => handleClaimRewards(pool)}
                  >
                    <Icon name="gift" size={16} color={colors.white} />
                    <Text style={[styles.actionButtonText, styles.claimButtonText]}>
                      보상
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      </SafeAreaView>
      {/* 글로벌 로딩/제출 오버레이 (SafeArea 위에 배치) */}
      {(isLoading || isSubmitting) && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.25)',
          zIndex: 5000,
          alignItems: 'center',
          justifyContent: 'center'
        }} pointerEvents="auto">
          <View style={{ backgroundColor: semanticColors.background.primary, padding: spacing[4], borderRadius: borderRadius.md, flexDirection: 'row', alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.primary[500]} style={{ marginRight: spacing[2] }} />
            <Text style={{ color: semanticColors.text.primary }}>{isSubmitting ? '트랜잭션 전송 중...' : '불러오는 중...'}</Text>
          </View>
        </View>
      )}
    </View>
  );
}