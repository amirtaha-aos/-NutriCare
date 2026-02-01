import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import chatService, { ChatSession, ChatMessage } from '../../services/chat.service';

interface ChatState {
  sessions: ChatSession[];
  activeSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

const initialState: ChatState = {
  sessions: [],
  activeSession: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
};

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (data: { sessionId?: string; message: string }, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMessage(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const createSession = createAsyncThunk(
  'chat/createSession',
  async (_, { rejectWithValue }) => {
    try {
      const session = await chatService.createSession();
      return session;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create session');
    }
  }
);

export const fetchSessions = createAsyncThunk(
  'chat/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const sessions = await chatService.getSessions();
      return sessions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sessions');
    }
  }
);

export const fetchSession = createAsyncThunk(
  'chat/fetchSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const session = await chatService.getSession(sessionId);
      return session;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch session');
    }
  }
);

export const deleteSession = createAsyncThunk(
  'chat/deleteSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      await chatService.deleteSession(sessionId);
      return sessionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete session');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveSession: (state, action: PayloadAction<ChatSession | null>) => {
      state.activeSession = action.payload;
      state.messages = action.payload?.messages || [];
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.activeSession = action.payload.session;
        state.messages = action.payload.session.messages;

        // Update session in sessions list
        const index = state.sessions.findIndex(s => s._id === action.payload.session._id);
        if (index !== -1) {
          state.sessions[index] = action.payload.session;
        } else {
          state.sessions.unshift(action.payload.session);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      })

      // Create session
      .addCase(createSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeSession = action.payload;
        state.messages = [];
        state.sessions.unshift(action.payload);
      })
      .addCase(createSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch sessions
      .addCase(fetchSessions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch session
      .addCase(fetchSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeSession = action.payload;
        state.messages = action.payload.messages;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete session
      .addCase(deleteSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = state.sessions.filter(s => s._id !== action.payload);
        if (state.activeSession?._id === action.payload) {
          state.activeSession = null;
          state.messages = [];
        }
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveSession, clearError, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
