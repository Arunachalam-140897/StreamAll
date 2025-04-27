import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { NotificationState } from '../../types/notifications';
import { notificationService } from '../../services/notificationService';

const initialState: NotificationState = {
  items: [],
  isLoading: false,
  error: null,
  unreadCount: 0,
  currentPage: 1,
  totalPages: 1
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (params: { page: number; limit: number }) => {
    const response = await notificationService.getNotifications(params);
    return response.data;
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string) => {
    const response = await notificationService.markAsRead(id);
    return { id, ...response.data };
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    const response = await notificationService.markAllAsRead();
    return response.data;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.rows;
        state.unreadCount = action.payload.unreadCount;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.items.find(item => item.id === action.payload.id);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(item => {
          item.read = true;
        });
        state.unreadCount = 0;
      });
  }
});

export const { clearError, incrementUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;