import { apiClient, ApiResponse } from './api';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/messages';

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  createdAt: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

// Auth Service Class
class AuthService {
  private readonly ENDPOINTS = {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
  } as const;

  private readonly STORAGE_KEYS = {
    USER: 'siddha_user',
    TOKEN: 'siddha_token',
  } as const;

  /**
   * Get dashboard route based on user role
   */
  getDashboardRoute(role: string): string {
    switch (role) {
      case 'admin':
        return '/dashboard/admin';
      case 'doctor':
        return '/dashboard/doctor';
      case 'patient':
        return '/dashboard/patient';
      default:
        return '/dashboard/admin'; // fallback
    }
  }

  /**
   * Login user with credentials
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>(
        this.ENDPOINTS.LOGIN,
        credentials
      );

      if (response.success && response.data) {
        // Store user data
        this.setUser(response.data.user);
        
        // Store token if provided
        if (response.data.token) {
          this.setToken(response.data.token);
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user and clear storage
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if needed
      await apiClient.post(this.ENDPOINTS.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      this.clearStorage();
    }
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.clearStorage();
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Get user role
   */
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  /**
   * Store user data
   */
  private setUser(user: User): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  /**
   * Store auth token
   */
  private setToken(token: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Clear all auth data
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.USER);
      localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Validate session and redirect if needed
   */
  validateSession(): boolean {
    const user = this.getCurrentUser();
    
    if (!user) {
      return false;
    }

    // Add additional validation logic here
    // e.g., token expiry, user status, etc.
    
    return true;
  }
}

// Export singleton instance
export const authService = new AuthService();
