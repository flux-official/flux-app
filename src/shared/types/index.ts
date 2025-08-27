export interface Asset {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  balanceUSD: number;
  chain: Chain;
  address: string;
  decimals: number;
  logo?: string;
}

export interface Chain {
  id: number;
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

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  asset: Asset;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: number;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
}

export enum TransactionType {
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
  SWAP = 'SWAP',
  STAKE = 'STAKE',
  UNSTAKE = 'UNSTAKE',
  CLAIM_REWARDS = 'CLAIM_REWARDS',
  BRIDGE = 'BRIDGE',
  PAYMENT = 'PAYMENT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

export interface StakingPosition {
  id: string;
  asset: Asset;
  stakedAmount: string;
  rewards: string;
  apy: number;
  lockPeriod?: number;
  unlockTime?: number;
  poolAddress: string;
}

export interface StakingPool {
  id: string;
  name: string;
  asset: Asset;
  totalStaked: string;
  totalStakedUSD: number;
  apy: number;
  minStake: string;
  lockPeriod?: number;
  participants: number;
  poolAddress: string;
  rewardAsset: Asset;
}

export interface PaymentRequest {
  id: string;
  merchant: string;
  amount: string;
  requestedAsset: Asset;
  requestedChain: Chain;
  userAsset?: Asset;
  userChain?: Chain;
  swapQuote?: SwapQuote;
  status: PaymentStatus;
  timestamp: number;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface SwapQuote {
  fromAsset: Asset;
  toAsset: Asset;
  fromAmount: string;
  toAmount: string;
  exchangeRate: number;
  priceImpact: number;
  estimatedGas: string;
  route: SwapRoute[];
}

export interface SwapRoute {
  protocol: string;
  fromChain: Chain;
  toChain: Chain;
  bridgeAddress?: string;
}