import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiEnvelope, AuthTokens } from "@/types";

// API base URL comes from an env var so it can differ between local dev and
// production. It must include the backend's global prefix (e.g. ".../api").

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

/**
 * Token accessors are injected by the auth store at app start (see
 * `auth.store.ts`). We avoid importing the store directly here to keep this
 * module free of circular dependencies.
 */
interface TokenBridge {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onRefreshed: (tokens: AuthTokens) => void;
  onAuthFailure: () => void;
}

let bridge: TokenBridge | null = null;

export function registerAuthBridge(b: TokenBridge): void {
  bridge = b;
}

// ───── Request interceptor: attach the Bearer access token ─────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = bridge?.getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// ───── Response interceptor: friendly errors + one-shot token refresh ─────

interface RetriableConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
}

// Ensures concurrent 401s trigger only a single refresh call.
let refreshPromise: Promise<AuthTokens> | null = null;

async function refreshTokens(): Promise<AuthTokens> {
  const refreshToken = bridge?.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available.");

  // Use a bare axios call so this request skips our interceptors entirely.
  const { data } = await axios.post<ApiEnvelope<AuthTokens>>(
    `${api.defaults.baseURL}/auth/refresh`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } }
  );
  return data.data;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.code === "ERR_NETWORK") {
      error.message =
        "Cannot reach the API server. Check that VITE_API_URL points to a running API.";
      return Promise.reject(error);
    }

    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    // Attempt a single transparent refresh on 401 (expired access token).
    if (
      status === 401 &&
      original &&
      !original._retry &&
      !original._skipAuthRefresh &&
      bridge?.getRefreshToken()
    ) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise ?? refreshTokens();
        const tokens = await refreshPromise;
        refreshPromise = null;

        bridge.onRefreshed(tokens);
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization =
          `Bearer ${tokens.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        refreshPromise = null;
        bridge?.onAuthFailure();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

