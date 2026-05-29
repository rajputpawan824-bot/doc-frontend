import { API_CONFIG, LOG_LEVEL, getApiBaseUrl } from "./config";
import type { ApiFailure } from "./types";

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

const LEVELS = ["debug", "info", "warn", "error"] as const;

export const logger = {
  debug: (...args: unknown[]) => {
    if (LEVELS.indexOf(LOG_LEVEL) <= 0) console.debug("[API]", ...args);
  },
  info: (...args: unknown[]) => {
    if (LEVELS.indexOf(LOG_LEVEL) <= 1) console.info("[API]", ...args);
  },
  warn: (...args: unknown[]) => {
    if (LEVELS.indexOf(LOG_LEVEL) <= 2) console.warn("[API]", ...args);
  },
  error: (...args: unknown[]) => {
    console.error("[API]", ...args);
  },
};

// ---------------------------------------------------------------------------
// URL building
// ---------------------------------------------------------------------------

export const buildQueryString = (
  params: Record<string, string | number | boolean | undefined | null>,
): string => {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      sp.append(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
};

export const buildUrl = (
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string => {
  // Strip leading slash from path if base already has trailing slash
  const base = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;
  return params && Object.keys(params).length
    ? url + buildQueryString(params)
    : url;
};

// ---------------------------------------------------------------------------
// Response parsing
// ---------------------------------------------------------------------------

/**
 * Safely parse a failed response into a human-readable error.
 * Accepts pre-parsed body text to avoid "body already used" errors.
 */
export const parseErrorBody = (
  rawText: string,
  status: number,
  statusText: string,
): Pick<ApiFailure, "error" | "code"> => {
  try {
    const json = JSON.parse(rawText);
    return {
      error: json.message ?? json.error ?? statusText ?? "Request failed",
      code: json.code ?? `HTTP_${status}`,
    };
  } catch {
    return {
      error: statusText || `Request failed with status ${status}`,
      code: `HTTP_${status}`,
    };
  }
};

// ---------------------------------------------------------------------------
// Retry helpers
// ---------------------------------------------------------------------------

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isRetryableStatus = (status: number): boolean =>
  (API_CONFIG.RETRY_STATUS_CODES as readonly number[]).includes(status);

/** Exponential backoff with jitter, capped at 30 s */
export const getBackoffDelay = (attempt: number): number => {
  const base = API_CONFIG.RETRY_DELAY * 2 ** attempt;
  const jitter = Math.random() * 500;
  return Math.min(base + jitter, 30_000);
};

// ---------------------------------------------------------------------------
// Abort / timeout
// ---------------------------------------------------------------------------

export const createTimeoutSignal = (
  ms: number,
): { signal: AbortSignal; cleanup: () => void } => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cleanup: () => clearTimeout(id) };
};
