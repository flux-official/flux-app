import { ethers } from 'ethers';
import { WalletManager } from './walletManager';

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// 지원 체인 설정
export const SUPPORTED_CHAINS: { [key: number]: ChainConfig } = {
  11155111: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: process.env.EXPO_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  1001: {
    chainId: 1001,
    name: 'Kaia Testnet',
    rpcUrl: process.env.EXPO_PUBLIC_KAIROS_RPC_URL || 'https://public-en-kairos.node.kaia.io',
    explorerUrl: 'https://kairos.kaiascan.io',
    nativeCurrency: {
      name: 'KAIA',
      symbol: 'KAIA',
      decimals: 18,
    },
  },
  1: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: process.env.EXPO_PUBLIC_ETH_MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/00000000000000000000000000000000',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  8217: {
    chainId: 8217,
    name: 'Kaia',
    rpcUrl: process.env.EXPO_PUBLIC_KAIA_MAINNET_RPC_URL || 'https://public-en.node.kaia.io',
    explorerUrl: 'https://kaiascan.io',
    nativeCurrency: {
      name: 'KAIA',
      symbol: 'KAIA',
      decimals: 18,
    },
  },
  137: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
};

export class Web3Provider {
  private static providers: Map<number, ethers.Provider> = new Map();
  private static currentWallet: ethers.Wallet | null = null;

  // Provider 초기화
  static initializeProviders(): void {
    Object.values(SUPPORTED_CHAINS).forEach(chain => {
      try {
        const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
        this.providers.set(chain.chainId, provider);
        console.log(`✅ ${chain.name} provider initialized`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${chain.name} provider:`, error);
      }
    });
  }

  // 특정 체인의 Provider 조회
  static getProvider(chainId: number): ethers.Provider | null {
    return this.providers.get(chainId) || null;
  }

  // 지갑과 연결된 Signer 조회
  static async getSigner(chainId: number, walletId?: string): Promise<ethers.Wallet | null> {
    try {
      const provider = this.getProvider(chainId);
      if (!provider) {
        throw new Error(`Provider not found for chain ${chainId}`);
      }

      // 활성 지갑 또는 지정된 지갑 사용
      let wallet: ethers.Wallet | null;
      
      if (walletId) {
        wallet = await WalletManager.getEthersWallet(walletId);
      } else {
        // 활성 지갑 사용
        const activeWallet = await WalletManager.getActiveWallet();
        if (!activeWallet) {
          throw new Error('No active wallet found');
        }
        wallet = new ethers.Wallet(activeWallet.privateKey);
      }

      if (!wallet) {
        throw new Error('Failed to create wallet instance');
      }

      // Provider와 연결
      return wallet.connect(provider);
    } catch (error) {
      console.error('❌ Error getting signer:', error);
      return null;
    }
  }

  // 현재 지갑 설정
  static async setCurrentWallet(walletId: string): Promise<void> {
    try {
      const walletData = await WalletManager.getWalletById(walletId);
      if (!walletData) {
        throw new Error('Wallet not found');
      }

      this.currentWallet = new ethers.Wallet(walletData.privateKey);
      await WalletManager.setActiveWallet(walletId);
      
      console.log('✅ Current wallet set:', walletData.address);
    } catch (error) {
      console.error('❌ Error setting current wallet:', error);
      throw error;
    }
  }

  // 현재 지갑 조회
  static getCurrentWallet(): ethers.Wallet | null {
    return this.currentWallet;
  }

  // 잔액 조회
  static async getBalance(chainId: number, address: string): Promise<string> {
    try {
      const provider = this.getProvider(chainId);
      if (!provider) {
        throw new Error(`Provider not found for chain ${chainId}`);
      }

      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('❌ Error getting balance:', error);
      return '0';
    }
  }

  // ERC20 토큰 잔액 조회
  static async getTokenBalance(
    chainId: number,
    tokenAddress: string,
    userAddress: string,
    decimals: number = 18
  ): Promise<string> {
    try {
      const provider = this.getProvider(chainId);
      if (!provider) {
        throw new Error(`Provider not found for chain ${chainId}`);
      }

      // ERC20 ABI (balanceOf만)
      const erc20Abi = ['function balanceOf(address owner) view returns (uint256)'];
      const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
      
      const balance = await contract.balanceOf(userAddress);
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('❌ Error getting token balance:', error);
      return '0';
    }
  }

  // 트랜잭션 전송
  static async sendTransaction(
    chainId: number,
    transaction: {
      to: string;
      value?: string;
      data?: string;
      gasLimit?: string;
      gasPrice?: string;
    },
    walletId?: string
  ): Promise<ethers.TransactionResponse | null> {
    try {
      const signer = await this.getSigner(chainId, walletId);
      if (!signer) {
        throw new Error('No signer available');
      }

      // 트랜잭션 파라미터 준비
      const txParams: any = {
        to: transaction.to,
      };

      if (transaction.value) {
        txParams.value = ethers.parseEther(transaction.value);
      }

      if (transaction.data) {
        txParams.data = transaction.data;
      }

      if (transaction.gasLimit) {
        txParams.gasLimit = transaction.gasLimit;
      }

      if (transaction.gasPrice) {
        txParams.gasPrice = ethers.parseUnits(transaction.gasPrice, 'gwei');
      }

      // 트랜잭션 전송
      const tx = await signer.sendTransaction(txParams);
      console.log('✅ Transaction sent:', tx.hash);
      
      return tx;
    } catch (error) {
      console.error('❌ Error sending transaction:', error);
      return null;
    }
  }

  // 컨트랙트 함수 호출
  static async callContract(
    chainId: number,
    contractAddress: string,
    abi: any[],
    functionName: string,
    params: any[] = [],
    walletId?: string
  ): Promise<any> {
    try {
      const signer = await this.getSigner(chainId, walletId);
      if (!signer) {
        throw new Error('No signer available');
      }

      const contract = new ethers.Contract(contractAddress, abi, signer);
      const result = await contract[functionName](...params);
      
      console.log(`✅ Contract call successful: ${functionName}`);
      return result;
    } catch (error) {
      console.error(`❌ Error calling contract function ${functionName}:`, error);
      throw error;
    }
  }

  // 가스 추정
  static async estimateGas(
    chainId: number,
    transaction: {
      to: string;
      value?: string;
      data?: string;
    },
    walletId?: string
  ): Promise<string> {
    try {
      const signer = await this.getSigner(chainId, walletId);
      if (!signer) {
        throw new Error('No signer available');
      }

      const gasEstimate = await signer.estimateGas(transaction);
      return gasEstimate.toString();
    } catch (error) {
      console.error('❌ Error estimating gas:', error);
      return '21000'; // 기본 가스 리미트
    }
  }

  // 네트워크 정보 조회
  static getChainConfig(chainId: number): ChainConfig | null {
    return SUPPORTED_CHAINS[chainId] || null;
  }

  // 지원 체인 목록
  static getSupportedChains(): ChainConfig[] {
    return Object.values(SUPPORTED_CHAINS);
  }

  // Provider 상태 확인
  static async checkProviderStatus(chainId: number): Promise<boolean> {
    try {
      const provider = this.getProvider(chainId);
      if (!provider) return false;

      await provider.getBlockNumber();
      return true;
    } catch (error) {
      console.error(`❌ Provider status check failed for chain ${chainId}:`, error);
      return false;
    }
  }
}

// 앱 시작 시 Provider 초기화
Web3Provider.initializeProviders();