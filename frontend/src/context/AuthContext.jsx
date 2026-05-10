import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, registerApi, logoutApi, getMeApi, googleAuthApi } from '../api/auth.api';
import { setAccessToken, clearAccessToken, refreshTokens, getAccessToken } from '../api/axios.instance';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // If no access token in memory, refresh it first to avoid 401 in console
      if (!getAccessToken()) {
        await refreshTokens();
      }

      const { data } = await getMeApi();
      const userData = data?.data?.user || data?.data;
      setUser(userData);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      clearAccessToken();
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
      clearAccessToken();
      localStorage.removeItem('refreshToken');
      toast.error('Session expired. Please log in again.');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  const handleAuthResponse = (data) => {
    const payload = data?.data || data;
    const token = payload?.accessToken || payload?.token;
    const refreshToken = payload?.refreshToken;
    
    if (token) setAccessToken(token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    
    const userData = payload?.user;
    setUser(userData);
    setIsAuthenticated(true);
    return payload;
  };

  const login = useCallback(async (credentials) => {
    const { data } = await loginApi(credentials);
    return handleAuthResponse(data);
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await registerApi(userData);
    return handleAuthResponse(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logoutApi({ refreshToken });
      }
    } catch {
      // ignore
    } finally {
      clearAccessToken();
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const googleLogin = useCallback(async (googleData) => {
    const { data } = await googleAuthApi(googleData);
    return handleAuthResponse(data);
  }, []);

  const updateUserInContext = useCallback((updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    googleLogin,
    updateUserInContext,
    loadUser,
    isAdmin: user?.role === 'admin',
    isDemo: false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
