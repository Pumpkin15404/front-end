import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  sessionMessage: string | null;
  setSession: (user: AuthUser, accessToken: string) => void;
  clearSession: () => void;
  setHydrated: (hydrated: boolean) => void;
  setSessionMessage: (message: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrated: false,
  sessionMessage: null,

  setSession: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      sessionMessage: null,
    }),

  clearSession: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }),

  setHydrated: (isHydrated) => set({ isHydrated }),

  setSessionMessage: (sessionMessage) => set({ sessionMessage }),
}));

export function resetAuthStore() {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isHydrated: true,
    sessionMessage: null,
  });
}
