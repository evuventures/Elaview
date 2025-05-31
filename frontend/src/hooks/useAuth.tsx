import { useState, useEffect, createContext, useContext } from 'react';
import { UserAPI } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'renter' | 'landlord' | 'both';
  // ... other user fields
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await UserAPI.getMyProfile();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await UserAPI.login(email, password);
    if (response.success) {
      await loadUser();
    } else {
      throw new Error(response.error);
    }
  };

  const signup = async (data: any) => {
    const response = await UserAPI.signup(data);
    if (!response.success) {
      throw new Error(response.error);
    }
    // Note: User needs to verify email before they can login
  };

  const logout = async () => {
    await UserAPI.logout();
    setUser(null);
  };

  const updateProfile = async (data: any) => {
    const response = await UserAPI.updateProfile(data);
    if (response.success) {
      setUser(response.data);
    } else {
      throw new Error(response.error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}