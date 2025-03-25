import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetUserQuery, useRefreshTokenMutation, useLogoutMutation } from '../services';
import { api } from '../services/api';
import { User, AuthResponse } from '../types/api';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (response: AuthResponse) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

interface JWTPayload {
  exp: number;
  sub: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [refreshTokenMutation] = useRefreshTokenMutation();
  const [logoutMutation] = useLogoutMutation();
  // In development, we don't need to query the user
  const skipQuery = !isAuthenticated || import.meta.env.DEV;
  const { data: userData, error: userError } = useGetUserQuery(undefined, { 
    skip: skipQuery,
    // Log any errors in development
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error('User Query Error:', error);
      }
    }
  });

  // Mock refetch function for development
  const refetchUser = useCallback(async () => {
    if (import.meta.env.DEV && token === 'mock-jwt-token') {
      return;
    }
    // Real refetch logic here when backend is ready
  }, [token]);

  const isTokenExpired = useCallback((token: string): boolean => {
    // Don't validate mock tokens in development
    if (import.meta.env.DEV && token === 'mock-jwt-token') {
      return false;
    }
    
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }, []);

  const refreshToken = useCallback(async () => {
    // Return mock token in development
    if (import.meta.env.DEV && token === 'mock-jwt-token') {
      return token;
    }

    try {
      const response = await refreshTokenMutation().unwrap();
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      return response.data.token;
    } catch (error) {
      logout();
      throw error;
    }
  }, [refreshTokenMutation, token]);

  useEffect(() => {
    const initializeAuth = async () => {
      if (import.meta.env.DEV) {
        console.group('Auth Initialization');
      }
      
      setIsLoading(true);
      setError(null);

      try {
        // In development, always set mock token and user
        if (import.meta.env.DEV) {
          const mockToken = 'mock-jwt-token';
          const mockUser = {
            id: 'mock-user',
            email: 'mock@example.com',
            role: 'mentee',
            name: 'Mock User'
          };

          localStorage.setItem('token', mockToken);
          setToken(mockToken);
          setUser(mockUser);
          setIsAuthenticated(true);

          if (import.meta.env.DEV) {
            console.log('Development Mode:', {
              token: mockToken,
              user: mockUser,
              isAuthenticated: true
            });
          }
        } else {
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
            if (isTokenExpired(storedToken)) {
              await refreshToken();
            } else {
              setToken(storedToken);
              setIsAuthenticated(true);
              await refetchUser();
            }
          }
        }
      } catch (error) {
        if (!import.meta.env.DEV) {
          setError('Failed to restore session');
          console.error('[Auth] Error initializing:', error);
        }
      } finally {
        setIsLoading(false);
        if (import.meta.env.DEV) {
          console.log('Auth State:', {
            isLoading: false,
            isAuthenticated,
            user,
            token
          });
          console.groupEnd();
        }
      }
    };

    // Initialize auth immediately
    initializeAuth();

    // Return cleanup function
    return () => {
      if (import.meta.env.DEV) {
        console.log('Auth cleanup');
      }
    };
  }, [isTokenExpired, refreshToken, refetchUser, token]);

  useEffect(() => {
    // Skip effect for mock users in development
    if (import.meta.env.DEV && token === 'mock-jwt-token') {
      return;
    }

    if (userData?.data) {
      setUser(userData.data);
    }
  }, [userData, token]);

  // Token refresh interval
  useEffect(() => {
    if (!token) return;
    
    // Skip refresh for mock tokens in development
    if (import.meta.env.DEV && token === 'mock-jwt-token') {
      return;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const expiresIn = decoded.exp * 1000 - Date.now();
      const refreshTime = Math.max(expiresIn - 60000, 0); // Refresh 1 minute before expiry

      const refreshInterval = setInterval(refreshToken, refreshTime);
      return () => clearInterval(refreshInterval);
    } catch (error) {
      console.error('[Auth] Error setting up token refresh:', error);
    }
  }, [token, refreshToken]);

  const login = useCallback((response: AuthResponse) => {
    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);

    // Redirect to the intended page or dashboard
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  }, [navigate, location]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('[Auth] Error during logout:', error);
    } finally {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate, logoutMutation]);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
  };

  // Removemos el loading screen del AuthProvider para evitar problemas con el routing

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
