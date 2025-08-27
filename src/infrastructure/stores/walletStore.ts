import { create } from 'zustand';
import { Asset, Transaction, StakingPosition, Chain } from '../../shared/types';
import { KAIA_TESTNET, SEPOLIA_TESTNET, KAIA_MAINNET, ETHEREUM_MAINNET } from '../../shared/constants/chains';
import { walletApi, BalanceInfo, fluxApi } from '../../services/api';
import { WalletManager, WalletData, Web3Provider } from '../../services/wallet';
import { ProviderService } from '../../services/blockchain/providerService';

interface WalletState {
  // 기존 상태
  address: string | null;
  assets: Asset[];
  transactions: Transaction[];
  stakingPositions: StakingPosition[];
  totalBalance: number;
  isConnected: boolean;
  currentChain: Chain;
  isLoading: boolean;

  // 지갑 관리 상태
  walletData: WalletData | null;
  hasWallet: boolean;
  isBlockchainReady: boolean;
  
  // 네이티브 토큰 잔액
  nativeBalances: {
    ethereum: string;
    kaia: string;
  };
  
  // 기존 함수들
  connectWallet: (address: string) => Promise<void>;
  disconnectWallet: () => void;
  setAssets: (assets: Asset[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setStakingPositions: (positions: StakingPosition[]) => void;
  setCurrentChain: (chain: Chain) => void;
  refreshWallet: () => Promise<void>;
  loadRealBalances: (address: string) => Promise<void>;

  // 새로운 지갑 관리 함수들
  createNewWallet: (name: string) => Promise<WalletData>;
  importWalletFromMnemonic: (mnemonic: string, name: string) => Promise<WalletData>;
  importWalletFromPrivateKey: (privateKey: string, name: string) => Promise<WalletData>;
  loadActiveWallet: () => Promise<void>;
  switchWallet: (walletId: string) => Promise<void>;
  initializeBlockchain: () => Promise<void>;
}

// 백엔드 데이터를 앱 형식으로 변환하는 헬퍼 함수
const convertBalanceToAsset = (balance: BalanceInfo): Asset => {
  const chainMap = {
    11155111: SEPOLIA_TESTNET, // Sepolia Testnet
    1001: KAIA_TESTNET,        // Kairos Testnet
    1: ETHEREUM_MAINNET,
    8217: KAIA_MAINNET,
    137: { id: 137, name: 'Polygon', symbol: 'MATIC', rpcUrl: '', explorerUrl: '', nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 } },
  };

  const tokenNames = {
    'MTK1': 'Mock Token 1',
    'MTK2': 'Mock Token 2', 
    'MTK3': 'Mock Token 3',
    'USDT': 'Tether USD',
    'USDC': 'USD Coin',
    'KRW-T': 'Korean Won Tether',
  };

  // 토큰별 원화 환율 설정
  const tokenPriceKRW = {
    'MTK1': 1,       // 1 MTK1 = 1원
    'MTK2': 1,       // 1 MTK2 = 1원  
    'MTK3': 1,       // 1 MTK3 = 1원
    'USDT': 1300,    // 1 USDT = 1300원
    'USDC': 1300,    // 1 USDC = 1300원
    'KRW-T': 1,      // 1 KRW-T = 1원
  };

  const tokenPrice = tokenPriceKRW[balance.symbol] || 1000;
  const balanceNum = parseFloat(balance.balance);

  return {
    id: `${balance.chainId}_${balance.symbol}`,
    symbol: balance.symbol,
    name: tokenNames[balance.symbol] || balance.symbol,
    balance: balance.balance,
    balanceUSD: balanceNum * tokenPrice, // 원화 기준으로 계산
    chain: chainMap[balance.chainId] || chainMap[1001],
    address: balance.address,
    decimals: balance.decimals,
  };
};

export const useWalletStore = create<WalletState>((set, get) => ({
  // 기존 상태
  address: null,
  isLoading: false,
  walletData: null,
  hasWallet: false,
  isBlockchainReady: false,
  nativeBalances: {
    ethereum: '0',
    kaia: '0',
  },
  assets: [],
  transactions: [],
  stakingPositions: [],
  totalBalance: 0,
  isConnected: false,
  currentChain: KAIA_TESTNET,

  connectWallet: async (address) => {
    set({ address, isConnected: true });
    // 지갑 연결 후 실제 잔액 로드
    await get().loadRealBalances(address);
  },

  disconnectWallet: () => {
    set({ 
      address: null, 
      isConnected: false, 
      hasWallet: false,
      walletData: null,
      assets: [], 
      transactions: [],
      stakingPositions: [],
      totalBalance: 0
    });
  },

  setAssets: (assets) => {
    const totalBalance = assets.reduce((sum, asset) => sum + asset.balanceUSD, 0);
    set({ assets, totalBalance });
  },

  setTransactions: (transactions) => {
    set({ transactions });
  },

  setStakingPositions: (stakingPositions) => {
    set({ stakingPositions });
  },

  setCurrentChain: (currentChain) => {
    set({ currentChain });
  },

  refreshWallet: async () => {
    const { address } = get();
    if (address) {
      await get().loadRealBalances(address);
    }
  },

  loadRealBalances: async (address: string) => {
    try {
      console.log('💰 Starting to load balances for:', address);
      set({ isLoading: true });
      
      // 백엔드에서 실제 잔액 조회 (타임아웃 설정됨)
      const response = await walletApi.getWalletBalances(address);
      
      // 네이티브 토큰 잔액 가져오기 (병렬 처리, 실패해도 계속 진행)
      const [ethBalance, kaiaBalance] = await Promise.allSettled([
        walletApi.getNativeBalance(address, 11155111), // Sepolia Testnet
        walletApi.getNativeBalance(address, 1001), // Kairos Testnet
      ]);
      
      if (response.success && response.data) {
        // 백엔드 데이터를 앱 형식으로 변환
        const realAssets = response.data.balances.map(convertBalanceToAsset);
        
        // Promise.allSettled 결과 처리
        const ethResult = ethBalance.status === 'fulfilled' ? ethBalance.value : null;
        const kaiaResult = kaiaBalance.status === 'fulfilled' ? kaiaBalance.value : null;
        
        set({ 
          assets: realAssets,
          totalBalance: response.data.totalBalanceUSD,
          nativeBalances: {
            ethereum: ethResult?.success && ethResult?.data?.balance ? ethResult.data.balance : '0',
            kaia: kaiaResult?.success && kaiaResult?.data?.balance ? kaiaResult.data.balance : '0',
          },
          isLoading: false
        });
        
        console.log('✅ Real balances loaded:', realAssets.length, 'assets');
        console.log('✅ Native balances - ETH:', ethResult?.data?.balance || '0', 'KAIA:', kaiaResult?.data?.balance || '0');
      } else {
        console.error('❌ Failed to load balances:', response.error);
        // 실패해도 로딩 상태는 해제
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('❌ Critical error loading balances:', error);
      // 에러가 발생해도 앱이 멈추지 않도록 로딩 상태 해제
      set({ isLoading: false });
    }
  },

  // === 새로운 지갑 관리 함수들 ===

  createNewWallet: async (name: string) => {
    try {
      set({ isLoading: true });
      
      const walletData = await WalletManager.createWallet(name);
      
      // Web3Provider에 활성 지갑 설정
      await Web3Provider.setCurrentWallet(WalletManager['generateWalletId'](walletData.address));
      
      set({
        walletData,
        address: walletData.address,
        isConnected: true,
        hasWallet: true,
        isLoading: false,
      });

      // 생성 후 잔액 로드
      await get().loadRealBalances(walletData.address);
      
      console.log('✅ New wallet created and connected:', walletData.address);
      return walletData;
    } catch (error) {
      console.error('❌ Error creating wallet:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  importWalletFromMnemonic: async (mnemonic: string, name: string) => {
    try {
      set({ isLoading: true });
      
      const walletData = await WalletManager.importWalletFromMnemonic(mnemonic, name);
      
      // Web3Provider에 활성 지갑 설정
      await Web3Provider.setCurrentWallet(WalletManager['generateWalletId'](walletData.address));
      
      set({
        walletData,
        address: walletData.address,
        isConnected: true,
        hasWallet: true,
        isLoading: false,
      });

      // 가져온 후 잔액 로드
      await get().loadRealBalances(walletData.address);
      
      console.log('✅ Wallet imported from mnemonic:', walletData.address);
      return walletData;
    } catch (error) {
      console.error('❌ Error importing wallet from mnemonic:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  importWalletFromPrivateKey: async (privateKey: string, name: string) => {
    try {
      set({ isLoading: true });
      
      const walletData = await WalletManager.importWalletFromPrivateKey(privateKey, name);
      
      // Web3Provider에 활성 지갑 설정
      await Web3Provider.setCurrentWallet(WalletManager['generateWalletId'](walletData.address));
      
      set({
        walletData,
        address: walletData.address,
        isConnected: true,
        hasWallet: true,
        isLoading: false,
      });

      // 가져온 후 잔액 로드
      await get().loadRealBalances(walletData.address);
      
      console.log('✅ Wallet imported from private key:', walletData.address);
      return walletData;
    } catch (error) {
      console.error('❌ Error importing wallet from private key:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  loadActiveWallet: async () => {
    try {
      set({ isLoading: true });
      
      const activeWallet = await WalletManager.getActiveWallet();
      
      if (activeWallet) {
        // Web3Provider에 활성 지갑 설정
        await Web3Provider.setCurrentWallet(WalletManager['generateWalletId'](activeWallet.address));
        
        set({
          walletData: activeWallet,
          address: activeWallet.address,
          isConnected: true,
          hasWallet: true,
          isLoading: false,
        });

        // 활성 지갑 잔액 로드
        await get().loadRealBalances(activeWallet.address);
        
        console.log('✅ Active wallet loaded:', activeWallet.address);
      } else {
        set({
          walletData: null,
          address: null,
          isConnected: false,
          hasWallet: false,
          isLoading: false,
        });
        
        console.log('ℹ️ No active wallet found');
      }
    } catch (error) {
      console.error('❌ Error loading active wallet:', error);
      set({ isLoading: false });
    }
  },

  switchWallet: async (walletId: string) => {
    try {
      set({ isLoading: true });
      
      const walletData = await WalletManager.getWalletById(walletId);
      
      if (!walletData) {
        throw new Error('Wallet not found');
      }

      // 활성 지갑 변경
      await WalletManager.setActiveWallet(walletId);
      await Web3Provider.setCurrentWallet(walletId);
      
      set({
        walletData,
        address: walletData.address,
        isConnected: true,
        hasWallet: true,
        isLoading: false,
      });

      // 지갑 전환 후 잔액 로드
      await get().loadRealBalances(walletData.address);
      
      console.log('✅ Wallet switched to:', walletData.address);
    } catch (error) {
      console.error('❌ Error switching wallet:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  // 블록체인 초기화
  initializeBlockchain: async () => {
    try {
      console.log('🚀 Initializing blockchain providers...');
      ProviderService.initializeProviders();
      
      // 각 체인 연결 상태 확인
      const chains = ProviderService.getSupportedChains();
      const connectionPromises = chains.map(chain => 
        ProviderService.checkConnection(chain.chainId)
      );
      
      const connectionResults = await Promise.all(connectionPromises);
      const connectedChains = chains.filter((_, index) => connectionResults[index]);
      
      console.log(`✅ Connected to ${connectedChains.length}/${chains.length} chains:`, 
        connectedChains.map(c => c.name).join(', '));
      
      set({ isBlockchainReady: true });
    } catch (error) {
      console.error('❌ Failed to initialize blockchain:', error);
      throw error;
    }
  },
}));