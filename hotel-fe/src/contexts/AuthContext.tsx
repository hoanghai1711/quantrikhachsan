import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth';
import { authService } from '../services/authService';
import { hasPermission as checkPermission } from '../utils/permissions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User | null) => void;
  hasPermission: (permission: string) => boolean;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
  hasPermission: () => false,
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setUser(user);
  };

  const register = async (email: string, password: string, fullName: string, phone: string) => {
    const user = await authService.register(email, password, fullName, phone);
    setUser(user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User | null) => {
    setUser(updatedUser);
  };

  const hasPermission = (permission: string) => {
    return checkPermission(user, permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);