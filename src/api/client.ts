import axios from "axios";

// API base URL comes from an env var so it can differ between local dev and
// production.

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      error.message =
        "Cannot reach the API server. Check that VITE_API_URL points to a running API.";
    }
    return Promise.reject(error);
  }
);










