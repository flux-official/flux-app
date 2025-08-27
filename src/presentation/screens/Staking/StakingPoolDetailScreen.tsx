import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, DataTable, Chip, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { spacing } from '../../theme';

export default function StakingPoolDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { poolId } = route.params;

  const poolDetail = {
    name: 'USDT Pool',
    description: 'USDT 스테이블코인 유동성 풀',
    apy: 12.5,
    tvl: 5000000,
    participants: 1234,
    minStake: 100,
    maxStake: 100000,
    lockPeriods: [7, 30, 90, 180],
    utilization: 0.75,
    totalRewards: 625000,
    rewardToken: 'USDT',
  };

  const topStakers = [
    { rank: 1, address: '0x1234...5678', amount: 100000, share: 2.0 },
    { rank: 2, address: '0xabcd...efgh', amount: 85000, share: 1.7 },
    { rank: 3, address: '0x9876...5432', amount: 75000, share: 1.5 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>{poolDetail.name}</Title>
            <Paragraph style={styles.description}>{poolDetail.description}</Paragraph>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Paragraph style={styles.statLabel}>APY</Paragraph>
                <Title style={styles.statValue}>{poolDetail.apy}%</Title>
              </View>
              <View style={styles.statItem}>
                <Paragraph style={styles.statLabel}>TVL</Paragraph>
                <Title style={styles.statValue}>${(poolDetail.tvl / 1000000).toFixed(1)}M</Title>
              </View>
              <View style={styles.statItem}>
                <Paragraph style={styles.statLabel}>참여자</Paragraph>
                <Title style={styles.statValue}>{poolDetail.participants.toLocaleString()}</Title>
              </View>
              <View style={styles.statItem}>
                <Paragraph style={styles.statLabel}>총 보상</Paragraph>
                <Title style={styles.statValue}>${(poolDetail.totalRewards / 1000).toFixed(0)}K</Title>
              </View>
            </View>

            <View style={styles.utilizationContainer}>
              <View style={styles.utilizationHeader}>
                <Paragraph>풀 사용률</Paragraph>
                <Paragraph>{(poolDetail.utilization * 100).toFixed(1)}%</Paragraph>
              </View>
              <ProgressBar 
                progress={poolDetail.utilization} 
                color="#6200EE"
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>스테이킹 조건</Title>
            <View style={styles.conditionRow}>
              <Paragraph style={styles.conditionLabel}>최소 스테이킹</Paragraph>
              <Paragraph style={styles.conditionValue}>${poolDetail.minStake}</Paragraph>
            </View>
            <View style={styles.conditionRow}>
              <Paragraph style={styles.conditionLabel}>최대 스테이킹</Paragraph>
              <Paragraph style={styles.conditionValue}>${poolDetail.maxStake.toLocaleString()}</Paragraph>
            </View>
            <View style={styles.conditionRow}>
              <Paragraph style={styles.conditionLabel}>보상 토큰</Paragraph>
              <Paragraph style={styles.conditionValue}>{poolDetail.rewardToken}</Paragraph>
            </View>
            <View style={styles.conditionRow}>
              <Paragraph style={styles.conditionLabel}>락업 기간</Paragraph>
              <View style={styles.periodChips}>
                {poolDetail.lockPeriods.map((period) => (
                  <Chip key={period} mode="outlined" style={styles.periodChip}>
                    {period}일
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>상위 스테이커</Title>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>순위</DataTable.Title>
                <DataTable.Title>주소</DataTable.Title>
                <DataTable.Title numeric>금액</DataTable.Title>
                <DataTable.Title numeric>점유율</DataTable.Title>
              </DataTable.Header>

              {topStakers.map((staker) => (
                <DataTable.Row key={staker.rank}>
                  <DataTable.Cell>{staker.rank}</DataTable.Cell>
                  <DataTable.Cell>{staker.address}</DataTable.Cell>
                  <DataTable.Cell numeric>${(staker.amount / 1000).toFixed(0)}K</DataTable.Cell>
                  <DataTable.Cell numeric>{staker.share}%</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('StakingRegister', { poolId })}
            style={styles.stakeButton}
          >
            스테이킹 하기
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  card: {
    margin: spacing.md,
    borderRadius: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statItem: {
    width: '48%',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  utilizationContainer: {
    marginTop: spacing.md,
  },
  utilizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  conditionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  conditionLabel: {
    fontSize: 14,
    color: '#666',
  },
  conditionValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  periodChips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  periodChip: {
    marginLeft: spacing.xs,
  },
  actions: {
    margin: spacing.md,
    marginBottom: spacing.xl,
  },
  stakeButton: {
    paddingVertical: spacing.sm,
  },
});