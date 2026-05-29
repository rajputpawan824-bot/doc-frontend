import { cookies } from "next/headers";
import { API_CONFIG, IS_PRODUCTION, getApiBaseUrl } from "./config";
import type { ApiResponse, RequestOptions, TokenData } from "./types";
import {
  logger,
  buildUrl,
  parseErrorBody,
  createTimeoutSignal,
  isRetryableStatus,
  getBackoffDelay,
  sleep,
} from "./utils";

/**
 * Server-side API client for Next.js Server Components, Server Actions,
 * and Route Handlers.
 *
 * - Tokens live in httpOnly cookies — never exposed to the browser.
 * - Never throws — always returns ApiResponse<T>.
 * - Transparently refreshes the access token on 401 (once per request).
 *
 * Usage in a Server Component or Server Action:
 *   const res = await serverApi.get<Patient[]>("/patients");
 *   if (res.success) { ... res.data ... }
 */
class ServerApiClient {
  // -------------------------------------------------------------------------
  // Token management (cookies)
  // -------------------------------------------------------------------------

  private async getAccessToken(): Promise<string | null> {
    try {
      const store = await cookies();
      return store.get(API_CONFIG.AUTH_TOKEN_KEY)?.value ?? null;
    } catch {
      return null;
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      const store = await cookies();
      return store.get(API_CONFIG.AUTH_REFRESH_TOKEN_KEY)?.value ?? null;
    } catch {
      return null;
    }
  }

  async setTokens(data: TokenData): Promise<void> {
    try {
      const store = await cookies();
      const accessMaxAge = (data.expiresIn ?? 3600); // seconds

      store.set(API_CONFIG.AUTH_TOKEN_KEY, data.accessToken, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: "strict",
        maxAge: accessMaxAge,
        path: "/",
      });

      if (data.refreshToken) {
        store.set(API_CONFIG.AUTH_REFRESH_TOKEN_KEY, data.refreshToken, {
          httpOnly: true,
          secure: IS_PRODUCTION,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
          path: "/",
        });
      }
    } catch (err) {
      logger.error("Failed to set tokens in cookies:", err);
    }
  }

  async clearTokens(): Promise<void> {
    try {
      const store = await cookies();
      store.delete(API_CONFIG.AUTH_TOKEN_KEY);
      store.delete(API_CONFIG.AUTH_REFRESH_TOKEN_KEY);
    } catch (err) {
      logger.error("Failed to clear tokens:", err);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return !!(await this.getAccessToken());
  }

  // -------------------------------------------------------------------------
  // Token refresh
  // -------------------------------------------------------------------------

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      await this.clearTokens();
      return false;
    }

    try {
      const response = await fetch(
        `${getApiBaseUrl()}${API_CONFIG.AUTH_REFRESH_ENDPOINT}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
          cache: "no-store",
        }
      );

      if (!response.ok) throw new Error(`Refresh failed: ${response.status}`);

      const data = await response.json();
      if (!data.access_token) throw new Error("No access_token in response");

      await this.setTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      });

      return true;
    } catch (err) {
      logger.error("Token refresh failed:", err);
      await this.clearTokens();
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // Core request method
  // -------------------------------------------------------------------------

  async request<T = unknown>(
    path: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = "GET",
      timeout = API_CONFIG.TIMEOUT,
      retries = API_CONFIG.MAX_RETRIES,
      body,
      headers: customHeaders,
      params,
      cache = "no-store",
      next,
    } = options;

    let refreshedOnce = false;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const { signal, cleanup } = createTimeoutSignal(timeout);

      try {
        const url = buildUrl(path, params);
        const accessToken = await this.getAccessToken();

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...customHeaders,
        };

        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const init: RequestInit = {
          method,
          headers,
          signal,
          cache,
          // @ts-expect-error — next is a Next.js fetch extension
          next,
        };

        if (body !== undefined) {
          init.body = typeof body === "string" ? body : JSON.stringify(body);
        }

        logger.debug(`→ ${method} ${url}`, { attempt: attempt + 1 });

        const response = await fetch(url, init);
        cleanup();

        // 401 — refresh once then retry
        if (response.status === 401 && !refreshedOnce) {
          refreshedOnce = true;
          const ok = await this.refreshAccessToken();
          if (ok) {
            attempt--;
            continue;
          }
          return this.failureResponse(401, "Unauthorized — session expired");
        }

        return this.parseResponse<T>(response);
      } catch (err: unknown) {
        cleanup();
        const message = err instanceof Error ? err.message : "Unknown error";
        logger.warn(`Request failed (attempt ${attempt + 1}/${retries + 1}): ${message}`);

        const isAbort = err instanceof Error && err.name === "AbortError";
        const statusCode = isAbort ? 408 : 500;
        const canRetry = attempt < retries && isRetryableStatus(statusCode);

        if (canRetry) {
          await sleep(getBackoffDelay(attempt));
          continue;
        }

        return this.failureResponse(statusCode, message);
      }
    }

    return this.failureResponse(500, "Request failed after retries");
  }

  // -------------------------------------------------------------------------
  // Response parsing — reads body once
  // -------------------------------------------------------------------------

  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const { status } = response;
    const timestamp = new Date().toISOString();

    // Read the raw text once so we can re-use it for both JSON parsing and
    // error extraction without hitting "body already used"
    const rawText = await response.text().catch(() => "");
    const ct = response.headers.get("content-type") ?? "";

    let data: unknown = rawText;
    if (ct.includes("application/json") && rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        // leave as raw text
      }
    }

    if (!response.ok) {
      const { error, code } = parseErrorBody(rawText, status, response.statusText);
      return { success: false, error, code, statusCode: status, timestamp };
    }

    return { success: true, data: data as T, statusCode: status, timestamp };
  }

  private failureResponse(statusCode: number, error: string): ApiResponse<never> {
    return {
      success: false,
      error,
      code: `HTTP_${statusCode}`,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  // -------------------------------------------------------------------------
  // Convenience methods
  // -------------------------------------------------------------------------

  get<T = unknown>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  patch<T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  delete<T = unknown>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const serverApi = new ServerApiClient();
export default serverApi;