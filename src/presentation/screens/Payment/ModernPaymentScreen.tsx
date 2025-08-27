import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWalletStore } from '../../../infrastructure/stores/walletStore';
import { paymentApi } from '../../../services/api';
import { modernColors, spacing, typography, shadows } from '../../theme/modernTheme';

export default function ModernPaymentScreen() {
  const navigation = useNavigation<any>();
  const { assets, address } = useWalletStore();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!recipient || !amount || !selectedAsset || !address) {
      Alert.alert('알림', '모든 필드를 입력해주세요.');
      return;
    }

    // 주소 형식 검증
    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      Alert.alert('오류', '올바른 지갑 주소를 입력해주세요.');
      return;
    }

    // 잔액 검증
    const balance = parseFloat(selectedAsset.balance);
    const paymentAmount = parseFloat(amount);
    if (paymentAmount > balance) {
      Alert.alert('잔액 부족', '보유 잔액보다 많은 금액을 입력했습니다.');
      return;
    }

    Alert.alert(
      '결제 확인',
      `${amount} ${selectedAsset.symbol}를 ${recipient.slice(0, 10)}...에게 전송하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '확인', 
          onPress: async () => {
            await executePayment();
          }
        }
      ]
    );
  };

  const executePayment = async () => {
    try {
      setIsLoading(true);
      
      // 1단계: 결제 견적 요청
      const quoteResponse = await paymentApi.getPaymentQuote({
        fromAddress: address!,
        toAddress: recipient,
        amount: amount,
        fromToken: selectedAsset.address,
        fromChain: selectedAsset.chain.id,
        memo: memo || undefined,
      });

      if (!quoteResponse.success) {
        throw new Error(quoteResponse.error || '견적 요청 실패');
      }

      const quote = quoteResponse.data!;
      
      // 2단계: 결제 생성
      const createResponse = await paymentApi.createPayment({
        fromAddress: address!,
        toAddress: recipient,
        amount: amount,
        fromToken: selectedAsset.address,
        fromChain: selectedAsset.chain.id,
        memo: memo || undefined,
        quoteId: quote.id,
      });

      if (!createResponse.success) {
        throw new Error(createResponse.error || '결제 생성 실패');
      }

      const payment = createResponse.data!;

      // 3단계: 결제 실행
      const executeResponse = await paymentApi.executePayment(payment.id);

      if (!executeResponse.success) {
        throw new Error(executeResponse.error || '결제 실행 실패');
      }

      Alert.alert(
        '결제 성공',
        `거래가 성공적으로 전송되었습니다.\n거래 해시: ${executeResponse.data?.transactionHash?.slice(0, 20)}...`,
        [
          {
            text: '확인',
            onPress: () => {
              // 폼 초기화
              setRecipient('');
              setAmount('');
              setMemo('');
              // 거래 내역 화면으로 이동
              navigation.navigate('PaymentHistory');
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Payment failed:', error);
      Alert.alert('결제 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* 헤더 */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={20} color={modernColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>결제하기</Text>
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() => navigation.navigate('PaymentHistory')}
          >
            <Icon name="history" size={20} color={modernColors.textSecondary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 수신자 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>받는 사람</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="지갑 주소 또는 ENS 도메인"
              placeholderTextColor={modernColors.textTertiary}
              value={recipient}
              onChangeText={setRecipient}
            />
            <TouchableOpacity style={styles.qrButton}>
              <Icon name="qrcode" size={20} color={modernColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 자산 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 자산</Text>
          <TouchableOpacity style={styles.assetSelector}>
            <View style={styles.assetSelectorLeft}>
              <View style={styles.assetIcon}>
                <Text style={styles.assetSymbol}>{selectedAsset?.symbol}</Text>
              </View>
              <View>
                <Text style={styles.assetName}>{selectedAsset?.symbol}</Text>
                <Text style={styles.assetBalance}>
                  잔액: {selectedAsset?.balance} {selectedAsset?.symbol}
                </Text>
              </View>
            </View>
            <Icon name="chevron-down" size={20} color={modernColors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 금액 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>보낼 금액</Text>
          <View style={styles.amountContainer}>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={modernColors.textTertiary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <Text style={styles.amountSymbol}>{selectedAsset?.symbol}</Text>
          </View>
          <View style={styles.amountActions}>
            <TouchableOpacity 
              style={styles.maxButton}
              onPress={() => setAmount(selectedAsset?.balance || '0')}
            >
              <Text style={styles.maxButtonText}>최대</Text>
            </TouchableOpacity>
            <Text style={styles.amountUsd}>
              ≈ {(parseFloat(amount || '0') * (selectedAsset?.balanceUSD || 0) / parseFloat(selectedAsset?.balance || '1')).toLocaleString()}원
            </Text>
          </View>
        </View>

        {/* 스왑 미리보기 */}
        {amount && parseFloat(amount) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>자동 스왑</Text>
            <View style={styles.swapPreview}>
              <View style={styles.swapRoute}>
                <View style={styles.swapItem}>
                  <Text style={styles.swapLabel}>From</Text>
                  <Text style={styles.swapValue}>{amount} {selectedAsset?.symbol}</Text>
                  <Text style={styles.swapChain}>{selectedAsset?.chain.name}</Text>
                </View>
                <Icon name="arrow-right" size={16} color={modernColors.textSecondary} />
                <View style={styles.swapItem}>
                  <Text style={styles.swapLabel}>To</Text>
                  <Text style={styles.swapValue}>{parseFloat(amount).toLocaleString()}원</Text>
                  <Text style={styles.swapChain}>KRW</Text>
                </View>
              </View>
              <View style={styles.swapDetails}>
                <View style={styles.swapDetail}>
                  <Text style={styles.swapDetailLabel}>환율</Text>
                  <Text style={styles.swapDetailValue}>1 {selectedAsset?.symbol} = 1원</Text>
                </View>
                <View style={styles.swapDetail}>
                  <Text style={styles.swapDetailLabel}>수수료</Text>
                  <Text style={styles.swapDetailValue}>0.65원</Text>
                </View>
                <View style={styles.swapDetail}>
                  <Text style={styles.swapDetailLabel}>예상 시간</Text>
                  <Text style={styles.swapDetailValue}>2-5분</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 메모 (선택사항) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메모 (선택사항)</Text>
          <TextInput
            style={[styles.input, styles.memoInput]}
            placeholder="결제 메모를 입력하세요"
            placeholderTextColor={modernColors.textTertiary}
            value={memo}
            onChangeText={setMemo}
            multiline
          />
        </View>
      </ScrollView>

      {/* 결제 버튼 */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.paymentButtons}>
          <TouchableOpacity 
            style={[
              styles.payButton, 
              (!amount || isLoading) && styles.payButtonDisabled
            ]}
            onPress={() => navigation.navigate('QRPayment', {
              amount,
              selectedAsset
            })}
            disabled={!amount || isLoading}
          >
            <Icon name="qrcode" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.payButtonText}>
              {amount ? `${amount} ${selectedAsset?.symbol} QR 결제` : 'QR 결제'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.directPayButton, 
              (!recipient || !amount || isLoading) && styles.payButtonDisabled
            ]}
            onPress={handlePayment}
            disabled={!recipient || !amount || isLoading}
          >
            <Text style={styles.directPayButtonText}>
              {isLoading 
                ? '결제 처리 중...' 
                : '직접 전송'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: modernColors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: modernColors.text,
  },
  historyButton: {
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
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.body1,
    color: modernColors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: modernColors.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body1,
    color: modernColors.text,
    paddingVertical: spacing.md,
  },
  qrButton: {
    padding: spacing.sm,
  },
  assetSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: modernColors.surfaceElevated,
    padding: spacing.md,
    borderRadius: 12,
  },
  assetSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: modernColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  assetSymbol: {
    ...typography.caption,
    color: modernColors.primary,
    fontWeight: '700',
  },
  assetName: {
    ...typography.body1,
    color: modernColors.text,
    fontWeight: '600',
  },
  assetBalance: {
    ...typography.caption,
    color: modernColors.textSecondary,
    marginTop: 2,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: modernColors.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  amountInput: {
    flex: 1,
    ...typography.h1,
    color: modernColors.text,
    paddingVertical: spacing.lg,
    textAlign: 'left',
  },
  amountSymbol: {
    ...typography.h3,
    color: modernColors.textSecondary,
    marginLeft: spacing.sm,
  },
  amountActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  maxButton: {
    backgroundColor: modernColors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  maxButtonText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  amountUsd: {
    ...typography.body2,
    color: modernColors.textSecondary,
  },
  swapPreview: {
    backgroundColor: modernColors.surfaceElevated,
    padding: spacing.lg,
    borderRadius: 12,
  },
  swapRoute: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  swapItem: {
    alignItems: 'center',
    flex: 1,
  },
  swapLabel: {
    ...typography.caption,
    color: modernColors.textSecondary,
    marginBottom: 4,
  },
  swapValue: {
    ...typography.body1,
    color: modernColors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  swapChain: {
    ...typography.caption,
    color: modernColors.textTertiary,
  },
  swapDetails: {
    borderTopWidth: 1,
    borderTopColor: modernColors.border,
    paddingTop: spacing.md,
  },
  swapDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  swapDetailLabel: {
    ...typography.body2,
    color: modernColors.textSecondary,
  },
  swapDetailValue: {
    ...typography.body2,
    color: modernColors.text,
    fontWeight: '500',
  },
  memoInput: {
    backgroundColor: modernColors.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    height: 80,
    textAlignVertical: 'top',
  },
  footer: {
    backgroundColor: modernColors.background,
    borderTopWidth: 1,
    borderTopColor: modernColors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  paymentButtons: {
    gap: 12,
  },
  payButton: {
    backgroundColor: modernColors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  directPayButton: {
    backgroundColor: '#fff',
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: modernColors.primary,
  },
  payButtonDisabled: {
    backgroundColor: modernColors.textTertiary,
  },
  payButtonText: {
    ...typography.body1,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  directPayButtonText: {
    ...typography.body1,
    color: modernColors.primary,
    fontWeight: '600',
  },
});