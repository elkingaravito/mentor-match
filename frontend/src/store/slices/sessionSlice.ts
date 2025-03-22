import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SessionState } from '../../types/store';
import { Session, SessionStatus, SessionParticipant } from '../../types/api';

interface SessionWithParticipants extends Session {
  mentor?: SessionParticipant;
  mentee?: SessionParticipant;
}

interface SessionFilters {
  status?: SessionStatus[];
  participantId?: number;
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
}

interface SessionStats {
  total: number;
  completed: number;
  scheduled: number;
  inProgress: number;
  cancelled: number;
  totalHours: number;
  averageRating: number;
}

interface SessionState {
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

const initialState: SessionState = {
  sessions: [],
  activeSession: null,
  upcomingSessions: [],
  filters: {},
  stats: {
    total: 0,
    completed: 0,
    scheduled: 0,
    inProgress: 0,
    cancelled: 0,
    totalHours: 0,
    averageRating: 0,
  },
  loading: {
    sessions: false,
    stats: false,
  },
  error: {
    sessions: null,
    stats: null,
  },
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // Gestión de sesiones
    setSessions: (state, action: PayloadAction<SessionWithParticipants[]>) => {
      state.sessions = action.payload;
      state.upcomingSessions = action.payload
        .filter(session => session.status === 'scheduled')
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    },
    addSession: (state, action: PayloadAction<SessionWithParticipants>) => {
      state.sessions.push(action.payload);
      if (action.payload.status === 'scheduled') {
        state.upcomingSessions.push(action.payload);
        state.upcomingSessions.sort((a, b) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      }
      state.stats.total += 1;
      state.stats[action.payload.status] += 1;
    },
    updateSession: (state, action: PayloadAction<SessionWithParticipants>) => {
      const index = state.sessions.findIndex(session => session.id === action.payload.id);
      if (index !== -1) {
        const oldStatus = state.sessions[index].status;
        state.sessions[index] = action.payload;
        
        // Actualizar estadísticas
        if (oldStatus !== action.payload.status) {
          state.stats[oldStatus] -= 1;
          state.stats[action.payload.status] += 1;
        }
        
        // Actualizar upcomingSessions
        state.upcomingSessions = state.sessions
          .filter(session => session.status === 'scheduled')
          .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      }
    },
    setActiveSession: (state, action: PayloadAction<SessionWithParticipants | null>) => {
      state.activeSession = action.payload;
    },

    // Gestión de filtros
    setFilters: (state, action: PayloadAction<SessionFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },

    // Gestión de estadísticas
    setStats: (state, action: PayloadAction<SessionStats>) => {
      state.stats = action.payload;
    },
    updateStats: (state, action: PayloadAction<Partial<SessionStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },

    // Gestión de estado de carga y errores
    setLoading: (state, action: PayloadAction<{ type: 'sessions' | 'stats'; loading: boolean }>) => {
      state.loading[action.payload.type] = action.payload.loading;
    },
    setError: (state, action: PayloadAction<{ type: 'sessions' | 'stats'; error: string | null }>) => {
      state.error[action.payload.type] = action.payload.error;
    },

    // Limpieza
    clearSessions: (state) => {
      state.sessions = [];
      state.activeSession = null;
      state.upcomingSessions = [];
      state.filters = {};
      state.stats = initialState.stats;
    },
  },
});

export const {
  setSessions,
  addSession,
  updateSession,
  setActiveSession,
  setFilters,
  clearFilters,
  setStats,
  updateStats,
  setLoading,
  setError,
  clearSessions,
} = sessionSlice.actions;
export default sessionSlice.reducer;
