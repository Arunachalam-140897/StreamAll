import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { VaultState } from '../../types/vault';
import { vaultService } from '../../services/vaultService';

const initialState: VaultState = {
  items: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1
};

export const fetchVaultItems = createAsyncThunk(
  'vault/fetchItems',
  async (params: { page?: number; limit?: number; type?: string }) => {
    const response = await vaultService.getItems(params);
    return response.data;
  }
);

export const addVaultItem = createAsyncThunk(
  'vault/addItem',
  async (formData: FormData) => {
    const response = await vaultService.addItem(formData);
    return response.data;
  }
);

export const deleteVaultItem = createAsyncThunk(
  'vault/deleteItem',
  async (id: string) => {
    await vaultService.deleteItem(id);
    return id;
  }
);

const vaultSlice = createSlice({
  name: 'vault',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVaultItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVaultItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.rows;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchVaultItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch vault items';
      })
      .addCase(addVaultItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteVaultItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  }
});

export const { clearError } = vaultSlice.actions;
export default vaultSlice.reducer;