// Auth
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  id: string;
  anonymousName: string;
  avatarIndex: number;
  authProvider: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

// Channels
export interface Channel {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  threadCount: number;
}

// Threads
export interface ThreadResponse {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorAvatar: number;
  channelSlug: string;
  channelEmoji: string;
  replyCount: number;
  reactions: Record<string, number>;
  createdAt: string;
}

export interface ThreadListResponse {
  threads: ThreadResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateThreadRequest {
  title: string;
  body: string;
  channelId: string;
  autoDeleteHours?: number;
}

// Replies 
export interface ReplyResponse {
  id: string;
  body: string;
  authorName: string;
  authorAvatar: number;
  parentReplyId: string | null;
  reactions: Record<string, number>;
  createdAt: string;
}

export interface CreateReplyRequest {
  body: string;
  parentReplyId?: string;
}

// Reactions 
export interface ToggleReactionRequest {
  targetType: "thread" | "reply";
  targetId: string;
  emoji: string;
}

export interface ReactionResponse {
  targetId: string;
  emoji: string;
  count: number;
  userReacted: boolean;
}
