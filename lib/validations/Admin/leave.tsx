// lib/validations/Admin/leave.ts
import type { ValidationRules } from "@/lib/hooks/useFormValidation";

// Leave Types
export type LeaveType =
  | "PAID_LEAVE"
  | "SICK_LEAVE"
  | "CASUAL_LEAVE"
  | "EARNED_LEAVE"
  | "MATERNITY_LEAVE"
  | "PATERNITY_LEAVE"
  | "EMERGENCY_LEAVE"
  | "HALF_DAY"
  | "OTHER";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type HalfDayType = "FIRST_HALF" | "SECOND_HALF" | "NOT_APPLICABLE";

export type StaffCategory =
  | "DOCTOR"
  | "NURSE"
  | "TECHNICIAN"
  | "ADMINISTRATOR"
  | "RECEPTIONIST"
  | "PHARMACIST"
  | "CLEANING_STAFF"
  | "SECURITY"
  | "OTHER";

// Form Data Interface
export interface LeaveFormData {
  staffId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  emergencyContact?: string;
  halfDay?: HalfDayType;
  isHalfDay: boolean;
}

// API Request/Response Interfaces
export interface LeaveRequest {
  staffId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  emergencyContact?: string;
  halfDay?: HalfDayType;
  isHalfDay: boolean;
}

export interface LeaveResponse {
  _id: string;
  id?: string;
  staffId: string;
  staffName: string;
  staffCode?: string;
  staffCategory?: StaffCategory;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  numberOfDays: number;
  halfDay?: HalfDayType;
  reason: string;
  emergencyContact?: string;
  appliedOn: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedOn?: string;
  rejectionReason?: string;
  attachments?: string[];
  isHalfDay: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveListResponse {
  success: boolean;
  data: LeaveResponse[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LeaveApprovalPayload {
  status: "APPROVED" | "REJECTED";
  approvedBy?: string;
  rejectionReason?: string;
}

// Validation Rules
export const LEAVE_VALIDATION_RULES: ValidationRules = {
  leaveType: {
    required: "Leave type is required",
    validate: (value: unknown) => {
      const validTypes = [
        "PAID_LEAVE",
        "SICK_LEAVE",
        "CASUAL_LEAVE",
        "EARNED_LEAVE",
        "MATERNITY_LEAVE",
        "PATERNITY_LEAVE",
        "EMERGENCY_LEAVE",
        "HALF_DAY",
        "OTHER",
      ];
      return (
        (typeof value === "string" && validTypes.includes(value)) ||
        `Leave type must be one of: ${validTypes.join(", ")}`
      );
    },
  },
  startDate: {
    required: "Start date is required",
    validate: (value: unknown) => {
      if (typeof value !== "string") return "Start date must be a string";
      const date = new Date(value);
      if (isNaN(date.getTime())) return "Start date must be a valid date";
      return true;
    },
  },
  endDate: {
    required: "End date is required",
    validate: (value: unknown) => {
      if (typeof value !== "string") return "End date must be a string";
      const date = new Date(value);
      if (isNaN(date.getTime())) return "End date must be a valid date";
      return true;
    },
  },
  reason: {
    required: "Reason is required",
    minLength: {
      value: 5,
      message: "Reason must be at least 5 characters",
    },
    maxLength: {
      value: 500,
      message: "Reason cannot exceed 500 characters",
    },
  },
  emergencyContact: {
    pattern: {
      value: /^[6-9]\d{9}$/,
      message: "Emergency contact must be a valid 10-digit number",
    },
  },
};

// Helper Functions
export function getLeaveTypeLabel(type: LeaveType): string {
  const labels: Record<LeaveType, string> = {
    PAID_LEAVE: "Paid Leave",
    SICK_LEAVE: "Sick Leave",
    CASUAL_LEAVE: "Casual Leave",
    EARNED_LEAVE: "Earned Leave",
    MATERNITY_LEAVE: "Maternity Leave",
    PATERNITY_LEAVE: "Paternity Leave",
    EMERGENCY_LEAVE: "Emergency Leave",
    HALF_DAY: "Half Day",
    OTHER: "Other",
  };
  return labels[type] || type;
}

export function getLeaveStatusColor(
  status: LeaveStatus,
): "default" | "secondary" | "destructive" | "outline" {
  const colors: Record<
    LeaveStatus,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    PENDING: "outline",
    APPROVED: "default",
    REJECTED: "destructive",
    CANCELLED: "secondary",
  };
  return colors[status] || "default";
}

export function getLeaveStatusBgColor(status: LeaveStatus): string {
  const colors: Record<LeaveStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function calculateDaysBetween(
  startDate: string,
  endDate: string,
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
}
