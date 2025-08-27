import { apiClient, ApiResponse } from './apiClient';
import { TOKEN_ADDRESSES_BY_CHAIN } from '../../shared/constants/contracts';

export interface StakeInfo {
  totalStaked: string;
  userStaked: string;
  pendingRewards: string;
  sharePercentage: string;
}

export interface SwapQuote {
  amountOut: string;
  inTokenFee: string;
  outTokenFee: string;
  totalFees: {
    token0Fee: string;
    token1Fee: string;
  };
}

export interface FluxToken {
  symbol: 'MTK1' | 'MTK2' | 'MTK3';
  chainId: number;
  address: string;
}

export interface BridgeRequest {
  tokenIn: string;
  tokenOut: string;
  from: string;
  to: string;
  sourceChainId: number;
  destChainId: number;
  amount: string;
}

export interface SwapRequest {
  chainId: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  userAddress: string;
}

export interface CrossChainSwapRequest {
  sourceChainId: number;
  destChainId: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  userAddress: string;
}

export class FluxApi {
  // =============================================================================
  // 스테이킹 API
  // =============================================================================

  async getUserStakes(chainId: number, userAddress: string): Promise<ApiResponse<Record<string, StakeInfo>>> {
    return apiClient.get<Record<string, StakeInfo>>(`/flux/stake/${chainId}/${userAddress}`);
  }

  async getStakeInfo(chainId: number, userAddress: string, tokenAddress: string): Promise<ApiResponse<StakeInfo>> {
    return apiClient.get<StakeInfo>(`/flux/stake/${chainId}/${userAddress}/${tokenAddress}`);
  }

  // =============================================================================
  // 스왑 API
  // =============================================================================

  async getSwapQuote(request: SwapRequest): Promise<ApiResponse<SwapQuote>> {
    return apiClient.post<SwapQuote>('/flux/swap/quote', request);
  }

  async getCrossChainSwapQuote(request: CrossChainSwapRequest): Promise<ApiResponse<SwapQuote>> {
    return apiClient.post<SwapQuote>('/flux/swap/cross-chain-quote', request);
  }

  // =============================================================================
  // 브리지 API
  // =============================================================================

  async initiateBridge(request: BridgeRequest): Promise<ApiResponse<{ transactionHash: string }>> {
    return apiClient.post<{ transactionHash: string }>('/flux/bridge/initiate', request);
  }

  async completeBridge(request: BridgeRequest): Promise<ApiResponse<{ transactionHash: string }>> {
    return apiClient.post<{ transactionHash: string }>('/flux/bridge/complete', request);
  }

  // =============================================================================
  // 유틸리티 API
  // =============================================================================

  async getSupportedTokens(): Promise<ApiResponse<Record<number, string[]>>> {
    return apiClient.get<Record<number, string[]>>('/flux/tokens');
  }

  async getContractAddresses(chainId: number): Promise<ApiResponse<{
    flux: string;
    bridge: string;
    supportedTokens: Record<number, string[]>;
  }>> {
    return apiClient.get(`/flux/contracts/${chainId}`);
  }

  async healthCheck(): Promise<ApiResponse<{
    message: string;
    timestamp: string;
    supportedChains: number[];
  }>> {
    return apiClient.get<{
      message: string;
      timestamp: string;
      supportedChains: number[];
    }>('/flux/health');
  }

  // =============================================================================
  // 헬퍼 메서드
  // =============================================================================

  // 토큰 주소로 심볼 찾기
  getTokenSymbol(address: string): 'MTK1' | 'MTK2' | 'MTK3' | null {
    const map: Record<string, 'MTK1'|'MTK2'|'MTK3'> = Object.entries(TOKEN_ADDRESSES_BY_CHAIN)
      .flatMap(([_, chainMap]) => Object.entries(chainMap))
      .reduce((acc, [sym, addr]) => { acc[addr.toLowerCase()] = sym as 'MTK1'|'MTK2'|'MTK3'; return acc; }, {} as Record<string, 'MTK1'|'MTK2'|'MTK3'>);
    return map[address.toLowerCase()] || null;
  }

  // 심볼로 토큰 주소 찾기
  getTokenAddressByChain(chainId: number, symbol: 'MTK1' | 'MTK2' | 'MTK3'): string {
    return TOKEN_ADDRESSES_BY_CHAIN[chainId][symbol];
  }

  // 체인 이름 반환
  getChainName(chainId: number): string {
    const chainNames: Record<number, string> = {
      11155111: 'Sepolia Testnet',
      1001: 'Kairos Testnet',
    };
    return chainNames[chainId] || `Unknown Chain (${chainId})`;
  }

  // 지원되는 체인 목록
  getSupportedChains(): number[] {
    return [11155111, 1001]; // Sepolia, Kairos
  }

  // 지원되는 토큰 목록 (하드코딩)
  getSupportedTokenList(): FluxToken[] {
    return [
      { symbol: 'MTK1', chainId: 11155111, address: TOKEN_ADDRESSES_BY_CHAIN[11155111].MTK1 },
      { symbol: 'MTK2', chainId: 11155111, address: TOKEN_ADDRESSES_BY_CHAIN[11155111].MTK2 },
      { symbol: 'MTK3', chainId: 11155111, address: TOKEN_ADDRESSES_BY_CHAIN[11155111].MTK3 },
      { symbol: 'MTK1', chainId: 1001, address: TOKEN_ADDRESSES_BY_CHAIN[1001].MTK1 },
      { symbol: 'MTK2', chainId: 1001, address: TOKEN_ADDRESSES_BY_CHAIN[1001].MTK2 },
      { symbol: 'MTK3', chainId: 1001, address: TOKEN_ADDRESSES_BY_CHAIN[1001].MTK3 },
    ];
  }
}

export const fluxApi = new FluxApi();