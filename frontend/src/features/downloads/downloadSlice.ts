import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DownloadState } from '../../types/downloads';
import type { StartDownloadParams } from '../../types/downloads';
import { downloadService } from '../../services/downloadService';

const initialState: DownloadState = {
  items: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1
};

export const startDownload = createAsyncThunk(
  'downloads/start',
  async (params: StartDownloadParams) => {
    const response = await downloadService.startDownload(params);
    return response.data;
  }
);

export const fetchDownloads = createAsyncThunk(
  'downloads/fetchAll',
  async (params: { page: number; limit: number }) => {
    const response = await downloadService.getAllDownloads(params);
    return response.data;
  }
);

export const cancelDownload = createAsyncThunk(
  'downloads/cancel',
  async (id: string) => {
    await downloadService.cancelDownload(id);
    return id;
  }
);

export const checkDownloadStatus = createAsyncThunk(
  'downloads/checkStatus',
  async (id: string) => {
    const response = await downloadService.getStatus(id);
    return response.data;
  }
);

const downloadSlice = createSlice({
  name: 'downloads',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateProgress: (state, action) => {
      const download = state.items.find(item => item.id === action.payload.id);
      if (download) {
        download.progress = action.payload.progress;
        download.status = action.payload.status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDownloads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDownloads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.rows;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchDownloads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch downloads';
      })
      .addCase(startDownload.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(cancelDownload.fulfilled, (state, action) => {
        const download = state.items.find(item => item.id === action.payload);
        if (download) {
          download.status = 'cancelled';
        }
      })
      .addCase(checkDownloadStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export const { clearError, updateProgress } = downloadSlice.actions;
export default downloadSlice.reducer;