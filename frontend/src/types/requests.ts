export interface MediaRequest {
  id: string;
  userId: string;
  request: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestState {
  items: MediaRequest[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
}