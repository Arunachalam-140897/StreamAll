export interface Media {
  id: string;
  title: string;
  category: string;
  type: 'video' | 'audio';
  genre: string[];
  format: string;
  filePath: string;
  thumbnail?: string;
  streamPath?: string;
  metadata: {
    duration?: number;
    resolution?: string;
    bitrate?: string;
    codec?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MediaState {
  items: Media[];
  currentItem: Media | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
}

export interface MediaQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  type?: string;
  genre?: string;
  search?: string;
}