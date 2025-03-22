import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MessageState } from '../../types/store';
import { Message, Conversation } from '../../types/api';

interface MessageState {
  messages: Message[];
  conversations: Conversation[];
  activeConversation: string | null;
  typingUsers: { [conversationId: string]: string[] };
  unreadCount: { [conversationId: string]: number };
}

const initialState: MessageState = {
  messages: [],
  conversations: [],
  activeConversation: null,
  typingUsers: {},
  unreadCount: {},
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    // Mensajes
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      // Incrementar contador de no leídos si no es la conversación activa
      if (action.payload.conversationId !== state.activeConversation) {
        state.unreadCount[action.payload.conversationId] = 
          (state.unreadCount[action.payload.conversationId] || 0) + 1;
      }
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      const index = state.messages.findIndex(msg => msg.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },

    // Conversaciones
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const index = state.conversations.findIndex(conv => conv.id === action.payload.id);
      if (index !== -1) {
        state.conversations[index] = action.payload;
      } else {
        state.conversations.push(action.payload);
      }
    },
    setActiveConversation: (state, action: PayloadAction<string>) => {
      state.activeConversation = action.payload;
      // Resetear contador de no leídos para esta conversación
      state.unreadCount[action.payload] = 0;
    },

    // Indicadores de escritura
    setTypingStatus: (state, action: PayloadAction<{
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }>) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      
      if (isTyping && !state.typingUsers[conversationId].includes(userId)) {
        state.typingUsers[conversationId].push(userId);
      } else if (!isTyping) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId]
          .filter(id => id !== userId);
      }
    },

    // Marcado como leído
    markConversationAsRead: (state, action: PayloadAction<string>) => {
      state.unreadCount[action.payload] = 0;
    },
    
    // Limpiar estado
    clearMessages: (state) => {
      state.messages = [];
      state.conversations = [];
      state.activeConversation = null;
      state.typingUsers = {};
      state.unreadCount = {};
    },
  },
});

export const {
  setMessages,
  addMessage,
  updateMessage,
  setConversations,
  updateConversation,
  setActiveConversation,
  setTypingStatus,
  markConversationAsRead,
  clearMessages,
} = messageSlice.actions;
export default messageSlice.reducer;
