/**
 * Advanced TanStack Query Patterns
 * Best practices, caching strategies, and advanced techniques
 */

// ==========================================
// 1. PAGINATION HOOK
// ==========================================

/**
 * Example: Paginated Query Hook
 * 
 * import { useQuery } from "@tanstack/react-query";
 * import { clientApi } from "@/lib/api";
 * import { PaginatedResponse } from "@/lib/api/types";
 * 
 * export function usePaginatedClinic(
 *   page: number = 1,
 *   pageSize: number = 10
 * ) {
 *   return useQuery<PaginatedResponse<Clinic>, Error>({
 *     queryKey: ["clinics", page, pageSize],
 *     queryFn: async () => {
 *       const response = await clientApi.get("/clinics", {
 *         params: { page, pageSize }
 *       });
 *       
 *       if (!response.success) {
 *         throw new Error("Failed to fetch clinics");
 *       }
 *       
 *       return response.data as PaginatedResponse<Clinic>;
 *     },
 *     staleTime: 5 * 60 * 1000,
 *   });
 * }
 */

// ==========================================
// 2. SEARCH/FILTER HOOK WITH DEBOUNCING
// ==========================================

/**
 * Example: Debounced Search Hook
 * 
 * import { useEffect, useState } from "react";
 * import { useQuery } from "@tanstack/react-query";
 * import { clientApi } from "@/lib/api";
 * 
 * export function useSearchClinics(searchTerm: string) {
 *   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
 * 
 *   useEffect(() => {
 *     const timer = setTimeout(() => {
 *       setDebouncedSearchTerm(searchTerm);
 *     }, 500); // Wait 500ms before searching
 * 
 *     return () => clearTimeout(timer);
 *   }, [searchTerm]);
 * 
 *   return useQuery<Clinic[], Error>({
 *     queryKey: ["clinics", "search", debouncedSearchTerm],
 *     queryFn: async () => {
 *       if (!debouncedSearchTerm) return [];
 * 
 *       const response = await clientApi.get("/clinics", {
 *         params: { search: debouncedSearchTerm }
 *       });
 * 
 *       if (!response.success) {
 *         throw new Error("Search failed");
 *       }
 * 
 *       return response.data as Clinic[];
 *     },
 *     enabled: debouncedSearchTerm.length > 0,
 *     staleTime: 2 * 60 * 1000,
 *   });
 * }
 */

// ==========================================
// 3. DEPENDENT QUERIES
// ==========================================

/**
 * Example: Fetch user, then their clinics
 * 
 * import { useQuery } from "@tanstack/react-query";
 * 
 * export function useUserWithClinics(userId: string | null) {
 *   // First query: fetch user
 *   const { data: user } = useQuery({
 *     queryKey: ["user", userId],
 *     queryFn: async () => {
 *       const response = await clientApi.get(`/users/${userId}`);
 *       if (!response.success) throw new Error("Failed to fetch user");
 *       return response.data as User;
 *     },
 *     enabled: userId !== null,
 *   });
 * 
 *   // Second query: fetch clinics (depends on user)
 *   const { data: clinics } = useQuery({
 *     queryKey: ["users", userId, "clinics"],
 *     queryFn: async () => {
 *       const response = await clientApi.get(`/users/${userId}/clinics`);
 *       if (!response.success) throw new Error("Failed to fetch clinics");
 *       return response.data as Clinic[];
 *     },
 *     // Only run this query after user is loaded
 *     enabled: !!user,
 *   });
 * 
 *   return { user, clinics };
 * }
 */

// ==========================================
// 4. OPTIMISTIC UPDATES
// ==========================================

/**
 * Example: Optimistic Update Pattern
 * Update UI before server confirms change
 * 
 * import { useMutation, useQueryClient } from "@tanstack/react-query";
 * 
 * export function useOptimisticUpdateClinic() {
 *   const queryClient = useQueryClient();
 * 
 *   return useMutation({
 *     mutationFn: async (data: UpdateClinicInput) => {
 *       const response = await clientApi.put(`/clinics/${data.id}`, data);
 *       if (!response.success) throw new Error("Update failed");
 *       return response.data as Clinic;
 *     },
 *     // Optimistic update
 *     onMutate: async (newData) => {
 *       // Cancel ongoing queries
 *       await queryClient.cancelQueries({ queryKey: ["clinic", newData.id] });
 * 
 *       // Get previous data
 *       const previousData = queryClient.getQueryData(["clinic", newData.id]);
 * 
 *       // Update UI optimistically
 *       queryClient.setQueryData(["clinic", newData.id], {
 *         ...previousData,
 *         ...newData,
 *       });
 * 
 *       // Return context for rollback if error
 *       return { previousData };
 *     },
 *     // Rollback on error
 *     onError: (err, newData, context) => {
 *       if (context?.previousData) {
 *         queryClient.setQueryData(
 *           ["clinic", newData.id],
 *           context.previousData
 *         );
 *       }
 *     },
 *     // Refetch after success
 *     onSuccess: (data) => {
 *       queryClient.setQueryData(["clinic", data.id], data);
 *     },
 *   });
 * }
 */

// ==========================================
// 5. MANUAL CACHE MANAGEMENT
// ==========================================

