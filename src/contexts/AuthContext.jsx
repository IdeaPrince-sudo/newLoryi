import React, { createContext, useContext, useState, useEffect } from 'react';

// ✅ Export AuthContext as a named export
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock user data with different roles and access permissions
  const mockUsers = [
    {
      id: '1',
      email: 'farmer@example.com',
      password: 'password',
      name: 'John Farmer',
      role: 'farmer',
      credits: 75,
      modules: [
        'GeoSense',
        'FertiWise',
        'SeedLin',
        'DiagnoX',
        'FarmIQ',
        'Predicto',
        'Terra Q',
        'SafeVest',
        'AgroMart',
        'UpdateX',
        'AgriTrack',
      ],
    },
    {
      id: '2',
      email: 'agronomist@example.com',
      password: 'password',
      name: 'Sara Expert',
      role: 'agronomist, extension, reseacher',
      credits: 150,
      modules: ['GeoSense', 'DiagnoX', 'Predicto', 'FertiWise', 'SeedLin', 'Terra Q'],
    },
    {
      id: '3',
      email: 'admin@example.com',
      password: 'password',
      name: 'Admin User',
      role: 'admin',
      credits: 500,
      modules: [
        'GeoSense',
        'FertiWise',
        'SeedLin',
        'DiagnoX',
        'FarmIQ',
        'Predicto',
        'Terra Q',
        'SafeVest',
        'AgroMart',
        'UpdateX',
        'AgriTrack',
      ],
    },
    {
      id: '4',
      email: 'investor@example.com',
      password: 'password',
      name: 'Justice Akpadie',
      role: 'investor',
      credits: 150,
      modules: ['SafeVest', 'FarmIQ', 'AgroMart', 'UpdateX', 'AgriTrack'],
    },
    {
      id: '5',
      email: 'provider@example.com',
      password: 'password',
      name: 'Justice Akpadie Jnr',
      role: 'financial, insurance, security',
      credits: 150,
      modules: ['SafeVest', 'AgroMart', 'UpdateX'],
    },
    {
      id: '6',
      email: 'buyer@example.com',
      password: 'password',
      name: 'Justice Akpadie Jnr',
      role: 'buyer',
      credits: 150,
      modules: ['SafeVest', 'AgroMart', 'UpdateX'],
    },
    {
      id: '7',
      email: 'store@example.com',
      password: 'password',
      name: 'Justice Akpadie Jnr',
      role: 'store',
      credits: 150,
      modules: ['SafeVest', 'AgroMart', 'UpdateX'],
    },
  ];

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('loryiUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('loryiUser');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (email, password) => {
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      const { password: _, ...userWithoutPassword } = user; // Remove password
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('loryiUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('loryiUser');
  };

  // Check module access
  const canAccessModule = (moduleName) => {
    if (!currentUser) return false;
    return currentUser.modules.includes(moduleName);
  };

  // Update credits (add or deduct)
  const updateCredits = (amountChange) => {
    if (!currentUser) return;

    const newCredits = Math.max(0, currentUser.credits + amountChange);

    const updatedUser = {
      ...currentUser,
      credits: newCredits,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('loryiUser', JSON.stringify(updatedUser));

    return newCredits;
  };

  // Provide context value
  const value = {
    currentUser,
    loading,
    login,
    logout,
    canAccessModule,
    updateCredits,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
