import { ApiErrorShape, ApiResponse, GenerationResult, HistoryQueryParams, PaginatedHistoryResponse } from '../types';

const BASE_URL = '/api/history';

export class ApiError extends Error {
  public readonly code?: string;
  public readonly details?: ApiErrorShape['details'];
  public readonly status?: number;

  constructor(message: string, options: { code?: string; details?: ApiErrorShape['details']; status?: number } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = options.code;
    this.details = options.details;
    this.status = options.status;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch (error) {
    if (!response.ok) {
      throw new ApiError(response.statusText || 'Unable to reach the server', {
        status: response.status,
      });
    }
    throw error;
  }

  if (!response.ok || !payload.success) {
    const errorShape = payload?.error;
    const message = errorShape?.message || response.statusText || 'Unexpected server error';
    throw new ApiError(message, {
      code: errorShape?.code,
      details: errorShape?.details,
      status: response.status,
    });
  }

  if (payload.data === undefined) {
    throw new ApiError('Malformed API response: missing data field', { status: response.status });
  }

  return payload.data;
}

function buildQuery(params: HistoryQueryParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set('page', params.page.toString());
  searchParams.set('pageSize', params.pageSize.toString());

  if (params.startDate) {
    searchParams.set('startDate', params.startDate);
  }

  if (params.endDate) {
    searchParams.set('endDate', params.endDate);
  }

  if (params.enhancement && params.enhancement !== 'all') {
    searchParams.set('enhancement', params.enhancement);
  }

  if (params.customApiOnly) {
    searchParams.set('customApiOnly', 'true');
  }

  return searchParams.toString();
}

export async function fetchHistory(params: HistoryQueryParams): Promise<PaginatedHistoryResponse> {
  const query = buildQuery(params);
  const response = await fetch(`${BASE_URL}?${query}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return parseResponse<PaginatedHistoryResponse>(response);
}

export async function toggleFavorite(historyId: string, isFavorite: boolean): Promise<GenerationResult> {
  const response = await fetch(`${BASE_URL}/${historyId}/favorite`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isFavorite }),
  });

  return parseResponse<GenerationResult>(response);
}

export async function deleteHistoryEntry(historyId: string): Promise<{ id: string }> {
  const response = await fetch(`${BASE_URL}/${historyId}`, {
    method: 'DELETE',
  });

  return parseResponse<{ id: string }>(response);
}
