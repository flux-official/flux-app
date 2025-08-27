import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar, Modal, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import QRCode from 'react-native-qrcode-svg';
import { useWalletStore } from '../../../infrastructure/stores/walletStore';
import { paymentApi } from '../../../services/api';
import { Web3Provider } from '../../../services/wallet/web3Provider';
import { getRandomMerchant, MerchantScenario, MERCHANT_SCENARIOS } from '../../../shared/constants/merchants';
import { FLUX_ADDRESSES, TOKEN_ADDRESSES_BY_CHAIN } from '../../../shared/constants/contracts';

interface QRPaymentParams {
  amount: string;
  selectedAsset: {
    symbol: string;
    chain: { id: number; name: string };
    address: string;
  };
  merchantInfo?: {
    name: string;
    product: string;
    amount: string;
    preferredToken: string;
    preferredChainId: number;
    logo: string;
    category: string;
  };
  targetChainId?: number;
  targetToken?: string;
}

export default function QRPaymentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { amount, selectedAsset, merchantInfo, targetChainId, targetToken } = route.params as QRPaymentParams;
  const { address } = useWalletStore();
  
  const [paymentId, setPaymentId] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantScenario | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [intentSnapshot, setIntentSnapshot] = useState<{
    targetChainId: number;
    targetToken: string;
    merchantAddress: string;
    amount: string;
  } | null>(null);
  const [finalizedHash, setFinalizedHash] = useState<string | null>(null);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressLines, setProgressLines] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const hasInitializedRef = useRef(false);
  const cancelledRef = useRef(false);
  const executedRef = useRef(false);

  // 데모용 랜덤 상점 주소 생성기 (유저 주소와 다르게 보장)
  const getRandomMerchantAddress = (exclude?: string): string => {
    const generate = () => '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    let candidate = generate();
    if (exclude && candidate.toLowerCase() === exclude.toLowerCase()) {
      candidate = generate();
    }
    return candidate;
  };

  // merchantInfo를 MerchantScenario로 정규화
  const toMerchantScenario = (info?: QRPaymentParams['merchantInfo'] | MerchantScenario): MerchantScenario => {
    if (!info) return getRandomMerchant();
    const maybeScenario = info as MerchantScenario;
    if ((maybeScenario as any).id) return maybeScenario;
    const base = info as NonNullable<QRPaymentParams['merchantInfo']>;
    return {
      id: `merchant_${base.name}_${base.preferredToken}_${base.preferredChainId}`,
      name: base.name,
      product: base.product,
      amount: base.amount,
      preferredToken: base.preferredToken as 'MTK1' | 'MTK2' | 'MTK3',
      preferredChainId: base.preferredChainId,
      logo: base.logo,
      category: base.category,
    };
  };

  // 선택한 자산 체인 기준, 반대 체인의 상점을 무작위 선택 (1001 <-> 11155111)
  const getOppositeChainId = (chainId: number) => (chainId === 1001 ? 11155111 : 1001);
  const pickOppositeChainMerchant = (chainId: number): MerchantScenario => {
    const desired = getOppositeChainId(chainId);
    const list = MERCHANT_SCENARIOS.filter(m => m.preferredChainId === desired);
    if (list.length === 0) return getRandomMerchant();
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  };

  // 반대 체인이면서 source 토큰과 다른 토큰을 선호하는 상점 선택
  const pickOppositeChainMerchantAvoidToken = (chainId: number, avoidToken: string): MerchantScenario => {
    const desired = getOppositeChainId(chainId);
    const filtered = MERCHANT_SCENARIOS.filter(m => m.preferredChainId === desired && m.preferredToken !== avoidToken);
    if (filtered.length > 0) {
      const idx = Math.floor(Math.random() * filtered.length);
      return filtered[idx];
    }
    return pickOppositeChainMerchant(chainId);
  };

  const getChainNameById = (chainId: number) => {
    switch (chainId) {
      case 1001: return 'Kaia Testnet';
      case 11155111: return 'Sepolia Testnet';
      default: return `Chain ${chainId}`;
    }
  };

  useEffect(() => {
    initializePayment();
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const initializePayment = async () => {
    try {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;
      // 1. 상점 선택: 선택 자산의 반대 체인 상점으로 강제 매칭
      const merchant = pickOppositeChainMerchantAvoidToken(selectedAsset.chain.id, selectedAsset.symbol);
      setSelectedMerchant(merchant);
      console.log('🏪 선택된 상점:', merchant.name, merchant.product, `${parseInt(merchant.amount).toLocaleString()}원`);
      
      // 2. QR 코드 생성 대기
      const qrSuccess = await generatePaymentQR();
      
      if (qrSuccess) {
        // 3. QR 생성 성공 후 3-5초 대기하고 자동 결제 시작
        console.log('📱 QR 코드 생성 완료, 자동 결제 대기 중...');
        const randomDelay = Math.random() * 2000 + 3000; // 3-5초 랜덤
        
        setTimeout(() => {
          console.log('🚀 자동 결제 시작:', merchant.name);
          startAutomaticPayment(merchant);
        }, randomDelay);
      } else {
        console.error('❌ QR 생성 실패로 자동 결제 취소');
      }
    } catch (error) {
      console.error('❌ 결제 초기화 실패:', error);
    }
  };

  useEffect(() => {
    if (isWaitingForPayment && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isWaitingForPayment && countdown === 0) {
      simulatePaymentSuccess();
    }
  }, [isWaitingForPayment, countdown]);

  const generatePaymentQR = async () => {
    try {
      console.log('📱 결제 생성 시작...');
      
      // 결제 생성 (반대 체인 상점 기준 토큰/체인 사용)
      const merchant = selectedMerchant || pickOppositeChainMerchantAvoidToken(selectedAsset.chain.id, selectedAsset.symbol);

      // 동일 토큰 브릿지 회피: 대상 토큰이 소스와 같다면 다른 토큰으로 강제 변경
      const allTokens: Array<'MTK1'|'MTK2'|'MTK3'> = ['MTK1','MTK2','MTK3'];
      const safeTargetToken = ((): 'MTK1'|'MTK2'|'MTK3' => {
        const mt = merchant.preferredToken as 'MTK1'|'MTK2'|'MTK3';
        if (mt !== (selectedAsset.symbol as any)) return mt;
        const alt = allTokens.find(t => t !== (selectedAsset.symbol as any));
        return (alt || mt) as 'MTK1'|'MTK2'|'MTK3';
      })();
      const createResponse = await paymentApi.createPaymentIntent({
        userAddress: address!,
        merchantAddress: getRandomMerchantAddress(address || undefined), // 데모용 무작위 가맹점 주소
        paymentAmount: amount,
        targetToken: safeTargetToken, // 소스 토큰과 다른 토큰 보장
        targetChainId: merchant.preferredChainId, // 상점 선호 체인(선택 자산의 반대 체인)
        memo: `${merchant.name} - ${merchant.product}`,
        sourceChainId: selectedAsset.chain.id,
        sourceToken: selectedAsset.symbol,
      });

      console.log('📱 결제 생성 응답:', createResponse);

      if (createResponse.success) {
        const payment = createResponse.data!;
        setPaymentId(payment.id);
        setIntentSnapshot({
          targetChainId: payment.targetChainId,
          targetToken: payment.targetToken,
          merchantAddress: payment.merchantAddress,
          amount: payment.amount,
        });

        // QR 데이터 생성
        const qrPaymentData = {
          paymentId: payment.id,
          fromToken: selectedAsset.symbol,
          fromChain: selectedAsset.chain.name,
          fromChainId: selectedAsset.chain.id,
          amount: amount,
          userAddress: address,
          timestamp: Date.now(),
          type: 'KAIA_PAYMENT'
        };

        setQrData(JSON.stringify(qrPaymentData));
        console.log('✅ QR 코드 데이터 생성 완료');
        return true; // 성공 반환
      } else {
        console.error('❌ 결제 생성 실패:', createResponse.error);
        Alert.alert('오류', '결제 생성에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('❌ QR Payment creation failed:', error);
      Alert.alert('오류', 'QR 코드 생성에 실패했습니다.');
      return false;
    }
  };

  const startAutomaticPayment = (merchant: MerchantScenario) => {
    setIsWaitingForPayment(true);
    setCountdown(5); // 5초 후 자동 완료
    setProgressVisible(true);
    setProgressLines([`${merchant.name} - ${merchant.product}`, '가맹점 확인됨, 결제 처리 준비 중...']);
  };

  const startPaymentSimulation = () => {
    if (selectedMerchant) {
      startAutomaticPayment(selectedMerchant);
    }
  };

  const simulatePaymentSuccess = async () => {
    if (isExecuting || executedRef.current) {
      console.log('⚠️ Payment already executing, skipping...');
      return;
    }

    try {
      setIsExecuting(true);
      executedRef.current = true;
      console.log('🚀 Starting payment execution...');
      setProgressLines(prev => [...prev, '결제 실행 시작']);
      
      // 교차체일 경우 사용자 서명으로 approve + swapToOtherChain 실행
      const snap = intentSnapshot;
      const isCrossChain = snap && selectedAsset.chain.id !== snap.targetChainId;
      if (isCrossChain && snap) {
        const sourceChainId = selectedAsset.chain.id;
        const destChainId = snap.targetChainId;
        // Flux addresses imported from shared constants
        const ERC20_ABI = [
          'function approve(address spender, uint256 amount) returns (bool)',
          'function decimals() view returns (uint8)',
          'function balanceOf(address owner) view returns (uint256)',
          'function allowance(address owner, address spender) view returns (uint256)'
        ];
        const FLUX_ABI = [
          'function swapToOtherChain(address tokenIn,address tokenOut,address to,uint256 sourceChainId,uint256 destChainId,uint256 amount)'
        ];
        const tokenIn = TOKEN_ADDRESSES_BY_CHAIN[sourceChainId][selectedAsset.symbol as 'MTK1'|'MTK2'|'MTK3'];
        const tokenOut = TOKEN_ADDRESSES_BY_CHAIN[destChainId][snap.targetToken as 'MTK1'|'MTK2'|'MTK3'];
        const fluxAddress = FLUX_ADDRESSES[sourceChainId];
        const signer = await Web3Provider.getSigner(sourceChainId);
        if (!signer || !fluxAddress || !tokenIn || !tokenOut) throw new Error('Missing signer or addresses');

        const erc20 = new (require('ethers').ethers.Contract)(tokenIn, ERC20_ABI, signer);
        const decimals: number = await erc20.decimals();
        const amountWei = (require('ethers').ethers).parseUnits(snap.amount, decimals);

        // 0) 사전 검증: 소스 주소/토큰/체인/수신자/금액
        console.log('🔎 Bridge pre-check:', JSON.stringify({
          sourceChainId,
          destChainId,
          tokenIn,
          tokenOut,
          fluxAddress,
          merchant: snap.merchantAddress,
          amountWei: amountWei.toString(),
        }));

        const owner = await signer.getAddress();
        // 1) 잔액 확인
        try {
          const bal = await erc20.balanceOf(owner);
          if (bal < amountWei) {
            console.error('❌ Insufficient token balance for bridge', { have: bal.toString(), need: amountWei.toString() });
            throw new Error(`잔액 부족: 보유=${(require('ethers').ethers).formatUnits(bal, decimals)}, 필요=${snap.amount}`);
          }
          setProgressLines(prev => [...prev, '잔액 확인 완료']);
        } catch (e) {
          setProgressLines(prev => [...prev, `오류: ${(e as Error).message}`]);
          setIsExecuting(false);
          setIsWaitingForPayment(false);
          setProgressVisible(true);
          return;
        }

        // 2) 허용량 확인 및 승인
        try {
          const allowance = await erc20.allowance(owner, fluxAddress);
          if (allowance < amountWei) {
            console.log('📝 Approving token allowance...', { required: amountWei.toString(), current: allowance.toString() });
            const approveTx = await erc20.approve(fluxAddress, amountWei);
            await approveTx.wait();
            console.log('✅ Approve confirmed:', approveTx.hash);
            setProgressLines(prev => [...prev, '승인 완료']);
          } else {
            console.log('✅ Sufficient allowance found');
            setProgressLines(prev => [...prev, '기존 승인량 충분']);
          }
        } catch (e) {
          console.error('❌ Approve failed:', e);
          setProgressLines(prev => [...prev, '오류: 토큰 승인 실패']);
          setIsExecuting(false);
          setIsWaitingForPayment(false);
          setProgressVisible(true);
          return;
        }

        const flux = new (require('ethers').ethers.Contract)(fluxAddress, FLUX_ABI, signer);
        // 3) 가스 추정으로 브리지 설정 검증
        try {
          console.log('🔄 Calling swapToOtherChain with params:', {
            tokenIn,
            tokenOut,
            to: snap.merchantAddress,
            sourceChainId,
            destChainId,
            amount: amountWei.toString()
          });
          await (flux as any).swapToOtherChain.estimateGas(tokenIn, tokenOut, snap.merchantAddress, BigInt(sourceChainId), BigInt(destChainId), amountWei);
          setProgressLines(prev => [...prev, '브릿지 사전 점검 통과']);
        } catch (e) {
          console.error('❌ Bridge pre-check (estimateGas) failed:', e);
          setProgressLines(prev => [...prev, '오류: 브릿지 사전 점검 실패']);
          setIsExecuting(false);
          setIsWaitingForPayment(false);
          setProgressVisible(true);
          return;
        }

        // 4) 실제 전송
        try {
          const swapTx = await flux.swapToOtherChain(
            tokenIn,
            tokenOut,
            snap.merchantAddress,
            BigInt(sourceChainId),
            BigInt(destChainId),
            amountWei
          );
          await swapTx.wait();
          console.log('✅ Bridge exit confirmed:', swapTx.hash);
          setProgressLines(prev => [...prev, '소스 체인 출금(Exit) 완료', '대상 체인 처리 중...']);
        } catch (e) {
          console.error('❌ swapToOtherChain failed:', e);
          setProgressLines(prev => [...prev, '오류: 브릿지 전송 실패']);
          setIsExecuting(false);
          setIsWaitingForPayment(false);
          setProgressVisible(true);
          return;
        }
      }

      // 실제 결제 API 호출 (상점 정보 포함)
      const executeResponse = await paymentApi.executePayment(paymentId, 0, selectedMerchant ? {
        name: selectedMerchant.name,
        product: selectedMerchant.product,
        amount: selectedMerchant.amount,
        preferredToken: selectedMerchant.preferredToken,
        logo: selectedMerchant.logo,
        category: selectedMerchant.category,
      } : undefined);
      
      setIsWaitingForPayment(false);
      
      if (executeResponse.success) {
        const merchant = selectedMerchant;
        // 프론트 즉시 완료 알림 대신, 백엔드 최종 COMPLETED까지 폴링하여 해시 확보
        let finalHash: string | null = null;
        try {
          const intentId = executeResponse.data?.id || paymentId;
          const start = Date.now();
          while (!cancelledRef.current && Date.now() - start < 180000) { // 최대 3분 또는 언마운트시 중단
            const statusResp = await paymentApi.getPaymentIntent(intentId);
            if (statusResp.success && statusResp.data) {
              const st = statusResp.data.status;
              const destH = (statusResp.data as any).destTransactionHash || null;
              const txh = (statusResp.data as any).transactionHashes?.[0] || null;
              if (st === 'COMPLETED') { finalHash = (destH || txh); break; }
              if (st === 'FAILED') { break; }
            }
            await new Promise(r => setTimeout(r, 5000));
          }
        } catch {}
        setFinalizedHash(finalHash);
        const txHash = finalHash || (executeResponse.data as any)?.destTransactionHash || (executeResponse.data as any)?.transactionHash || executeResponse.data?.transactionHashes?.[0] || 'NO_HASH';
        setProgressLines(prev => [...prev, '대상 체인 완료', `최종 완료: ${txHash ? txHash.slice(0, 20) + '...' : 'NO_HASH'}`]);
        setIsCompleted(true);
        setIsExecuting(false);
        executedRef.current = false;
      } else {
        setProgressLines(prev => [...prev, `오류: 결제 실패 (${executeResponse.error || '알 수 없는 오류'})`] );
        setProgressVisible(true);
        setIsExecuting(false);
        executedRef.current = false;
      }
    } catch (error) {
      console.error('❌ Payment execution failed:', error);
      setIsWaitingForPayment(false);
      setIsExecuting(false);
      executedRef.current = false;
      setProgressLines(prev => [...prev, `오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`]);
      setProgressVisible(true);
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
            <Icon name="arrow-left" size={20} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR 결제</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* 상점 및 결제 정보 */}
        <View style={styles.paymentInfo}>
          {selectedMerchant ? (
            <>
              <Text style={styles.merchantEmoji}>{selectedMerchant.logo}</Text>
              <Text style={styles.merchantName}>{selectedMerchant.name}</Text>
              <Text style={styles.productName}>{selectedMerchant.product}</Text>
              <Text style={styles.amount}>{selectedMerchant.amount}원</Text>
              <Text style={styles.paymentMethod}>
                {selectedMerchant.amount}원 = {parseInt(selectedMerchant.amount)} {selectedMerchant.preferredToken}
              </Text>
              <Text style={styles.chainInfo}>{getChainNameById(selectedMerchant.preferredChainId)} 체인</Text>
            </>
          ) : (
            <>
              <Text style={styles.amountLabel}>결제 금액</Text>
              <Text style={styles.amount}>{amount} {selectedAsset.symbol}</Text>
              <Text style={styles.chainInfo}>{getChainNameById(getOppositeChainId(selectedAsset.chain.id))} 체인</Text>
            </>
          )}
        </View>

        {/* QR 코드 */}
        <View style={styles.qrContainer}>
          {qrData ? (
            <>
              <QRCode
                value={qrData}
                size={250}
                color="#1a1a1a"
                backgroundColor="#ffffff"
                logo={{ uri: 'https://via.placeholder.com/50' }}
                logoSize={30}
                logoBackgroundColor="transparent"
              />
              <Text style={styles.qrDescription}>
                가맹점에서 이 QR 코드를 스캔하세요
              </Text>
            </>
          ) : (
            <View style={styles.loadingQR}>
              <Icon name="qrcode" size={100} color="#ccc" />
              <Text style={styles.loadingText}>QR 코드 생성 중...</Text>
            </View>
          )}
        </View>

        {/* 상태 표시 */}
        {isWaitingForPayment && (
          <View style={styles.waitingContainer}>
            <Icon name="clock-outline" size={24} color="#FF9800" />
            <Text style={styles.waitingText}>
              결제 처리 중... ({countdown}초)
            </Text>
          </View>
        )}

        {/* 액션 버튼 */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => Alert.alert('공유', 'QR 코드를 공유합니다')}
            disabled={!qrData}
          >
            <Icon name="share-variant" size={20} color="#007AFF" />
            <Text style={styles.shareButtonText}>QR 코드 공유</Text>
          </TouchableOpacity>
        </View>

        {/* 안내 문구 */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>사용 방법</Text>
          <Text style={styles.instructionText}>
            1. 가맹점에서 QR 코드를 스캔합니다{'\n'}
            2. 가맹점이 원하는 토큰으로 자동 변환됩니다{'\n'}
            3. 브릿지를 통해 결제가 완료됩니다
          </Text>
        </View>
      </View>
      <ProgressOverlay
        visible={progressVisible}
        lines={progressLines}
        completed={isCompleted}
        onViewReceipt={() => {
          setProgressVisible(false);
          navigation.navigate('PaymentHistory');
        }}
        onClose={() => setProgressVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  paymentInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  merchantEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  merchantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#FF6B35',
    backgroundColor: '#fff5f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  chainInfo: {
    fontSize: 14,
    color: '#007AFF',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingQR: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  waitingText: {
    fontSize: 16,
    color: '#856404',
    marginLeft: 8,
    fontWeight: '500',
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
  simulateButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  simulateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  shareButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  instructions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  progressModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
  },
  progressHeaderGradient: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressHeaderIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  progressBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#eef1f4',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  stepIconWrap: {
    width: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  progressLine: {
    fontSize: 14,
    color: '#444',
  },
  progressActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepperItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepperCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#d0d7e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCircleActive: {
    backgroundColor: '#007AFF',
  },
  stepperCircleDone: {
    backgroundColor: '#22C55E',
  },
  stepperLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
    flexShrink: 1,
  },
  stepperLabelActive: {
    color: '#111827',
    fontWeight: '600',
  },
  stepperConnector: {
    height: 2,
    backgroundColor: '#d0d7e2',
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 1,
  },
});

// Progress Modal UI appended after default export render
export function ProgressOverlay({ visible, lines, completed, onViewReceipt, onClose }: { visible: boolean; lines: string[]; completed: boolean; onViewReceipt: () => void; onClose: () => void; }) {
  const [showDetails, setShowDetails] = React.useState(false);
  const stepLabels = ['사전 점검', '승인', '출금(Exit)', '대상 체인 완료'];
  const currentStep = (() => {
    if (completed || lines.some(l => l.includes('대상 체인 완료'))) return 3;
    if (lines.some(l => l.includes('소스 체인 출금(Exit) 완료'))) return 2;
    if (lines.some(l => l.includes('승인 완료') || l.includes('기존 승인량 충분'))) return 1;
    if (lines.length > 0) return 0;
    return 0;
  })();
  const progressPct = ((currentStep + (completed ? 1 : 0)) / stepLabels.length) * 100;
  const compactLines = showDetails ? lines : lines.slice(-2);
  const stepAnim = React.useRef(new Animated.Value(currentStep)).current;
  React.useEffect(() => {
    Animated.timing(stepAnim, {
      toValue: currentStep,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.progressModalContainer}>
        <View style={styles.progressCard}>
          <LinearGradient colors={["#007AFF", "#005BBB"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.progressHeaderGradient}>
            <View style={styles.progressHeaderRow}>
              <View style={styles.progressHeaderIconWrap}>
                {completed ? <Icon name="check" size={16} color="#fff" /> : <ActivityIndicator size="small" color="#fff" />}
              </View>
              <Text style={styles.progressTitle}>{completed ? '결제 완료' : '결제 진행 중'}</Text>
            </View>
            <View style={[styles.progressBar, { marginTop: 10 }]}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(10, Math.floor(progressPct)))}%` }]} />
            </View>
          </LinearGradient>
          <View style={styles.progressBody}>
            <View style={styles.stepperRow}>
              {stepLabels.map((label, idx) => (
                <View key={label} style={styles.stepperItem}>
                  <View style={[styles.stepperCircle, idx < currentStep && styles.stepperCircleDone, idx === currentStep && !completed && styles.stepperCircleActive, completed && idx === 3 && styles.stepperCircleDone]}>
                    <Icon name={idx < currentStep || (completed && idx === 3) ? 'check' : idx === currentStep ? 'progress-clock' : 'circle-outline'} size={12} color={idx <= currentStep || completed ? '#fff' : '#9aa4b2'} />
                  </View>
                  {idx === currentStep ? (
                    <Animated.Text style={[styles.stepperLabelActive, { opacity: stepAnim.interpolate({ inputRange: [idx-1, idx], outputRange: [0, 1], extrapolate: 'clamp' }) }]}>
                      {label}
                    </Animated.Text>
                  ) : null}
                  {idx < stepLabels.length - 1 && <View style={[styles.stepperConnector, { opacity: idx < currentStep ? 1 : 0.3 }]} />}
                </View>
              ))}
            </View>

            {compactLines.map((l, i) => (
              <View key={`${l}-${i}`} style={styles.stepRow}>
                <View style={styles.stepIconWrap}>
                  <Icon name={l.startsWith('오류') ? 'alert-circle' : 'check-circle'} size={14} color={l.startsWith('오류') ? '#F44336' : '#4CAF50'} />
                </View>
                <Text style={styles.progressLine}>{l}</Text>
              </View>
            ))}

            {lines.length > compactLines.length && (
              <TouchableOpacity onPress={() => setShowDetails(!showDetails)} style={{ marginTop: 8 }}>
                <Text style={{ color: '#007AFF', fontWeight: '600' }}>{showDetails ? '간단히 보기' : '자세히 보기'}</Text>
              </TouchableOpacity>
            )}

            <View style={styles.progressActions}>
              {completed ? (
                <>
                  <TouchableOpacity style={styles.actionBtn} onPress={onViewReceipt}><Text style={styles.actionBtnText}>영수증 보기</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#6c757d' }]} onPress={onClose}><Text style={styles.actionBtnText}>닫기</Text></TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#6c757d' }]} onPress={onClose}><Text style={styles.actionBtnText}>취소</Text></TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}