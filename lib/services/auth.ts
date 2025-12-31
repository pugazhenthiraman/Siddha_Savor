import { apiClient, ApiResponse, ApiClient } from './api';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';

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
    REGISTER_DOCTOR: '/api/auth/register-doctor',
    REGISTER_PATIENT: '/api/auth/register-patient',
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
      // Use longer timeout for login (60 seconds) - login can be slow with multiple DB queries
      const loginClient = new ApiClient('', 60000);
      const response = await loginClient.post<LoginResponse>(
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
      // Always clear local storage first
      this.clearStorage();
      
      // Try to call logout endpoint (optional)
      try {
      await apiClient.post(this.ENDPOINTS.LOGOUT);
      } catch (error) {
        // Ignore logout API errors - user is already logged out locally
        logger.warn('Logout API call failed (ignored)', error);
      }
    } catch (error) {
      // Even if everything fails, ensure user is logged out locally
      logger.error('Logout error', error);
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
      logger.error('Error parsing user data', error);
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
      logger.error('Error storing user data', error);
    }
  }

  /**
   * Store auth token
   */
  private setToken(token: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      logger.error('Error storing token', error);
    }
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEYS.TOKEN);
    } catch (error) {
      logger.error('Error getting token', error);
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
      logger.error('Error clearing storage', error);
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

  /**
   * Register doctor with invite token
   */
  async registerDoctor(token: string, formData: Record<string, unknown>): Promise<ApiResponse> {
    try {
      // Use longer timeout for registration (60 seconds)
      const registrationClient = new ApiClient('', 60000);
      const response = await registrationClient.post(
        this.ENDPOINTS.REGISTER_DOCTOR,
        { token, ...formData }
      );
      return response;
    } catch (error) {
      logger.error('Doctor registration failed', error);
      throw error;
    }
  }

  /**
   * Register patient with invite token
   */
  async registerPatient(token: string, formData: Record<string, unknown>): Promise<ApiResponse> {
    try {
      // Use longer timeout for registration (60 seconds)
      const registrationClient = new ApiClient('', 60000);
      const response = await registrationClient.post(
        this.ENDPOINTS.REGISTER_PATIENT,
        { token, ...formData }
      );
      return response;
    } catch (error) {
      logger.error('Patient registration failed', error);
      throw error;
    }
  }

  /**
   * Register patient without token (using doctorID)
   */
  async registerPatientWithoutToken(formData: Record<string, unknown>): Promise<ApiResponse> {
    try {
      // Use longer timeout for registration (60 seconds)
      const registrationClient = new ApiClient('', 60000);
      const response = await registrationClient.post(
        this.ENDPOINTS.REGISTER_PATIENT,
        formData // No token, just formData with doctorID
      );
      return response;
    } catch (error) {
      logger.error('Patient registration without token failed', error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
