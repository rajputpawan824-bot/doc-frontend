/**
 * TanStack Query Integration Guide
 * 
 * This guide demonstrates the best practices for using TanStack Query
 * in the clinic management application.
 */

// ==========================================
// 1. SETUP AND CONFIGURATION
// ==========================================

/**
 * The QueryProvider is already set up in app/layout.tsx
 * It wraps the entire application with TanStack Query functionality.
 * 
 * Key configurations:
 * - staleTime: 5 minutes (default for all queries)
 * - gcTime: 10 minutes (formerly cacheTime)
 * - retry: 3 attempts for queries, 1 for mutations
 * - refetchOnWindowFocus: disabled by default
 * - refetchOnReconnect: refetch stale data
 * - refetchOnMount: refetch stale data on component mount
 */

// ==========================================
// 2. USING HOOKS FOR API CALLS
// ==========================================

/**
 * Example 1: Using useLoginMutation for login
 * 
 * import { useLoginMutation } from "@/lib/api/hooks";
 * import { useRouter } from "next/navigation";
 * 
 * export function MyLoginComponent() {
 *   const router = useRouter();
 *   const { mutate: login, isPending, error } = useLoginMutation({
 *     onSuccess: (data) => {
 *       // Handle successful login
 *       localStorage.setItem("user", JSON.stringify(data.user));
 *       router.push("/dashboard");
 *     },
 *     onError: (error) => {
 *       // Handle error
 *       console.error(error.message);
 *     }
 *   });
 * 
 *   const handleLogin = (username: string, password: string) => {
 *     login({ username, password });
 *   };
 * 
 *   return (
 *     <button onClick={() => handleLogin("user", "pass")} disabled={isPending}>
 *       {isPending ? "Logging in..." : "Login"}
 *     </button>
 *   );
 * }
 */

/**
 * Example 2: Using useMutationRequest for generic POST/PUT/DELETE
 * 
 * import { useMutationRequest } from "@/lib/api/hooks";
 * 
 * interface CreateClinicData {
 *   name: string;
 *   address: string;
 *   phone: string;
 * }
 * 
 * export function CreateClinicForm() {
 *   const { mutate: createClinic, isPending } = useMutationRequest<
 *     CreateClinicData,
 *     Error,
 *     CreateClinicData
 *   >("/clinics", "POST", {
 *     onSuccess: (data) => {
 *       console.log("Clinic created:", data);
 *       // Optionally invalidate queries to refetch data
 *     }
 *   });
 * 
 *   return (
 *     <form onSubmit={(e) => {
 *       e.preventDefault();
 *       const formData = new FormData(e.currentTarget);
 *       createClinic({
 *         name: formData.get("name") as string,
 *         address: formData.get("address") as string,
 *         phone: formData.get("phone") as string,
 *       });
 *     }}>
 *       {/* Form fields */}
 *     </form>
 *   );
 * }
 */

/**
 * Example 3: Using useQueryRequest for GET requests
 * 
 * import { useQueryRequest } from "@/lib/api/hooks";
 * 
 * export function ClinicsList() {
 *   const { data: clinics, isLoading, error } = useQueryRequest<Clinic[]>(
 *     "/clinics",
 *     ["clinics"],
 *     {
 *       staleTime: 10 * 60 * 1000, // 10 minutes
 *       retry: 3,
 *     }
 *   );
 * 
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 * 
 *   return (
 *     <ul>
 *       {clinics?.map(clinic => (
 *         <li key={clinic.id}>{clinic.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 */

// ==========================================
// 3. FORM VALIDATION
// ==========================================

/**
 * Example: Using useFormValidation for reusable form validation
 * 
 * import { useFormValidation, ValidationRules } from "@/lib/hooks/useFormValidation";
 * import { ChangeEvent, FormEvent } from "react";
 * 
 * const FORM_VALIDATION_RULES: ValidationRules = {
 *   email: {
 *     required: "Email is required",
 *     pattern: {
 *       value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
 *       message: "Invalid email address"
 *     }
 *   },
 *   password: {
 *     required: "Password is required",
 *     minLength: {
 *       value: 8,
 *       message: "Password must be at least 8 characters"
 *     }
 *   }
 * };
 * 
 * export function SignupForm() {
 *   const [formData, setFormData] = useState({ email: "", password: "" });
 *   const { errors, validate, clearError } = useFormValidation(FORM_VALIDATION_RULES);
 * 
 *   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
 *     const { name, value } = e.target;
 *     setFormData(prev => ({ ...prev, [name]: value }));
 *     if (errors[name]) clearError(name);
 *   };
 * 
 *   const handleSubmit = (e: FormEvent) => {
 *     e.preventDefault();
 *     if (validate(formData)) {
 *       // Submit form
 *     }
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="email" onChange={handleChange} />
 *       {errors.email && <span>{errors.email}</span>}
 *     </form>
 *   );
 * }
 */

// ==========================================
// 4. QUERY INVALIDATION
// ==========================================

/**
 * After mutations, you often need to invalidate queries to refetch data.
 * Use the queryClient from the query-provider.tsx
 * 
 * import { useQueryClient } from "@tanstack/react-query";
 * 
 * export function DeleteClinic() {
 *   const queryClient = useQueryClient();
 *   const { mutate: deleteClinic } = useMutationRequest(
 *     "/clinics/{id}",
 *     "DELETE",
 *     {
 *       onSuccess: () => {
 *         // Invalidate clinics list to trigger refetch
 *         queryClient.invalidateQueries({ queryKey: ["clinics"] });
 *       }
 *     }
 *   );
 * 
 *   return <button onClick={() => deleteClinic({})}>Delete</button>;
 * }
 */

// ==========================================
// 5. BEST PRACTICES
// ==========================================

/**
 * 1. SEPARATION OF CONCERNS
 *    - Keep API logic in hooks (lib/api/hooks.ts)
 *    - Keep validation logic in validation hooks (lib/hooks/useFormValidation.ts)
 *    - Keep components focused on UI
 * 
 * 2. ERROR HANDLING
 *    - Always handle both validation errors and API errors
 *    - Show user-friendly error messages
 *    - Use error boundaries for critical errors
 * 
 * 3. LOADING STATES
 *    - Use isPending instead of manual isLoading state
 *    - Disable buttons/inputs during mutations
 *    - Show loading indicators
 * 
 * 4. QUERY KEYS
 *    - Use descriptive query keys: ["clinics"], ["clinics", clinicId]
 *    - Prefix with entity type for organization
 *    - Include params in key for parameterized queries
 * 
 * 5. REUSABILITY
 *    - Create specific hooks for common API operations
 *    - Use generic hooks (useMutationRequest, useQueryRequest) for one-offs
 *    - Extract validation rules to constants
 * 
 * 6. PERFORMANCE
 *    - Set appropriate staleTime for your use case
 *    - Use pagination for large datasets
 *    - Implement request debouncing for search
 * 
 * 7. TESTING
 *    - Mock the hooks in tests
 *    - Use MSW (Mock Service Worker) for API mocking
 *    - Test error scenarios
 */

// ==========================================
// 6. FILE STRUCTURE
// ==========================================

/**
 * lib/
 *   api/
 *     client.tsx          - API client implementation
 *     config.ts           - API configuration
 *     hooks.ts            - TanStack Query hooks (NEW)
 *     index.ts            - Exports
 *     query-provider.tsx  - QueryClient provider (NEW)
 *     server.ts           - Server-side API client
 *     types.ts            - TypeScript types
 *     utils.ts            - Utility functions
 *   hooks/
 *     useFormValidation.ts - Form validation hook (NEW)
 */
