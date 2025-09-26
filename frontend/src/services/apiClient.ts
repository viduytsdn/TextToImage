import { createApiRequest, resolveBackendUrl, resolveCustomApiUrl } from '@/config/env.ts'

export const backendClient = {
  get: <TResponse>(path: string, init?: RequestInit) =>
    createApiRequest<TResponse>(path, { ...init, method: init?.method ?? 'GET' }, resolveBackendUrl),
  post: <TPayload, TResponse>(path: string, payload: TPayload, init?: RequestInit) =>
    createApiRequest<TResponse>(
      path,
      {
        ...init,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers ?? {}),
        },
        body: JSON.stringify(payload),
      },
      resolveBackendUrl,
    ),
}

export const customIntegrationClient = {
  get: <TResponse>(path: string, init?: RequestInit) =>
    createApiRequest<TResponse>(path, { ...init, method: init?.method ?? 'GET' }, resolveCustomApiUrl),
}
