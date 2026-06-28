import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthTokens, AuthUser } from "@/types";
import { useCartStore } from "./cart.store";
import { registerAuthBridge } from "@/api/client";

interface AuthState {
  user: AuthUser | null;
  originalUser: AuthUser | null; // Admin user before impersonation
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isImpersonating: boolean;
  login: (user: AuthUser, tokens?: AuthTokens) => void;
  logout: () => void;
  setTokens: (tokens: AuthTokens) => void;
  updateUser: (patch: Partial<AuthUser>) => void;
  impersonate: (user: AuthUser) => void;
  exitImpersonation: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      originalUser: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isImpersonating: false,

      login: (user, tokens) => {
        useCartStore.getState().switchUser(user.userId);
        set({
          user,
          isAuthenticated: true,
          ...(tokens
            ? { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
            : {}),
        });
      },

      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),

      updateUser: (patch) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...patch } });
      },

      logout: () => {
        useCartStore.getState().switchUser(null);
        set({
          user: null,
          originalUser: null,
          accessToken: null,
          refreshToken: null,
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

// ───── Wire the Axios client to the store (token bridge) ─────
// This lets client.ts read tokens and react to refresh/auth-failure without a
// circular import.
registerAuthBridge({
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  onRefreshed: (tokens) => useAuthStore.getState().setTokens(tokens),
  onAuthFailure: () => useAuthStore.getState().logout(),
});


