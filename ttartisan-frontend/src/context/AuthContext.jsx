import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ttartisan_token'));
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' or 'register'

  // Fetch current user on mount if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('ttartisan_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getMe();
        if (response.data?.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error('Session expired or invalid token:', err.message);
        localStorage.removeItem('ttartisan_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token: receivedToken, user: receivedUser } = response.data;

    localStorage.setItem('ttartisan_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    setAuthModalOpen(false);
    return receivedUser;
  };

  const register = async (username, email, password) => {
    const response = await authAPI.register({ username, email, password });
    const { token: receivedToken, user: receivedUser } = response.data;

    localStorage.setItem('ttartisan_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    setAuthModalOpen(false);
    return receivedUser;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('ttartisan_token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => ({
      ...prev,
      ...updatedUserData
    }));
  }, []);

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
        authModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
