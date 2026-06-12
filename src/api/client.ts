import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      error.message =
        "Cannot reach the API server. Is json-server running on port 4000?";
    }
    return Promise.reject(error);
  }
);








