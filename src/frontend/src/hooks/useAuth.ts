import { useCallback, useEffect } from 'react';
import { useAuthStore, useAppStore } from '../store';
import { api, ApiError, getAccessToken, clearTokens } from '../services/api';
import type { UserProfile, OAuthProvider } from '../store/types';

export function useAuth() {
  const {
    user,
    status,
    error,
    setUser,
    setStatus,
    setError,
    logout: clearAuthState,
  } = useAuthStore();

  const { setGermanLevel, setUILanguage, setTutorVoice } = useAppStore();

  // Sync user preferences with app state
  const syncUserPreferences = useCallback((profile: UserProfile) => {
    setGermanLevel(profile.german_level);
    setUILanguage(profile.preferred_ui_language);
    setTutorVoice(profile.preferred_voice);
  }, [setGermanLevel, setUILanguage, setTutorVoice]);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (!token) {
        setStatus('unauthenticated');
        return;
      }

      setStatus('loading');
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        setStatus('authenticated');
        
        // Sync preferences if user is verified
        if (currentUser.is_verified) {
          syncUserPreferences(currentUser.profile);
        }
      } catch {
        // Token invalid or expired
        clearTokens();
        setStatus('unauthenticated');
      }
    };

    if (status === 'idle') {
      initAuth();
    }
  }, [status, setUser, setStatus, syncUserPreferences]);

  // Login with email/password
  const login = useCallback(async (email: string, password: string) => {
    setStatus('loading');
    setError(null);
    
    try {
      await api.login(email, password);
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
      setStatus('authenticated');
      
      if (currentUser.is_verified) {
        syncUserPreferences(currentUser.profile);
      }
      
      return currentUser;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Login failed';
      setError(message);
      setStatus('unauthenticated');
      throw err;
    }
  }, [setUser, setStatus, setError, syncUserPreferences]);

  // Register new user
  const register = useCallback(async (
    email: string,
    password: string,
    profile?: Partial<UserProfile>
  ) => {
    setStatus('loading');
    setError(null);
    
    try {
      const newUser = await api.register(email, password, profile);
      // Don't auto-login after registration - user needs to verify email
      setStatus('unauthenticated');
      return newUser;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Registration failed';
      setError(message);
      setStatus('unauthenticated');
      throw err;
    }
  }, [setStatus, setError]);

  // Logout
  const logout = useCallback(async () => {
    await api.logout();
    clearAuthState();
  }, [clearAuthState]);

  // OAuth login - redirects to provider
  const loginWithOAuth = useCallback(async (provider: OAuthProvider) => {
    try {
      const authUrl = await api.getOAuthAuthorizeUrl(provider);
      window.location.href = authUrl;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'OAuth login failed';
      setError(message);
      throw err;
    }
  }, [setError]);

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(async (
    provider: OAuthProvider,
    code: string,
    state?: string
  ) => {
    setStatus('loading');
    setError(null);
    
    try {
      await api.handleOAuthCallback(provider, code, state);
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
      setStatus('authenticated');
      
      // OAuth users are pre-verified
      syncUserPreferences(currentUser.profile);
      
      return currentUser;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'OAuth callback failed';
      setError(message);
      setStatus('unauthenticated');
      throw err;
    }
  }, [setUser, setStatus, setError, syncUserPreferences]);

  // Verify email
  const verifyEmail = useCallback(async (token: string) => {
    try {
      const result = await api.verifyEmail(token);
      // Refresh user data to get updated is_verified status
      if (getAccessToken()) {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        if (currentUser.is_verified) {
          syncUserPreferences(currentUser.profile);
        }
      }
      return result;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Email verification failed';
      setError(message);
      throw err;
    }
  }, [setUser, setError, syncUserPreferences]);

  // Resend verification email
  const resendVerification = useCallback(async (email: string) => {
    try {
      return await api.resendVerification(email);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to resend verification';
      setError(message);
      throw err;
    }
  }, [setError]);

  // Forgot password
  const forgotPassword = useCallback(async (email: string) => {
    try {
      return await api.forgotPassword(email);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to send reset email';
      setError(message);
      throw err;
    }
  }, [setError]);

  // Reset password
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      return await api.resetPassword(token, newPassword);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Password reset failed';
      setError(message);
      throw err;
    }
  }, [setError]);

  // Update profile
  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    try {
      const updatedUser = await api.updateProfile(profile);
      setUser(updatedUser);
      syncUserPreferences(updatedUser.profile);
      return updatedUser;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Profile update failed';
      setError(message);
      throw err;
    }
  }, [setUser, setError, syncUserPreferences]);

  // Change password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      return await api.changePassword(currentPassword, newPassword);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Password change failed';
      setError(message);
      throw err;
    }
  }, [setError]);

  // Delete account
  const deleteAccount = useCallback(async () => {
    try {
      await api.deleteAccount();
      clearAuthState();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Account deletion failed';
      setError(message);
      throw err;
    }
  }, [clearAuthState, setError]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) return null;
    
    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch {
      return null;
    }
  }, [setUser]);

  // Memoized clearError to prevent infinite loops when used in useEffect dependencies
  const clearError = useCallback(() => setError(null), [setError]);

  return {
    // State
    user,
    status,
    error,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isVerified: user?.is_verified ?? false,
    
    // Actions
    login,
    register,
    logout,
    loginWithOAuth,
    handleOAuthCallback,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    deleteAccount,
    refreshUser,
    clearError,
  };
}