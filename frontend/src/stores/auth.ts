import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '@/services/auth.service';
import type { User, LoginDto, RegisterDto } from '@/types/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  async function login(credentials: LoginDto) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authService.login(credentials);
      
      token.value = response.access_token;
      refreshToken.value = response.refresh_token;
      user.value = response.user;
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(data: RegisterDto) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authService.register(data);
      
      token.value = response.access_token;
      refreshToken.value = response.refresh_token;
      user.value = response.user;
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      user.value = null;
      token.value = null;
      refreshToken.value = null;
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  async function checkAuth() {
    if (!token.value) return;
    
    try {
      const response = await authService.getProfile();
      user.value = response;
    } catch (err) {
      console.error('Auth check failed:', err);
      await logout();
    }
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authService.refreshToken(refreshToken.value);
      
      token.value = response.access_token;
      localStorage.setItem('token', response.access_token);
      
      return response.access_token;
    } catch (err) {
      await logout();
      throw err;
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    refreshAccessToken,
  };
});