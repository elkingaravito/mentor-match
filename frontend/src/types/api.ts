// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Notification Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: NotificationType;
}

// Session Types
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'in_progress';

export interface SessionParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'mentor' | 'mentee';
}

export interface Session {
  id: string;
  mentorId: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  title: string;
}

// Message Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

// Match Types
export type MatchStatus = 'pending' | 'accepted' | 'rejected';

export interface Match {
  id: string;
  mentorId: string;
  status: MatchStatus;
  score: number;
}

// Statistics Types
export interface Statistics {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  averageRating: number;
  totalMentors?: number;
  totalMentees?: number;
  activeMatches?: number;
  matchSuccessRate?: number;
  pendingApprovals?: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponse extends ApiResponse<{
  token: string;
  user: User;
}> {}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
