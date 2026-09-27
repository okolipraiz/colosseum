import axios from "axios";
import { toast } from "sonner";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.dispatchEvent(new Event("auth-changed"));
  window.location.href = "/markets";
}

axiosInstance.interceptors.request.use(
  (config) => {
    const accessTokenStr = localStorage?.getItem("access_token");
    const AccessToken =
      accessTokenStr && accessTokenStr !== "undefined" ? accessTokenStr : null;

    if (AccessToken) {
      config.headers!["Authorization"] = "Bearer " + AccessToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  async (config) => {
    return config;
  },
  async (error) => {
    const originalRequest = error.config;
    const refreshTokenStr = localStorage?.getItem("refresh_token");
    const RefreshToken =
      refreshTokenStr && refreshTokenStr !== "undefined"
        ? refreshTokenStr
        : null;

    const errorDetail = error?.response?.data?.detail;
    if (errorDetail === "Signature has expired") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.dispatchEvent(new Event("auth-changed"));
      window.location.href = "/markets";
      return Promise.reject(error);
    }

    if (error?.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
        const { data } = await axios.post(`${baseUrl}/auth/refresh_token`, {
          refresh_token: RefreshToken,
        });
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.dispatchEvent(new Event("auth-changed"));
        // window.location.href = "/signup";
      }
    } else if (error?.response?.status === 401) {
      const requestUrl = error?.config?.url || "";
      if (requestUrl.includes("/auth/me")) {
        window.dispatchEvent(new CustomEvent("unauthorized"));
      }
      return Promise.reject(error); // ← this was there
    }

    return Promise.reject(error); // ← ADD THIS at the very end
  },
);
