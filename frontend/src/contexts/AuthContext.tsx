import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, AuthState, LoginCredentials, RegisterData } from '@/types';
import { authService, userService, apiClient } from '@/services';

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for stored auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('hakinga_token');
      const storedUser = localStorage.getItem('hakinga_user');

      if (token) {
        try {
          // Validate token by fetching current user
          const user = await userService.getCurrentUser();
          localStorage.setItem('hakinga_user', JSON.stringify(user));
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Token is invalid, clear storage
          localStorage.removeItem('hakinga_token');
          localStorage.removeItem('hakinga_user');
          apiClient.setAccessToken(null);
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else if (storedUser) {
        // Have stored user but no token - clear it
        localStorage.removeItem('hakinga_user');
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResult> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { user } = await authService.login({
        email: credentials.email,
        password: credentials.password,
      });

      localStorage.setItem('hakinga_user', JSON.stringify(user));

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<AuthResult> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      if (data.password !== data.confirmPassword) {
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'Passwords do not match' };
      }

      const { user } = await authService.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      localStorage.setItem('hakinga_user', JSON.stringify(user));

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('hakinga_user');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, ...data };
      localStorage.setItem('hakinga_user', JSON.stringify(updatedUser));
      return { ...prev, user: updatedUser };
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!state.isAuthenticated) return;

    try {
      const user = await userService.getCurrentUser();
      localStorage.setItem('hakinga_user', JSON.stringify(user));
      setState(prev => ({ ...prev, user }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [state.isAuthenticated]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
