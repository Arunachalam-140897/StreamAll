export interface UserPreferences {
  streamingQuality: 'auto' | '1080p' | '720p' | '480p' | '360p';
  notifications: {
    enabled: boolean;
    pushEnabled: boolean;
    mediaUpdates: boolean;
    downloadComplete: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    listView: 'grid' | 'list';
    autoplay: boolean;
  };
  offlineMode: boolean;
  maxDownloadSize: number;
}

export interface PreferencesState {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
}