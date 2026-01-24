import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { OAuthProvider } from '../store/types';

export default function OAuthCallback() {
  const { provider } = useParams<{ provider: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && provider) {
      handleOAuthCallback(provider as OAuthProvider, code, state || undefined)
        .then(() => navigate('/'))
        .catch(() => navigate('/login'));
    } else {
      navigate('/login');
    }
  }, [provider, searchParams, handleOAuthCallback, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-german-gold"></div>
    </div>
  );
}
