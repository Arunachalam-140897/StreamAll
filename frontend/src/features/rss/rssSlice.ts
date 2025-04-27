import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RSSState } from '../../types/rss';
import { rssService } from '../../services/rssService';

const initialState: RSSState = {
  feeds: [],
  currentFeedItems: [],
  isLoading: false,
  error: null
};

export const fetchFeeds = createAsyncThunk(
  'rss/fetchFeeds',
  async () => {
    const response = await rssService.getAllFeeds();
    return response.data;
  }
);

export const addFeed = createAsyncThunk(
  'rss/addFeed',
  async ({ url, label }: { url: string; label: string }) => {
    const response = await rssService.addFeed(url, label);
    return response.data;
  }
);

export const deleteFeed = createAsyncThunk(
  'rss/deleteFeed',
  async (id: string) => {
    await rssService.deleteFeed(id);
    return id;
  }
);

export const fetchFeedItems = createAsyncThunk(
  'rss/fetchFeedItems',
  async (id: string) => {
    const response = await rssService.getFeedItems(id);
    return response.data;
  }
);

const rssSlice = createSlice({
  name: 'rss',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentFeedItems: (state) => {
      state.currentFeedItems = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feeds = action.payload;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch RSS feeds';
      })
      .addCase(addFeed.fulfilled, (state, action) => {
        state.feeds.push(action.payload);
      })
      .addCase(deleteFeed.fulfilled, (state, action) => {
        state.feeds = state.feeds.filter(feed => feed.id !== action.payload);
      })
      .addCase(fetchFeedItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeedItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFeedItems = action.payload;
      })
      .addCase(fetchFeedItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch feed items';
      });
  }
});

export const { clearError, clearCurrentFeedItems } = rssSlice.actions;
export default rssSlice.reducer;