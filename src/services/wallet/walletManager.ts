import 'react-native-get-random-values';
import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export interface WalletData {
  address: string;
  mnemonic?: string;
  privateKey: string;
  name: string;
  isImported: boolean;
  createdAt: number;
}

export interface StoredWallet {
  id: string;
  address: string;
  name: string;
  isImported: boolean;
  createdAt: number;
}

const WALLETS_KEY = 'stored_wallets';
const ACTIVE_WALLET_KEY = 'active_wallet_id';

export class WalletManager {
  // 새 지갑 생성
  static async createWallet(name: string): Promise<WalletData> {
    try {
      // 새 지갑 생성
      const wallet = ethers.Wallet.createRandom();
      
      const walletData: WalletData = {
        address: wallet.address,
        mnemonic: wallet.mnemonic?.phrase || '',
        privateKey: wallet.privateKey,
        name,
        isImported: false,
        createdAt: Date.now(),
      };

      // 안전하게 저장
      await this.saveWallet(walletData);
      
      console.log('✅ New wallet created:', wallet.address);
      return walletData;
    } catch (error) {
      console.error('❌ Error creating wallet:', error);
      throw new Error('Failed to create wallet');
    }
  }

  // 니모닉으로 지갑 가져오기
  static async importWalletFromMnemonic(mnemonic: string, name: string): Promise<WalletData> {
    try {
      // 니모닉 검증 및 지갑 복원
      const wallet = ethers.Wallet.fromPhrase(mnemonic.trim());
      
      const walletData: WalletData = {
        address: wallet.address,
        mnemonic: mnemonic.trim(),
        privateKey: wallet.privateKey,
        name,
        isImported: true,
        createdAt: Date.now(),
      };

      await this.saveWallet(walletData);
      
      console.log('✅ Wallet imported from mnemonic:', wallet.address);
      return walletData;
    } catch (error) {
      console.error('❌ Error importing wallet from mnemonic:', error);
      throw new Error('Invalid mnemonic phrase');
    }
  }

