export interface Download {
  id: string;
  mediaId: string;
  userId: string;
  sourceType: 'magnet' | 'direct' | 'torrent';
  sourceUrl: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  aria2_gid?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DownloadState {
  items: Download[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
}

export interface StartDownloadParams {
  mediaId: string;
  sourceType: Download['sourceType'];
  sourceUrl: string;
}