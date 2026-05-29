"use client";

import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { clientApi } from "./client";
import type { ApiResponse } from "./types";

// ---------------------------------------------------------------------------
// useApiQuery — wraps clientApi.get with TanStack Query
// ---------------------------------------------------------------------------

type UseApiQueryOptions<TData> = Omit<
  UseQueryOptions<TData, Error>,
  "queryKey" | "queryFn"
> & {
  /** Pass null to disable the query (replaces `enabled` for endpoint-based disabling) */
  params?: Record<string, string | number | boolean | null | undefined>;
};

/**
 * Fetches data from a GET endpoint.
 *
 * @example
 * const { data, isLoading } = useApiQuery<Patient[]>("/patients", ["patients"]);
 * const { data } = useApiQuery<Patient>(`/patients/${id}`, ["patients", id], {
 *   enabled: !!id,
 *   staleTime: 60_000,
 * });
 */
export function useApiQuery<TData = unknown>(
  endpoint: string | null,
  queryKey: readonly unknown[],
  options?: UseApiQueryOptions<TData>,
) {
  const { params, enabled, ...rest } = options ?? {};

  return useQuery<TData, Error>({
    queryKey,
    queryFn: async (): Promise<TData> => {
      const response = await clientApi.request<TData>(endpoint!, {
        method: "GET",
        params,
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data;
    },
    enabled: endpoint !== null && enabled !== false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    ...rest,
  });
}

// ---------------------------------------------------------------------------
// useApiMutation — wraps clientApi POST/PUT/PATCH/DELETE
// ---------------------------------------------------------------------------

type MutationMethod = "POST" | "PUT" | "PATCH" | "DELETE";

type UseApiMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  "mutationFn"
>;

/**
 * Mutates data via POST/PUT/PATCH/DELETE.
 *
 * @example
 * // POST
 * const { mutate } = useApiMutation<Patient, CreatePatientDto>("/patients");
 * mutate({ name: "John", dob: "1990-01-01" });
 *
 * // DELETE (no body)
 * const { mutate } = useApiMutation<void, { id: string }>(
 *   (vars) => `/patients/${vars.id}`,
 *   "DELETE"
 * );
 * mutate({ id: "abc" });
 *
 * // Dynamic endpoint
 * const { mutate } = useApiMutation<Patient, UpdatePatientDto>(
 *   (vars) => `/patients/${vars.id}`,
 *   "PUT"
 * );
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  endpoint: string | ((variables: TVariables) => string),
  method: MutationMethod = "POST",
  options?: UseApiMutationOptions<TData, TVariables>,
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      const resolvedEndpoint =
        typeof endpoint === "function" ? endpoint(variables) : endpoint;

      let response: ApiResponse<TData>;
      // Get token from clientApi (which should read from cookies)
   

      if (method === "DELETE") {
        response = await clientApi.delete<TData>(resolvedEndpoint);
      } else if (method === "PUT") {
        response = await clientApi.put<TData>(resolvedEndpoint, variables);
      } else if (method === "PATCH") {
        response = await clientApi.patch<TData>(resolvedEndpoint, variables);
      } else {
        response = await clientApi.post<TData>(resolvedEndpoint, variables);
      }

      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data;
    },
    retry: 0,

    ...options,
  });
}

// ---------------------------------------------------------------------------
// useApiPaginatedQuery — convenience wrapper for paginated endpoints
// ---------------------------------------------------------------------------

export interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

/**
 * Fetches a paginated list. Automatically re-fetches when page/limit change.
 *
 * @example
 * const { data } = useApiPaginatedQuery<Patient>(
 *   "/patients",
 *   ["patients"],
 *   { page: 1, limit: 20, search: "john" }
 * );
 */
export function useApiPaginatedQuery<TData = unknown>(
  endpoint: string | null,
  baseQueryKey: readonly unknown[],
  pagination: PaginationParams = {},
  options?: Omit<UseApiQueryOptions<TData>, "params">,
) {
  return useApiQuery<TData>(endpoint, [...baseQueryKey, pagination], {
    ...options,
    params: pagination as Record<
      string,
      string | number | boolean | null | undefined
    >,
  });
}
