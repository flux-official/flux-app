import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '../theme';

export default function StakingSummaryCard() {
  const navigation = useNavigation<any>();

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>스테이킹 요약</Title>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Paragraph style={styles.label}>내 스테이킹</Paragraph>
            <Title style={styles.value}>$6,000</Title>
          </View>
          <View style={styles.summaryItem}>
            <Paragraph style={styles.label}>누적 보상</Paragraph>
            <Title style={styles.value}>$76.25</Title>
          </View>
          <View style={styles.summaryItem}>
            <Paragraph style={styles.label}>평균 APY</Paragraph>
            <Title style={styles.value}>13.2%</Title>
          </View>
          <View style={styles.summaryItem}>
            <Paragraph style={styles.label}>전체 TVL</Paragraph>
            <Title style={styles.value}>$10M</Title>
          </View>
        </View>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Staking')}
          style={styles.button}
        >
          스테이킹 관리
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: spacing.md,
    borderRadius: 16,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryItem: {
    width: '48%',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  button: {
    marginTop: spacing.sm,
  },
});