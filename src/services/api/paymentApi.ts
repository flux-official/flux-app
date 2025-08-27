import { apiClient, ApiResponse } from './apiClient';

export interface PaymentQuote {
  paymentAmount: string;
  targetToken: string;
  bestRoute: {
    sourceToken: string;
    sourceChainId: number;
    swapQuote?: any;
    bridgeQuote?: any;
    totalCost: string;
    estimatedTime: number;
  };
  alternatives: Array<{
    sourceToken: string;
    sourceChainId: number;
    totalCost: string;
    estimatedTime: number;
  }>;
}

export interface PaymentIntent {
  id: string;
  userAddress: string;
  merchantAddress: string;
  amount: string;
  targetToken: string;
  targetChainId: number;
  status: 'CREATED' | 'QUOTED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  quote?: PaymentQuote;
  selectedRoute?: any;
  transactionHashes?: string[];
  bridgeId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  memo?: string;
}

export interface PaymentRequest {
  userAddress: string;
  merchantAddress: string;
  paymentAmount: string;
  targetToken: string;
  targetChainId: number;
  memo?: string;
  sourceChainId?: number;
  sourceToken?: string;
}

export interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  failedPayments: number;
  totalVolume: string;
  avgPaymentTime: number;
  topTokens: { token: string; count: number }[];
}

export interface GasStrategy {
  slow: { gasPrice: string; estimatedTime: number };
  standard: { gasPrice: string; estimatedTime: number };
  fast: { gasPrice: string; estimatedTime: number };
}

export class PaymentApi {
  // 결제 견적 요청
  async getPaymentQuote(request: PaymentRequest): Promise<ApiResponse<PaymentQuote>> {
    return apiClient.post<PaymentQuote>('/payment/quote', request);
  }

  // 결제 의도 생성
  async createPaymentIntent(request: PaymentRequest): Promise<ApiResponse<PaymentIntent>> {
    return apiClient.post<PaymentIntent>('/payment/create', request);
  }

  // 결제 실행
  async executePayment(
    paymentId: string,
    selectedRouteIndex = 0,
    merchantInfo?: {
      name: string;
      product: string;
      amount: string;
      preferredToken: string;
      logo: string;
      category: string;
    }
  ): Promise<ApiResponse<PaymentIntent>> {
    return apiClient.post<PaymentIntent>(`/payment/${paymentId}/execute`, {
      selectedRouteIndex,
      merchantInfo,
    });
  }

  // 결제 상태 조회
  async getPaymentIntent(paymentId: string): Promise<ApiResponse<PaymentIntent>> {
    return apiClient.get<PaymentIntent>(`/payment/${paymentId}`);
  }

  // 사용자 결제 내역
  async getUserPayments(address: string, limit = 20): Promise<ApiResponse<PaymentIntent[]>> {
    return apiClient.get<PaymentIntent[]>(`/payment/user/${address}?limit=${limit}`);
  }

  // 판매처 결제 내역
  async getMerchantPayments(address: string, limit = 20): Promise<ApiResponse<PaymentIntent[]>> {
    return apiClient.get<PaymentIntent[]>(`/payment/merchant/${address}?limit=${limit}`);
  }

  // 결제 취소
  async cancelPayment(paymentId: string, reason?: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/payment/${paymentId}/cancel`, { reason });
  }

  // 결제 재시도
  async retryPayment(paymentId: string): Promise<ApiResponse<PaymentIntent>> {
    return apiClient.post<PaymentIntent>(`/payment/${paymentId}/retry`);
  }

  // 결제 통계
  async getPaymentStats(): Promise<ApiResponse<PaymentStats>> {
    return apiClient.get<PaymentStats>('/payment/stats/overview');
  }

  // 가스 전략 조회
  async getGasStrategy(chainId: number): Promise<ApiResponse<GasStrategy>> {
    return apiClient.get<GasStrategy>(`/payment/gas/${chainId}`);
  }
}

export const paymentApi = new PaymentApi();