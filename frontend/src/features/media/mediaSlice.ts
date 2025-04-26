import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MediaState, MediaQueryParams } from '../../types/media';
import api from '../../services/api';

const initialState: MediaState = {
  items: [],
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

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.currentPage = action.payload.currentPage || 1;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchMedia.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch media';
      });
  },
});

export default mediaSlice.reducer;