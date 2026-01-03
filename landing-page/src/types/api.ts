// Common API response types
export interface ApiError {
  errors?: Record<string, string[]>;
  message: string;
  status?: number;
}

export interface ErrorResponse {
  message: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SuccessResponse {
  message: string;
  success: boolean;
}
