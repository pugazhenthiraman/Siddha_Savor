'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { Navbar } from '@/components/ui/Navbar';
import { Alert } from '@/components/ui/Alert';

function LoginContent() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const registered = searchParams.get('registered');
    const pending = searchParams.get('pending');
    
    if (registered === 'true') {
      setMessage({
        type: 'success',
        text: '🎉 Registration completed successfully! Your account is pending approval. You will receive an email notification once approved.'
      });
    }
    
    if (pending === 'true') {
      setMessage({
        type: 'warning', 
        text: '⏳ Your account is pending admin approval. Please wait for verification.'
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar showBackButton={true} />

      {/* Message Alert */}
      {message && (
        <div className="max-w-md mx-auto pt-4 px-4">
          <Alert variant={message.type} message={message.text} />
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-[calc(100vh-80px)]">
        {/* Left Side - Content */}
        <div className="w-1/2 bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-16">
          <div className="max-w-md text-center">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex justify-center space-x-4 mb-6">
                <div className="w-3 h-3 bg-green-200 rounded-full"></div>
                <div className="w-3 h-3 bg-green-300 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Healthcare Management
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Secure access to your healthcare dashboard. Manage appointments, 
              records, and connect with healthcare professionals.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Secure & Private</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">24/7 Access</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Easy to Use</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-500">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to your account</p>
              </div>
              <LoginForm />
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">Protected by enterprise-grade security</p>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-gray-500 text-sm">
                Need help?{' '}
                <a href="mailto:support@siddhasavor.com" className="text-green-600 hover:text-green-700 font-medium">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Simple Login Only */}
      <div className="lg:hidden flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-500">
            <LoginForm />
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              Need help?{' '}
              <a href="mailto:support@siddhasavor.com" className="text-green-600 hover:text-green-700 font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showBackButton={true} />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-500">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
