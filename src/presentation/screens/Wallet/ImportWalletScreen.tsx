import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useWalletStore } from '../../../infrastructure/stores/walletStore';
import { WalletManager } from '../../../services/wallet';

type ImportType = 'mnemonic' | 'privateKey';

export const ImportWalletScreen = ({ navigation }: any) => {
  const [importType, setImportType] = useState<ImportType>('mnemonic');
  const [inputValue, setInputValue] = useState('');
  const [walletName, setWalletName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { importWalletFromMnemonic, importWalletFromPrivateKey } = useWalletStore();

  const handleImport = async () => {
    if (!inputValue.trim()) {
      Alert.alert('오류', '지갑 정보를 입력해주세요.');
      return;
    }

    if (!walletName.trim()) {
      Alert.alert('오류', '지갑 이름을 입력해주세요.');
      return;
    }

    // 입력값 검증
    if (importType === 'mnemonic') {
      if (!WalletManager.validateMnemonic(inputValue)) {
        Alert.alert('오류', '유효하지 않은 니모닉 문구입니다.');
        return;
      }
    } else {
      if (!WalletManager.validatePrivateKey(inputValue)) {
        Alert.alert('오류', '유효하지 않은 프라이빗 키입니다.');
        return;
      }
    }

    try {
      setIsLoading(true);
      
      let wallet;
      if (importType === 'mnemonic') {
        wallet = await importWalletFromMnemonic(inputValue.trim(), walletName.trim());
      } else {
        wallet = await importWalletFromPrivateKey(inputValue.trim(), walletName.trim());
      }

      Alert.alert(
        '지갑 가져오기 완료',
        `지갑이 성공적으로 가져와졌습니다.\n주소: ${wallet.address.slice(0, 10)}...`,
        [
          {
            text: '확인',
            onPress: () => {
              // hasWallet이 true로 변경되면 WalletNavigator가 자동으로 메인 앱으로 전환
              console.log('✅ Wallet imported, should navigate to main app');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('오류', '지갑 가져오기에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>지갑 가져오기</Text>
              <Text style={styles.subtitle}>
                니모닉 문구 또는 프라이빗 키로 기존 지갑을 가져오세요
              </Text>
            </View>

            {/* 가져오기 타입 선택 */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  importType === 'mnemonic' && styles.typeButtonActive,
                ]}
                onPress={() => setImportType('mnemonic')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    importType === 'mnemonic' && styles.typeButtonTextActive,
                  ]}
                >
                  니모닉 문구
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  importType === 'privateKey' && styles.typeButtonActive,
                ]}
                onPress={() => setImportType('privateKey')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    importType === 'privateKey' && styles.typeButtonTextActive,
                  ]}
                >
                  프라이빗 키
                </Text>
              </TouchableOpacity>
            </View>

            {/* 지갑 이름 입력 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>지갑 이름</Text>
              <TextInput
                style={styles.textInput}
                value={walletName}
                onChangeText={setWalletName}
                placeholder="지갑 이름을 입력하세요"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* 니모닉/프라이빗 키 입력 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {importType === 'mnemonic' ? '니모닉 문구' : '프라이빗 키'}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  importType === 'mnemonic' ? styles.mnemonicInput : styles.privateKeyInput,
                ]}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={
                  importType === 'mnemonic'
                    ? '12개 또는 24개 단어로 구성된 니모닉 문구를 입력하세요'
                    : '프라이빗 키를 입력하세요 (0x로 시작)'
                }
                placeholderTextColor="#999"
                multiline={importType === 'mnemonic'}
                numberOfLines={importType === 'mnemonic' ? 4 : 1}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={importType === 'privateKey'}
              />
            </View>

            {/* 가져오기 버튼 */}
            <TouchableOpacity
              style={[styles.importButton, isLoading && styles.importButtonDisabled]}
              onPress={handleImport}
              disabled={isLoading}
            >
              <Text style={styles.importButtonText}>
                {isLoading ? '가져오는 중...' : '지갑 가져오기'}
              </Text>
            </TouchableOpacity>

            {/* 주의사항 */}
            <View style={styles.warning}>
              <Text style={styles.warningText}>
                ⚠️ 주의사항
              </Text>
              <Text style={styles.warningDescription}>
                • 니모닉 문구와 프라이빗 키는 절대 다른 사람과 공유하지 마세요
                {'\n'}• 안전한 네트워크에서만 지갑을 가져오세요
                {'\n'}• 입력한 정보는 기기에 안전하게 저장됩니다
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#e6e6e6',
    borderRadius: 12,
    marginBottom: 24,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  mnemonicInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  privateKeyInput: {
    height: 50,
  },
  importButton: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  importButtonDisabled: {
    backgroundColor: '#ccc',
  },
  importButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warning: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: 12,
    padding: 16,
  },
  warningText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  warningDescription: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});