import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  userEmail: string | null;
  isAuthenticated: boolean;
  login: (email: string) => boolean;
  logout: () => void;
}

const ALLOWED_EMAIL = "saffanakbar942@gmail.com";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userEmail: null,
      isAuthenticated: false,
      login: (email) => {
        const clean = email.trim().toLowerCase();
        if (clean === ALLOWED_EMAIL) {
          set({ userEmail: clean, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ userEmail: null, isAuthenticated: false }),
    }),
    { name: "codecraft-auth-store" }
  )
);
