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

// Backend API 回應型別定義

export interface BackendMeta {
  timestamp: string;
  version: string;
  total_count: number;
}

export interface BackendResponse<T> {
  data: T;
  meta: BackendMeta;
}

// Libraries API 回應
export interface OpenHoursItem {
  open: string; // HH:MM
  close: string; // HH:MM
}

export interface CurrentSeats {
  free: number;
  total: number;
}

export interface LibraryApiItem {
  branch_name: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  open_hours: Record<string, OpenHoursItem | null>;
  is_open: boolean;
  closing_in_minutes: number | null;
  distance_km: number | null;
  current_seats: CurrentSeats | null;
}

export type LibrariesResponse = BackendResponse<LibraryApiItem[]>;

// Realtime API 回應
export interface RealtimeSeatItem {
  branch_name: string;
  total_free_count: number;
  total_seat_count: number;
  usage_rate: number;
  last_updated: string; // ISO 8601
  batch_id: string; // UUID
}

export type RealtimeResponse = BackendResponse<RealtimeSeatItem[]>;

// Prediction API 回應
export interface PredictionItem {
  horizon_minutes: 30 | 60;
  predicted_seats: number;
  is_fallback: boolean;
}

export interface PredictionApiResponse {
  library_id: number;
  predictions: PredictionItem[];
}
