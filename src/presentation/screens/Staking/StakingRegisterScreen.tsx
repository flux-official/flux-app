import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, TextInput, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { spacing } from '../../theme';

export default function StakingRegisterScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { poolId } = route.params;

  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState('30');

  const poolInfo = {
    name: 'USDT Pool',
    apy: 12.5,
    minStake: 100,
    maxStake: 100000,
    availableLiquidity: 5000000,
  };

  const handleStake = async () => {
    if (!amount || parseFloat(amount) < poolInfo.minStake) {
      Alert.alert('오류', `최소 스테이킹 금액은 $${poolInfo.minStake}입니다.`);
      return;
    }

    Alert.alert(
      '스테이킹 확인',
      `${amount} USDT를 ${lockPeriod}일 동안 스테이킹하시겠습니까?\n예상 APY: ${poolInfo.apy}%`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '확인', 
          onPress: async () => {
            Alert.alert('성공', '스테이킹이 완료되었습니다.');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const calculateRewards = () => {
    if (!amount) return 0;
    const principal = parseFloat(amount);
    const days = parseInt(lockPeriod);
    const dailyRate = poolInfo.apy / 365 / 100;
    return (principal * dailyRate * days).toFixed(2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>{poolInfo.name}</Title>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Paragraph style={styles.infoLabel}>APY</Paragraph>
                <Title style={styles.infoValue}>{poolInfo.apy}%</Title>
              </View>
              <View style={styles.infoItem}>
                <Paragraph style={styles.infoLabel}>최소 스테이킹</Paragraph>
                <Title style={styles.infoValue}>${poolInfo.minStake}</Title>
              </View>
              <View style={styles.infoItem}>
                <Paragraph style={styles.infoLabel}>유동성</Paragraph>
                <Title style={styles.infoValue}>${(poolInfo.availableLiquidity / 1000000).toFixed(1)}M</Title>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>스테이킹 설정</Title>
            
            <TextInput
              label="스테이킹 금액 (USDT)"
              value={amount}
              onChangeText={setAmount}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              placeholder={`최소 ${poolInfo.minStake} USDT`}
            />

            <Paragraph style={styles.label}>락업 기간</Paragraph>
            <View style={styles.periodContainer}>
              {['7', '30', '90', '180'].map((period) => (
                <Chip
                  key={period}
                  mode={lockPeriod === period ? 'flat' : 'outlined'}
                  onPress={() => setLockPeriod(period)}
                  style={[
                    styles.periodChip,
                    lockPeriod === period && styles.selectedPeriodChip
                  ]}
                >
                  {period}일
                </Chip>
              ))}
            </View>

            {amount && (
              <Card style={styles.rewardCard}>
                <Card.Content>
                  <Paragraph style={styles.rewardLabel}>예상 보상</Paragraph>
                  <Title style={styles.rewardValue}>${calculateRewards()} USDT</Title>
                  <Paragraph style={styles.rewardInfo}>
                    {lockPeriod}일 후 수령 가능
                  </Paragraph>
                </Card.Content>
              </Card>
            )}
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleStake}
            style={styles.stakeButton}
            disabled={!amount || parseFloat(amount) < poolInfo.minStake}
          >
            스테이킹 하기
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            취소
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  input: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.sm,
  },
  periodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  periodChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedPeriodChip: {
    backgroundColor: '#E3F2FD',
  },
  rewardCard: {
    marginTop: spacing.lg,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
  },
  rewardLabel: {
    fontSize: 12,
    color: '#666',
  },
  rewardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: spacing.xs,
  },
  rewardInfo: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    margin: spacing.md,
  },
  stakeButton: {
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
  },
});