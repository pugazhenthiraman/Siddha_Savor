'use client';

import { useState } from 'react';
import { Button } from './Button';

interface ErrorPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorPage({
  title = "Oops! Something went wrong",
  message = "We're having trouble connecting to our servers. Please check your connection and try again.",
  onRetry,
  showRetry = true
}: ErrorPageProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    // Clear any cached data that might be causing issues
    if (typeof window !== 'undefined') {
      // Clear any error states
      sessionStorage.removeItem('error');
      
      // Try to go back to where they came from, or login
      const referrer = document.referrer;
      if (referrer && referrer.includes(window.location.origin)) {
        window.location.href = referrer;
      } else {
        window.location.href = '/login';
      }
    }
    
    setIsRetrying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated Error Icon */}
        <div className="mb-8">
          <div className="relative mx-auto w-32 h-32">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-spin-slow"></div>
            
            {/* Inner pulsing circle */}
            <div className="absolute inset-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse flex items-center justify-center">
              {/* Error Icon */}
              <svg className="w-12 h-12 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            {/* Floating particles */}
            <div className="absolute -top-2 -left-2 w-3 h-3 bg-green-300 rounded-full animate-float"></div>
            <div className="absolute -top-1 -right-3 w-2 h-2 bg-green-400 rounded-full animate-float-delayed"></div>
            <div className="absolute -bottom-2 -right-1 w-3 h-3 bg-green-200 rounded-full animate-float"></div>
            <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-green-500 rounded-full animate-float-delayed"></div>
          </div>
        </div>

        {/* Error Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in">
            {title}
          </h1>
          <p className="text-gray-600 leading-relaxed animate-fade-in-delayed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        {showRetry && (
          <div className="space-y-4 animate-fade-in-delayed-2">
            <Button
              onClick={handleRetry}
              isLoading={isRetrying}
              className="w-full"
              size="lg"
            >
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>
            
            <button
              onClick={() => {
                // Clear any stored data and go to login
                window.location.href = '/login';
              }}
              className="w-full text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        )}

        {/* Status Indicators */}
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-sm text-gray-500">
          <p>If you're seeing this page, there might be a temporary connection issue.</p>
          <p className="mt-1">
            Need help? Contact{' '}
            <a href="mailto:support@siddhasavor.com" className="text-green-600 hover:text-green-700">
              support@siddhasavor.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
