/**
 * Unified API response models matching the backend contracts
 */

/** Success response wrapping data: { data: T, message?: string } */
export interface ApiResponse<T> {
  data: T;
  message?: string | null;
}

/** Success message only response: { message: string } */
export interface ApiMessage {
  message: string;
}

/** Error response from ExceptionHandlingMiddleware */
export interface ApiError {
  code: string;
  message: string;
  traceId?: string;
  details?: unknown;
  errors?: Record<string, string[]>; // validation errors
}

/** Pagination wrapper matching QueryResult<T> */
export interface QueryResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

/** Paginated API response: { data: { items, totalCount, ... } } */
export type PaginatedResponse<T> = ApiResponse<QueryResult<T>>;
