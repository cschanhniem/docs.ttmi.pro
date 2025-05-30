'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { checkAuth, type AuthState } from '@/lib/auth';

interface AuthContextType extends AuthState {
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authState = checkAuth();
    setIsAuthenticated(authState);
    setIsLoading(false);

    // Redirect to login if not authenticated and not already on login page
    if (!authState && pathname !== '/login' && pathname !== '/login/') {
      router.push('/login');
    }
  }, [pathname, router]);

  const login = (password: string): boolean => {
    const { login: authLogin } = require('@/lib/auth');
    const success = authLogin(password);

    if (success) {
      setIsAuthenticated(true);
    }

    return success;
  };

  const logout = (): void => {
    const { logout: authLogout } = require('@/lib/auth');
    authLogout();
    setIsAuthenticated(false);
    router.push('/login');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated && pathname !== '/login' && pathname !== '/login/') {
    return null; // Router will handle redirect
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
