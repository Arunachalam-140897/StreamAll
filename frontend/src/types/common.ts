export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  data: T;
  message?: string;
}