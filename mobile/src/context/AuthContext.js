import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          const res = await authAPI.getMe();
          setUser(res.data);
        }
      } catch {
        await SecureStore.deleteItemAsync('token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    await SecureStore.setItemAsync('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    await SecureStore.setItemAsync('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    setUser(null);
  };

  const updateUser = (data) => setUser((prev) => ({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
