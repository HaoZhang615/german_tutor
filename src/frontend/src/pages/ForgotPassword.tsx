import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';

export default function ForgotPassword() {
  const { t } = useTranslation('common');
  const { forgotPassword, error, isLoading, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setIsSuccess(true);
    } catch {
      // Error is handled by useAuth and exposed via error state
    }
  };

  if (isSuccess) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
          <Card className="w-full max-w-md p-8 text-center space-y-6 animate-fade-in-up border-t-4 border-t-german-gold shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('auth.checkEmail', 'Check your email')}
            </h2>
            <p className="text-gray-600">
              {t('auth.resetLinkSent', 'We have sent a password reset link to')} <span className="font-medium text-gray-900">{email}</span>.
              <br />
              {t('auth.clickToReset', 'Please click the link to reset your password.')}
            </p>
            <div className="pt-4">
              <Link to="/login" className="text-german-black hover:text-german-gold font-medium transition-colors">
                {t('auth.backToLogin', 'Back to login')}
              </Link>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              {t('auth.forgotPassword', 'Reset your password')}
            </h1>
            <p className="text-gray-600">
              {t('auth.forgotPasswordSubtitle', 'Enter your email to receive a reset link')}
            </p>
          </div>

          <Card className="border-t-4 border-t-german-gold shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.email', 'Email address')}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-german-gold focus:border-transparent transition-all duration-200"
                  placeholder="name@example.com"
                />
              </div>

              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                className="font-bold text-lg"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-german-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('common.processing', 'Sending...')}
                  </span>
                ) : (
                  t('auth.sendResetLink', 'Send reset link')
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="text-sm font-medium text-gray-600 hover:text-german-gold transition-colors"
              >
                {t('auth.backToLogin', 'Back to login')}
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
