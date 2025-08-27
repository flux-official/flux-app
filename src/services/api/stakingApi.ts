import { apiClient, ApiResponse } from './apiClient';

export interface StakingPoolInfo {
  tokenAddress: string;
  tokenSymbol: string;
  chainId: number;
  chainName: string;
  totalStaked: string;
  totalStakedWei: string;
  userStaked: string;
  userStakedWei: string;
  pendingRewards: string;
  pendingRewardsWei: string;
  userSharePercentage: string;
  totalClaimedRewards: string;
  userClaimedRewards: string;
  estimatedApy: string;
  isActive: boolean;
}

export interface StakingOverview {
  userAddress: string;
  totalValueStaked: number;
  totalPendingRewards: number;
  totalClaimedRewards: number;
  pools: StakingPoolInfo[];
  lastUpdated: string;
}

export interface StakeRequest {
  userAddress: string;
  tokenAddress: string;
  amount: string;
  chainId: number;
}

export interface UnstakeRequest {
  userAddress: string;
  tokenAddress: string;
  amount: string;
  chainId: number;
}

export interface ClaimRewardsRequest {
  userAddress: string;
  tokenAddress: string;
  chainId: number;
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  amount?: string;
  error?: string;
}

export class StakingApi {
  // 사용자 스테이킹 전체 현황 조회
  async getStakingOverview(address: string): Promise<ApiResponse<StakingOverview>> {
    return apiClient.get<StakingOverview>(`/staking/overview/${address}`);
  }

  // 특정 체인의 스테이킹 풀 목록 조회
  async getChainStakingPools(address: string, chainId: number): Promise<ApiResponse<StakingPoolInfo[]>> {
    return apiClient.get<StakingPoolInfo[]>(`/staking/pools/${address}/chain/${chainId}`);
  }

  // 특정 풀의 상세 정보 조회
  async getPoolDetail(
    address: string,
    tokenAddress: string,
    chainId: number
  ): Promise<ApiResponse<StakingPoolInfo>> {
    return apiClient.get<StakingPoolInfo>(
      `/staking/pool/${address}/token/${tokenAddress}?chainId=${chainId}`
    );
  }

  // 토큰 스테이킹
  async stakeTokens(stakeRequest: StakeRequest): Promise<ApiResponse<TransactionResult>> {
    return apiClient.post<TransactionResult>('/staking/stake', stakeRequest);
  }

  // 토큰 언스테이킹
  async unstakeTokens(unstakeRequest: UnstakeRequest): Promise<ApiResponse<TransactionResult>> {
    return apiClient.post<TransactionResult>('/staking/unstake', unstakeRequest);
  }

  // 보상 청구
  async claimRewards(claimRequest: ClaimRewardsRequest): Promise<ApiResponse<TransactionResult>> {
    return apiClient.post<TransactionResult>('/staking/claim', claimRequest);
  }
}

export const stakingApi = new StakingApi();