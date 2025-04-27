import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import mediaReducer from '../features/media/mediaSlice';
import preferencesReducer from '../features/preferences/preferencesSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import vaultReducer from '../features/vault/vaultSlice';
import downloadReducer from '../features/downloads/downloadSlice';
import rssReducer from '../features/rss/rssSlice';
import requestReducer from '../features/requests/requestSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    media: mediaReducer,
    preferences: preferencesReducer,
    notifications: notificationsReducer,
    vault: vaultReducer,
    downloads: downloadReducer,
    rss: rssReducer,
    requests: requestReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;