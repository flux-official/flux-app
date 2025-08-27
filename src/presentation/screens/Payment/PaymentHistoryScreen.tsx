import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SectionList, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Chip, List, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWalletStore } from '../../../infrastructure/stores/walletStore';
import { paymentApi } from '../../../services/api';
import { spacing } from '../../theme';

export default function PaymentHistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useWalletStore();
  const navigation = (require('@react-navigation/native') as any).useNavigation();

  useEffect(() => {
    loadPaymentHistory();
  }, [address]);

  const loadPaymentHistory = async () => {
    if (!address) return;
    
    try {
      setIsLoading(true);
      const response = await paymentApi.getUserPayments(address);
      
      if (response.success && response.data) {
        // 날짜별로 그룹화
        const groupedHistory = groupPaymentsByDate(response.data);
        setPaymentHistory(groupedHistory);
      } else {
        console.error('Failed to load payment history:', response.error);
        setPaymentHistory([]);
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
      setPaymentHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const groupPaymentsByDate = (payments: any[]) => {
    const groups: { [key: string]: any[] } = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    payments.forEach(payment => {
      const paymentDate = new Date(payment.createdAt);
      let groupKey: string;

      if (isSameDay(paymentDate, today)) {
        groupKey = '오늘';
      } else if (isSameDay(paymentDate, yesterday)) {
        groupKey = '어제';
      } else {
        groupKey = paymentDate.toLocaleDateString('ko-KR', { 
          month: 'long', 
          day: 'numeric' 
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(payment);
    });

    return Object.entries(groups).map(([title, data]) => ({
      title,
      data
    }));
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const extractMerchantInfo = (metadata: string) => {
    try {
      // metadata에서 Merchant: 부분 찾기
      const merchantMatch = metadata.match(/Merchant:\s*({.*?})/);
      if (merchantMatch) {
        return JSON.parse(merchantMatch[1]);
      }
      return null;
    } catch (error) {
      console.error('Error parsing merchant info:', error);
      return null;
    }
  };

  // 목업 데이터 제거 - 실제 API 데이터만 사용
  const mockPaymentHistory: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateUSDAmount = (krwAmount: string, rate: number) => {
    return (parseFloat(krwAmount) / rate).toFixed(2);
  };

  const displayHistory = paymentHistory.length > 0 ? paymentHistory : mockPaymentHistory;
  
  const filteredHistory = displayHistory.map(section => ({
    ...section,
    data: section.data.filter(item => {
      // 대소문자 통일
      const normalizedStatus = item.status?.toUpperCase();
      if (filter === 'completed' && normalizedStatus !== 'COMPLETED') return false;
      if (filter === 'failed' && normalizedStatus !== 'FAILED') return false;
      
      // 검색어로 메모나 상점명 필터
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const merchantMatch = item.memo?.toLowerCase().includes(searchLower);
        const metadataMatch = item.metadata?.toLowerCase().includes(searchLower);
        if (!merchantMatch && !metadataMatch) return false;
      }
      return true;
    }),
  })).filter(section => section.data.length > 0);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>결제 내역을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title>결제 내역</Title>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.homeBtn}>
            <Text style={styles.homeBtnText}>홈으로</Text>
          </TouchableOpacity>
        </View>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'all', label: '전체' },
            { value: 'completed', label: '완료' },
            { value: 'failed', label: '실패' },
          ]}
          style={styles.filterButtons}
        />
      </View>

      <SectionList
        sections={filteredHistory}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>{title}</Title>
          </View>
        )}
        renderItem={({ item }) => {
          // 상점 정보 파싱
          const merchantInfo = item.metadata ? extractMerchantInfo(item.metadata) : null;
          const displayName = merchantInfo ? `${merchantInfo.logo} ${merchantInfo.name}` : (item.memo || '결제');
          const displayProduct = merchantInfo ? merchantInfo.product : '';
          
          // 결제 타입 표시
          const getPaymentTypeLabel = (type: string) => {
            switch(type) {
              case 'DIRECT': return '직접 전송';
              case 'SWAP': return '자동 스왑';
              case 'BRIDGE': return '크로스체인';
              default: return type;
            }
          };
          
          // 체인 이름 표시
          const getChainName = (chainId: number) => {
            switch(chainId) {
              case 1001: return 'KAIA';
              case 11155111: return 'ETH Sepolia';
              default: return `Chain ${chainId}`;
            }
          };
          
          const finalHash = item.destTransactionHash || (item.transactionHashes && item.transactionHashes[0]);
          return (
            <Card style={styles.historyCard}>
              <Card.Content>
                <View style={styles.historyHeader}>
                  <View style={{ flex: 1 }}>
                    <Title style={styles.merchantName}>{displayName}</Title>
                    {displayProduct ? <Paragraph style={styles.productName}>{displayProduct}</Paragraph> : null}
                    <Paragraph style={styles.timestamp}>
                      {new Date(item.createdAt).toLocaleString('ko-KR')}
                    </Paragraph>
                  </View>
                  <Chip
                    mode="flat"
                    style={[styles.statusChip, { backgroundColor: getStatusColor(item.status.toLowerCase()) }]}
                    textStyle={styles.statusText}
                  >
                    {item.status === 'COMPLETED' ? '완료' : item.status === 'FAILED' ? '실패' : '진행중'}
                  </Chip>
                </View>
                
                <View style={styles.amountContainer}>
                  <View style={styles.amountItem}>
                    <Paragraph style={styles.amountLabel}>결제 금액</Paragraph>
                    <Title style={styles.amountValue}>
                      ₩{parseInt(item.amount).toLocaleString()} {item.targetToken}
                    </Title>
                  </View>
                  <View style={styles.amountItem}>
                    <Paragraph style={styles.amountLabel}>결제 방식</Paragraph>
                    <Title style={[styles.amountValue, { fontSize: 14 }]}>
                      {getPaymentTypeLabel(item.selectedRoute?.type)}
                    </Title>
                  </View>
                </View>

                {item.selectedRoute && (
                  <View style={styles.swapInfo}>
                    <Paragraph style={styles.swapText}>
                      {item.selectedRoute.sourceToken} ({getChainName(item.selectedRoute.sourceChainId)}) 
                      {item.selectedRoute.type === 'BRIDGE' ? ' 🌉 ' : ' → '}
                      {item.targetToken} ({getChainName(item.targetChainId)})
                    </Paragraph>
                    {finalHash && (
                      <Paragraph style={styles.txHash}>
                        TX: {finalHash.slice(0, 10)}...{finalHash.slice(-8)}
                      </Paragraph>
                    )}
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: spacing.md,
    backgroundColor: 'white',
    elevation: 2,
  },
  searchBar: {
    marginBottom: spacing.md,
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
  filterButtons: {
    marginBottom: spacing.sm,
  },
  homeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  homeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    backgroundColor: '#F6F6F6',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  historyCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  merchantName: {
    fontSize: 18,
    fontWeight: '600',
  },
  productName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  txHash: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  swapInfo: {
    backgroundColor: '#F5F5F5',
    padding: spacing.sm,
    borderRadius: 8,
  },
  swapText: {
    fontSize: 12,
    color: '#666',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
});