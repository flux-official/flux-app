import { ethers } from 'ethers';

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  symbol: string;
  explorer: string;
  isTestnet: boolean;
}

export class ProviderService {
  private static providers: Map<number, ethers.Provider> = new Map();
  
  private static chains: ChainConfig[] = [
    {
      chainId: 1,
      name: 'Ethereum',
      rpcUrl: process.env.EXPO_PUBLIC_ETH_MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/00000000000000000000000000000000',
      symbol: 'ETH',
      explorer: 'https://etherscan.io',
      isTestnet: false,
    },
    {
      chainId: 11155111,
      name: 'Sepolia Testnet',
      rpcUrl: process.env.EXPO_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
      symbol: 'ETH',
      explorer: 'https://sepolia.etherscan.io',
      isTestnet: true,
    },
    {
      chainId: 8217,
      name: 'Kaia',
      rpcUrl: process.env.EXPO_PUBLIC_KAIA_MAINNET_RPC_URL || 'https://public-en.node.kaia.io',
      symbol: 'KAIA',
      explorer: 'https://kaiascope.com',
      isTestnet: false,
    },
    {
      chainId: 137,
      name: 'Polygon',
      rpcUrl: 'https://polygon-rpc.com',
      symbol: 'MATIC',
      explorer: 'https://polygonscan.com',
      isTestnet: false,
    },
  ];

  // Provider 초기화
  static initializeProviders(): void {
    for (const chain of this.chains) {
      try {
        const provider = new ethers.JsonRpcProvider(chain.rpcUrl, {
          chainId: chain.chainId,
          name: chain.name,
        });
        
        this.providers.set(chain.chainId, provider);
        console.log(`✅ Provider initialized for ${chain.name} (${chain.chainId})`);
      } catch (error) {
        console.error(`❌ Failed to initialize provider for ${chain.name}:`, error);
      }
    }
  }

  // Provider 가져오기
  static getProvider(chainId: number): ethers.Provider | null {
    return this.providers.get(chainId) || null;
  }

  // 지갑과 연결된 사이너 가져오기
  static getSigner(chainId: number, privateKey: string): ethers.Wallet | null {
    const provider = this.getProvider(chainId);
    if (!provider) {
      console.error(`Provider not found for chain ${chainId}`);
      return null;
    }

    try {
      const wallet = new ethers.Wallet(privateKey, provider);
      return wallet;
    } catch (error) {
      console.error(`Failed to create signer for chain ${chainId}:`, error);
      return null;
    }
  }

  // 체인 정보 가져오기
  static getChainConfig(chainId: number): ChainConfig | null {
    return this.chains.find(chain => chain.chainId === chainId) || null;
  }

  // 지원되는 모든 체인 목록
  static getSupportedChains(): ChainConfig[] {
    return [...this.chains];
  }

  // 네트워크 연결 상태 확인
  static async checkConnection(chainId: number): Promise<boolean> {
    const provider = this.getProvider(chainId);
    if (!provider) return false;

    try {
      await provider.getBlockNumber();
      return true;
    } catch (error) {
      console.error(`Connection failed for chain ${chainId}:`, error);
      return false;
    }
  }

  // 가스 가격 조회
  static async getGasPrice(chainId: number): Promise<{
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  } | null> {
    const provider = this.getProvider(chainId);
    if (!provider) return null;

    try {
      const feeData = await provider.getFeeData();
      
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        return {
          maxFeePerGas: feeData.maxFeePerGas.toString(),
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.toString(),
        };
      } else if (feeData.gasPrice) {
        return {
          gasPrice: feeData.gasPrice.toString(),
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to get gas price for chain ${chainId}:`, error);
      return null;
    }
  }

  // 잔액 조회 (네이티브 토큰)
  static async getNativeBalance(chainId: number, address: string): Promise<string | null> {
    const provider = this.getProvider(chainId);
    if (!provider) return null;

    try {
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error(`Failed to get native balance for ${address} on chain ${chainId}:`, error);
      return null;
    }
  }

  // ERC20 토큰 잔액 조회
  static async getTokenBalance(
    chainId: number,
    tokenAddress: string,
    walletAddress: string
  ): Promise<string | null> {
    const provider = this.getProvider(chainId);
    if (!provider) return null;

    try {
      const erc20ABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];
      
      const contract = new ethers.Contract(tokenAddress, erc20ABI, provider);
      const [balance, decimals] = await Promise.all([
        contract.balanceOf(walletAddress),
        contract.decimals()
      ]);
      
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error(`Failed to get token balance for ${tokenAddress}:`, error);
      return null;
    }
  }

  // 트랜잭션 전송
  static async sendTransaction(
    chainId: number,
    privateKey: string,
    transaction: ethers.TransactionRequest
  ): Promise<string | null> {
    const signer = this.getSigner(chainId, privateKey);
    if (!signer) return null;

    try {
      const tx = await signer.sendTransaction(transaction);
      console.log(`✅ Transaction sent: ${tx.hash}`);
      return tx.hash;
    } catch (error) {
      console.error(`Failed to send transaction:`, error);
      return null;
    }
  }

  // 트랜잭션 상태 확인
  static async getTransactionReceipt(
    chainId: number,
    txHash: string
  ): Promise<ethers.TransactionReceipt | null> {
    const provider = this.getProvider(chainId);
    if (!provider) return null;

    try {
      return await provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error(`Failed to get transaction receipt for ${txHash}:`, error);
      return null;
    }
  }

  // 트랜잭션 대기
  static async waitForTransaction(
    chainId: number,
    txHash: string,
    confirmations: number = 1
  ): Promise<ethers.TransactionReceipt | null> {
    const provider = this.getProvider(chainId);
    if (!provider) return null;

    try {
      console.log(`⏳ Waiting for transaction ${txHash} with ${confirmations} confirmations...`);
      return await provider.waitForTransaction(txHash, confirmations);
    } catch (error) {
      console.error(`Failed to wait for transaction ${txHash}:`, error);
      return null;
    }
  }

  // 현재 블록 번호 조회
  static async getBlockNumber(chainId: number): Promise<number | null> {
    const provider = this.getProvider(chainId);
    if (!provider) return null;

    try {
      return await provider.getBlockNumber();
    } catch (error) {
      console.error(`Failed to get block number for chain ${chainId}:`, error);
      return null;
    }
  }

  // 가스 추정
  static async estimateGas(
    chainId: number,
    transaction: ethers.TransactionRequest
  ): Promise<string | null> {
    const provider = this.getProvider(chainId);
    if (!provider) return null;

    try {
      const gasEstimate = await provider.estimateGas(transaction);
      return gasEstimate.toString();
    } catch (error) {
      console.error(`Failed to estimate gas:`, error);
      return null;
    }
  }

  // 체인 전환을 위한 네트워크 정보
  static getNetworkSwitchParams(chainId: number): any {
    const chain = this.getChainConfig(chainId);
    if (!chain) return null;

    return {
      chainId: `0x${chainId.toString(16)}`,
      chainName: chain.name,
      rpcUrls: [chain.rpcUrl],
      nativeCurrency: {
        name: chain.symbol,
        symbol: chain.symbol,
        decimals: 18,
      },
      blockExplorerUrls: [chain.explorer],
    };
  }
}