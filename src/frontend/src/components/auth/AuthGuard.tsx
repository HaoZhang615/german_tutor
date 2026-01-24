/**
 * AuthGuard component for protecting routes that require authentication.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireVerified?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireVerified = true,
}) => {
  const { isAuthenticated, isLoading, isVerified, status } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth (including initial 'idle' state)
  if (isLoading || status === 'idle') {
    return (
      <div className="min-h-screen bg-german-black flex items-center justify-center">
        <div className="text-german-gold text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to verification page if email not verified (when required)
  if (requireVerified && !isVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * GuestGuard - opposite of AuthGuard, for login/register pages
 * Redirects authenticated users away from auth pages.
 */
interface GuestGuardProps {
  children: React.ReactNode;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isVerified, status } = useAuth();
  const location = useLocation();

  if (isLoading || status === 'idle') {
    return (
      <div className="min-h-screen bg-german-black flex items-center justify-center">
        <div className="text-german-gold text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect authenticated and verified users to home
  if (isAuthenticated && isVerified) {
    // Redirect to the page they were trying to access, or home
    const from = (location.state as { from?: Location })?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

/**
 * VerificationGuard - for the email verification page
 * Only accessible to authenticated but unverified users.
 */
interface VerificationGuardProps {
  children: React.ReactNode;
}

export const VerificationGuard: React.FC<VerificationGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isVerified, status } = useAuth();

  if (isLoading || status === 'idle') {
    return (
      <div className="min-h-screen bg-german-black flex items-center justify-center">
        <div className="text-german-gold text-lg">Loading...</div>
      </div>
    );
  }

  // If not authenticated, go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If already verified, go to home
  if (isVerified) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
