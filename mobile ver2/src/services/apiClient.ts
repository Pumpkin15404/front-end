import { env } from '@/config/env';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  _retry?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type TokenProvider = () => string | null;
type RefreshHandler = () => Promise<string>;
type UnauthorizedHandler = (message: string) => Promise<void>;

let getAccessToken: TokenProvider = () => null;
let refreshAccessToken: RefreshHandler | null = null;
let onUnauthorized: UnauthorizedHandler | null = null;

export function configureApiClient(options: {
  getAccessToken: TokenProvider;
  refreshAccessToken?: RefreshHandler;
  onUnauthorized?: UnauthorizedHandler;
}) {
  getAccessToken = options.getAccessToken;
  refreshAccessToken = options.refreshAccessToken ?? null;
  onUnauthorized = options.onUnauthorized ?? null;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {}, skipAuth = false, _retry = false } =
    options;
  const url = `${env.apiBaseUrl}${path}`;

  const authHeaders: Record<string, string> = {};
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      authHeaders.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Network request failed', 0);
  }

  if (response.status === 401 && !skipAuth && !_retry && refreshAccessToken) {
    try {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return apiClient<T>(path, { ...options, _retry: true });
      }
    } catch {
      if (onUnauthorized) {
        await onUnauthorized('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      }
      throw new ApiError('Unauthorized', 401);
    }
  }

  if (response.status === 401 && !skipAuth && onUnauthorized) {
    await onUnauthorized('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    throw new ApiError('Unauthorized', 401);
  }

  if (!response.ok) {
    const data = await parseResponseBody(response);
    throw new ApiError(
      extractErrorMessage(data, response.statusText),
      response.status,
      data,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
