export interface ApiMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  meta?: ApiMeta;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export type PaginatedResponse<T> = ApiResponse<T>;
