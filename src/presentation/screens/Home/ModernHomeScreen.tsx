import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWalletStore } from '../../../infrastructure/stores/walletStore';
import { TransactionStatusCard } from '../../components/TransactionStatusCard';
import { modernColors, spacing, typography, shadows } from '../../theme/modernTheme';

export default function ModernHomeScreen() {
  const { assets, totalBalance, address, refreshWallet, isLoading } = useWalletStore();
  const [selectedTab, setSelectedTab] = useState('assets');

  // 화면 로드 시 잔액 새로고침
  useEffect(() => {
    if (address) {
      refreshWallet();
    }
  }, [address]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* 깔끔한 헤더 */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>안녕하세요</Text>
            <Text style={styles.userName}>사용자님</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="bell-outline" size={20} color={modernColors.textSecondary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 잔액 카드 - 토스 스타일 */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>총 자산</Text>
            <TouchableOpacity 
              onPress={() => address && refreshWallet()}
              disabled={isLoading}
              style={styles.refreshButton}
            >
              <Icon 
                name="refresh" 
                size={16} 
                color={modernColors.textSecondary}
                style={isLoading ? { opacity: 0.5 } : {}}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {isLoading ? '로딩 중...' : `${totalBalance.toLocaleString()}원`}
          </Text>
          <View style={styles.balanceChange}>
            <Icon name="trending-up" size={14} color={modernColors.success} />
            <Text style={styles.changeText}>+12.5%</Text>
            <Text style={styles.changePeriod}>24시간</Text>
          </View>
        </View>

        {/* 액션 버튼들 - 미니멀 */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#F0F8FF' }]}>
              <Icon name="bank-plus" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.actionText}>스테이킹</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#FFF8F0' }]}>
              <Icon name="swap-horizontal" size={20} color={modernColors.primary} />
            </View>
            <Text style={styles.actionText}>스왑</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}>
              <Icon name="credit-card-outline" size={20} color={modernColors.success} />
            </View>
            <Text style={styles.actionText}>결제</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#FAFAFA' }]}>
              <Icon name="history" size={20} color={modernColors.textSecondary} />
            </View>
            <Text style={styles.actionText}>내역</Text>
          </TouchableOpacity>
        </View>

        {/* 최근 거래 상태 */}
        <TransactionStatusCard />

        {/* 탭 메뉴 - 카카오뱅크 스타일 */}
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
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 자산 리스트 */}
        {selectedTab === 'assets' && (
          <View style={styles.assetList}>
            {assets.map((asset) => (
              <TouchableOpacity key={asset.id} style={styles.assetItem}>
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
                  <Text style={styles.assetBalance}>{asset.balance}</Text>
                  <Text style={styles.assetValue}>{asset.balanceUSD.toLocaleString()}원</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 스테이킹 정보 */}
        {selectedTab === 'staking' && (
          <View style={styles.stakingContainer}>
            <View style={styles.stakingCard}>
              <View style={styles.stakingHeader}>
                <Text style={styles.stakingTitle}>내 스테이킹</Text>
                <View style={styles.apyBadge}>
                  <Text style={styles.apyText}>12.5%</Text>
                </View>
              </View>
              <View style={styles.stakingStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>6,000,000원</Text>
                  <Text style={styles.statLabel}>총 스테이킹</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>76,250원</Text>
                  <Text style={styles.statLabel}>누적 보상</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernColors.background,
  },
  header: {
    backgroundColor: modernColors.background,
    borderBottomWidth: 1,
    borderBottomColor: modernColors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: {},
  greeting: {
    ...typography.body2,
    color: modernColors.textSecondary,
  },
  userName: {
    ...typography.h3,
    color: modernColors.text,
    marginTop: 2,
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: modernColors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: modernColors.card,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.small,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  balanceLabel: {
    ...typography.body2,
    color: modernColors.textSecondary,
  },
  refreshButton: {
    padding: spacing.xs,
    borderRadius: 12,
  },
  balanceAmount: {
    ...typography.h1,
    color: modernColors.text,
    marginBottom: spacing.sm,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    ...typography.body2,
    color: modernColors.success,
    fontWeight: '600',
    marginLeft: 4,
  },
  changePeriod: {
    ...typography.caption,
    color: modernColors.textTertiary,
    marginLeft: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionText: {
    ...typography.caption,
    color: modernColors.text,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.lg,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: modernColors.primary,
  },
  tabText: {
    ...typography.body1,
    color: modernColors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: modernColors.primary,
    fontWeight: '600',
  },
  assetList: {
    paddingHorizontal: spacing.lg,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: modernColors.border,
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: modernColors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  assetSymbol: {
    ...typography.caption,
    color: modernColors.primary,
    fontWeight: '700',
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    ...typography.body1,
    color: modernColors.text,
    fontWeight: '600',
  },
  assetChain: {
    ...typography.caption,
    color: modernColors.textSecondary,
    marginTop: 2,
  },
  assetRight: {
    alignItems: 'flex-end',
  },
  assetBalance: {
    ...typography.body1,
    color: modernColors.text,
    fontWeight: '600',
  },
  assetValue: {
    ...typography.caption,
    color: modernColors.textSecondary,
    marginTop: 2,
  },
  stakingContainer: {
    paddingHorizontal: spacing.lg,
  },
  stakingCard: {
    backgroundColor: modernColors.card,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.small,
  },
  stakingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stakingTitle: {
    ...typography.h3,
    color: modernColors.text,
  },
  apyBadge: {
    backgroundColor: modernColors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  apyText: {
    ...typography.caption,
    color: modernColors.primary,
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
    color: modernColors.text,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: modernColors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: modernColors.border,
    marginHorizontal: spacing.md,
  },
});