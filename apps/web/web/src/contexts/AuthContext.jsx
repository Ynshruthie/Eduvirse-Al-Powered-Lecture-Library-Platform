import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = api.getStoredUser();
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setInitialLoading(false);
  }, []);

  const login = async (email, password) => {
    const user = await api.login(email, password);
    setCurrentUser(user);
    return user;
  };

  const signup = async (email, password, name, role) => {
    const user = await api.signup(email, password, name, role);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    api.clearAuthSession();
    setCurrentUser(null);
    navigate('/');
  };

  const updateProfile = async (updates) => {
    if (!currentUser) {
      throw new Error('No active user');
    }

    const user = await api.updateProfile(updates);
    setCurrentUser(user);
    return user;
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    signup,
    logout,
    updateProfile,
    initialLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};