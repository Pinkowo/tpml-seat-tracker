import type { AxiosError, AxiosInstance } from 'axios';

let apiClient: AxiosInstance | null = null;

const createApiClient = async (): Promise<AxiosInstance> => {
  const axiosModule: typeof import('axios') = await import('axios');

  const instance = axiosModule.default.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  instance.interceptors.request.use((config) => {
    console.info(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      console.info(`[API] Response ${response.status} ${response.config.url}`);
      return response;
    },
    (error: AxiosError | Error) => {
      console.error('[API] Error response', error);
      const normalizedError =
        error instanceof Error ? error : new Error('API request failed with an unknown error');
      return Promise.reject(normalizedError);
    }
  );

  return instance;
};

export const getApiClient = async () => {
  if (!apiClient) {
    apiClient = await createApiClient();
  }

  return apiClient;
};

export default getApiClient;
