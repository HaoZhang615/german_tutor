import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard, GuestGuard, VerificationGuard } from './components/auth/AuthGuard';

// Pages
import Home from './pages/Home';
import Tutor from './pages/Tutor';
import History from './pages/History';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import OAuthCallback from './pages/OAuthCallback';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest routes - only for unauthenticated users */}
        <Route
          path="/login"
          element={
            <GuestGuard>
              <Login />
            </GuestGuard>
          }
        />
        <Route path="/auth/callback/:provider" element={<OAuthCallback />} />

        {/* Verification route - only for authenticated but unverified users */}
        <Route
          path="/verify-email"
          element={
            <VerificationGuard>
              <VerifyEmail />
            </VerificationGuard>
          }
        />

        {/* Protected routes - require authentication */}
        <Route
          path="/"
          element={
            <AuthGuard requireVerified={false}>
              <Home />
            </AuthGuard>
          }
        />
        <Route
          path="/tutor"
          element={
            <AuthGuard requireVerified={true}>
              <Tutor />
            </AuthGuard>
          }
        />
        <Route
          path="/history"
          element={
            <AuthGuard requireVerified={true}>
              <History />
            </AuthGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGuard requireVerified={false}>
              <Profile />
            </AuthGuard>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AuthGuard requireVerified={true}>
              <Dashboard />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
