import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types";
import { useCartStore } from "./cart.store";

interface AuthState {
  user: AuthUser | null;
  originalUser: AuthUser | null; // Admin user before impersonation
  isAuthenticated: boolean;
  isImpersonating: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  impersonate: (user: AuthUser) => void;
  exitImpersonation: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      originalUser: null,
      isAuthenticated: false,
      isImpersonating: false,

      login: (user) => {
        useCartStore.getState().switchUser(user.userId);
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        useCartStore.getState().switchUser(null);
        set({
          user: null,
          originalUser: null,
          isAuthenticated: false,
          isImpersonating: false,
        });
      },

      impersonate: (user) => {
        const current = get().user;
        if (current && current.role === "ADMIN") {
          useCartStore.getState().switchUser(user.userId);
          set({
            originalUser: current,
            user: { ...user, sellerStatus: "APPROVED" },
            isImpersonating: true,
          });
        }
      },

      exitImpersonation: () => {
        const original = get().originalUser;
        if (original) {
          useCartStore.getState().switchUser(original.userId);
          set({
            user: original,
            originalUser: null,
            isImpersonating: false,
          });
        }
      },
    }),
    { name: "wk-auth" }
  )
);
