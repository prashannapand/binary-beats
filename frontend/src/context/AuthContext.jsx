import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { staffApi } from '../utils/api';

const STAFF_TOKEN_KEY = 'seamless.staff.access';
const STAFF_DATA_KEY = 'seamless.staff.data';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [staff, setStaff] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(STAFF_TOKEN_KEY);
    const storedStaff = localStorage.getItem(STAFF_DATA_KEY);

    if (storedToken && storedStaff) {
      try {
        setToken(storedToken);
        setStaff(JSON.parse(storedStaff));
      } catch {
        localStorage.removeItem(STAFF_TOKEN_KEY);
        localStorage.removeItem(STAFF_DATA_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await staffApi.login(username, password);
    localStorage.setItem(STAFF_TOKEN_KEY, data.access);
    localStorage.setItem(STAFF_DATA_KEY, JSON.stringify(data.staff));
    setToken(data.access);
    setStaff(data.staff);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STAFF_TOKEN_KEY);
    localStorage.removeItem(STAFF_DATA_KEY);
    setToken(null);
    setStaff(null);
  }, []);

  const value = {
    staff,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}