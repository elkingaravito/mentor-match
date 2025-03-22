import { Message, Notification, Session } from '.';

import { 
    Message, 
    Conversation, 
    Notification, 
    NotificationType,
    Session,
    SessionStatus,
    SessionParticipant,
} from './api';
import { LoadingState, ErrorState } from './common';

// Message Types
export interface MessageState {
    messages: Message[];
    conversations: Conversation[];
    activeConversation: string | null;
    typingUsers: { [conversationId: string]: string[] };
    unreadCount: { [conversationId: string]: number };
    loading: LoadingState;
    error: ErrorState;
}

// Notification Types
export interface NotificationWithMeta extends Notification {
    isRead: boolean;
    isDisplayed: boolean;
    expiresAt?: number;
}

export interface NotificationState {
    notifications: NotificationWithMeta[];
    unreadCount: number;
    filters: {
        types: NotificationType[];
        showRead: boolean;
        dateRange?: {
            start: string;
            end: string;
        };
    };
    settings: {
        soundEnabled: boolean;
        desktopEnabled: boolean;
        autoHideDelay: number;
    };
    loading: LoadingState;
    error: ErrorState;
}

// Session Types
export interface SessionWithParticipants extends Session {
    mentor?: SessionParticipant;
    mentee?: SessionParticipant;
}

export interface SessionFilters {
    status?: SessionStatus[];
    participantId?: number;
    dateRange?: {
        start: string;
        end: string;
    };
    searchTerm?: string;
}

export interface SessionStats {
    total: number;
    completed: number;
    scheduled: number;
    inProgress: number;
    cancelled: number;
    totalHours: number;
    averageRating: number;
}

export interface SessionState {
    sessions: SessionWithParticipants[];
    activeSession: SessionWithParticipants | null;
    upcomingSessions: SessionWithParticipants[];
    filters: SessionFilters;
    stats: SessionStats;
    loading: LoadingState;
    error: ErrorState;
}

// Root State Type
export interface RootState {
    message: MessageState;
    notification: NotificationState;
    session: SessionState;
}

import { Notification, NotificationType } from './api';

export interface NotificationWithMeta extends Notification {
  isRead: boolean;
  isDisplayed: boolean;
  expiresAt?: number;
}

export interface NotificationState {
  notifications: NotificationWithMeta[];
  unreadCount: number;
  filters: {
    types: NotificationType[];
    showRead: boolean;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  settings: {
    soundEnabled: boolean;
    desktopEnabled: boolean;
    autoHideDelay: number;
  };
}

import { Session, SessionStatus, SessionParticipant } from './api';

export interface SessionWithParticipants extends Session {
  mentor?: SessionParticipant;
  mentee?: SessionParticipant;
}

export interface SessionFilters {
  status?: SessionStatus[];
  participantId?: number;
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
}

export interface SessionStats {
  total: number;
  completed: number;
  scheduled: number;
  inProgress: number;
  cancelled: number;
  totalHours: number;
  averageRating: number;
}

export interface SessionState {
  sessions: SessionWithParticipants[];
  activeSession: SessionWithParticipants | null;
  upcomingSessions: SessionWithParticipants[];
  filters: SessionFilters;
  stats: SessionStats;
  loading: {
    sessions: boolean;
    stats: boolean;
  };
  error: {
    sessions: string | null;
    stats: string | null;
  };
}

export interface RootState {
  message: MessageState;
  notification: NotificationState;
  session: SessionState;
}
