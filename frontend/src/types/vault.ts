export interface VaultItem {
  id: string;
  ownerId: string;
  mediaPath: string;
  type: 'video' | 'audio' | 'photo';
  isEncrypted: boolean;
  metadata: {
    originalName: string;
    mimeType: string;
    size: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VaultState {
  items: VaultItem[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
}