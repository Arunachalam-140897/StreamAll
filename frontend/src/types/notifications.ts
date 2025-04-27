export interface Notification {
  id: string;
  userId: string;
  type: 'media_update' | 'download_complete' | 'system' | 'request_update';
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface NotificationState {
  items: Notification[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  currentPage: number;
  totalPages: number;
}