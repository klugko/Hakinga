import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ProtectedRoute } from '@/components/layout';
import { initQuoteService } from '@/services/quoteService';
import {
  // Public pages
  LandingPage,
  // Auth pages
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  // Main pages
  DashboardPage,
  ProfilePage,
  SettingsPage,
  HistoryPage,
  LeaderboardPage,
  AchievementsPage,
  FriendsPage,
  TrainingPage,
  TrainingSessionPage,
  TypingProfilePage,
  // Solo pages
  SoloPracticePage,
  SoloSessionPage,
  // Private session pages
  CreatePrivateSessionPage,
  PrivateSessionLobbyPage,
  PrivateRacePage,
  // Competition pages
  CompetitionPage,
} from '@/pages';

// Redirect authenticated users away from auth pages
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-[#8b5cf6] rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />

      {/* Auth routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Solo Practice */}
      <Route
        path="/solo"
        element={
          <ProtectedRoute>
            <SoloPracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/solo/session"
        element={
          <ProtectedRoute>
            <SoloSessionPage />
          </ProtectedRoute>
        }
      />

      {/* Private Sessions */}
      <Route
        path="/private/create"
        element={
          <ProtectedRoute>
            <CreatePrivateSessionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/private/lobby/:code"
        element={
          <ProtectedRoute>
            <PrivateSessionLobbyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/private/race/:code"
        element={
          <ProtectedRoute>
            <PrivateRacePage />
          </ProtectedRoute>
        }
      />

      {/* Competition */}
      <Route
        path="/competition"
        element={
          <ProtectedRoute>
            <CompetitionPage />
          </ProtectedRoute>
        }
      />

      {/* User pages */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            <AchievementsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/friends"
        element={
          <ProtectedRoute>
            <FriendsPage />
          </ProtectedRoute>
        }
      />

      {/* Training */}
      <Route
        path="/training"
        element={
          <ProtectedRoute>
            <TrainingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/training/:mode"
        element={
          <ProtectedRoute>
            <TrainingSessionPage />
          </ProtectedRoute>
        }
      />

      {/* Typing Profile */}
      <Route
        path="/typing-profile"
        element={
          <ProtectedRoute>
            <TypingProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to dashboard if authenticated, landing if not */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  // Prefetch quotes on app start for better UX
  useEffect(() => {
    initQuoteService();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
