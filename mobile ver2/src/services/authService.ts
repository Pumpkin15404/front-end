import { ApiError, apiClient, configureApiClient } from '@/services/apiClient';
import { secureStorage } from '@/services/secureStorage';
import { navigateToLogin } from '@/navigation/navigationRef';
import { resetAuthStore, useAuthStore, type AuthUser } from '@/state_management/authStore';
import { env } from '@/config/env';
import { decodeJwtPayload, isTokenExpired } from '@/utils/jwt';
import { isOnline, OFFLINE_MESSAGE } from '@/utils/network';
import {
  createMockLoginResponse,
  createMockRefreshResponse,
  isMockCredentials,
  isMockRefreshToken,
} from '@/utils/mockAuth';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface SessionRestoreResult {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
}

const SESSION_EXPIRED_MESSAGE =
  'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';

let refreshPromise: Promise<string> | null = null;

function userFromToken(accessToken: string, fallbackEmail?: string): AuthUser | null {
  const payload = decodeJwtPayload(accessToken);
  if (!payload?.sub) {
    return null;
  }

  return {
    id: String(payload.sub),
    email: String(payload.email ?? fallbackEmail ?? ''),
    name: payload.name ? String(payload.name) : undefined,
  };
}

async function persistSession(
  user: AuthUser,
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await secureStorage.saveTokens(accessToken, refreshToken);
  useAuthStore.getState().setSession(user, accessToken);
}

async function clearPersistedSession(): Promise<void> {
  await secureStorage.clearTokens();
  resetAuthStore();
}

export const authService = {
  configureApiClientHandlers() {
    configureApiClient({
      getAccessToken: () => useAuthStore.getState().accessToken,
      refreshAccessToken: () => authService.refreshAccessToken(),
      onUnauthorized: (message) => authService.handleSessionExpired(message),
    });
  },

  async restoreSession(): Promise<SessionRestoreResult> {
    const accessToken = await secureStorage.getAccessToken();
    const refreshToken = await secureStorage.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return { isAuthenticated: false, user: null, accessToken: null };
    }

    if (!isTokenExpired(accessToken)) {
      const user = userFromToken(accessToken);
      if (user) {
        useAuthStore.getState().setSession(user, accessToken);
        return { isAuthenticated: true, user, accessToken };
      }
    }

    try {
      useAuthStore.getState().setSession(
        userFromToken(accessToken) ?? { id: 'unknown', email: '' },
        accessToken,
      );

      const newAccessToken = await authService.refreshAccessToken();
      const user = userFromToken(newAccessToken);

      if (!user) {
        await clearPersistedSession();
        return { isAuthenticated: false, user: null, accessToken: null };
      }

      useAuthStore.getState().setSession(user, newAccessToken);
      return { isAuthenticated: true, user, accessToken: newAccessToken };
    } catch {
      await clearPersistedSession();
      return { isAuthenticated: false, user: null, accessToken: null };
    }
  },

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    if (!(await isOnline())) {
      throw new ApiError(OFFLINE_MESSAGE, 0);
    }

    if (env.enableMockAuth && isMockCredentials(credentials.email, credentials.password)) {
      const mockResponse = createMockLoginResponse(credentials.email.trim());
      await persistSession(
        mockResponse.user,
        mockResponse.accessToken,
        mockResponse.refreshToken,
      );
      return mockResponse;
    }

    try {
      const response = await apiClient<LoginResponse>('/auth/login', {
        method: 'POST',
        body: credentials,
        skipAuth: true,
      });

      await persistSession(
        response.user,
        response.accessToken,
        response.refreshToken,
      );

      return response;
    } catch (error) {
      if (env.enableMockAuth && error instanceof ApiError && error.status === 0) {
        const mockResponse = createMockLoginResponse(credentials.email.trim());
        await persistSession(
          mockResponse.user,
          mockResponse.accessToken,
          mockResponse.refreshToken,
        );
        return mockResponse;
      }

      throw error;
    }
  },

  async refreshAccessToken(): Promise<string> {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      const refreshToken = await secureStorage.getRefreshToken();
      if (!refreshToken) {
        throw new ApiError('Missing refresh token', 401);
      }

      if (env.enableMockAuth && isMockRefreshToken(refreshToken)) {
        const mockResponse = createMockRefreshResponse();
        await secureStorage.saveTokens(
          mockResponse.accessToken,
          mockResponse.refreshToken,
        );

        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setSession(currentUser, mockResponse.accessToken);
        }

        return mockResponse.accessToken;
      }

      const response = await apiClient<RefreshResponse>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
        skipAuth: true,
      });

      const nextRefreshToken = response.refreshToken ?? refreshToken;
      await secureStorage.saveTokens(response.accessToken, nextRefreshToken);

      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.getState().setSession(currentUser, response.accessToken);
      }

      return response.accessToken;
    })();

    try {
      return await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  },

  async logout(): Promise<void> {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken && (await isOnline())) {
      try {
        await apiClient('/auth/logout', { method: 'POST' });
      } catch {
        // Always clear local session even if server logout fails.
      }
    }

    await clearPersistedSession();
    navigateToLogin();
  },

  async handleSessionExpired(
    message: string = SESSION_EXPIRED_MESSAGE,
  ): Promise<void> {
    await clearPersistedSession();
    useAuthStore.getState().setSessionMessage(message);
    navigateToLogin(message);
  },
};
