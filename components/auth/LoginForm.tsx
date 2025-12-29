'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { ForgotPassword } from '@/components/auth/ForgotPassword';
import { authService } from '@/lib/services/auth';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useErrorHandler } from '@/lib/hooks/useErrorHandler';
import { SUCCESS_MESSAGES, INFO_MESSAGES, FORM_LABELS, FORM_PLACEHOLDERS, AUTH_STATUS_MESSAGES } from '@/lib/constants/messages';

export function LoginForm() {
  const router = useRouter();
  const { error, hasError, handleError, clearError } = useErrorHandler();
  
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear global error when user modifies form
    if (hasError) {
      clearError();
    }
    
    // Clear success message
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setFieldErrors({});
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ path: string[]; message: string }> };
        const errors: Partial<LoginFormData> = {};
        zodError.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    clearError();
    setSuccessMessage('');

    try {
      // Show checking credentials message
      setSuccessMessage(AUTH_STATUS_MESSAGES.CHECKING_CREDENTIALS);
      
      const response = await authService.login(formData);

      if (response.success && response.data) {
        // Show role-specific success message from API response
        setSuccessMessage(response.message || SUCCESS_MESSAGES.LOGIN_SUCCESS);
        
        // Get dashboard route based on user role
        const dashboardRoute = authService.getDashboardRoute(response.data.user.role);
        
        // Show redirecting message
        setTimeout(() => {
          setSuccessMessage(AUTH_STATUS_MESSAGES.REDIRECTING);
        }, 1000);
        
        // Redirect after showing success message
        setTimeout(() => {
          router.push(dashboardRoute);
        }, 2000);
      }
    } catch (error: any) {
      setSuccessMessage(''); // Clear success message on error
      
      // Show user-friendly error message
      if (error?.message) {
        handleError(new Error(error.message));
      } else if (error?.status === 401) {
        handleError(new Error('Please check your email and password'));
      } else if (error?.status === 403) {
        handleError(new Error('Account access restricted. Please contact support'));
      } else if (error?.status >= 500) {
        handleError(new Error('Server error. Please try again later'));
      } else {
        handleError(new Error('Login failed. Please check your credentials'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {hasError && error && (
        <Alert variant="error" message={error.message} />
      )}

      {successMessage && (
        <Alert variant="success" message={successMessage} />
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          {FORM_LABELS.EMAIL_ADDRESS}
        </label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={fieldErrors.email}
          placeholder={FORM_PLACEHOLDERS.EMAIL}
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          {FORM_LABELS.PASSWORD}
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={fieldErrors.password}
            placeholder={FORM_PLACEHOLDERS.PASSWORD}
            disabled={isLoading}
            autoComplete="current-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
            disabled={isLoading}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? AUTH_STATUS_MESSAGES.LOGGING_IN : INFO_MESSAGES.SIGN_IN}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-green-600 hover:text-green-700 text-sm font-medium"
          disabled={isLoading}
        >
          Forgot your password?
        </button>
      </div>
    </form>
  );
}
