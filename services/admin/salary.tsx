// services/admin/salary.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { clientApi } from "@/lib/api";
import type { ApiResponse } from "@/lib/types/types";
import type {
  SalaryAdjustmentData,
  SalaryUpdateData,
  SalaryHistoryResponse,
  SalaryDetailsResponse,
  SalaryListResponse,
  SalarySummary,
  UserRole,
} from "@/lib/validations/Admin/salary";

export interface SalaryListParams {
  userRole?: UserRole;
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
}

export interface SalarySummaryParams {
  userRole?: UserRole;
  month?: number;
  year?: number;
}

export interface SalaryDetailsParams {
  userId: string;
  userRole: UserRole;
  month: number;
  year: number;
}

export function useAddSalaryAdjustment(options?: {
  onSuccess?: (data: SalaryHistoryResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<SalaryHistoryResponse, Error, SalaryAdjustmentData>({
    mutationFn: async (data: SalaryAdjustmentData) => {
      const response: ApiResponse<{ data: SalaryHistoryResponse }> =
        await clientApi.post("/salary", data);

      if (!response.success || !response.data) {
        throw new Error(
          typeof response.error === "string"
            ? response.error
            : response.error?.message || "Failed to add salary adjustment",
        );
      }

      return response.data.data;
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export function useUpdateSalary(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<void, Error, SalaryUpdateData>({
    mutationFn: async (data: SalaryUpdateData) => {
      const response: ApiResponse<{ message: string }> = await clientApi.put(
        "/salary/payslip",
        data,
      );

      if (!response.success) {
        throw new Error(
          typeof response.error === "string"
            ? response.error
            : response.error?.message || "Failed to update salary",
        );
      }

      return;
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export const useSalaryHistory = (userId: string, userRole: UserRole) => {
  return useQuery({
    queryKey: ["salary-history", userId, userRole],
    queryFn: async () => {
      if (!userId || !userRole) {
        throw new Error("User ID and role are required");
      }

      const response: ApiResponse<{
        data: SalaryHistoryResponse[];
        count: number;
      }> = await clientApi.get(`/salary/history/${userId}/${userRole}`);

      if (!response.success) {
        throw new Error(
          (response.error as string) || "Failed to fetch salary history",
        );
      }

      return response.data;
    },
    retry: 2,
    retryDelay: 1000,
    enabled: !!userId && !!userRole,
  });
};

export const useSalaryDetails = (params: SalaryDetailsParams | null) => {
  return useQuery({
    queryKey: ["salary-details", params],
    queryFn: async () => {
      if (!params) {
        throw new Error("Salary details params are required");
      }

      const { userId, userRole, month, year } = params;

      const response: ApiResponse<{ data: SalaryDetailsResponse }> =
        await clientApi.get(
          `/salary/details?userId=${userId}&userRole=${userRole}&month=${month}&year=${year}`,
        );

      if (!response.success || !response.data) {
        throw new Error(
          (response.error as string) || "Failed to fetch salary details",
        );
      }

      return response.data.data;
    },
    retry: 2,
    retryDelay: 1000,
    enabled: !!params,
  });
};

export const useSalaryList = (params: SalaryListParams) => {
  const { userRole = "ALL", page = 1, limit = 10, month, year } = params;

  return useQuery({
    queryKey: ["salary-list", userRole, page, limit, month, year],
    queryFn: async () => {
      let url = `/dashboard/salary/list?userRole=${userRole}&page=${page}&limit=${limit}`;

      if (month && year) {
        url += `&month=${month}&year=${year}`;
      }

      const response: ApiResponse<SalaryListResponse> =
        await clientApi.get(url);

      if (!response.success) {
        throw new Error(
          (response.error as string) || "Failed to fetch salary list",
        );
      }

      if (!response.data) {
        throw new Error("No data received from server");
      }

      return response.data;
    },
    retry: 2,
    retryDelay: 1000,
  });
};

export const useSalarySummary = (params: SalarySummaryParams) => {
  const { userRole = "ALL", month, year } = params;

  return useQuery({
    queryKey: ["salary-summary", userRole, month, year],
    queryFn: async () => {
      let url = `/dashboard/salary/summary?userRole=${userRole}`;

      if (month && year) {
        url += `&month=${month}&year=${year}`;
      }

      const response: ApiResponse<{ data: SalarySummary }> =
        await clientApi.get(url);

      if (!response.success || !response.data) {
        throw new Error(
          (response.error as string) || "Failed to fetch salary summary",
        );
      }

      return response.data.data;
    },
    retry: 2,
    retryDelay: 1000,
  });
};

export const useDownloadPayslip = () => {
  return useMutation<void, Error, SalaryDetailsParams>({
    mutationFn: async (params: SalaryDetailsParams) => {
      const { userId, userRole, month, year } = params;

      const response = await clientApi.get<Blob>(
        `/salary/payslip?userId=${userId}&userRole=${userRole}&month=${month}&year=${year}`,
        { responseType: "blob" },
      );

      if (!response.success || !response.data) {
        throw new Error("Failed to download payslip");
      }

      // Create blob and download
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-${userId}-${month}-${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    retry: 1,
    retryDelay: 1000,
  });
};
