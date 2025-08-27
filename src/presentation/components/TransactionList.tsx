import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Text, Chip } from 'react-native-paper';
import { Transaction, TransactionType, TransactionStatus } from '../../shared/types';
import { spacing } from '../theme';

interface TransactionListProps {
  transactions: Transaction[];
  showAll?: boolean;
}

export default function TransactionList({ transactions, showAll = true }: TransactionListProps) {
  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.SEND:
        return 'arrow-up';
      case TransactionType.RECEIVE:
        return 'arrow-down';
      case TransactionType.SWAP:
        return 'swap-horizontal';
      case TransactionType.STAKE:
        return 'bank-plus';
      case TransactionType.PAYMENT:
        return 'credit-card';
      default:
        return 'circle';
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.CONFIRMED:
        return '#4CAF50';
      case TransactionStatus.PENDING:
        return '#FF9800';
      case TransactionStatus.FAILED:
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}분 전`;
    } else if (hours < 24) {
      return `${hours}시간 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  const displayTransactions = showAll ? transactions : transactions.slice(0, 5);

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>거래 내역이 없습니다</Text>
      </View>
    );
  }

  return (
    <View>
      {displayTransactions.map((tx) => (
        <List.Item
          key={tx.id}
          title={`${tx.type} - ${tx.value} ${tx.asset.symbol}`}
          description={formatTime(tx.timestamp)}
          left={() => (
            <List.Icon icon={getTransactionIcon(tx.type)} />
          )}
          right={() => (
            <Chip
              mode="flat"
              style={[styles.statusChip, { backgroundColor: getStatusColor(tx.status) }]}
              textStyle={styles.statusText}
            >
              {tx.status}
            </Chip>
          )}
          style={styles.item}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  item: {
    paddingVertical: spacing.xs,
  },
  statusChip: {
    alignSelf: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 10,
  },
});