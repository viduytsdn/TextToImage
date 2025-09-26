const sanitize = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const rawBackendBaseUrl = sanitize(import.meta.env.VITE_BACKEND_BASE_URL)
const rawGeminiApiKey = sanitize(import.meta.env.VITE_GEMINI_API_KEY)
const rawCustomApiBaseUrl = sanitize(import.meta.env.VITE_CUSTOM_API_BASE_URL)

export const envConfig = {
  backendBaseUrl: rawBackendBaseUrl,
  geminiApiKey: rawGeminiApiKey,
  customApiBaseUrl: rawCustomApiBaseUrl,
} as const

export const envFlags = {
  isBackendConfigured: Boolean(rawBackendBaseUrl),
  isGeminiConfigured: Boolean(rawGeminiApiKey),
  isCustomApiConfigured: Boolean(rawCustomApiBaseUrl),
} as const

type Fetcher = typeof fetch

const assertBaseUrl = (baseUrl: string, label: string) => {
  if (!baseUrl) {
    throw new Error(`Missing ${label} base URL. Check your environment variables.`)
  }
  return baseUrl.replace(/\/$/, '')
}

export const resolveBackendUrl = (path: string) => {
  const base = assertBaseUrl(envConfig.backendBaseUrl, 'backend')
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${base}/${normalizedPath}`
}

export const resolveCustomApiUrl = (path: string) => {
  const base = assertBaseUrl(envConfig.customApiBaseUrl, 'custom API')
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return `${base}/${normalizedPath}`
}

export interface ApiClientOptions extends RequestInit {
  fetchImplementation?: Fetcher
}

const defaultFetcher: Fetcher = (...args) => fetch(...args)

export async function createApiRequest<TResponse = unknown>(
  input: string,
  init: ApiClientOptions = {},
  resolver: (path: string) => string = resolveBackendUrl,
): Promise<TResponse> {
  const { fetchImplementation = defaultFetcher, ...requestInit } = init
  const url = resolver(input)
  const response = await fetchImplementation(url, requestInit)

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error')
    throw new Error(`Request to ${url} failed with status ${response.status}: ${errorBody}`)
  }

  return response.json() as Promise<TResponse>
}

export interface GeminiRequestOptions {
  apiKey?: string
  fetchImplementation?: Fetcher
}

export async function createGeminiRequest<TPayload extends Record<string, unknown>, TResponse = unknown>(
  payload: TPayload,
  options: GeminiRequestOptions = {},
) {
  const apiKey = options.apiKey ?? envConfig.geminiApiKey
  if (!apiKey) {
    throw new Error('Missing Google Gemini API key. Set VITE_GEMINI_API_KEY to enable Gemini requests.')
  }

  const fetchImpl = options.fetchImplementation ?? defaultFetcher

  const response = await fetchImpl('https://generativelanguage.googleapis.com/v1beta/models', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error')
    throw new Error(`Gemini request failed with status ${response.status}: ${errorBody}`)
  }

  return (await response.json()) as TResponse
}
