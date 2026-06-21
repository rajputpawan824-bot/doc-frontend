import type { ValidationRules } from "@/lib/hooks/useFormValidation";

export interface ClockPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface TodayAttendanceResponse {
  attendanceId: string;
  clockedIn: boolean;
  clockedOut: boolean;
  clockInTime: string | null;
  clockOutTime: string | null;
  status: "PRESENT" | "LATE" | "ABSENT" | "LEAVE" | "HALF_DAY";
  totalWorkingMinutes: number;
  shiftStart: string;
  shiftEnd: string;
}

export interface AttendanceStatsResponse {
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  halfDays: number;
  lateDays: number;
  workingMinutes: number;
}

export interface AttendanceHistoryItem {
  _id: string;
  admin: string;
  user: string;
  userRole: string;
  employeeName: string;

  attendanceDate: string;

  clockInTime: string | null;
  clockOutTime: string | null;

  totalWorkingMinutes: number;
  overtimeMinutes: number;
  lateMinutes: number;

  status: "PRESENT" | "LATE" | "ABSENT" | "LEAVE" | "HALF_DAY";

  shiftStart: string;
  shiftEnd: string;

  createdAt: string;
  updatedAt: string;
}

export interface AttendanceHistoryResponse {
  page: number;
  limit: number;
  total: number;
  data: AttendanceHistoryItem[];
}



export interface ClockAttendanceResponse {
  _id?: string;
  attendanceId: string;

  clockedIn: boolean;
  clockedOut: boolean;

  clockInTime: string | null;
  clockOutTime: string | null;

  status: "PRESENT" | "LATE" | "ABSENT" | "LEAVE" | "HALF_DAY";

  totalWorkingMinutes: number;

  shiftStart: string;
  shiftEnd: string;
}