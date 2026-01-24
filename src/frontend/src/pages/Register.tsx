import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const { t } = useTranslation('common');
  const { register, loginWithOAuth, isLoading, error: authError, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const errors: typeof validationErrors = {};
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = t('auth.invalidEmail', 'Please enter a valid email address');
      isValid = false;
    }

    // Password validation
    if (!formData.password || formData.password.length < 8) {
      errors.password = t('auth.passwordLength', 'Password must be at least 8 characters');
      isValid = false;
    } else if (new TextEncoder().encode(formData.password).length > 72) {
      errors.password = t('auth.passwordTooLong', 'Password is too long (max 72 bytes)');
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('auth.passwordsDoNotMatch', 'Passwords do not match');
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) {
      return;
    }

    try {
      await register(
        formData.email, 
        formData.password, 
        formData.displayName ? { display_name: formData.displayName } : undefined
      );
      setIsSuccess(true);
    } catch {
      // Error is handled by useAuth and exposed via authError
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (isSuccess) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-md p-8 text-center space-y-6 animate-fade-in-up">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('auth.checkEmail', 'Check your email')}
            </h2>
            <p className="text-gray-600">
              {t('auth.verificationSent', 'We have sent a verification link to')} <span className="font-medium text-gray-900">{formData.email}</span>.
              <br />
              {t('auth.clickToVerify', 'Please click the link to activate your account.')}
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
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {t('auth.createAccount', 'Create an account')}
            </h1>
            <p className="mt-2 text-gray-600">
              {t('auth.startJourney', 'Start your German learning journey today')}
            </p>
          </div>

          <Card className="p-8 shadow-lg border-t-4 border-t-german-gold">
            <form onSubmit={handleSubmit} className="space-y-6">
              {authError && (
                <div className="p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
                  {authError}
                </div>
              )}

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                  {t('auth.displayName', 'Display Name')} <span className="text-gray-400 font-normal">({t('common.optional', 'Optional')})</span>
                </label>
                <div className="mt-1">
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-german-gold focus:border-german-gold sm:text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('auth.email', 'Email address')}
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-german-gold focus:border-german-gold sm:text-sm transition-colors ${
                      validationErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t('auth.password', 'Password')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-german-gold focus:border-german-gold sm:text-sm transition-colors ${
                        validationErrors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    {t('auth.confirmPassword', 'Confirm Password')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-german-gold focus:border-german-gold sm:text-sm transition-colors ${
                        validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  fullWidth
                  disabled={isLoading}
                  className="bg-german-gold hover:bg-amber-400 text-german-black font-bold"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-german-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('common.processing', 'Creating account...')}
                    </span>
                  ) : (
                    t('auth.register', 'Create Account')
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {t('auth.orContinueWith', 'Or continue with')}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => loginWithOAuth('google')}
                  className="flex justify-center items-center"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => loginWithOAuth('github')}
                  className="flex justify-center items-center"
                >
                  <svg className="h-5 w-5 mr-2 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  GitHub
                </Button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              {t('auth.hasAccount', 'Already have an account?')}
              {' '}
              <Link to="/login" className="font-medium text-german-black hover:text-german-gold transition-colors">
                {t('auth.login', 'Log in')}
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
