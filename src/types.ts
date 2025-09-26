export type EnhancementType = 'nano-banana' | 'prompt-boost' | 'style-transfer' | 'none';

export interface GenerationMetadata {
  width?: number;
  height?: number;
  inferenceTimeMs?: number;
  model?: string;
}

export interface GenerationResult {
  id: string;
  prompt: string;
  imageUrl: string;
  shareUrl?: string | null;
  createdAt: string;
  enhancement?: EnhancementType | null;
  customApiUsed?: boolean;
  isFavorite?: boolean;
  metadata?: GenerationMetadata;
}

export interface ApiErrorShape {
  code?: string;
  message: string;
  details?: Record<string, unknown> | string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorShape;
}

export interface HistoryQueryParams {
  page: number;
  pageSize: number;
  startDate?: string | null;
  endDate?: string | null;
  enhancement?: EnhancementType | 'all';
  customApiOnly?: boolean;
}

export interface PaginatedHistoryResponse {
  items: GenerationResult[];
  page: number;
  pageSize: number;
  total: number;
}
