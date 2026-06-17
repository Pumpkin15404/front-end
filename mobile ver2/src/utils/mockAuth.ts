import type { AuthUser } from '@/state_management/authStore';

function encodeBase64Url(value: string): string {
  if (typeof globalThis.btoa === 'function') {
    return globalThis
      .btoa(value)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  throw new Error('Base64 encoder is not available');
}

function createMockJwt(payload: Record<string, unknown>): string {
  const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = encodeBase64Url(JSON.stringify(payload));
  return `${header}.${body}.mock-signature`;
}

export const MOCK_CREDENTIALS = {
  email: 'demo@moneyhabits.app',
  password: 'demo123',
} as const;

export function createMockLoginResponse(email: string): {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
} {
  const now = Math.floor(Date.now() / 1000);
  const user: AuthUser = {
    id: 'demo-user-1',
    email,
    name: 'Demo User',
  };

  return {
    accessToken: createMockJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
      exp: now + 60 * 15,
    }),
    refreshToken: createMockJwt({
      sub: user.id,
      type: 'refresh',
      exp: now + 60 * 60 * 24 * 7,
    }),
    user,
  };
}

export function createMockRefreshResponse(): {
  accessToken: string;
  refreshToken: string;
} {
  const now = Math.floor(Date.now() / 1000);

  return {
    accessToken: createMockJwt({
      sub: 'demo-user-1',
      email: MOCK_CREDENTIALS.email,
      name: 'Demo User',
      exp: now + 60 * 15,
    }),
    refreshToken: createMockJwt({
      sub: 'demo-user-1',
      type: 'refresh',
      exp: now + 60 * 60 * 24 * 7,
    }),
  };
}

export function isMockCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === MOCK_CREDENTIALS.email &&
    password === MOCK_CREDENTIALS.password
  );
}

export function isMockRefreshToken(token: string): boolean {
  return token.endsWith('.mock-signature');
}
