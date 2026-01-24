import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';

export default function ResetPassword() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const { resetPassword, isLoading, error, clearError } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  // Client-side validation
  const validate = (): boolean => {
    setValidationError(null);
    
    if (newPassword.length < 8) {
      setValidationError(t('auth.passwordTooShort', 'Password must be at least 8 characters'));
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setValidationError(t('auth.passwordsDoNotMatch', 'Passwords do not match'));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) return;
    if (!validate()) return;
    
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      // Error is handled by useAuth and exposed via error state
      console.error('Password reset failed', err);
    }
  };

  // If no token provided, show error state immediately
  if (!token) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
          <Card className="w-full max-w-md border-t-4 border-t-red-500 shadow-lg p-8">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('auth.invalidToken', 'Invalid Reset Token')}
              </h3>
              <p className="text-gray-500 mb-6">
                {t('auth.missingTokenMessage', 'The password reset link is invalid or has expired.')}
              </p>
              <Button onClick={() => navigate('/login')} fullWidth>
                {t('auth.backToLogin', 'Back to Login')}
              </Button>
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
              {t('auth.resetPassword', 'Set New Password')}
            </h1>
            <p className="text-gray-600">
              {t('auth.resetPasswordSubtitle', 'Enter your new password below')}
            </p>
          </div>

          <Card className="border-t-4 border-t-german-gold shadow-lg">
            {success ? (
              <div className="text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('auth.passwordResetSuccess', 'Password Reset Successful')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t('auth.passwordResetSuccessMessage', 'Your password has been successfully updated. You can now login with your new password.')}
                </p>
                <Button onClick={() => navigate('/login')} fullWidth>
                  {t('auth.goToLogin', 'Go to Login')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {(error || validationError) && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {validationError || error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.newPassword', 'New Password')}
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-german-gold focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                      minLength={8}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.confirmPassword', 'Confirm New Password')}
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-german-gold focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                      minLength={8}
                    />
                  </div>
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
                      {t('auth.resetting', 'Resetting Password...')}
                    </span>
                  ) : (
                    t('auth.resetPasswordButton', 'Reset Password')
                  )}
                </Button>

                <div className="text-center mt-4">
                  <Link 
                    to="/login" 
                    className="text-sm font-medium text-amber-600 hover:text-amber-500 transition-colors"
                  >
                    {t('auth.backToLogin', 'Back to Login')}
                  </Link>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
