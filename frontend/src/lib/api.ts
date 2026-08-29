import axios, { AxiosError } from "axios";
import { useAuthStore } from "./authStore";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/")) {
      if (isRefreshing) {
        await new Promise<void>((resolve) => queue.push(resolve));
      } else {
        isRefreshing = true;
        try {
          const res = await api.post("/auth/refresh");
          useAuthStore.getState().setAccessToken(res.data.accessToken);
          useAuthStore.getState().setUser(res.data.user);
        } catch {
          useAuthStore.getState().logout();
          isRefreshing = false;
          queue.forEach((r) => r());
          queue = [];
          return Promise.reject(error);
        }
        isRefreshing = false;
        queue.forEach((r) => r());
        queue = [];
      }
      originalRequest._retry = true;
      originalRequest.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);
