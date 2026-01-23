import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, AuthState, LoginCredentials, RegisterData } from '@/types';
import { mockUser, sleep } from '@/lib/utils';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
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
      const storedUser = localStorage.getItem('hakinga_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          localStorage.removeItem('hakinga_user');
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    // Simulate API call
    await sleep(800);

    // Mock validation - accept any email with password length >= 6
    if (credentials.email && credentials.password.length >= 6) {
      // Create user from mock data or generate from email
      const user: User = {
        ...mockUser,
        email: credentials.email,
        username: credentials.email.split('@')[0],
      };

      localStorage.setItem('hakinga_user', JSON.stringify(user));

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }

    setState(prev => ({ ...prev, isLoading: false }));
    return false;
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    // Simulate API call
    await sleep(1000);

    // Mock validation
    if (data.email && data.username && data.password.length >= 6 && data.password === data.confirmPassword) {
      const user: User = {
        id: Date.now().toString(),
        username: data.username,
        email: data.email,
        createdAt: new Date().toISOString(),
        stats: {
          avgWpm: 0,
          avgAccuracy: 0,
          bestWpm: 0,
          totalSessions: 0,
          totalTimeTyped: 0,
          totalCharactersTyped: 0,
        },
      };

      localStorage.setItem('hakinga_user', JSON.stringify(user));

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }

    setState(prev => ({ ...prev, isLoading: false }));
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hakinga_user');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, ...data };
      localStorage.setItem('hakinga_user', JSON.stringify(updatedUser));
      return { ...prev, user: updatedUser };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
