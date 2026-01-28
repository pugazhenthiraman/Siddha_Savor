import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { logger } from '@/lib/utils/logger';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Custom API Error Class
export class ApiException extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.code = code;
  }
}

// Base API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const REGISTRATION_TIMEOUT = 60000; // 60 seconds for registration endpoints

// HTTP Client with error handling
export class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = DEFAULT_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';
    
    logger.apiRequest(method, endpoint, { options });
    
    // Get user data from localStorage to include in headers
    let authHeader = '';
    try {
      if (typeof window !== 'undefined') {
        const userDataStr = localStorage.getItem('siddha_user');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          // Send user ID and role as base64 encoded auth header
          authHeader = `Bearer ${btoa(JSON.stringify({ id: userData.id, role: userData.role }))}`;
        }
      }
    } catch (e) {
      logger.warn('Failed to read user data from localStorage', e);
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Handle non-JSON responses (like 404 pages)
          const text = await response.text();
          if (response.ok) {
            data = { success: true, message: 'Operation completed' };
          } else {
            logger.error('Non-JSON error response', { url, status: response.status, text });
            throw new ApiException(
              response.status === 404 ? 'Endpoint not found' : 'Server error',
              response.status
            );
          }
        }
      } catch (parseError) {
        logger.error('Failed to parse response', parseError, { url, status: response.status });
        throw new ApiException('Invalid response format', response.status);
      }

      if (!response.ok) {
        const errorMessage = data.error || this.getErrorMessage(response.status);
        
        // Log validation errors (400) as warnings, server errors as errors
        if (response.status >= 400 && response.status < 500) {
          // Client errors (400-499) are usually validation/input errors - log as warning
          logger.warn(`API ${method} ${endpoint} validation error`, { 
            status: response.status, 
            error: errorMessage,
            responseData: data 
          });
        } else {
          // Server errors (500+) are system errors - log as error
        logger.apiError(method, endpoint, new Error(errorMessage), { 
          status: response.status, 
          responseData: data 
        });
        }
        
        throw new ApiException(errorMessage, response.status, data.code);
      }

      logger.info(`API ${method} ${endpoint} success`, { status: response.status });

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };

    } catch (error) {
      if (error instanceof ApiException) {
        // For server errors, log but don't redirect
        if (error.status >= 500) {
          // this.handleServerError(); // Disabled - no error page redirect
        }
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          logger.error('API request timeout', error, { url, timeout: this.timeout });
          throw new ApiException(ERROR_MESSAGES.TIMEOUT_ERROR, 408);
        }
        
        logger.error('Network error', error, { url });
        // Network error - redirect to error page
        this.handleNetworkError();
        throw new ApiException(ERROR_MESSAGES.NETWORK_ERROR, 0);
      }

      logger.error('Unknown API error', error, { url });
      throw new ApiException(ERROR_MESSAGES.SOMETHING_WENT_WRONG, 500);
    }
  }

  private handleNetworkError() {
    logger.warn('Network error occurred - no redirect');
    // Disabled error page redirect
  }

  private handleServerError() {
    logger.warn('Server error occurred - no redirect');
    // Disabled error page redirect
  }

  private getErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Bad request. Please check your input';
      case 401:
        return ERROR_MESSAGES.INVALID_CREDENTIALS;
      case 403:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return 'Resource not found';
      case 429:
        return 'Too many requests. Please try again later';
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      case 503:
        return ERROR_MESSAGES.MAINTENANCE_MODE;
      default:
        return ERROR_MESSAGES.SOMETHING_WENT_WRONG;
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
