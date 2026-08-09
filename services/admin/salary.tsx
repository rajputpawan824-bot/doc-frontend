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
  //SalarySummary,
  SalaryDashboardStats,
  UserRole,
} from "@/lib/validations/Admin/salary";

export interface SalaryListParams {
  userRole?: UserRole;
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
  search?: string;
}

// export interface SalarySummaryParams {
//   userRole?: UserRole;
//   month?: number;
//   year?: number;
// }

export interface SalaryDetailsParams {
  userId?: string;
  userRole?: UserRole;
  month: number;
  year: number;
}

export interface SalaryHistoryParams {
  userId?: string;
  userRole?: UserRole;
  month: number;
  year: number;
}

export type PayslipParams = SalaryDetailsParams;

type SalaryDetailsApiResponse =
  | SalaryDetailsResponse
  | { data?: SalaryDetailsResponse };

const salaryDetailsExpectedFields = [
  "baseSalary",
  "bonus",
  "penalty",
  "attendanceDeduction",
  "absentDays",
  "halfDays",
  "leaveDeduction",
  "unpaidDays",
  "totalDeductions",
  "totalEarnings",
  "netSalary",
  "adjustments",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasSalaryDetailsFields(value: unknown): value is SalaryDetailsResponse {
  return (
    isRecord(value) &&
    salaryDetailsExpectedFields.every((field) => field in value)
  );
}

function getSalaryDetailsPayload(
  payload: SalaryDetailsApiResponse | undefined,
): SalaryDetailsResponse | null {
  if (hasSalaryDetailsFields(payload)) {
    return payload;
  }

  if (isRecord(payload) && hasSalaryDetailsFields(payload.data)) {
    return payload.data;
  }

  return null;
}

function getSalaryDetailsMismatch(payload: unknown) {
  const candidate = isRecord(payload) && "data" in payload ? payload.data : payload;
  const candidateKeys = isRecord(candidate) ? Object.keys(candidate) : [];

  return {
    expectedFields: salaryDetailsExpectedFields,
    actualFields: candidateKeys,
    missingFields: salaryDetailsExpectedFields.filter(
      (field) => !candidateKeys.includes(field),
    ),
    extraFields: candidateKeys.filter(
      (field) => !salaryDetailsExpectedFields.includes(
        field as (typeof salaryDetailsExpectedFields)[number],
      ),
    ),
  };
}

function buildSalaryQueryString(params: SalaryDetailsParams | SalaryHistoryParams) {
  const urlParams = new URLSearchParams();

  if (params.userId) {
    urlParams.append("userId", params.userId);
  }
  if (params.userRole) {
    urlParams.append("userRole", params.userRole);
  }
  urlParams.append("month", String(params.month));
  urlParams.append("year", String(params.year));

  return urlParams.toString();
}

function validateSalaryDetailsParams(params: SalaryDetailsParams | null) {
  const validRoles: UserRole[] = [
    "DOCTOR",
    "NURSE",
    "RECEPTIONIST",
    "TECHNICIAN",
    "PHARMACIST",
    "ADMIN",
    "STAFF",
    "ALL",
  ];

  const errors: string[] = [];

  if (!params) {
    errors.push("params are null");
  } else {
    if (params.userId && !params.userRole) {
      errors.push("userRole is required when userId is provided");
    }
    if (params.userRole && !params.userId) {
      errors.push("userId is required when userRole is provided");
    }
    if (params.userRole && !validRoles.includes(params.userRole)) {
      errors.push(`userRole must be one of: ${validRoles.join(", ")}`);
    }
    if (!Number.isInteger(params.month) || params.month < 1 || params.month > 12) {
      errors.push("month must be between 1 and 12");
    }
    const currentYear = new Date().getFullYear();
    if (
      !Number.isInteger(params.year) ||
      params.year < 2020 ||
      params.year > currentYear + 1
    ) {
      errors.push(`year must be between 2020 and ${currentYear + 1}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateSalaryHistoryParams(params: SalaryHistoryParams | null) {
  return validateSalaryDetailsParams(params);
}

export function useAddSalaryAdjustment(options?: {
  onSuccess?: (data: SalaryHistoryResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<SalaryHistoryResponse, Error, SalaryAdjustmentData>({
    mutationFn: async (data: SalaryAdjustmentData) => {
      const response: ApiResponse<{ data: SalaryHistoryResponse }> =
        await clientApi.post("/salary/add-Salary-Entry", data);

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
  onSuccess?: (data: { message?: string } | string) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<{ message?: string } | string, Error, SalaryUpdateData>({
    mutationFn: async (data: SalaryUpdateData) => {
      const response: ApiResponse<{ message?: string } | string> = await clientApi.put(
        "/salary/update",
        data,
      );

      console.log("Salary update API response:", response);

      if (!response.success) {
        throw new Error(
          typeof response.error === "string"
            ? response.error
            : response.error?.message || "Failed to update salary",
        );
      }

      return response.data ?? "Salary updated successfully";
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export const useSalaryHistory = (params: SalaryHistoryParams | null) => {
  const validationResult = validateSalaryHistoryParams(params);
  const enabled = validationResult.isValid;

  return useQuery({
    queryKey: ["salary-history", params],
    queryFn: async () => {
      if (!params) {
        throw new Error("Salary history params are required");
      }

      const response: ApiResponse<{
        data: SalaryHistoryResponse[];
        count: number;
      }> = await clientApi.get(`/salary/history?${buildSalaryQueryString(params)}`);

      if (!response.success) {
        throw new Error(
          (response.error as string) || "Failed to fetch salary history",
        );
      }

      return response.data;
    },
    retry: 2,
    retryDelay: 1000,
    enabled,
  });
};

export const useSalaryDetails = (params: SalaryDetailsParams | null) => {
  const validationResult = validateSalaryDetailsParams(params);
  const enabled = validationResult.isValid;

  console.log("useSalaryDetails params:", {
    userId: params?.userId,
    userRole: params?.userRole,
    month: params?.month,
    year: params?.year,
  });
  console.log("useSalaryDetails validation result:", validationResult);
  console.log("useSalaryDetails query enabled:", enabled);

  return useQuery({
    queryKey: ["salary-details", params],
    queryFn: async () => {
      if (!params) {
        throw new Error("Salary details params are required");
      }

      const url = `/salary/details?${buildSalaryQueryString(params)}`;

      console.log("useSalaryDetails final request URL:", url);

      const response: ApiResponse<SalaryDetailsApiResponse> =
        await clientApi.get(url);

      console.log("useSalaryDetails actual API response:", response);

      if (!response.success || !response.data) {
        throw new Error(
          (response.error as string) || "Failed to fetch salary details",
        );
      }

      const details = getSalaryDetailsPayload(response.data);
      const mismatch = getSalaryDetailsMismatch(response.data);

      console.log("useSalaryDetails fields expected by modal:", {
        expectedFields: salaryDetailsExpectedFields,
      });
      console.log("useSalaryDetails exact mismatch:", mismatch);
      console.log("useSalaryDetails value returned:", details);

      if (!details) {
        throw new Error("Salary details response shape did not match expected fields");
      }

      return details;
    },
    retry: 2,
    retryDelay: 1000,
    enabled,
  });
};

export const useSalaryList = (params: SalaryListParams) => {
  const {
    userRole = "ALL",
    page = 1,
    limit = 10,
    month,
    year,
    search,
  } = params;

  return useQuery({
    queryKey: ["salary-list", userRole, page, limit, month, year, search],
    queryFn: async () => {
      const urlParams = new URLSearchParams();

      if (userRole && userRole !== "ALL") {
        urlParams.append("role", userRole);
      }
      urlParams.append("page", String(page));
      urlParams.append("limit", String(limit));
      if (month) {
        urlParams.append("month", String(month));
      }
      if (year) {
        urlParams.append("year", String(year));
      }
      if (search) {
        urlParams.append("search", search);
      }

      const url = `/salary/list?${urlParams.toString()}`;

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

// export const useSalarySummary = (params: SalarySummaryParams) => {
//   const { userRole = "ALL", month, year } = params;

//   return useQuery({
//     queryKey: ["salary-summary", userRole, month, year],
//     queryFn: async () => {
//       let url = `/dashboard/salary/summary?userRole=${userRole}`;

//       if (month && year) {
//         url += `&month=${month}&year=${year}`;
//       }

//       const response: ApiResponse<{ data: SalarySummary }> =
//         await clientApi.get(url);

//       if (!response.success || !response.data) {
//         throw new Error(
//           (response.error as string) || "Failed to fetch salary summary",
//         );
//       }

//       return response.data.data;
//     },
//     retry: 2,
//     retryDelay: 1000,
//   });
// };

export interface SalaryDashboardStatsParams {
  userRole?: UserRole;
  month?: number;
  year?: number;
}

export const useSalaryDashboardStats = (params: SalaryDashboardStatsParams) => {
  const { userRole = "ALL", month, year } = params;

  return useQuery({
    queryKey: ["salary-dashboard-stats", userRole, month, year],
    queryFn: async () => {
      let url = `/salary/dashboard-stats?userRole=${userRole}`;

      if (month && year) {
        url += `&month=${month}&year=${year}`;
      }

      const response: ApiResponse<{ data: SalaryDashboardStats }> =
        await clientApi.get(url);

      if (!response.success || !response.data) {
        throw new Error(
          (response.error as string) || "Failed to fetch salary dashboard stats",
        );
      }

      return response.data.data;
    },
    retry: 2,
    retryDelay: 1000,
  });
};

export const useDownloadPayslip = () => {
  return useMutation<void, Error, PayslipParams>({
    mutationFn: async (params: PayslipParams) => {
      const { userId, month, year } = params;

      const response = await clientApi.get<Blob>(
        `/salary/payslip?${buildSalaryQueryString(params)}`,
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
      a.download = `payslip-${userId ?? "me"}-${month}-${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    retry: 1,
    retryDelay: 1000,
  });
};


export const useViewPayslip = () => {
  return useMutation<void, Error, PayslipParams>({
    mutationFn: async (params: PayslipParams) => {
      const { userId, month, year } = params;

      const response = await clientApi.get<Blob>(
        `/salary/view-payslip?${buildSalaryQueryString(params)}`,
        { responseType: "blob" },
      );

      if (!response.success || !response.data) {
        throw new Error("Failed to view payslip");
      }

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    },
    retry: 1,
    retryDelay: 1000,
  });
};