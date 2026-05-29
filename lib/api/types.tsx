// ---------------------------------------------------------------------------
// Core response shape — both clients return this, never throw
// ---------------------------------------------------------------------------

export type ApiSuccess<T> = {
  success: true;
  data: T;
  statusCode: number;
  timestamp: string;
};

export type ApiFailure = {
  success: false;
  error: string; // human-readable message always present
  code?: string; // machine-readable e.g. "UNAUTHORIZED", "HTTP_404"
  statusCode: number;
  timestamp: string;
};

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiFailure;

// ---------------------------------------------------------------------------
// Request options
// ---------------------------------------------------------------------------

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  timeout?: number;
  retries?: number;
  /** Only relevant for the client-side client */
  responseType?: "json" | "text" | "blob" | "arraybuffer";
  /** Passed through to fetch */
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

// Next.js specific fetch option
interface NextFetchRequestConfig {
  revalidate?: number | false;
  tags?: string[];
}

// ---------------------------------------------------------------------------
// Token management
// ---------------------------------------------------------------------------

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number; // seconds
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
