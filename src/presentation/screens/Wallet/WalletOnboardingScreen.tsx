import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useWalletStore } from '../../../infrastructure/stores/walletStore';

export const WalletOnboardingScreen = ({ navigation }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const { createNewWallet } = useWalletStore();

  const handleCreateWallet = async () => {
    try {
      setIsLoading(true);
      const wallet = await createNewWallet('Main Wallet');
      Alert.alert(
        '지갑 생성 완료',
        `새 지갑이 생성되었습니다.\n주소: ${wallet.address.slice(0, 10)}...`,
        [
          {
            text: '확인',
            onPress: () => {
              // hasWallet이 true로 변경되면 WalletNavigator가 자동으로 메인 앱으로 전환
              console.log('✅ Wallet created, should navigate to main app');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('오류', '지갑 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportWallet = () => {
    navigation.navigate('ImportWallet');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Kaia Wallet</Text>
          <Text style={styles.subtitle}>
            안전한 스테이블코인 결제와 스테이킹을 시작하세요
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleCreateWallet}
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              {isLoading ? '생성 중...' : '새 지갑 만들기'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleImportWallet}
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              기존 지갑 가져오기
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            지갑을 생성하면 니모닉 문구가 생성됩니다. 
            이 문구는 지갑 복구에 필요하므로 안전한 곳에 보관하세요.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 40,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  disclaimer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
});