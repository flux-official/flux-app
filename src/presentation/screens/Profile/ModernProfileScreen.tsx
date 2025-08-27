import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Clipboard from 'expo-clipboard';
import { useWalletStore } from '../../../infrastructure/stores/walletStore';
import { WalletManager } from '../../../services/wallet';
import { useThemeStore } from '../../../infrastructure/stores/themeStore';
import { createDynamicDesignSystem } from '../../theme/dynamicDesignSystem';

export default function ModernProfileScreen() {
  const navigation = useNavigation<any>();
  const { address, totalBalance, disconnectWallet, walletData } = useWalletStore();
  const { currentTheme } = useThemeStore();
  const { colors, semanticColors, typography, spacing, shadows, borderRadius, components } = createDynamicDesignSystem(currentTheme);

  const formatAddress = (addr: string) => {
    if (!addr) return '지갑 연결 필요';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleCopyAddress = async () => {
    if (address) {
      await Clipboard.setStringAsync(address);
      Alert.alert('복사 완료', '지갑 주소가 클립보드에 복사되었습니다.');
    }
  };

  const handleShowPrivateKey = async () => {
    if (!walletData) {
      Alert.alert('오류', '지갑 데이터를 찾을 수 없습니다.');
      return;
    }

    Alert.alert(
      '⚠️ 보안 경고',
      'Private Key는 매우 중요한 정보입니다.\n다른 사람과 절대 공유하지 마세요!\n\nPrivate Key를 확인하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '확인', 
          style: 'destructive',
          onPress: () => showPrivateKeyModal()
        }
      ]
    );
  };

  const showPrivateKeyModal = () => {
    if (!walletData?.privateKey) {
      Alert.alert('오류', 'Private Key를 찾을 수 없습니다.');
      return;
    }

    const privateKey = walletData.privateKey;
    const maskedKey = `${privateKey.substring(0, 10)}...${privateKey.substring(privateKey.length - 10)}`;

    Alert.alert(
      '🔐 Private Key',
      `${maskedKey}\n\n탭하여 전체 키 복사`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '복사', 
          onPress: async () => {
            await Clipboard.setStringAsync(privateKey);
            Alert.alert('복사 완료', 'Private Key가 클립보드에 복사되었습니다.\n\n⚠️ 보안을 위해 사용 후 클립보드를 지워주세요.');
          }
        }
      ]
    );
  };

  const handleDisconnect = () => {
    Alert.alert(
      '지갑 연결 해제',
      '지갑 연결을 해제하시겠습니까?\n\n- 임시 연결 해제: 앱 재시작 시 자동 연결\n- 완전 삭제: 지갑 데이터 완전 삭제 (복구 불가)',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '임시 해제', 
          onPress: () => {
            disconnectWallet();
            Alert.alert('완료', '지갑 연결이 해제되었습니다.');
          }
        },
        { 
          text: '완전 삭제', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '지갑 완전 삭제',
              '⚠️ 경고: 지갑이 완전히 삭제됩니다.\n시드 구문을 백업하지 않았다면 복구가 불가능합니다.',
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '삭제',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      if (walletData) {
                        const walletId = `wallet_${walletData.address.toLowerCase()}`;
                        await WalletManager.deleteWallet(walletId);
                      }
                      disconnectWallet();
                      // 온보딩으로 이동 (네비게이션 스택 초기화)
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'WalletOnboarding' }],
                      });
                    } catch (error) {
                      Alert.alert('오류', '지갑 삭제에 실패했습니다.');
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      section: 'activity',
      title: '내 활동',
      items: [
        { 
          icon: 'bank', 
          title: '스테이킹 관리', 
          subtitle: '내 스테이킹 포지션 확인',
          onPress: () => navigation.navigate('Staking')
        },
        { 
          icon: 'history', 
          title: '거래 내역', 
          subtitle: '모든 거래 기록 보기',
          onPress: () => navigation.navigate('PaymentHistory')
        },
        { 
          icon: 'chart-line', 
          title: '수익 분석', 
          subtitle: '포트폴리오 수익률 분석',
          onPress: () => Alert.alert('준비중', '이 기능은 준비 중입니다.')
        },
      ]
    },
    {
      section: 'settings',
      title: '설정',
      items: [
        { 
          icon: 'web', 
          title: '네트워크 설정', 
          subtitle: '기본 블록체인 네트워크 변경',
          onPress: () => Alert.alert('준비중', '이 기능은 준비 중입니다.')
        },
        { 
          icon: 'percent', 
          title: '슬리피지 설정', 
          subtitle: '스왑 슬리피지 허용치 조정',
          onPress: () => Alert.alert('준비중', '이 기능은 준비 중입니다.')
        },
        { 
          icon: 'gas-station', 
          title: '가스비 설정', 
          subtitle: '트랜잭션 수수료 우선순위',
          onPress: () => Alert.alert('준비중', '이 기능은 준비 중입니다.')
        },
        { 
          icon: 'bell-outline', 
          title: '알림 설정', 
          subtitle: '푸시 알림 및 이메일 설정',
          onPress: () => Alert.alert('준비중', '이 기능은 준비 중입니다.')
        },
      ]
    },
    {
      section: 'security',
      title: '보안',
      items: [
        { 
          icon: 'key-variant', 
          title: '시드 구문 백업', 
          subtitle: '지갑 복구 구문 확인 및 백업',
          onPress: () => Alert.alert('보안', '시드 구문을 안전한 곳에 보관하세요.')
        },
        { 
          icon: 'key-outline', 
          title: 'Private Key 확인', 
          subtitle: '지갑 Private Key 보기 및 복사',
          onPress: handleShowPrivateKey
        },
        { 
          icon: 'fingerprint', 
          title: '생체 인증', 
          subtitle: 'Face ID / Touch ID 설정',
          onPress: () => Alert.alert('준비중', '이 기능은 준비 중입니다.')
        },
        { 
          icon: 'shield-check', 
          title: '보안 검사', 
          subtitle: '지갑 보안 상태 점검',
          onPress: () => Alert.alert('보안 검사', '지갑 보안 상태가 양호합니다.')
        },
      ]
    },
    {
      section: 'support',
      title: '지원',
      items: [
        { 
          icon: 'help-circle-outline', 
          title: '도움말', 
          subtitle: 'FAQ 및 사용 가이드',
          onPress: () => Alert.alert('준비중', '이 기능은 준비 중입니다.')
        },
        { 
          icon: 'message-outline', 
          title: '고객 지원', 
          subtitle: '문의사항 및 피드백',
          onPress: () => Alert.alert('준비중', '이 기능은 준비 중입니다.')
        },
        { 
          icon: 'information-outline', 
          title: '앱 정보', 
          subtitle: '버전 및 라이선스 정보',
          onPress: () => Alert.alert('앱 정보', 'KAIA Wallet v1.0.0')
        },
      ]
    }
  ];

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
    settingsButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
    },
    userCard: {
      ...components.card,
      margin: spacing[6],
      borderColor: colors.neutral[200],
      borderWidth: 1,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing[5],
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary[50],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[4],
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      ...typography.styles.h3,
      marginBottom: spacing[1],
    },
    userAddress: {
      ...typography.styles.body2,
      fontFamily: typography.fontFamily.mono,
    },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing[1],
    },
    copyIcon: {
      marginLeft: spacing[2],
    },
    balanceInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: spacing[4],
      borderTopWidth: 1,
      borderTopColor: semanticColors.border.light,
    },
    balanceLabel: {
      ...typography.styles.body1,
    },
    balanceValue: {
      ...typography.styles.h3,
      fontWeight: typography.fontWeight.bold,
    },
    menuSection: {
      marginBottom: spacing[6],
    },
    sectionTitle: {
      ...typography.styles.body1,
      fontWeight: typography.fontWeight.semibold,
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[4],
      backgroundColor: semanticColors.background.secondary,
    },
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: semanticColors.background.primary,
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: semanticColors.border.light,
    },
    lastMenuItem: {
      borderBottomWidth: 0,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    menuIcon: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      backgroundColor: colors.neutral[100],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing[4],
    },
    menuTextContainer: {
      flex: 1,
    },
    menuTitle: {
      ...typography.styles.body1,
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[1],
    },
    menuSubtitle: {
      ...typography.styles.caption,
    },
    dangerSection: {
      padding: spacing[6],
    },
    dangerButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: semanticColors.background.primary,
      paddingVertical: spacing[5],
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.error[500],
    },
    dangerButtonText: {
      ...typography.styles.body1,
      color: colors.error[500],
      fontWeight: typography.fontWeight.semibold,
      marginLeft: spacing[2],
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary[500]} />
      
      {/* 헤더 */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>프로필</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Icon name="cog-outline" size={20} color={semanticColors.text.secondary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 사용자 정보 카드 */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Icon name="account" size={32} color={colors.primary[500]} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>내 지갑</Text>
              <TouchableOpacity onPress={handleCopyAddress} style={styles.addressRow}>
                <Text style={styles.userAddress}>{formatAddress(address || '')}</Text>
                {address && (
                  <Icon 
                    name="content-copy" 
                    size={18} 
                    color={colors.primary[500]} 
                    style={styles.copyIcon}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>총 자산</Text>
            <Text style={styles.balanceValue}>${totalBalance.toLocaleString()}</Text>
          </View>
        </View>

        {/* 메뉴 섹션들 */}
        {menuItems.map((section) => (
          <View key={section.section} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.menuItem,
                  index === section.items.length - 1 && styles.lastMenuItem
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <Icon name={item.icon} size={20} color={semanticColors.text.secondary} />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={16} color={semanticColors.text.tertiary} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* 지갑 연결 해제 */}
        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.dangerButton} onPress={handleDisconnect}>
            <Icon name="logout" size={20} color={colors.error[500]} />
            <Text style={styles.dangerButtonText}>지갑 연결 해제</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

