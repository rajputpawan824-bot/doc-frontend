/**
 * API Types and Interfaces
 * Defines all types used across the API layer
 */

/**
 * Generic API Response Type
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type RequestBody = BodyInit | JsonValue | Record<string, unknown> | unknown[];

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | ApiError;
  statusCode: number;
  timestamp: string;
  rawResponse?: Response | null; // Add optional rawResponse property
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  path?: string;
}

/**
 * Pagination Meta Data
 */
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

/**
 * Request Options
 */
export interface RequestOptions extends Omit<RequestInit, "body" | "method"> {
  timeout?: number;
  retries?: number;
  params?: Record<string, unknown>;
  onRetry?: (attempt: number, error: Error) => void;
  responseType?: "json" | "text" | "blob" | "arraybuffer";
  headers?: Record<string, string>;
  body?: RequestBody;
  method?: string;
}

/**
 * Fetch Request Options
 */
export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: RequestBody;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * API Request Config
 */
export interface ApiRequestConfig {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

/**
 * Auth Token Data
 */
export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}



/**
 * Request Options
 */
export interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  timeout?: number;
  retries?: number;
  params?: Record<string, unknown>;
  onRetry?: (attempt: number, error: Error) => void;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  headers?: Record<string, string>;
  body?: RequestBody;
  method?: string;
}

/**
 * Fetch Request Options
 */
export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: RequestBody;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * API Request Config
 */
export interface ApiRequestConfig {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

/**
 * Auth Token Data
 */
export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

/**
 * Request Interceptor Type
 */
/**
 * Request Interceptor Type
 */
export type RequestInterceptor = (
  config: ApiRequestConfig,
) => Promise<ApiRequestConfig> | ApiRequestConfig;

/**
 * Response Interceptor Type
 */
export type ResponseInterceptor = (
  response: Response,
  data: unknown,
) => Promise<unknown> | unknown;

/**
 * Error Interceptor Type
 */
export type ErrorInterceptor = (error: unknown) => Promise<void> | void;
