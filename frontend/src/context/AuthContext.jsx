import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('meetsense_token');
        const cached = localStorage.getItem('meetsense_user');
        if (cached) setUser(JSON.parse(cached));
        if (token) {
          const me = await authService.getCurrentUser();
          if (me) {
            setUser(me);
            localStorage.setItem('meetsense_user', JSON.stringify(me));
          }
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result?.user) setUser(result.user);
    return { success: true };
  };

  const signup = async (name, email, password) => {
    const result = await authService.signup(name, email, password);
    if (result?.user) setUser(result.user);
    return { success: true };
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
