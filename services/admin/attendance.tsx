import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api";
import type { ApiResponse } from "@/lib/types/types";


import type {
TodayAttendanceResponse,
AttendanceStatsResponse,
AttendanceHistoryItem,
AttendanceHistoryResponse,
ClockAttendanceResponse,
AttendanceDashboardStatsResponse,
AttendanceListResponse,
EmployeeAttendanceSummary

} from "@/lib/validations/Admin/attendance";

export interface ClockPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface AttendanceHistoryParams {
  page?: number;
  limit?: number;
}

// export interface TodayAttendanceResponse {
//   attendanceId: string;
//   clockedIn: boolean;
//   clockedOut: boolean;
//   clockInTime: string | null;
//   clockOutTime: string | null;
//   status: "PRESENT" | "LATE" | "ABSENT" | "LEAVE" | "HALF_DAY";
//   totalWorkingMinutes: number;
//   shiftStart: string;
//   shiftEnd: string;
// }

const ATTENDANCE_KEYS = {
  today: ["attendance", "today"],
  history: ["attendance", "history"],
  stats: ["attendance", "stats"],

    adminAttendance: ["attendance", "all"],
  dashboardStats: ["attendance", "dashboard"],
  employeeSummary: ["attendance", "summary"],
};

// ==================== TODAY ATTENDANCE ====================

export const useTodayAttendance = () => {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.today,

    queryFn: async () => {
    const response: ApiResponse<{
  data: TodayAttendanceResponse;
}> = await clientApi.get(
  "/attendance/today"
);

     if (!response.success || !response.data) {
  throw new Error("Failed to fetch attendance");
}

return response.data.data;
    },

    retry: 2,
    retryDelay: 1000,
  });
};

// ==================== MY STATS ====================

export const useMyAttendanceStats = (
  month?: number,
  year?: number
) => {
   return useQuery({
    queryKey: [
      ...ATTENDANCE_KEYS.stats,
      month,
      year,
    ],

    queryFn: async () => {
      const response: ApiResponse<{
        data: AttendanceStatsResponse;
      }> = await clientApi.get(
        "/attendance/my-stats",
        {
          params: {
            month,
            year,
          },
        }
      );

      if (!response.success) {
        throw new Error(
           "Failed to fetch attendance stats"
        );
      }

      if (!response.data) {
        throw new Error(
          "No attendance stats received"
        );
      }

       return response.data.data;
    },

    retry: 2,
    retryDelay: 1000,
  });
};

// ==================== ATTENDANCE HISTORY ====================

export const useMyAttendanceHistory = ({
  page = 1,
  limit = 10,
  date,
    month,
  year,
}: {
  page?: number;
  limit?: number;
  date?: string;
  month?: number;
year?: number;
}) => {
  return useQuery({
queryKey: [
  ...ATTENDANCE_KEYS.history,
     page,
      limit,
      date,
      month,
      year,
],

    queryFn: async () => {
const response: ApiResponse<AttendanceHistoryResponse> =
  await clientApi.get(
    "/attendance/my-history",
    {
      params: {
         page,
              limit,
              date,
              month,
              year,
      },
    }
  );

      if (!response.success) {
        throw new Error(
          "Failed to fetch attendance history"
        );
      }

      if (!response.data) {
        throw new Error(
          "No attendance history received"
        );
      }

      return response.data.data;
    },

    retry: 2,
    retryDelay: 1000,
  });
};

// ==================== CLOCK IN ====================

export const useClockIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: ClockPayload
    ): Promise<ClockAttendanceResponse> => {

      const response: ApiResponse<{
        data: ClockAttendanceResponse;
      }> = await clientApi.post(
        "/attendance/clock-in",
        payload
      );

      if (!response.success || !response.data) {
        throw new Error(
          typeof response.error === "string"
            ? response.error
            : response.error?.message ||
                "Failed to clock in"
        );
      }

      return response.data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_KEYS.today,
      });

      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_KEYS.history,
      });

      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_KEYS.stats,
      });
    },
  });
};
// ==================== CLOCK OUT ====================

export const useClockOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: ClockPayload
    ): Promise<ClockAttendanceResponse> => {

      const response: ApiResponse<{
        data: ClockAttendanceResponse;
      }> = await clientApi.post(
        "/attendance/clock-out",
        payload
      );

      if (!response.success || !response.data) {
        throw new Error(
          typeof response.error === "string"
            ? response.error
            : response.error?.message ||
                "Failed to clock out"
        );
      }

      return response.data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_KEYS.today,
      });

      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_KEYS.history,
      });

      queryClient.invalidateQueries({
        queryKey: ATTENDANCE_KEYS.stats,
      });
    },
  });
};



export const useAttendanceDashboardStats = (
  role?: string,
  date?: string,
  month?: number,
  year?: number
) => {
  return useQuery({
    queryKey: [
      ...ATTENDANCE_KEYS.dashboardStats,
      role,
      date,
      month,
      year,
    ],

    queryFn: async () => {
     const response: ApiResponse<{
  data: AttendanceDashboardStatsResponse;
}> =
        await clientApi.get(
          "/attendance/dashboard-stats",
          {
            params: {
              role,
              date,
              month,
              year,
            },
          }
        );
        if (!response.success || !response.data) {
  throw new Error(
    "Failed to fetch dashboard stats"
  );
}

      return response.data.data;
    },
  });
};



export const useAttendanceList = ({
  page = 1,
  limit = 10,
  role,
  status,
  date,
  search,
}: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  date?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: [
      ...ATTENDANCE_KEYS.adminAttendance,
      page,
      limit,
      role,
      status,
      date,
      search,
    ],

    queryFn: async () => {
const response: ApiResponse<AttendanceListResponse> = await clientApi.get(
          "/attendance/all",
          {
            params: {
              page,
              limit,
              role,
              status,
              date,
              search,
            },
          }
        );
        if (!response.success || !response.data) {
  throw new Error(
    "Failed to fetch Attendance List"
  );
}

      return response.data;
    },
  });
};



export const useEmployeeAttendanceSummary = (
  role?: string,
  month?: number,
  year?: number
) => {
  return useQuery({
    queryKey: [
      ...ATTENDANCE_KEYS.employeeSummary,
      role,
      month,
      year,
    ],

    queryFn: async () => {
      const response: ApiResponse<{
  data: EmployeeAttendanceSummary;
}> = 
        await clientApi.get(
          "/attendance/employee-summary",
          {
            params: {
              role,
              month,
              year,
            },
          }
        );
         if (!response.success || !response.data) {
  throw new Error(
    "Failed to fetch dashboard stats"
  );
}


      return response.data.data;
    },
  });
};