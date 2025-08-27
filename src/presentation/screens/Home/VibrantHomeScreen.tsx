import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWalletStore } from '../../../infrastructure/stores/walletStore';
import { vibrantColors, vibrantGradients, typography, spacing, shadows } from '../../theme/vibrantTheme';

const { width } = Dimensions.get('window');

export default function VibrantHomeScreen() {
  const navigation = useNavigation<any>();
  const { assets, transactions, totalBalance } = useWalletStore();
  const [selectedTab, setSelectedTab] = useState('assets');

  const quickActions = [
    {
      id: 'staking',
      icon: 'bank-plus',
      title: '스테이킹',
      subtitle: '수익 창출',
      gradient: vibrantGradients.stakingCard,
      onPress: () => navigation.navigate('Staking'),
    },
    {
      id: 'swap',
      icon: 'swap-horizontal',
      title: '스왑',
      subtitle: '토큰 교환',
      gradient: vibrantGradients.swapCard,
      onPress: () => navigation.navigate('Payment'),
    },
    {
      id: 'payment',
      icon: 'credit-card',
      title: '결제',
      subtitle: '간편 결제',
      gradient: vibrantGradients.paymentCard,
      onPress: () => navigation.navigate('Payment'),
    },
    {
      id: 'history',
      icon: 'history',
      title: '내역',
      subtitle: '거래 기록',
      gradient: vibrantGradients.historyCard,
      onPress: () => navigation.navigate('PaymentHistory'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* 트렌디한 헤더 */}
      <LinearGradient
        colors={vibrantGradients.headerBg}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <Animated.View entering={FadeInUp.delay(100).duration(600)}>
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.greeting}>Good Evening! 🌅</Text>
                  <Text style={styles.userName}>사용자님</Text>
                </View>
                <TouchableOpacity style={styles.profileButton}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                    style={styles.profileGradient}
                  >
                    <Icon name="account" size={24} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>총 자산</Text>
                <Text style={styles.balanceAmount}>
                  {totalBalance.toLocaleString('ko-KR', { minimumFractionDigits: 2 })}원
                </Text>
                <View style={styles.balanceChange}>
                  <View style={styles.changeBadge}>
                    <Icon name="trending-up" size={14} color={vibrantColors.success} />
                    <Text style={styles.changeText}>+12.5%</Text>
                  </View>
                  <Text style={styles.changePeriod}>24시간</Text>
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
      >
        {/* 퀵 액션 - 생동감 있는 카드 */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>빠른 실행</Text>
          <View style={styles.quickActions}>
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
                  <LinearGradient
                    colors={action.gradient}
                    style={styles.actionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.actionIcon}>
                      <Icon name={action.icon} size={24} color="#FFFFFF" />
                    </View>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* 트렌디한 탭 시스템 */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.tabSection}>
          <View style={styles.tabContainer}>
            {[
              { key: 'assets', label: '💎 자산', icon: 'wallet' },
              { key: 'staking', label: '🚀 스테이킹', icon: 'rocket' },
              { key: 'history', label: '📊 거래내역', icon: 'chart-line' }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
                onPress={() => setSelectedTab(tab.key)}
                activeOpacity={0.7}
              >
                {selectedTab === tab.key && (
                  <LinearGradient
                    colors={vibrantGradients.primary}
                    style={styles.activeTabGradient}
                  />
                )}
                <Text style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.activeTabText
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* 콘텐츠 섹션 */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.contentSection}>
          {selectedTab === 'assets' && (
            <View style={styles.assetsList}>
              <Text style={styles.sectionTitle}>내 자산</Text>
              {assets.map((asset, index) => (
                <Animated.View
                  key={asset.id}
                  entering={FadeInDown.delay(600 + index * 100).duration(600)}
                >
                  <TouchableOpacity style={styles.assetCard}>
                    <View style={styles.assetLeft}>
                      <LinearGradient
                        colors={[vibrantColors.primaryLight, vibrantColors.primary]}
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
                      <Text style={styles.assetBalance}>{asset.balance}</Text>
                      <Text style={styles.assetValue}>{asset.balanceUSD.toLocaleString()}원</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}

          {selectedTab === 'staking' && (
            <View style={styles.stakingSection}>
              <Text style={styles.sectionTitle}>스테이킹 현황</Text>
              <TouchableOpacity style={styles.stakingCard}>
                <LinearGradient
                  colors={vibrantGradients.stakingCard}
                  style={styles.stakingGradient}
                >
                  <View style={styles.stakingHeader}>
                    <Text style={styles.stakingTitle}>💰 총 스테이킹</Text>
                    <View style={styles.apyBadge}>
                      <Text style={styles.apyText}>🔥 12.5% APY</Text>
                    </View>
                  </View>
                  <View style={styles.stakingStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>$6,000</Text>
                      <Text style={styles.statLabel}>스테이킹 금액</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>$76.25</Text>
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
              {transactions.slice(0, 5).map((tx, index) => (
                <Animated.View
                  key={tx.id}
                  entering={FadeInDown.delay(600 + index * 100).duration(600)}
                >
                  <TouchableOpacity style={styles.transactionCard}>
                    <View style={styles.txLeft}>
                      <LinearGradient
                        colors={getTransactionGradient(tx.type)}
                        style={styles.txIcon}
                      >
                        <Icon name={getTransactionIcon(tx.type)} size={18} color="#FFFFFF" />
                      </LinearGradient>
                      <View style={styles.txInfo}>
                        <Text style={styles.txType}>{getTransactionLabel(tx.type)}</Text>
                        <Text style={styles.txTime}>
                          {new Date(tx.timestamp).toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.txRight}>
                      <Text style={styles.txAmount}>
                        {tx.type === 'RECEIVE' ? '+' : ''}{tx.value} {tx.asset.symbol}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tx.status) }]}>
                        <Text style={styles.statusText}>{getStatusLabel(tx.status)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

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

const getTransactionGradient = (type: string) => {
  switch (type) {
    case 'PAYMENT': return vibrantGradients.paymentCard;
    case 'STAKE': return vibrantGradients.stakingCard;
    case 'SWAP': return vibrantGradients.swapCard;
    case 'RECEIVE': return vibrantGradients.success;
    default: return vibrantGradients.primary;
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
    case 'CONFIRMED': return `${vibrantColors.success}20`;
    case 'PENDING': return `${vibrantColors.warning}20`;
    case 'FAILED': return `${vibrantColors.error}20`;
    default: return `${vibrantColors.textTertiary}20`;
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: vibrantColors.background,
  },
  header: {
    paddingBottom: spacing.xl,
  },
  headerContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  userName: {
    ...typography.h2,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  profileButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  profileGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceSection: {
    alignItems: 'center',
  },
  balanceLabel: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.sm,
  },
  balanceAmount: {
    ...typography.h1,
    color: '#FFFFFF',
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  changeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 4,
  },
  changePeriod: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
    marginTop: -spacing.lg,
  },
  scrollContent: {
    paddingBottom: 100, // 바텀 네비게이션 공간 확보
  },
  quickActionsContainer: {
    backgroundColor: vibrantColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: vibrantColors.text,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  actionWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.medium,
  },
  actionGradient: {
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    ...typography.buttonSmall,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 2,
  },
  actionSubtitle: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
  },
  tabSection: {
    paddingHorizontal: spacing.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    ...shadows.small,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  activeTab: {},
  activeTabGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  tabText: {
    ...typography.buttonSmall,
    color: vibrantColors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  contentSection: {
    paddingHorizontal: spacing.lg,
  },
  assetsList: {},
  assetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  assetSymbol: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    ...typography.body1,
    color: vibrantColors.text,
    fontWeight: '700',
  },
  assetChain: {
    ...typography.caption,
    color: vibrantColors.textSecondary,
    marginTop: 2,
  },
  assetRight: {
    alignItems: 'flex-end',
  },
  assetBalance: {
    ...typography.body1,
    color: vibrantColors.text,
    fontWeight: '700',
  },
  assetValue: {
    ...typography.caption,
    color: vibrantColors.textSecondary,
    marginTop: 2,
  },
  stakingSection: {},
  stakingCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.colored,
  },
  stakingGradient: {
    padding: spacing.xl,
  },
  stakingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stakingTitle: {
    ...typography.h3,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  apyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  apyText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
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
    ...typography.h2,
    color: '#FFFFFF',
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: spacing.lg,
    borderRadius: 1,
  },
  historySection: {},
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  txInfo: {
    flex: 1,
  },
  txType: {
    ...typography.body1,
    color: vibrantColors.text,
    fontWeight: '600',
  },
  txTime: {
    ...typography.caption,
    color: vibrantColors.textSecondary,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    ...typography.body1,
    color: vibrantColors.text,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  statusText: {
    ...typography.caption,
    color: vibrantColors.text,
    fontWeight: '600',
    fontSize: 10,
  },
});