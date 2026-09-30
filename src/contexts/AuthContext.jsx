import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import moduleRegistry from '../data/modules';

const roleModuleDefaults = {
  farmer: moduleRegistry
    .filter((module) => module.module)
    .map((module) => module.module),
  agronomist: [
    'GeoSense',
    'DiagnoX',
    'Predicto',
    'FertiWise',
    'SeedLin',
    'Livestock',
    'Forestry',
    'Fisheries & Aquaculture',
    'Terra Q',
    'CreditTrack',
  ],
  admin: moduleRegistry
    .filter((module) => module.module)
    .map((module) => module.module),
  investor: ['SafeVest', 'FarmIQ', 'AgroMart', 'UpdateX', 'AgriTrack', 'CreditTrack'],
  bank: ['FarmIQ', 'SafeVest', 'AgroMart', 'UpdateX', 'AgriTrack', 'CreditTrack'],
  store: ['SafeVest', 'AgroMart', 'UpdateX', 'CreditTrack'],
  buyer: ['SafeVest', 'AgroMart', 'UpdateX', 'CreditTrack'],
};

const normalizeUser = (user) => {
  if (!user) return user;
  const defaultModules = roleModuleDefaults[user.role] || [];
  const modules = [...new Set([...(Array.isArray(user.modules) ? user.modules : []), ...defaultModules])];
  return { ...user, modules };
};

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSessionExpired = () => {
      setCurrentUser(null);
      localStorage.removeItem('loryiToken');
      localStorage.removeItem('loryiUser');
    };
    window.addEventListener('loryi:session-expired', handleSessionExpired);

    if (!localStorage.getItem('loryiToken')) {
      setLoading(false);
      return () => window.removeEventListener('loryi:session-expired', handleSessionExpired);
    }

    api.me()
      .then((user) => setCurrentUser(normalizeUser(user)))
      .catch(() => {
        localStorage.removeItem('loryiToken');
        localStorage.removeItem('loryiUser');
      })
      .finally(() => setLoading(false));

    return () => window.removeEventListener('loryi:session-expired', handleSessionExpired);
  }, []);

  const login = async (email, password) => {
    try {
      const { token, user } = await api.login(email, password);
      const normalizedUser = normalizeUser(user);
      localStorage.setItem('loryiToken', token);
      localStorage.setItem('loryiUser', JSON.stringify(normalizedUser));
      setCurrentUser(normalizedUser);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('loryiToken')) await api.logout();
    } finally {
      setCurrentUser(null);
      localStorage.removeItem('loryiToken');
      localStorage.removeItem('loryiUser');
    }
  };

  const refreshUser = async () => {
    const user = await api.me();
    const normalizedUser = normalizeUser(user);
    setCurrentUser(normalizedUser);
    localStorage.setItem('loryiUser', JSON.stringify(normalizedUser));
    return normalizedUser;
  };

  const canAccessModule = (moduleName) => Boolean(
    currentUser && (currentUser.role === 'admin' || currentUser.modules.includes(moduleName))
  );

  const updateCredits = async (amountChange) => {
    if (!currentUser) return;
    const result = await api.adjustCredits(amountChange);
    await refreshUser();
    return result.balance;
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    canAccessModule,
    updateCredits,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
