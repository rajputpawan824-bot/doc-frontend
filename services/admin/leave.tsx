// services/admin/leave.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api";
import type {
  LeaveResponse,
  LeaveListResponse,
  LeaveFormData,
  LeaveRequest,
  LeaveApprovalPayload,
  LeaveStatus,
  LeaveBalanceResponse,
} from "@/lib/validations/Admin/leave";

// ==================== QUERY HOOKS ====================

/**
 * Fetch all leaves (with optional filtering)
 */
export const useAllLeaves = (options?: {
  status?: LeaveStatus;
  page?: number;
  limit?: number;
  onError?: (error: Error) => void;
}) => {
  return useQuery({
    queryKey: ["leaves", "all", options?.status, options?.page, options?.limit],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (options?.status) params.append("status", options.status);
        if (options?.page) params.append("page", String(options.page));
        if (options?.limit) params.append("limit", String(options.limit));

        const queryString = params.toString();
        const url = `/leave/all-leaves${queryString ? `?${queryString}` : ""}`;

        const response = await clientApi.get<LeaveListResponse>(url);

        if (!response.success) {
          throw new Error(response.error || "Failed to fetch leaves");
        }
        if (!response.data) {
          throw new Error("No data received from server");
        }

        return response.data.data || [];
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        options?.onError?.(err);
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch a specific leave by ID
 */
export const useLeaveById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["leaves", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Leave ID is required");
      }

      const response = await clientApi.get<{ data: LeaveResponse }>(
        `/leave/${id}`,
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch leave details");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      return response.data.data;
    },
    retry: 2,
    retryDelay: 1000,
    enabled: !!id,
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Create a new leave application
 */
export const useCreateLeave = (options?: {
  onSuccess?: (data: LeaveResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<LeaveResponse, Error, LeaveFormData>({
    mutationFn: async (formData: LeaveFormData) => {
      console.log("[DEBUG] 6. MUTATION FN EXECUTED - formData:", formData);
      
      const payload: LeaveRequest = {
        ...(formData.userId ? { userId: formData.userId.trim() } : {}),
        leaveType: formData.leaveType,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        requestedIsPaid:
  formData.requestedIsPaid,
        reason: formData.reason.trim(),
        emergencyContact: formData.emergencyContact?.trim(),
        isHalfDay: formData.isHalfDay,
        ...(formData.isHalfDay && formData.halfDayType
          ? { halfDayType: formData.halfDayType }
          : {}),
      };

      console.log("[DEBUG] LEAVE PAYLOAD", payload);

      const response = await clientApi.post<{ data: LeaveResponse }>(
        "/leave/apply-leave",
        payload,
      );

      console.log("[DEBUG] 8. AFTER POST - Response:", response);

      if (!response.success) {
        throw new Error(response.error || "Failed to create leave");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      return response.data.data;
    },
onSuccess: (data) => {
  queryClient.invalidateQueries({
    queryKey: ["leaves"],
  });

  queryClient.invalidateQueries({
    queryKey: ["doctors", "on-leave"],
  });

  queryClient.invalidateQueries({
    queryKey: ["doctors"],
  });

  queryClient.invalidateQueries({
    queryKey: ["doctors", "dashboard-stats"],
  });

  options?.onSuccess?.(data);
},
    onError: options?.onError,
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Approve a leave application
 */
export const useApproveLeave = (options?: {
  onSuccess?: (data: LeaveResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<
    LeaveResponse,
    Error,
    { leaveId: string; approvedIsPaid: boolean }
  >({
    mutationFn: async ({ leaveId, approvedIsPaid }) => {
      const payload: LeaveApprovalPayload = {
        status: "APPROVED",
        approvedIsPaid,
      };

      const response = await clientApi.put<{ data: LeaveResponse }>(
        `/leave/approve-leave/${leaveId}`,
        payload,
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to approve leave");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      return response.data.data;
    },
onSuccess: (data) => {
  queryClient.invalidateQueries({
    queryKey: ["leaves"],
  });

  queryClient.invalidateQueries({
    queryKey: ["doctors", "on-leave"],
  });

  queryClient.invalidateQueries({
    queryKey: ["doctors"],
  });

  queryClient.invalidateQueries({
    queryKey: ["doctors", "dashboard-stats"],
  });

  options?.onSuccess?.(data);
},
    onError: options?.onError,
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Reject a leave application
 */
export const useRejectLeave = (options?: {
  onSuccess?: (data: LeaveResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<
    LeaveResponse,
    Error,
    { leaveId: string; rejectionReason: string }
  >({
    mutationFn: async ({ leaveId, rejectionReason }) => {
      const payload: LeaveApprovalPayload = {
        status: "REJECTED",
        rejectionReason,
      };

      const response = await clientApi.put<{ data: LeaveResponse }>(
        `/leave/reject-leave/${leaveId}`,
        payload,
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to reject leave");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Update a leave application
 */
export const useUpdateLeave = (options?: {
  onSuccess?: (data: LeaveResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<
    LeaveResponse,
    Error,
    { leaveId: string; data: Partial<LeaveFormData> }
  >({
    mutationFn: async ({ leaveId, data }) => {
      const response = await clientApi.put<{ data: LeaveResponse }>(
        `/leave/${leaveId}`,
        data,
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to update leave");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Delete a leave application
 */
export const useDeleteLeave = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (leaveId) => {
      const response = await clientApi.delete(`/leave/${leaveId}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to delete leave");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      options?.onSuccess?.();
    },
    onError: options?.onError,
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Cancel a leave application
 */
export const useCancelLeave = (options?: {
  onSuccess?: (data: LeaveResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<LeaveResponse, Error, string>({
    mutationFn: async (leaveId) => {
      const response = await clientApi.put<{ data: LeaveResponse }>(
        `/leave/cancel-leave/${leaveId}`,
        {},
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to cancel leave");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Get leave statistics for dashboard
 */
export const useLeaveStats = (options?: {
  onError?: (error: Error) => void;
}) => {
  return useQuery({
    queryKey: ["leaves", "stats"],
    queryFn: async () => {
      try {
        const response = await clientApi.get<{
          data: {
            totalLeaves: number;
            pendingLeaves: number;
            approvedToday: number;
            onLeaveToday: number;
            upcomingLeaves: number;
            approvalRate: number;
          };
        }>("/leave/stats");

        if (!response.success) {
          throw new Error(response.error || "Failed to fetch leave stats");
        }
        if (!response.data) {
          throw new Error("No data received from server");
        }

        return response.data.data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        options?.onError?.(err);
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOnLeave = (options?: {
  userRole?: "DOCTOR" | "STAFF" | "RECEPTIONIST" | "ADMIN";
  date?: string;
  onError?: (error: Error) => void;
}) => {
  return useQuery({
    queryKey: [
  "leaves",
  "on-leave",
  options?.userRole,
  options?.date,
],
   queryFn: async () => {
  try {
    const params = new URLSearchParams();

    if (options?.userRole) {
      params.append("userRole", options.userRole);
    }

    if (options?.date) {
      params.append("date", options.date);
    }

    const queryString = params.toString();
    const url = `/leave/on-leave${queryString ? `?${queryString}` : ""}`;
        const response = await clientApi.get<
          { data: LeaveResponse[] } | LeaveResponse[]
        >(url);

        if (!response.success) {
          throw new Error(response.error || "Failed to fetch on leave employees");
        }
        if (!response.data) {
          throw new Error("No data received from server");
        }

        return Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        options?.onError?.(err);
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });
};


export const useEmployeesForLeave = (
  role?: "DOCTOR" | "STAFF" | "RECEPTIONIST"
) => {
  return useQuery({
    queryKey: ["leave-employees", role],
    queryFn: async () => {
      const response = await clientApi.get<{
        data: {
          id: string;
          name: string;
        }[];
      }>(`/leave/employees?role=${role}`);

      if (!response.success) {
        throw new Error(
          response.error || "Failed to fetch employees"
        );
      }

      return response.data?.data || [];
    },
    enabled: !!role,
    retry: 2,
  });
};


export const useLeaveBalance = (  month?: number,
  year?: number,
  status?: string) => {
  return useQuery({
    queryKey: ["leave-balance",     month,
      year,
      status,],

    queryFn: async () => {
            const params =
        new URLSearchParams();

      if (month) {
        params.append(
          "month",
          String(month)
        );
      }

      if (year) {
        params.append(
          "year",
          String(year)
        );
      }

      if (status) {
        params.append(
          "status",
          status
        );
      }
      const response =
        await clientApi.get<{
          data: LeaveBalanceResponse;
        }>(
          "/leave/leave-balance",
           {
      params: {
        month,
        year,
        status,
      },
    }
        );

      if (!response.success) {
        throw new Error(
          response.error ||
            "Failed to fetch leave balance"
        );
      }

      return response.data?.data;
    },

    retry: 2,
  });
};


export const useMyLeaves = (
  month?: number,
  year?: number,
  status?: string
) => {
  return useQuery({
    queryKey: [
      "my-leaves",
      month,
      year,
      status,
    ],

    queryFn: async () => {
      const params =
        new URLSearchParams();

      if (month) {
        params.append(
          "month",
          String(month)
        );
      }

      if (year) {
        params.append(
          "year",
          String(year)
        );
      }

      if (status) {
        params.append(
          "status",
          status
        );
      }

      const response =
        await clientApi.get<
          LeaveListResponse
        >(
          `/leave/my-leaves?${
            params.toString()
          }`
        );

      if (!response.success) {
        throw new Error(
          response.error
        );
      }

      return response.data?.data || [];
    },
  });
};


export const useCreateLeavePolicy = (options?: {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      role: "DOCTOR" | "STAFF" | "RECEPTIONIST";
      policyType: "MONTHLY" | "YEARLY";
      allowedLeaves: number;
    }) => {
      const response = await clientApi.post(
        "/leave/create-leavepolicy",
        payload
      );

      if (!response.success) {
        throw new Error(
          response.error ||
          "Failed to save leave policy"
        );
      }

      return response.data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["leave-policy"],
      });

      options?.onSuccess?.(data);
    },

    onError: options?.onError,
  });
};


interface LeavePolicy {
  _id: string;
  role: "DOCTOR" | "STAFF" | "RECEPTIONIST";
  policyType: "MONTHLY" | "YEARLY";
  allowedLeaves: number;
}

interface LeavePolicyResponse {
  data: LeavePolicy[];
}

export const useLeavePolicy = () => {
  return useQuery<LeavePolicyResponse>({
    queryKey: ["leave-policy"],

    queryFn: async () => {
      const response =
        await clientApi.get<LeavePolicyResponse>(
          "/leave/leavepolicy"
        );

      if (!response.success) {
        throw new Error(
          response.error ||
          "Failed to fetch leave policy"
        );
      }

      return response.data;
    },

    staleTime: 0,
  });
};