/**
 * Example: Manual Cache Control
 * 
 * import { useQueryClient } from "@tanstack/react-query";
 * 
 * export function useCacheManagement() {
 *   const queryClient = useQueryClient();
 * 
 *   return {
 *     // Invalidate clinics cache
 *     invalidateClinics: () => {
 *       queryClient.invalidateQueries({ queryKey: ["clinics"] });
 *     },
 * 
 *     // Refetch immediately
 *     refetchClinics: () => {
 *       queryClient.refetchQueries({ queryKey: ["clinics"] });
 *     },
 * 
 *     // Get cached data
 *     getClinicsFromCache: () => {
 *       return queryClient.getQueryData(["clinics"]);
 *     },
 * 
 *     // Set cache directly
 *     setClinicsCache: (data: Clinic[]) => {
 *       queryClient.setQueryData(["clinics"], data);
 *     },
 * 
 *     // Clear all cache
 *     clearAllCache: () => {
 *       queryClient.clear();
 *     },
 *   };
 * }
 */

// ==========================================
// 6. ERROR HANDLING PATTERNS
// ==========================================

/**
 * Example: Custom Error Handling Hook
 * 
 * import { isAxiosError } from "axios";
 * 
 * export function useApiErrorHandler() {
 *   return {
 *     getErrorMessage: (error: unknown): string => {
 *       if (error instanceof Error) {
 *         return error.message;
 *       }
 * 
 *       if (isAxiosError(error)) {
 *         return error.response?.data?.message || error.message;
 *       }
 * 
 *       return "An unexpected error occurred";
 *     },
 * 
 *     isNetworkError: (error: unknown): boolean => {
 *       return isAxiosError(error) && !error.response;
 *     },
 * 
 *     isAuthError: (error: unknown): boolean => {
 *       return isAxiosError(error) && error.response?.status === 401;
 *     },
 * 
 *     isValidationError: (error: unknown): boolean => {
 *       return isAxiosError(error) && error.response?.status === 422;
 *     },
 *   };
 * }
 */

// ==========================================
// 7. QUERY KEY FACTORY PATTERN
// ==========================================

/**
 * Recommended: Use a factory for consistent query keys
 * 
 * export const clinicQueries = {
 *   all: () => ["clinics"] as const,
 *   lists: () => [...clinicQueries.all(), "list"] as const,
 *   list: (filters?: Record<string, any>) =>
 *     [...clinicQueries.lists(), { filters }] as const,
 *   details: () => [...clinicQueries.all(), "detail"] as const,
 *   detail: (id: string) =>
 *     [...clinicQueries.details(), id] as const,
 * };
 * 
 * // Usage:
 * useQuery({
 *   queryKey: clinicQueries.detail(clinicId),
 *   queryFn: () => fetchClinic(clinicId),
 * });
 * 
 * // Invalidate:
 * queryClient.invalidateQueries({
 *   queryKey: clinicQueries.lists(),
 * });
 */

// ==========================================
// 8. FORM STATE INTEGRATION
// ==========================================

/**
 * Example: Form State with Mutations
 * 
 * import { FormEvent } from "react";
 * import { useCreateClinic } from "@/lib/api/hooks-examples";
 * 
 * export function CreateClinicForm() {
 *   const { mutate, isPending, error } = useCreateClinic({
 *     onSuccess: () => {
 *       // Form will be reset here if needed
 *     }
 *   });
 * 
 *   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
 *     e.preventDefault();
 *     const formData = new FormData(e.currentTarget);
 *     mutate({
 *       name: formData.get("name") as string,
 *       address: formData.get("address") as string,
 *       phone: formData.get("phone") as string,
 *       email: formData.get("email") as string,
 *     });
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {/* Form fields */}
 *       {error && <p className="error">{error.message}</p>}
 *       <button disabled={isPending}>
 *         {isPending ? "Creating..." : "Create"}
 *       </button>
 *     </form>
 *   );
 * }
 */

// ==========================================
// 9. COMMON ISSUES AND SOLUTIONS
// ==========================================

/**
 * Issue: Query runs on every render
 * Solution: Ensure dependencies are stable
 * 
 * ❌ Bad - Creates new array every render
 * const queryKey = ["clinics", page, size];
 * 
 * ✅ Good - Stable array
 * const queryKey = useMemo(() => ["clinics", page, size], [page, size]);
 */

/**
 * Issue: Data not updating after mutation
 * Solution: Invalidate the query
 * 
 * const { mutate } = useMutation({
 *   mutationFn: updateClinic,
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({ queryKey: ["clinics"] });
 *   }
 * });
 */

/**
 * Issue: Memory leaks with pending requests
 * Solution: Component unmounts while request pending
 * 
 * ✅ TanStack Query handles this automatically
 * No need for AbortController or cleanup
 */

/**
 * Issue: Stale data in background
 * Solution: Configure refetch strategies
 * 
 * useQuery({
 *   queryKey: ["clinics"],
 *   queryFn: fetchClinics,
 *   refetchOnWindowFocus: true,      // Refetch when window focused
 *   refetchOnReconnect: "stale",     // Refetch if connection restored
 *   refetchOnMount: "stale",         // Refetch on component mount
 * });
 */
