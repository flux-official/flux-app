import { ethers } from 'ethers';
import { WalletManager } from './walletManager';

export interface TransactionRequest {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  chainId: number;
}

export interface SwapTransactionParams {
  tokenInAddress: string;
  tokenOutAddress: string;
  amountIn: string;
  amountOutMin: string;
  recipient: string;
  deadline: number;
  chainId: number;
}

export interface BridgeTransactionParams {
  tokenAddress: string;
  amount: string;
  destinationChainId: number;
  recipient: string;
  chainId: number;
}

export class TransactionManager {
  // 기본 트랜잭션 서명
  static async signTransaction(
    walletId: string,
    transaction: TransactionRequest,
    provider: ethers.Provider
  ): Promise<string> {
    try {
      const wallet = await WalletManager.getEthersWallet(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const connectedWallet = wallet.connect(provider);
      
      // 트랜잭션 객체 구성
      const tx: ethers.TransactionRequest = {
        to: transaction.to,
        value: transaction.value || '0',
        data: transaction.data || '0x',
        gasLimit: transaction.gasLimit || '200000',
        chainId: transaction.chainId,
      };

      // EIP-1559 또는 레거시 가스 가격 설정
      if (transaction.maxFeePerGas && transaction.maxPriorityFeePerGas) {
        tx.maxFeePerGas = transaction.maxFeePerGas;
        tx.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
      } else if (transaction.gasPrice) {
        tx.gasPrice = transaction.gasPrice;
      }

      // 트랜잭션 서명 및 전송
      const signedTx = await connectedWallet.sendTransaction(tx);
      
      console.log(`✅ Transaction signed and sent: ${signedTx.hash}`);
      return signedTx.hash;
    } catch (error) {
      console.error('❌ Error signing transaction:', error);
      throw error;
    }
  }

  // 스왑 트랜잭션 생성 및 서명
  static async executeSwap(
    walletId: string,
    params: SwapTransactionParams,
    provider: ethers.Provider,
    swapContractAddress: string
  ): Promise<string> {
    try {
      // Flux 스왑 컨트랙트 ABI (간소화)
      const swapABI = [
        "function swap(address tokenIn, address tokenOut, uint256 amountIn, address to) external returns (uint256 amountOut)"
      ];

      const wallet = await WalletManager.getEthersWallet(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const connectedWallet = wallet.connect(provider);
      const swapContract = new ethers.Contract(swapContractAddress, swapABI, connectedWallet);

      // 스왑 실행
      const tx = await swapContract.swap(
        params.tokenInAddress,
        params.tokenOutAddress,
        params.amountIn,
        params.recipient,
        {
          gasLimit: '300000'
        }
      );

      console.log(`✅ Swap transaction sent: ${tx.hash}`);
      return tx.hash;
    } catch (error) {
      console.error('❌ Error executing swap:', error);
      throw error;
    }
  }

  // 브릿지 트랜잭션 생성 및 서명 (burn)
  static async executeBridgeBurn(
    walletId: string,
    params: BridgeTransactionParams,
    provider: ethers.Provider,
    bridgeContractAddress: string
  ): Promise<string> {
    try {
      // Bridge 컨트랙트 ABI (burn & mint 방식)
      const bridgeABI = [
        "function exit(address tokenIn, address tokenOut, address from, address to, uint256 sourceChainId, uint256 destChainId, uint256 amount) external"
      ];

      const wallet = await WalletManager.getEthersWallet(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const connectedWallet = wallet.connect(provider);
      const bridgeContract = new ethers.Contract(bridgeContractAddress, bridgeABI, connectedWallet);

      // 브릿지 exit (burn) 실행
      const tx = await bridgeContract.exit(
        params.tokenAddress,
        params.tokenAddress, // 같은 토큰 (burn & mint)
        connectedWallet.address,
        params.recipient,
        params.chainId,
        params.destinationChainId,
        params.amount,
        {
          gasLimit: '350000'
        }
      );

      console.log(`✅ Bridge burn transaction sent: ${tx.hash}`);
      return tx.hash;
    } catch (error) {
      console.error('❌ Error executing bridge burn:', error);
      throw error;
    }
  }

  // 토큰 approve 트랜잭션
  static async approveToken(
    walletId: string,
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    provider: ethers.Provider,
    chainId: number
  ): Promise<string> {
    try {
      const erc20ABI = [
        "function approve(address spender, uint256 amount) external returns (bool)"
      ];

      const wallet = await WalletManager.getEthersWallet(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const connectedWallet = wallet.connect(provider);
      const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, connectedWallet);

      // Approve 실행
      const tx = await tokenContract.approve(spenderAddress, amount, {
        gasLimit: '100000'
      });

      console.log(`✅ Token approval sent: ${tx.hash}`);
      return tx.hash;
    } catch (error) {
      console.error('❌ Error approving token:', error);
      throw error;
    }
  }

  // 가스 가격 추정
  static async estimateGasPrice(provider: ethers.Provider): Promise<{
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  }> {
    try {
      const feeData = await provider.getFeeData();
      
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        // EIP-1559 지원
        return {
          maxFeePerGas: feeData.maxFeePerGas.toString(),
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.toString(),
        };
      } else if (feeData.gasPrice) {
        // 레거시 가스 가격
        return {
          gasPrice: feeData.gasPrice.toString(),
        };
      }

      // 기본값
      return {
        gasPrice: ethers.parseGwei('20').toString(),
      };
    } catch (error) {
      console.error('❌ Error estimating gas price:', error);
      return {
        gasPrice: ethers.parseGwei('20').toString(),
      };
    }
  }

  // 트랜잭션 영수증 확인
  static async waitForTransaction(
    provider: ethers.Provider,
    txHash: string,
    confirmations: number = 1
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      console.log(`⏳ Waiting for transaction ${txHash} with ${confirmations} confirmations...`);
      const receipt = await provider.waitForTransaction(txHash, confirmations);
      
      if (receipt) {
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        return receipt;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error waiting for transaction:', error);
      throw error;
    }
  }

  // 트랜잭션 상태 확인
  static async getTransactionStatus(
    provider: ethers.Provider,
    txHash: string
  ): Promise<{
    status: 'pending' | 'confirmed' | 'failed' | 'not_found';
    blockNumber?: number;
    gasUsed?: string;
    effectiveGasPrice?: string;
  }> {
    try {
      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        return { status: 'not_found' };
      }

      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        return { status: 'pending' };
      }

      return {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.gasPrice?.toString(),
      };
    } catch (error) {
      console.error('❌ Error getting transaction status:', error);
      return { status: 'not_found' };
    }
  }
}