import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PreferencesState } from '../../types/preferences';
import { userPreferencesService } from '../../services/userPreferencesService';

const initialState: PreferencesState = {
  preferences: null,
  isLoading: false,
  error: null,
};

export const fetchPreferences = createAsyncThunk(
  'preferences/fetch',
  async () => {
    const response = await userPreferencesService.getPreferences();
    return response.data;
  }
);

export const updatePreferences = createAsyncThunk(
  'preferences/update',
  async (preferences: Partial<PreferencesState['preferences']>) => {
    const response = await userPreferencesService.updatePreferences(preferences);
    return response.data;
  }
);

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload;
      })
      .addCase(fetchPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch preferences';
      })
      .addCase(updatePreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload;
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update preferences';
      });
  },
});

export const { clearError } = preferencesSlice.actions;
export default preferencesSlice.reducer;