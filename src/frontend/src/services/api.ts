/**
 * API service client for authentication and data fetching.
 */
import type {
  User,
  UserProfile,
  TokenResponse,
  UserProgress,
  ConversationSummary,
  ConversationDetail,
  OAuthProvider,
} from '../store/types';

// Token storage keys
const ACCESS_TOKEN_KEY = 'german_tutor_access_token';
const REFRESH_TOKEN_KEY = 'german_tutor_refresh_token';

// Runtime config
interface RuntimeConfig {
  apiUrl: string;
  wsUrl: string;
}

let cachedConfig: RuntimeConfig | null = null;

async function loadConfig(): Promise<RuntimeConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }
  
  if (import.meta.env.VITE_API_URL) {
    cachedConfig = {
      apiUrl: import.meta.env.VITE_API_URL,
      wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
    };
    return cachedConfig;
  }
  
  try {
    const response = await fetch('/config.json');
    if (response.ok) {
      cachedConfig = await response.json();
      return cachedConfig!;
    }
  } catch {
    console.warn('Failed to load config.json, using defaults');
  }
  
  cachedConfig = {
    apiUrl: 'http://localhost:8000',
    wsUrl: 'ws://localhost:8000',
  };
  return cachedConfig;
}

// Token management
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// API client
class ApiClient {
  private async getBaseUrl(): Promise<string> {
    const config = await loadConfig();
    return config.apiUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth = true
  ): Promise<T> {
    const baseUrl = await this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (requiresAuth) {
      const token = getAccessToken();
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle 401 - try to refresh token
    if (response.status === 401 && requiresAuth) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        const newToken = getAccessToken();
        if (newToken) {
          (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
        }
        const retryResponse = await fetch(url, {
          ...options,
          headers,
        });
        
        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({ detail: 'Request failed' }));
          throw new ApiError(retryResponse.status, error.detail || 'Request failed');
        }
        
        return retryResponse.json();
      } else {
        // Refresh failed, clear tokens and throw
        clearTokens();
        throw new ApiError(401, 'Session expired. Please log in again.');
      }
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new ApiError(response.status, error.detail || 'Request failed');
    }
    
    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }
    
    return response.json();
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }
    
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const tokens: TokenResponse = await response.json();
      setTokens(tokens.access_token, tokens.refresh_token);
      return true;
    } catch {
      return false;
    }
  }

  // Auth endpoints
  async register(email: string, password: string, profile?: Partial<UserProfile>): Promise<User> {
    return this.request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, profile: profile || {} }),
    }, false);
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    const tokens = await this.request<TokenResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);
    setTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  }

  async logout(): Promise<void> {
    clearTokens();
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'POST',
    }, false);
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false);
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    }, false);
  }

  async getAuthStatus(): Promise<{ authenticated: boolean; user?: User }> {
    const token = getAccessToken();
    if (!token) {
      return { authenticated: false };
    }
    
    try {
      const user = await this.getCurrentUser();
      return { authenticated: true, user };
    } catch {
      return { authenticated: false };
    }
  }

  // OAuth
  async getOAuthAuthorizeUrl(provider: OAuthProvider): Promise<string> {
    const response = await this.request<{ authorization_url: string }>(
      `/api/auth/oauth/${provider}/authorize`,
      { method: 'GET' },
      false
    );
    return response.authorization_url;
  }

  async handleOAuthCallback(provider: OAuthProvider, code: string, state?: string): Promise<TokenResponse> {
    const tokens = await this.request<TokenResponse>(
      `/api/auth/oauth/${provider}/callback`,
      {
        method: 'POST',
        body: JSON.stringify({ code, state }),
      },
      false
    );
    setTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/users/me');
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<User> {
    return this.request<User>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ profile }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<User> {
    return this.request<User>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ 
        current_password: currentPassword,
        password: newPassword,
      }),
    });
  }

  async deleteAccount(): Promise<void> {
    return this.request<void>('/api/users/me', {
      method: 'DELETE',
    });
  }

  // Progress endpoints
  async getUserProgress(): Promise<UserProgress> {
    return this.request<UserProgress>('/api/users/me/progress');
  }

  // Conversation endpoints
  async getConversations(
    limit = 20,
    offset = 0,
    level?: string
  ): Promise<ConversationSummary[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (level) {
      params.append('level', level);
    }
    return this.request<ConversationSummary[]>(`/api/conversations?${params}`);
  }

  async getConversation(id: string): Promise<ConversationDetail> {
    return this.request<ConversationDetail>(`/api/conversations/${id}`);
  }

  async exportConversations(): Promise<Blob> {
    const baseUrl = await this.getBaseUrl();
    const token = getAccessToken();
    
    const response = await fetch(`${baseUrl}/api/conversations/export`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to export conversations');
    }
    
    return response.blob();
  }

  async deleteConversation(id: string): Promise<void> {
    return this.request<void>(`/api/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteAllConversations(): Promise<{ deleted_count: number }> {
    return this.request<{ deleted_count: number }>('/api/conversations', {
      method: 'DELETE',
    });
  }
}

// Error class
export class ApiError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export config loader for other modules (like WebSocket)
export { loadConfig };
export type { RuntimeConfig };
