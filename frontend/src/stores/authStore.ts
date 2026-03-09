import { create } from "zustand";
import type { UserInfo } from "../types";
import { authApi } from "../services/api";

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.register({ email, password });
      localStorage.setItem("sayit_token", data.token);
      localStorage.setItem("sayit_user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.error || "Registration failed";
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem("sayit_token", data.token);
      localStorage.setItem("sayit_user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.error || "Login failed";
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem("sayit_token");
    localStorage.removeItem("sayit_user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem("sayit_token");
    const userStr = localStorage.getItem("sayit_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem("sayit_token");
        localStorage.removeItem("sayit_user");
      }
    }
  },
}));
