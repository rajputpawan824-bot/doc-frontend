/**
 * API module — central export
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  WHEN TO USE WHAT                                                        │
 * │                                                                          │
 * │  Server Component / Server Action → serverApi                            │
 * │    - Auth flows (login, logout, token refresh)                           │
 * │    - Any mutation that needs to stay off the client bundle               │
 * │    - Initial page data fetches (SSR)                                     │
 * │                                                                          │
 * │  Client Component (interactive UI) → useApiQuery / useApiMutation        │
 * │    - Data that needs live refetching, pagination, optimistic updates     │
 * │    - Anything user-triggered (forms, buttons)                            │
 * │                                                                          │
 * │  Direct clientApi → rarely needed; prefer the hooks                      │
 * │                                                                          │
 * │  The key rule: mutations that touch sensitive data should go through     │
 * │  a Server Action (which uses serverApi), not directly from the browser.  │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * ─── Examples ──────────────────────────────────────────────────────────────
 *
 *  Server Action (app/actions/patients.ts):
 *    "use server";
 *    export async function getPatients() {
 *      return serverApi.get<Patient[]>("/patients");
 *    }
 *
 *  Server Component (app/patients/page.tsx):
 *    const res = await serverApi.get<Patient[]>("/patients");
 *    if (!res.success) notFound();
 *
 *  Client Component:
 *    const { data, isLoading } = useApiQuery<Patient[]>("/patients", ["patients"]);
 *    const { mutate, isPending } = useApiMutation<Patient, CreatePatientDto>("/patients");
 *
 *  Dynamic endpoint:
 *    const { mutate } = useApiMutation<void, { id: string }>(
 *      (vars) => `/patients/${vars.id}`,
 *      "DELETE"
 *    );
 */

// Configuration
export {
  API_CONFIG,
  getApiBaseUrl,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  IS_SERVER,
  IS_CLIENT,
} from "./config";

// Types
export type {
  ApiResponse,
  ApiSuccess,
  ApiFailure,
  RequestOptions,
  TokenData,
  PaginatedResponse,
  PaginationMeta,
} from "./types";

// Hooks (client-only)
export { useApiQuery, useApiMutation, useApiPaginatedQuery } from "./hooks";
export type { PaginationParams } from "./hooks";

// Clients
export { clientApi } from "./client";
// Note: serverApi is intentionally not exported here to prevent next/headers 
// from leaking into client bundles. Import it directly from "@/lib/api/server".
