"use client";

import { API_CONFIG, getApiBaseUrl } from "./config";
import type { ApiResponse, RequestOptions, TokenData } from "./types";
import {
  logger,
  buildUrl,
  parseErrorBody,
  createTimeoutSignal,
  getBackoffDelay,
  sleep,
} from "./utils";

/**
 * Client-side API client.
 *
 * - Stores access/refresh tokens in localStorage.
 * - Transparently refreshes the access token on 401 and retries the original
 *   request exactly once before giving up.
 * - Never throws — always returns ApiResponse<T>.
 *
 * Usage:
 *   const res = await clientApi.get<Patient[]>("/patients");
 *   if (res.success) { ... res.data ... }
 *   else { toast.error(res.error); }
 */
class ClientApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private isRefreshing = false;
  private refreshQueue: Array<(success: boolean) => void> = [];

  private readonly ACCESS_TOKEN_KEY = API_CONFIG.AUTH_TOKEN_KEY;
  private readonly REFRESH_TOKEN_KEY = API_CONFIG.AUTH_REFRESH_TOKEN_KEY;

  constructor() {
    if (typeof window !== "undefined") {
      this.loadTokens();
    }
  }

  // -------------------------------------------------------------------------
  // Cookie Helpers (REPLACES storage())
  // -------------------------------------------------------------------------

  private setCookie(name: string, value: string, days = 7) {
    if (typeof document === "undefined") return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  }

  private getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;

    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)"),
    );

    return match ? decodeURIComponent(match[2]) : null;
  }

  private deleteCookie(name: string) {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; Max-Age=0; path=/`;
  }

  private getAccessTokenFromCookie(): string | null {
    return this.getCookie(this.ACCESS_TOKEN_KEY);
  }

  private loadTokens(): void {
    this.accessToken = this.getCookie(this.ACCESS_TOKEN_KEY);
    this.refreshToken = this.getCookie(this.REFRESH_TOKEN_KEY);
  }

  setTokens(data: TokenData): void {
    this.accessToken = data.accessToken;

    if (data.refreshToken) {
      this.refreshToken = data.refreshToken;
    }

    this.setCookie(this.ACCESS_TOKEN_KEY, data.accessToken);

    if (data.refreshToken) {
      this.setCookie(this.REFRESH_TOKEN_KEY, data.refreshToken);
    }

    logger.debug("Tokens stored in cookies");
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;

    this.deleteCookie(this.ACCESS_TOKEN_KEY);
    this.deleteCookie(this.REFRESH_TOKEN_KEY);

    logger.debug("Tokens cleared from cookies");
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // -------------------------------------------------------------------------
  // Token refresh (unchanged)
  // -------------------------------------------------------------------------

  private async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return new Promise<boolean>((resolve) => {
        this.refreshQueue.push(resolve);
      });
    }

    if (!this.refreshToken) {
      this.clearTokens();
      return false;
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(
        `${getApiBaseUrl()}${API_CONFIG.AUTH_REFRESH_ENDPOINT}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
          credentials: "include",
        },
      );

      if (!response.ok) throw new Error("Refresh response not OK");

      const data = await response.json();

      if (!data.access_token) {
        throw new Error("No access_token in refresh response");
      }

      this.setTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? this.refreshToken ?? undefined,
      });

      this.refreshQueue.forEach((cb) => cb(true));
      return true;
    } catch (err) {
      logger.error("Token refresh failed:", err);
      this.clearTokens();
      this.refreshQueue.forEach((cb) => cb(false));
      return false;
    } finally {
      this.isRefreshing = false;
      this.refreshQueue = [];
    }
  }

  // -------------------------------------------------------------------------
  // Core request method
  // -------------------------------------------------------------------------

  async request<T = unknown>(
    path: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const {
      method = "GET",
      timeout = API_CONFIG.TIMEOUT,
      retries = API_CONFIG.MAX_RETRIES,
      responseType = "json",
      body,
      headers: customHeaders,
      params,
    } = options;

    let refreshedOnce = false;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const { signal, cleanup } = createTimeoutSignal(timeout);

      try {
        const url = buildUrl(path, params);
        const headers: Record<string, string> = { ...customHeaders };

        if (responseType === "json" && !headers["Content-Type"]) {
          headers["Content-Type"] = "application/json";
        }

        const cookieToken = this.getAccessTokenFromCookie();

        // DEBUG: Log cookie token status
        console.log("🔍 DEBUG - Cookie Token:", {
          exists: !!cookieToken,
          tokenValue: cookieToken ? `${cookieToken.substring(0, 20)}...` : null,
          cookieName: this.ACCESS_TOKEN_KEY,
          allCookies: document.cookie,
        });

        if (cookieToken) {
          this.accessToken = cookieToken;
          headers["Authorization"] = `Bearer ${cookieToken}`;
          console.log(
            "✅ DEBUG - Added Authorization header:",
            headers["Authorization"],
          );
        } else {
          console.log("❌ DEBUG - No token found in cookies");
        }

        const init: RequestInit = {
          method,
          headers,
          signal,
          credentials: "include",
        };

        if (body !== undefined) {
          init.body = typeof body === "string" ? body : JSON.stringify(body);
        }

        console.log("🚀 DEBUG - Final Request:", {
          url,
          method,
          headers: init.headers,
          hasBody: !!init.body,
        });

        const response = await fetch(url, init);
        cleanup();

        // Workaround: The backend incorrectly returns 401 instead of 403 for these endpoints, 
        // so we intercept them to prevent the token from being wiped securely from cookies.
        const ignore401Wipe = path.includes("/doctors/all-doctors") || 
                              path.includes("/doctors/active-doctors") || 
                              path.includes("/doctors/inactive-doctors") ||
                              path.includes("/receptionists/all-receptionists") ||
                              path.includes("/receptionists/create-receptionist") ||
                              path.includes("/staff/isActive") ||
                              path.includes("/staff/isInActive") ||
                              path.includes("/staff/create-staff");

        // 401 handling — try refresh exactly once
        if (response.status === 401 && !refreshedOnce && !ignore401Wipe) {
          refreshedOnce = true;
          const ok = await this.refreshAccessToken();
          if (ok) {
            attempt--; // don't count this as a real retry attempt
            continue;
          }
          return this.failureResponse(401, "Unauthorized — session expired");
        }

        return this.parseResponse<T>(response, responseType);
      } catch (err: unknown) {
        cleanup();
        const message = err instanceof Error ? err.message : "Unknown error";
        logger.warn(
          `Request failed (attempt ${attempt + 1}/${retries + 1}): ${message}`,
        );

        const isAbort = err instanceof Error && err.name === "AbortError";
        const canRetry = attempt < retries && isAbort;

        if (canRetry) {
          await sleep(getBackoffDelay(attempt));
          continue;
        }

        return this.failureResponse(isAbort ? 408 : 500, message);
      }
    }

    return this.failureResponse(500, "Request failed after retries");
  }

  // -------------------------------------------------------------------------
  // Response parsing
  // -------------------------------------------------------------------------

  private async parseResponse<T>(
    response: Response,
    responseType: RequestOptions["responseType"] = "json",
  ): Promise<ApiResponse<T>> {
    const { status } = response;
    const timestamp = new Date().toISOString();

    // Read the body once
    let rawText: string | null = null;
    let data: unknown = null;

    try {
      switch (responseType) {
        case "blob":
          data = await response.blob();
          break;
        case "arraybuffer":
          data = await response.arrayBuffer();
          break;
        case "text":
          data = await response.text();
          break;
        default: {
          rawText = await response.text();
          const ct = response.headers.get("content-type") ?? "";
          data = ct.includes("application/json")
            ? JSON.parse(rawText)
            : rawText;
          break;
        }
      }
    } catch {
      // body read failed — treat as opaque error
    }

    if (!response.ok) {
      const { error, code } = parseErrorBody(
        rawText ?? "",
        status,
        response.statusText,
      );
      return { success: false, error, code, statusCode: status, timestamp };
    }

    return { success: true, data: data as T, statusCode: status, timestamp };
  }

  private failureResponse(statusCode: number, error: string): ApiFailure {
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

  get<T = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  patch<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  delete<T = unknown>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

// Singleton — safe to import anywhere in client components
export const clientApi = new ClientApiClient();
export default clientApi;

// Re-export the type so callers can use it without importing from types.ts
type ApiFailure = Extract<ApiResponse, { success: false }>;
