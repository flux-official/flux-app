import { apiClient, ApiResponse } from './apiClient';

export interface BalanceInfo {
  chainId: number;
  chainName: string;
  symbol: string;
  address: string;
  balance: string;
  balanceWei: string;
  decimals: number;
}

export interface AggregatedBalance {
  userAddress: string;
  totalBalanceUSD: number;
  balances: BalanceInfo[];
  lastUpdated: string;
}

export interface ChainInfo {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface TokenInfo {
  chainId: number;
  symbol: string;
  address: string;
  decimals: number;
}

export interface ChainStatus {
  chainId: number;
  name: string;
  status: 'online' | 'offline';
  blockNumber: number;
  lastCheck: string;
  error?: string;
}

export class WalletApi {
  // 지갑 전체 잔액 조회
  async getWalletBalances(address: string): Promise<ApiResponse<AggregatedBalance>> {
    return apiClient.get<AggregatedBalance>(`/wallet/balances/${address}`);
  }

  // 특정 체인 잔액 조회
  async getChainBalances(address: string, chainId: number): Promise<ApiResponse<BalanceInfo[]>> {
    return apiClient.get<BalanceInfo[]>(`/wallet/balances/${address}/chain/${chainId}`);
  }

  // 특정 토큰 잔액 조회
  async getTokenBalance(
    address: string,
    chainId: number,
    symbol: string
  ): Promise<ApiResponse<BalanceInfo>> {
    return apiClient.get<BalanceInfo>(
      `/wallet/balances/${address}/token?chainId=${chainId}&symbol=${symbol}`
    );
  }

  // 네이티브 토큰 잔액 조회
  async getNativeBalance(address: string, chainId: number): Promise<ApiResponse<{ balance: string }>> {
    return apiClient.get<{ balance: string }>(`/wallet/native-balance/${address}/${chainId}`);
  }

  // 지원 체인 목록
  async getSupportedChains(): Promise<ApiResponse<ChainInfo[]>> {
    return apiClient.get<ChainInfo[]>('/wallet/supported-chains');
  }

  // 지원 토큰 목록
  async getSupportedTokens(): Promise<ApiResponse<TokenInfo[]>> {
    return apiClient.get<TokenInfo[]>('/wallet/supported-tokens');
  }

  // 체인 상태 확인
  async getChainStatus(): Promise<ApiResponse<ChainStatus[]>> {
    return apiClient.get<ChainStatus[]>('/wallet/chain-status');
  }
}

export const walletApi = new WalletApi();