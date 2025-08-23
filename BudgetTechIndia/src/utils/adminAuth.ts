/**
 * Admin Authentication Service
 * Secure authentication for admin panel
 */

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
  error: string | null;
}

const ADMIN_EMAIL = process.env.PUBLIC_ADMIN_EMAIL || (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_ADMIN_EMAIL) || 'admin@budgettechindia.com';
const ADMIN_PASSWORD = process.env.PUBLIC_ADMIN_PASSWORD || (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_ADMIN_PASSWORD) || 'CHANGE_THIS_TO_A_SECURE_PASSWORD';

export async function signInAdmin(email: string, password: string): Promise<{
  success: boolean;
  user?: AdminUser;
  error?: string;
}> {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const user: AdminUser = {
      id: 'admin_1',
      email: ADMIN_EMAIL,
      displayName: 'Admin User',
      photoURL: '',
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('admin_authenticated', 'true');
    }
    return { success: true, user };
  }
  return { success: false, error: 'Invalid admin credentials' };
}

export async function signOutAdmin(): Promise<{ success: boolean }> {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('admin_authenticated');
  }
  return { success: true };
}

export const loginAdmin = signInAdmin;
export const logoutAdmin = signOutAdmin;

export async function isAdminAuthenticated(): Promise<boolean> {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('admin_authenticated') === 'true';
  }
  return false;
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const isAuth = await isAdminAuthenticated();
  if (isAuth) {
    return {
      id: 'admin_1',
      email: ADMIN_EMAIL,
      displayName: 'Admin User',
      photoURL: '',
    };
  }
  return null;
}

export function onAdminAuthStateChange(callback: (user: AdminUser | null) => void) {
  getCurrentAdmin().then(callback);
  return () => {};
}

export function isUserAdmin(user: any): boolean {
  return user && user.email === ADMIN_EMAIL;
}
