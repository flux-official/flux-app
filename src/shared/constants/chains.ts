import { Chain } from '../types';

export const KAIA_MAINNET: Chain = {
  id: 8217,
  name: 'Kaia Mainnet',
  symbol: 'KAIA',
  rpcUrl: 'https://public-en.node.kaia.io',
  explorerUrl: 'https://kaiascan.io',
  nativeCurrency: {
    name: 'KAIA',
    symbol: 'KAIA',
    decimals: 18,
  },
};

export const KAIA_TESTNET: Chain = {
  id: 1001,
  name: 'Kaia Testnet',
  symbol: 'KAIA',
  rpcUrl: 'https://public-en-kairos.node.kaia.io',
  explorerUrl: 'https://kairos.kaiascan.io',
  nativeCurrency: {
    name: 'KAIA',
    symbol: 'KAIA',
    decimals: 18,
  },
};

export const ETHEREUM_MAINNET: Chain = {
  id: 1,
  name: 'Ethereum',
  symbol: 'ETH',
  rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
  explorerUrl: 'https://etherscan.io',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};

export const SEPOLIA_TESTNET: Chain = {
  id: 11155111,
  name: 'Sepolia Testnet',
  symbol: 'ETH',
  rpcUrl: process.env.EXPO_PUBLIC_SEPOLIA_RPC_URL || `https://sepolia.infura.io/v3/${process.env.EXPO_PUBLIC_INFURA_API_KEY}`,
  explorerUrl: 'https://sepolia.etherscan.io',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};

export const POLYGON_MAINNET: Chain = {
  id: 137,
  name: 'Polygon',
  symbol: 'MATIC',
  rpcUrl: 'https://polygon-rpc.com',
  explorerUrl: 'https://polygonscan.com',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
};

export const SUPPORTED_CHAINS = [
  KAIA_TESTNET,
  SEPOLIA_TESTNET,
  KAIA_MAINNET,
  ETHEREUM_MAINNET,
  POLYGON_MAINNET,
];

export const DEFAULT_CHAIN = KAIA_TESTNET;