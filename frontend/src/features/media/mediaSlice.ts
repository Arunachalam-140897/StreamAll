import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MediaState, MediaQueryParams, Media } from '../../types/media';
import api from '../../services/api';

const initialState: MediaState = {
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1
};

export const fetchMedia = createAsyncThunk(
  'media/fetchMedia',
  async (params: MediaQueryParams = {}) => {
    const response = await api.get('/media', { params });
    return response.data;
  }
);

export const fetchMediaById = createAsyncThunk(
  'media/fetchMediaById',
  async (id: string) => {
    const response = await api.get(`/media/${id}`);
    return response.data;
  }
);

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch media list handlers
      .addCase(fetchMedia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data.rows;
        state.currentPage = action.payload.currentPage || 1;
        state.totalPages = Math.ceil(action.payload.data.count / 12) || 1;
      })
      .addCase(fetchMedia.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch media';
      })
      // Fetch single media handlers
      .addCase(fetchMediaById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMediaById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload.data;
      })
      .addCase(fetchMediaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch media details';
      });
  },
});

export default mediaSlice.reducer;