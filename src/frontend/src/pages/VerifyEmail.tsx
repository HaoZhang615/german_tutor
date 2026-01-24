import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export default function VerifyEmail() {
  const { t } = useTranslation('common');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const { verifyEmail, resendVerification, user, logout } = useAuth();
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>(
    token ? 'verifying' : 'pending'
  );

  useEffect(() => {
    if (token) {
      verifyEmail(token)
        .then(() => {
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 3000);
        })
        .catch(() => setStatus('error'));
    }
  }, [token, verifyEmail, navigate]);

  const handleResend = async () => {
    if (user?.email) {
      try {
        await resendVerification(user.email);
        alert(t('verifyEmail.sent', 'Email sent!'));
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md p-8 text-center space-y-6">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-german-gold mx-auto"></div>
              <h2 className="text-xl font-bold">{t('verifyEmail.verifying', 'Verifying email...')}</h2>
              <p className="text-gray-600">{t('verifyEmail.wait', 'Please wait while we verify your token.')}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-green-600">{t('verifyEmail.success', 'Email verified!')}</h2>
              <p className="text-gray-600">{t('verifyEmail.redirecting', 'Redirecting you to the dashboard...')}</p>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-600">{t('verifyEmail.error', 'Verification failed')}</h2>
              <Button onClick={() => navigate('/dashboard')} variant="secondary" fullWidth className="mt-4">
                {t('common.back', 'Back')}
              </Button>
            </>
          )}
          {status === 'pending' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold">{t('verifyEmail.checkEmail', 'Check your email')}</h2>
              <p className="text-gray-600">
                {t('verifyEmail.sentLink', 'We sent a verification link to')} <span className="font-semibold">{user?.email}</span>
              </p>
              <div className="space-y-3 pt-4">
                <Button onClick={handleResend} variant="secondary" fullWidth>
                  {t('verifyEmail.resend', 'Resend verification email')}
                </Button>
                <Button onClick={logout} variant="ghost" fullWidth>
                  {t('auth.logout', 'Log out')}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}
