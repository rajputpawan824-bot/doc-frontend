// lib/validations/Admin/salary.ts
import {
  useFormValidation,
  ValidationRules,
} from "@/lib/hooks/useFormValidation";

export type SalaryType = "BONUS" | "PENALTY" | "INCREMENT" | "DEDUCTION";
export type UserRole = "DOCTOR" | "NURSE" | "RECEPTIONIST" | "TECHNICIAN" | "PHARMACIST" | "ADMIN" | "STAFF" | "ALL";

export interface SalaryAdjustmentData {
  userId: string;
  userRole: UserRole;
  type: SalaryType;
  amount: number;
  reason: string;
  month: number;
  year: number;
}

export interface SalaryUpdateData {
  userId: string;
  userRole: UserRole;
  newSalary: number;
  reason: string;
  month: number;
  year: number;
}

export interface SalaryHistoryResponse {
  id: string;
  userId: string;
  userRole: UserRole;
  type: SalaryType;
  amount: number;
  reason: string;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryDetailsResponse {
  baseSalary: number;
  bonus: number;
  penalty: number;
  netSalary: number;
  adjustments: SalaryHistoryResponse[];
}

export interface EmployeeSalary {
  userId: string;
  name: string;
  role: UserRole;
  baseSalary: number;
  isActive: boolean;
  bonus: number;
  penalty: number;
  adjustments: SalaryHistoryResponse[];
  netSalary: number;
}

export interface SalaryListResponse {
  count?: number;
  currentPage?: number;
  totalPages?: number;
  data: EmployeeSalary[];
  pagination: {
    page: number;
    limit: number;
    total?: number;
    totalRecords?: number;
    totalPages: number;
  };
}

export interface SalarySummary {
  totalMonthlySalary: number;
  averageSalary: number;
  totalBonus: number;
  totalPenalty: number;
  pendingAdjustment: number;
}

export interface SalaryDashboardStats {
  totalMonthlySalary: number;
  averageSalary: number;
  totalBonuses: number;
  totalPenalties: number;
  totalAdjustments: number;
}

export const SALARY_VALIDATION_RULES: ValidationRules = {
  userId: {
    required: "User ID is required",
  },
  userRole: {
    required: "User role is required",
    validate: (value: unknown) => {
      const validRoles: UserRole[] = ["DOCTOR", "NURSE", "RECEPTIONIST", "TECHNICIAN", "PHARMACIST", "ADMIN", "STAFF", "ALL"];
      return (typeof value === "string" && validRoles.includes(value as UserRole)) ||
        `Role must be one of: ${validRoles.join(", ")}`;
    },
  },
  type: {
    required: "Adjustment type is required",
    validate: (value: unknown) => {
      const validTypes: SalaryType[] = ["BONUS", "PENALTY", "INCREMENT", "DEDUCTION"];
      return (typeof value === "string" && validTypes.includes(value as SalaryType)) ||
        `Type must be one of: ${validTypes.join(", ")}`;
    },
  },
  amount: {
    required: "Amount is required",
    validate: (value: unknown) => {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) {
        return "Amount must be a positive number";
      }
      if (numValue > 1000000) {
        return "Amount cannot exceed 10,00,000";
      }
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
      value: 200,
      message: "Reason cannot exceed 200 characters",
    },
  },
  month: {
    required: "Month is required",
    validate: (value: unknown) => {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 1 || numValue > 12) {
        return "Month must be between 1 and 12";
      }
      return true;
    },
  },
  year: {
    required: "Year is required",
    validate: (value: unknown) => {
      const numValue = Number(value);
      const currentYear = new Date().getFullYear();
      if (isNaN(numValue) || numValue < 2020 || numValue > currentYear + 1) {
        return `Year must be between 2020 and ${currentYear + 1}`;
      }
      return true;
    },
  },
  newSalary: {
    required: "New salary is required",
    validate: (value: unknown) => {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) {
        return "Salary must be a positive number";
      }
      if (numValue > 1000000) {
        return "Salary cannot exceed 10,00,000";
      }
      return true;
    },
  },
};

export function useSalaryFormValidation() {
  return useFormValidation(SALARY_VALIDATION_RULES);
}

type TransformedValidationRule = {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  custom?: (value: unknown) => string | null;
};

export function transformValidation(rules: ValidationRules) {
  return Object.entries(rules).reduce((acc, [key, rule]) => {
    const transformed: TransformedValidationRule = {};
    
    if (rule.required) {
      transformed.required = rule.required;
    }
    
    if (rule.minLength) {
      transformed.minLength = {
        value: rule.minLength.value,
        message: rule.minLength.message,
      };
    }
    
    if (rule.maxLength) {
      transformed.maxLength = {
        value: rule.maxLength.value,
        message: rule.maxLength.message,
      };
    }
    
    if (rule.pattern) {
      transformed.pattern = {
        value: rule.pattern.value,
        message: rule.pattern.message,
      };
    }
    
    // TypeScript now knows validate exists and is a function
    const validate = rule.validate;
    if (validate) {
      transformed.custom = (value: unknown) => {
        const result = validate(value);
        return result === true ? null : result;
      };
    }
    
    acc[key] = transformed;
    return acc;
  }, {} as Record<string, TransformedValidationRule>);
}

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
}

export function getMonthYearOptions() {
  const options = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // Add current month
  options.push({
    value: { month: currentMonth, year: currentYear },
    label: `${getMonthName(currentMonth)} ${currentYear}`,
  });
  
  // Add previous 11 months
  for (let i = 1; i <= 11; i++) {
    let month = currentMonth - i;
    let year = currentYear;
    
    if (month < 1) {
      month += 12;
      year -= 1;
    }
    
    options.push({
      value: { month, year },
      label: `${getMonthName(month)} ${year}`,
    });
  }
  
  return options;
}
