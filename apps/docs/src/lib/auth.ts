import Cookies from 'js-cookie';

const AUTH_COOKIE = 'docs-auth';
const AUTH_PASSWORD = process.env.NEXT_PUBLIC_DOCS_PASSWORD || 'admin123';

export interface AuthState {
  isAuthenticated: boolean;
}

export const checkAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const authCookie = Cookies.get(AUTH_COOKIE);
  return authCookie === 'authenticated';
};

export const login = (password: string): boolean => {
  if (password === AUTH_PASSWORD) {
    Cookies.set(AUTH_COOKIE, 'authenticated', { 
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    return true;
  }
  return false;
};

export const logout = (): void => {
  Cookies.remove(AUTH_COOKIE);
};

export const getAuthState = (): AuthState => ({
  isAuthenticated: checkAuth()
});
