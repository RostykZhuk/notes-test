import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { apiClient, applyAuthToken } from '../services/apiClient';
import { AuthResponse, Credentials, RegisterPayload, User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isInitializing: boolean;
  login: (credentials: Credentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const AUTH_COOKIE_NAME = 'quicknotes_auth';
const AUTH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

const readAuthCookie = () => {
  if (typeof document === 'undefined') {
    return null;
  }
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const cookie of cookies) {
    if (cookie.startsWith(`${AUTH_COOKIE_NAME}=`)) {
      const value = cookie.slice(AUTH_COOKIE_NAME.length + 1);
      try {
        return JSON.parse(decodeURIComponent(value)) as StoredAuth;
      } catch (error) {
        console.warn('Failed to parse auth cookie', error);
        clearAuthCookie();
        return null;
      }
    }
  }
  return null;
};

const persistAuthCookie = (data: StoredAuth) => {
  if (typeof document === 'undefined') {
    return;
  }
  const serialized = encodeURIComponent(JSON.stringify(data));
  document.cookie = `${AUTH_COOKIE_NAME}=${serialized}; path=/; max-age=${AUTH_COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
};

const clearAuthCookie = () => {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
};

interface StoredAuth {
  token: string;
  user: User;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = readAuthCookie();
    if (stored) {
      setToken(stored.token);
      setUser(stored.user);
      applyAuthToken(stored.token);
    }
    setIsInitializing(false);
  }, []);

  const persistAuth = useCallback((data: AuthResponse) => {
    setToken(data.token);
    setUser(data.user);
    applyAuthToken(data.token);
    persistAuthCookie({ token: data.token, user: data.user });
  }, []);

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    applyAuthToken(null);
    clearAuthCookie();
  }, []);

  const login = useCallback(
    async (credentials: Credentials) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
      persistAuth(data);
    },
    [persistAuth]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
      persistAuth(data);
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user,
      token,
      isInitializing,
      login,
      register,
      logout
    }),
    [user, token, isInitializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
