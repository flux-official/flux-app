import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, List, Text } from 'react-native-paper';
import { Asset } from '../../shared/types';
import { spacing } from '../theme';

interface AssetCardProps {
  asset: Asset;
  onPress?: () => void;
}

export default function AssetCard({ asset, onPress }: AssetCardProps) {
  return (
    <List.Item
      title={asset.symbol}
      description={`${asset.chain.name}`}
      left={() => (
        <Avatar.Text 
          size={40} 
          label={asset.symbol.substring(0, 2)}
          style={styles.avatar}
        />
      )}
      right={() => (
        <View style={styles.balanceContainer}>
          <Text style={styles.balance}>{asset.balance}</Text>
          <Text style={styles.balanceUSD}>{asset.balanceUSD.toLocaleString()}원</Text>
        </View>
      )}
      onPress={onPress}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    backgroundColor: '#6200EE',
  },
  balanceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
  },
  balanceUSD: {
    fontSize: 14,
    color: '#666',
  },
});