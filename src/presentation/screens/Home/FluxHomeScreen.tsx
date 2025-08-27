import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWalletStore } from '../../../infrastructure/stores/walletStore';
import { fluxColors, fluxGradients } from '../../theme/fluxTheme';

const { width } = Dimensions.get('window');

export default function FluxHomeScreen() {
  const { assets, transactions, totalBalance } = useWalletStore();
  const [selectedTab, setSelectedTab] = useState('assets');
  
  // FLUX 무한대 애니메이션
  const infinityScale = useSharedValue(1);
  const infinityRotate = useSharedValue(0);

  React.useEffect(() => {
    infinityScale.value = withRepeat(withTiming(1.05, { duration: 2000 }), -1, true);
    infinityRotate.value = withRepeat(withTiming(5, { duration: 3000 }), -1, true);
  }, []);

  const infinityStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: infinityScale.value },
      { rotate: `${infinityRotate.value}deg` }
    ],
  }));

  return (
    <View style={styles.container}>
      {/* FLUX 헤더 */}
      <LinearGradient
        colors={fluxGradients.main}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <Animated.View entering={FadeInUp.delay(100)}>
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                {/* FLUX 로고 영역 */}
                <Animated.View style={[styles.logoContainer, infinityStyle]}>
                  <Text style={styles.fluxLogo}>∞</Text>
                  <Text style={styles.fluxText}>FLUX</Text>
                </Animated.View>
                <TouchableOpacity style={styles.profileButton}>
                  <Icon name="account-circle" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>총 자산</Text>
                <Text style={styles.balanceAmount}>
                  {totalBalance.toLocaleString('ko-KR', { minimumFractionDigits: 2 })}원
                </Text>
                <View style={styles.balanceChange}>
                  <Icon name="trending-up" size={16} color="#FFD54F" />
                  <Text style={styles.changeText}>+12.5% (24h)</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      {/* 곡선형 카드 컨테이너 */}
      <View style={styles.curvedContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 퀵 액션 - FLUX 스타일 곡선형 */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.quickActions}>
            <TouchableOpacity style={styles.actionItem}>
              <LinearGradient colors={fluxGradients.staking} style={styles.actionGradient}>
                <Icon name="bank-plus" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionText}>스테이킹</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <LinearGradient colors={fluxGradients.swap} style={styles.actionGradient}>
                <View style={styles.infinityIcon}>
                  <Text style={styles.infinitySymbol}>∞</Text>
                </View>
              </LinearGradient>
              <Text style={styles.actionText}>스왑</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <LinearGradient colors={fluxGradients.payment} style={styles.actionGradient}>
                <Icon name="credit-card" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionText}>결제</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <LinearGradient colors={fluxGradients.infinity} style={styles.actionGradient}>
                <Icon name="history" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionText}>내역</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* 흐름형 탭 선택기 */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.flowTabs}>
            {['assets', 'staking', 'history'].map((tab, index) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.flowTab,
                  selectedTab === tab && styles.activeFlowTab,
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[
                  styles.flowTabText,
                  selectedTab === tab && styles.activeFlowTabText
                ]}>
                  {tab === 'assets' ? '자산' : tab === 'staking' ? '스테이킹' : '거래내역'}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* FLUX 스타일 컨텐츠 카드 */}
          <Animated.View entering={FadeInDown.delay(400)}>
            {selectedTab === 'assets' && (
              <View style={styles.contentSection}>
                {assets.map((asset, index) => (
                  <Animated.View
                    key={asset.id}
                    entering={FadeInDown.delay(400 + index * 100)}
                  >
                    <TouchableOpacity style={styles.fluxCard}>
                      <LinearGradient
                        colors={['#FFFFFF', '#FFF8F5']}
                        style={styles.cardGradient}
                      >
                        <View style={styles.assetContent}>
                          <View style={styles.assetLeft}>
                            <View style={[styles.assetIcon, { backgroundColor: `${fluxColors.light.primary}20` }]}>
                              <Text style={styles.assetSymbol}>{asset.symbol.substring(0, 2)}</Text>
                            </View>
                            <View>
                              <Text style={styles.assetName}>{asset.symbol}</Text>
                              <Text style={styles.assetChain}>{asset.chain.name}</Text>
                            </View>
                          </View>
                          <View style={styles.assetRight}>
                            <Text style={styles.assetBalance}>{asset.balance}</Text>
                            <Text style={styles.assetValue}>{asset.balanceUSD.toLocaleString()}원</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            )}

            {selectedTab === 'staking' && (
              <View style={styles.contentSection}>
                <TouchableOpacity style={styles.stakingFluxCard}>
                  <LinearGradient
                    colors={fluxGradients.main}
                    style={styles.stakingGradient}
                  >
                    <View style={styles.stakingHeader}>
                      <Text style={styles.stakingTitle}>FLUX 스테이킹</Text>
                      <View style={styles.infinityBadge}>
                        <Text style={styles.infinityText}>∞ 12.5%</Text>
                      </View>
                    </View>
                    <View style={styles.stakingStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>총 스테이킹</Text>
                        <Text style={styles.statValue}>$6,000</Text>
                      </View>
                      <View style={styles.flowDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>누적 보상</Text>
                        <Text style={styles.statValue}>$76.25</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: fluxColors.light.background,
  },
  header: {
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fluxLogo: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
  },
  fluxText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceSection: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    color: '#FFD54F',
    marginLeft: 4,
    fontWeight: '600',
  },
  curvedContainer: {
    flex: 1,
    marginTop: -20,
    backgroundColor: fluxColors.light.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 4,
    shadowColor: fluxColors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  infinityIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infinitySymbol: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  actionText: {
    fontSize: 12,
    color: fluxColors.light.text,
    fontWeight: '600',
  },
  flowTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 4,
    elevation: 2,
  },
  flowTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 16,
  },
  activeFlowTab: {
    backgroundColor: fluxColors.light.primary,
  },
  flowTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: fluxColors.light.textSecondary,
  },
  activeFlowTabText: {
    color: '#FFFFFF',
  },
  contentSection: {
    paddingHorizontal: 20,
  },
  fluxCard: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: fluxColors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: 16,
  },
  assetContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: fluxColors.light.primary,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: fluxColors.light.text,
  },
  assetChain: {
    fontSize: 12,
    color: fluxColors.light.textSecondary,
    marginTop: 2,
  },
  assetRight: {
    alignItems: 'flex-end',
  },
  assetBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: fluxColors.light.text,
  },
  assetValue: {
    fontSize: 12,
    color: fluxColors.light.textSecondary,
    marginTop: 2,
  },
  stakingFluxCard: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: fluxColors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  stakingGradient: {
    padding: 20,
  },
  stakingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stakingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infinityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  infinityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stakingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  flowDivider: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
});