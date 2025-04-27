import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RequestState } from '../../types/requests';
import { requestService } from '../../services/requestService';

const initialState: RequestState = {
  items: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1
};

export const createRequest = createAsyncThunk(
  'requests/create',
  async (request: string) => {
    const response = await requestService.createRequest(request);
    return response.data;
  }
);

export const fetchRequests = createAsyncThunk(
  'requests/fetchAll',
  async (params: { page: number; limit: number }) => {
    const response = await requestService.getAllRequests(params);
    return response.data;
  }
);

export const fetchUserRequests = createAsyncThunk(
  'requests/fetchUserRequests',
  async (params: { page: number; limit: number }) => {
    const response = await requestService.getUserRequests(params);
    return response.data;
  }
);

export const updateRequestStatus = createAsyncThunk(
  'requests/updateStatus',
  async ({ id, status, adminResponse }: { id: string; status: string; adminResponse?: string }) => {
    const response = await requestService.updateRequestStatus(id, status, adminResponse);
    return response.data;
  }
);

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.rows;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch requests';
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(fetchUserRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.rows;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export const { clearError } = requestSlice.actions;
export default requestSlice.reducer;