import { Platform } from 'react-native';
import Constants from 'expo-constants';

// React Native 플랫폼별 API URL 설정 (시뮬레이터/실기기 모두 지원)
const getApiBaseUrl = () => {
  // 1) 환경변수(Expo extra)로 강제 지정 가능
  const explicit = (Constants.expoConfig?.extra as any)?.API_BASE_URL as string | undefined;
  if (explicit) return explicit.endsWith('/api') ? explicit : `${explicit.replace(/\/$/, '')}/api`;

  if (__DEV__) {
    // Expo 개발 호스트에서 IP 추출
    const hostUri = (Constants.expoConfig as any)?.hostUri || (Constants.manifest as any)?.debuggerHost || '';
    let host = typeof hostUri === 'string' ? hostUri.split(':')[0] : 'localhost';

    // Android 에뮬레이터 특수 주소
    if (Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
      host = '10.0.2.2';
    }

    // 기본 포트 3000의 API 서버 가정
    return `http://${host}:3000/api`;
  }
  // 2) 프로덕션 기본값 (필요 시 배포 환경에서 override)
  return 'https://your-api-server.com/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log('🌐 API Request:', options.method || 'GET', url);
      
      // 타임아웃 설정 (30초 - 블록체인 트랜잭션 대기용)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      console.log('🌐 API Response:', url, data);
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('⏱️ API Request timeout:', endpoint);
        return {
          success: false,
          error: 'Request timeout - server not responding',
        };
      }
      console.error('❌ API Request failed:', endpoint, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();