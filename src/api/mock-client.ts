import axios from "axios";

/**
 * mockApi — Axios client for the legacy mock json-server.
 *
 * WHY THIS EXISTS (temporary, "Option A / split clients"):
 * Auth (login, register, OTP, forgot/reset/change password) talks to the REAL
 * NestJS backend via `./client` (VITE_API_URL → http://localhost:3000/api).
 * Everything else (books, cart, orders, seller, admin) still relies on the mock
 * json-server until those modules are migrated to the real backend.
 *
 * Keeping a SEPARATE client lets both work side-by-side without conflict.
 *
 * NOTE: The mock has no authentication, so this client intentionally does NOT
 * attach JWT tokens or do token refresh — it only needs a baseURL, a timeout,
 * and friendly network-error handling.
 */
export const mockApi = axios.create({
  // Base URL comes from an env var so it is never hardcoded.
  baseURL: import.meta.env.VITE_MOCK_API_URL ?? "http://localhost:4000",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor: turn raw network failures into a readable message.
mockApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      error.message =
        "Cannot reach the mock data server. Make sure `npm run server` is running on port 4000.";
    }
    return Promise.reject(error);
  }
);
