import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';
import { Layout, SessionLayout, AuthLayout } from '@/components/layout/Layout';
import { ProtectedRoute, GuestRoute } from '@/components/layout/ProtectedRoute';

import {
  LandingPage,
  DashboardPage,
  ProfilePage,
  SettingsPage,
  LeaderboardPage,
  HistoryPage,
  FriendsPage,
  AchievementsPage,
  TypingProfilePage,
  TrainingPage,
  TrainingSessionPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  SoloPracticePage,
  SoloSessionPage,
  CompetitionPage,
  RacePage,
  CreatePrivateSessionPage,
  PrivateSessionLobbyPage,
} from '@/pages';

/**
 * Main application component with routing configuration
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route element={<AuthLayout />}>
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <RegisterPage />
                  </GuestRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/typing-profile" element={<TypingProfilePage />} />
              <Route path="/training" element={<TrainingPage />} />
              <Route path="/solo" element={<SoloPracticePage />} />
              <Route path="/competition" element={<CompetitionPage />} />
              <Route path="/session/private/create" element={<CreatePrivateSessionPage />} />
            </Route>

            <Route
              element={
                <ProtectedRoute>
                  <SessionLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/solo/session" element={<SoloSessionPage />} />
              <Route path="/race/:sessionId" element={<RacePage />} />
              <Route path="/session/private/:code" element={<PrivateSessionLobbyPage />} />
              <Route path="/training/:moduleId" element={<TrainingSessionPage />} />
            </Route>
          </Routes>
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