  // 프라이빗 키로 지갑 가져오기
  static async importWalletFromPrivateKey(privateKey: string, name: string): Promise<WalletData> {
    try {
      // 프라이빗 키 검증 및 지갑 생성
      const wallet = new ethers.Wallet(privateKey);
      
      const walletData: WalletData = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        name,
        isImported: true,
        createdAt: Date.now(),
      };

      await this.saveWallet(walletData);
      
      console.log('✅ Wallet imported from private key:', wallet.address);
      return walletData;
    } catch (error) {
      console.error('❌ Error importing wallet from private key:', error);
      throw new Error('Invalid private key');
    }
  }

  // 지갑 안전 저장 (키체인 사용)
  private static async saveWallet(walletData: WalletData): Promise<void> {
    try {
      const walletId = this.generateWalletId(walletData.address);
      
      // 민감한 정보는 키체인에 저장
      const sensitiveData = {
        privateKey: walletData.privateKey,
        mnemonic: walletData.mnemonic || '',
      };
      
      // Expo SecureStore 사용
      await SecureStore.setItemAsync(walletId, JSON.stringify(sensitiveData));

      // 공개 정보는 AsyncStorage에 저장
      const storedWallet: StoredWallet = {
        id: walletId,
        address: walletData.address,
        name: walletData.name,
        isImported: walletData.isImported,
        createdAt: walletData.createdAt,
      };

      const existingWallets = await this.getStoredWallets();
      const updatedWallets = [...existingWallets, storedWallet];
      
      await AsyncStorage.setItem(WALLETS_KEY, JSON.stringify(updatedWallets));
      
      // 첫 번째 지갑이면 활성 지갑으로 설정
      if (existingWallets.length === 0) {
        await this.setActiveWallet(walletId);
      }
      
    } catch (error) {
      console.error('❌ Error saving wallet:', error);
      throw new Error('Failed to save wallet');
    }
  }

  // 저장된 지갑 목록 조회
  static async getStoredWallets(): Promise<StoredWallet[]> {
    try {
      const walletsJson = await AsyncStorage.getItem(WALLETS_KEY);
      return walletsJson ? JSON.parse(walletsJson) : [];
    } catch (error) {
      console.error('❌ Error getting stored wallets:', error);
      return [];
    }
  }

  // 활성 지갑 설정
  static async setActiveWallet(walletId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVE_WALLET_KEY, walletId);
    } catch (error) {
      console.error('❌ Error setting active wallet:', error);
    }
  }

  // 활성 지갑 조회
  static async getActiveWallet(): Promise<WalletData | null> {
    try {
      const activeWalletId = await AsyncStorage.getItem(ACTIVE_WALLET_KEY);
      if (!activeWalletId) return null;

      return await this.getWalletById(activeWalletId);
    } catch (error) {
      console.error('❌ Error getting active wallet:', error);
      return null;
    }
  }

  // ID로 지갑 조회 (키체인에서 민감한 정보 복원)
  static async getWalletById(walletId: string): Promise<WalletData | null> {
    try {
      // 공개 정보 조회
      const storedWallets = await this.getStoredWallets();
      const storedWallet = storedWallets.find(w => w.id === walletId);
      
      if (!storedWallet) return null;

      // 민감한 정보 조회 (SecureStore 사용)
      const sensitiveDataStr = await SecureStore.getItemAsync(walletId);
      if (!sensitiveDataStr) return null;
      
      const sensitiveData = JSON.parse(sensitiveDataStr);
      
      return {
        address: storedWallet.address,
        name: storedWallet.name,
        privateKey: sensitiveData.privateKey,
        mnemonic: sensitiveData.mnemonic || undefined,
        isImported: storedWallet.isImported,
        createdAt: storedWallet.createdAt,
      };
    } catch (error) {
      console.error('❌ Error getting wallet by ID:', error);
      return null;
    }
  }

  // 지갑 삭제
  static async deleteWallet(walletId: string): Promise<void> {
    try {
      // SecureStore에서 민감한 정보 삭제
      await SecureStore.deleteItemAsync(walletId);
      
      // AsyncStorage에서 공개 정보 삭제
      const storedWallets = await this.getStoredWallets();
      const updatedWallets = storedWallets.filter(w => w.id !== walletId);
      await AsyncStorage.setItem(WALLETS_KEY, JSON.stringify(updatedWallets));

      // 활성 지갑이었다면 초기화
      const activeWalletId = await AsyncStorage.getItem(ACTIVE_WALLET_KEY);
      if (activeWalletId === walletId) {
        await AsyncStorage.removeItem(ACTIVE_WALLET_KEY);
      }
      
      console.log('✅ Wallet deleted:', walletId);
    } catch (error) {
      console.error('❌ Error deleting wallet:', error);
      throw new Error('Failed to delete wallet');
    }
  }

  // ethers 지갑 인스턴스 생성 (트랜잭션 서명용)
  static async getEthersWallet(walletId: string): Promise<ethers.Wallet | null> {
    try {
      const walletData = await this.getWalletById(walletId);
      if (!walletData) return null;

      return new ethers.Wallet(walletData.privateKey);
    } catch (error) {
      console.error('❌ Error creating ethers wallet:', error);
      return null;
    }
  }

  // 유틸리티 함수들
  private static generateWalletId(address: string): string {
    return `wallet_${address.toLowerCase()}`;
  }

  // 니모닉 검증
  static validateMnemonic(mnemonic: string): boolean {
    try {
      ethers.Wallet.fromPhrase(mnemonic.trim());
      return true;
    } catch {
      return false;
    }
  }

  // 프라이빗 키 검증
  static validatePrivateKey(privateKey: string): boolean {
    try {
      new ethers.Wallet(privateKey);
      return true;
    } catch {
      return false;
    }
  }

  // 모든 지갑 데이터 초기화 (개발용)
  static async clearAllWallets(): Promise<void> {
    try {
      const wallets = await this.getStoredWallets();
      
      // 모든 SecureStore 항목 삭제
      for (const wallet of wallets) {
        await SecureStore.deleteItemAsync(wallet.id);
      }
      
      // AsyncStorage 초기화
      await AsyncStorage.removeItem(WALLETS_KEY);
      await AsyncStorage.removeItem(ACTIVE_WALLET_KEY);
      
      console.log('✅ All wallets cleared');
    } catch (error) {
      console.error('❌ Error clearing wallets:', error);
    }
  }
}