import { apiClient } from './apiClient';

export interface HelloResponse {
  message: string;
}

/** Example API layer — swap with real endpoint when backend is ready. */
export const helloService = {
  async fetchMessage(): Promise<HelloResponse> {
    try {
      return await apiClient<HelloResponse>('/hello');
    } catch {
      return { message: 'Hello World' };
    }
  },
};
