/**
 * API Configuration
 * All env variables are validated at startup — missing required ones will
 * throw at build/start time rather than silently failing at runtime.
 */

const IS_SERVER = typeof window === "undefined";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
export const IS_CLIENT = !IS_SERVER;
export { IS_SERVER };

/**
 * Returns the correct base URL depending on execution context.
 * Server-side uses the private env var (never sent to browser).
 * Client-side uses the NEXT_PUBLIC_ prefixed var.
 */
export const getApiBaseUrl = (): string => {
  if (IS_SERVER) {
    const url = process.env.API_BASE_URL;
    
    if (!url && IS_PRODUCTION) {
      throw new Error("Missing required env var: API_BASE_URL");
    }
    return url ?? "https://clinic-managemnet-backend.onrender.com/api";
  }

  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url && IS_PRODUCTION) {
    throw new Error("Missing required env var: NEXT_PUBLIC_API_BASE_URL");
  }
  return url ?? "https://clinic-managemnet-backend.onrender.com/api";
};

export const API_CONFIG = {
  // Auth
  AUTH_REFRESH_ENDPOINT: "/auth/refresh",
  AUTH_TOKEN_KEY: "access_token",
  AUTH_REFRESH_TOKEN_KEY: "refresh_token",

  // Timeouts & retries
  TIMEOUT: parseInt(
    process.env.NEXT_PUBLIC_API_TIMEOUT ?? process.env.API_TIMEOUT ?? "15000",
    10
  ),
  MAX_RETRIES: 2,
  RETRY_DELAY: 500, // ms — base for exponential backoff

  // Status codes that warrant an automatic retry
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504] as readonly number[],
} as const;

export type LogLevel = "debug" | "info" | "warn" | "error";

export const LOG_LEVEL: LogLevel = (
  process.env.NEXT_PUBLIC_LOG_LEVEL ??
  process.env.LOG_LEVEL ??
  "info"
).toLowerCase() as LogLevel;

export default API_CONFIG;