'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { authService } from '@/lib/services/auth';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useErrorHandler } from '@/lib/hooks/useErrorHandler';
import { SUCCESS_MESSAGES, INFO_MESSAGES, FORM_LABELS, FORM_PLACEHOLDERS } from '@/lib/constants/messages';

export function LoginForm() {
  const router = useRouter();
  const { error, hasError, handleError, clearError } = useErrorHandler();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
      const response = await authService.login(formData);

      if (response.success && response.data) {
        setSuccessMessage(SUCCESS_MESSAGES.LOGIN_SUCCESS);
        
        // Get dashboard route based on user role
        const dashboardRoute = authService.getDashboardRoute(response.data.user.role);
        
        // Small delay to show success message
        setTimeout(() => {
          router.push(dashboardRoute);
        }, 1000);
      }
    } catch (error) {
      handleError(error);
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
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          error={fieldErrors.password}
          placeholder={FORM_PLACEHOLDERS.PASSWORD}
          disabled={isLoading}
          autoComplete="current-password"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? INFO_MESSAGES.PROCESSING : INFO_MESSAGES.SIGN_IN}
      </Button>
    </form>
  );
}
