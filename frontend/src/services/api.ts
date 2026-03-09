import axios from "axios";
import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  ThreadListResponse,
  ThreadResponse,
  CreateThreadRequest,
  ReplyResponse,
  CreateReplyRequest,
  ReactionResponse,
  ToggleReactionRequest,
  Channel,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5247";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sayit_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/auth/register", data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/auth/login", data),
};

// Threads
export const threadsApi = {
  list: (params?: { channel?: string; page?: number; pageSize?: number; sort?: string }) =>
    api.get<ThreadListResponse>("/Threads", { params }),

  get: (id: string) =>
    api.get<ThreadResponse>(`/Threads/${id}`),

  create: (data: CreateThreadRequest) =>
    api.post<ThreadResponse>("/Threads", data),

  delete: (id: string) =>
    api.delete(`/Threads/${id}`),
};

// Replies
export const repliesApi = {
  list: (threadId: string) =>
    api.get<ReplyResponse[]>(`/Threads/${threadId}/replies`),

  create: (threadId: string, data: CreateReplyRequest) =>
    api.post<ReplyResponse>(`/Threads/${threadId}/replies`, data),
};

// Reactions
export const reactionsApi = {
  toggle: (data: ToggleReactionRequest) =>
    api.post<ReactionResponse>("/Reactions/toggle", data),
};

// Channels
export const channelsApi = {
  list: () => api.get<Channel[]>("/Channels"),
};

export default api;
