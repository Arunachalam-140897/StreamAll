export interface Media {
  id: string;
  title: string;
  category: 'movie' | 'series' | 'animation';
  genre: string[];
  type: 'video' | 'audio';
  format: string;
  filePath: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaState {
  items: Media[];
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