import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWalletStore } from '../../infrastructure/stores/walletStore';
import { paymentApi } from '../../services/api';

interface Transaction {
  id: string;
  hash?: string;
  type: 'PAYMENT' | 'STAKING' | 'BRIDGE';
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  amount: string;
  asset: string;
  timestamp: number;
  toAddress?: string;
}

export const TransactionStatusCard = () => {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useWalletStore();

  useEffect(() => {
    if (address) {
      loadRecentTransactions();
      // 30초마다 트랜잭션 상태 업데이트
      const interval = setInterval(loadRecentTransactions, 30000);
      return () => clearInterval(interval);
    }
  }, [address]);

  const loadRecentTransactions = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      const response = await paymentApi.getUserPayments(address);
      
      if (response.success && response.data) {
        // 최근 3개의 트랜잭션만 표시
        const recent = response.data
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
          .map(tx => ({
            id: tx.id,
            hash: tx.transactionHash,
            type: 'PAYMENT' as const,
            status: tx.status.toUpperCase() as 'PENDING' | 'CONFIRMED' | 'FAILED',
            amount: tx.amount,
            asset: tx.fromToken.symbol || 'TOKEN',
            timestamp: new Date(tx.createdAt).getTime(),
            toAddress: tx.toAddress,
          }));
        
        setRecentTransactions(recent);
      }
    } catch (error) {
      console.error('❌ Failed to load recent transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ActivityIndicator size={16} color="#FF9800" />;
      case 'CONFIRMED':
        return <Icon name="check-circle" size={16} color="#4CAF50" />;
      case 'FAILED':
        return <Icon name="alert-circle" size={16} color="#F44336" />;
      default:
        return <Icon name="clock-outline" size={16} color="#9E9E9E" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#FF9800';
      case 'CONFIRMED': return '#4CAF50';
      case 'FAILED': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT': return 'send';
      case 'STAKING': return 'bank';
      case 'BRIDGE': return 'bridge';
      default: return 'swap-horizontal';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return new Date(timestamp).toLocaleDateString('ko-KR');
  };

  if (!address || recentTransactions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>최근 거래</Text>
        {isLoading && <ActivityIndicator size={16} color="#666" />}
      </View>
      
      {recentTransactions.map((tx) => (
        <TouchableOpacity key={tx.id} style={styles.transactionItem}>
          <View style={styles.transactionLeft}>
            <View style={styles.iconContainer}>
              <Icon 
                name={getTypeIcon(tx.type)} 
                size={20} 
                color="#007AFF" 
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionType}>
                {tx.type === 'PAYMENT' ? '결제' : 
                 tx.type === 'STAKING' ? '스테이킹' : '브릿지'}
              </Text>
              <Text style={styles.transactionDetails}>
                {tx.toAddress ? formatAddress(tx.toAddress) : ''}
              </Text>
              <Text style={styles.transactionTime}>{formatTime(tx.timestamp)}</Text>
            </View>
          </View>
          
          <View style={styles.transactionRight}>
            <Text style={styles.transactionAmount}>
              {tx.amount} {tx.asset}
            </Text>
            <View style={styles.statusContainer}>
              {getStatusIcon(tx.status)}
              <Text style={[styles.statusText, { color: getStatusColor(tx.status) }]}>
                {tx.status === 'PENDING' ? '처리중' :
                 tx.status === 'CONFIRMED' ? '완료' : '실패'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  transactionDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: '#999',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});