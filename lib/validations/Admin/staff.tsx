// lib/validations/Staff/staff.ts (updated)
import {
  useFormValidation,
  ValidationRules,
} from "@/lib/hooks/useFormValidation";

// Staff Category Types
export type StaffCategory =
  | "DOCTOR"
  | "NURSE"
  | "RECEPTIONIST"
  | "TECHNICIAN"
  | "PHARMACIST"
  | "ADMIN"
  | "LAB_TECHNICIAN"
  | "WARD_BOY"
  | "CLEANING_STAFF"
  | "SECURITY";

export type StaffShift =
  | "MORNING"
  | "AFTERNOON"
  | "EVENING"
  | "NIGHT"
  | "ROTATING";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  skill: string;
  category: StaffCategory;
  experience?: string;
  salary: number;
  shift: StaffShift;
  gender: Gender;
  aadhaar: string;
  address: string;
  joiningDate?: string;
  staffCode?: string;
  department?: string;
  registrationNo?: string;
  roleBadge?: string;
  password?: string;
}

export interface StaffResponse {
  _id?: string;
  id?: string;
  userId?: string;
  skill: string;
  category: StaffCategory;
  experience?: string | number;
  salary: number;
  shift: StaffShift;
  gender: Gender;
  aadhaar: string;
  address: string;
  registrationNo?: string;
  department?: string;
  staffCode?: string;
  joiningDate?: string;
  roleBadge?: string;
  createdAt: string;
  updatedAt: string;
  // isActive can appear at top-level on detail endpoint
  isActive?: boolean;
  password?: string;
  user: {
    _id?: string;
    id?: string;
    email: string;
    phone?: string;
    password?: string;
    name: string;
    role?: string;
    isActive: boolean;
    isVerified?: boolean;
    lastLogin?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  // Derived fields added by service layer
  status?: "active" | "inactive" | "on_leave";
  name?: string;
  email?: string;
  phone?: string;
  lastLogin?: string | null;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  phone: string;
  skill: string;
  category: StaffCategory;
  experience?: number | string;
  salary: number;
  shift: StaffShift;
  gender: Gender;
  aadhaar: string;
  address: string;
  joiningDate?: string;
  staffCode?: string;
  department?: string;
  registrationNo?: string;
  roleBadge?: string;
  password?: string;
}

export const STAFF_VALIDATION_RULES: ValidationRules = {
  name: {
    required: "Staff name is required",
    minLength: {
      value: 2,
      message: "Staff name must be at least 2 characters",
    },
    maxLength: {
      value: 100,
      message: "Staff name cannot exceed 100 characters",
    },
    pattern: {
      value: /^[A-Za-z\s.'-]{2,100}$/,
      message:
        "Name can only contain letters, spaces, dots, apostrophes and hyphens",
    },
  },

  email: {
    required: "Email is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
      message: "Email is invalid",
    },
  },

  phone: {
    required: "Phone number is required",
    pattern: {
      value: /^[6-9]\d{9}$/,
      message:
        "Phone number must be a valid 10-digit Indian number starting with 6-9",
    },
  },

  skill: {
    required: "Skill/Specialization is required",
    minLength: {
      value: 2,
      message: "Skill must be at least 2 characters",
    },
    maxLength: {
      value: 100,
      message: "Skill cannot exceed 100 characters",
    },
  },

  category: {
    required: "Staff category is required",
    validate: (value: unknown) => {
      const validCategories: StaffCategory[] = [
        "DOCTOR",
        "NURSE",
        "RECEPTIONIST",
        "TECHNICIAN",
        "PHARMACIST",
        "ADMIN",
        "LAB_TECHNICIAN",
        "WARD_BOY",
        "CLEANING_STAFF",
        "SECURITY",
      ];
      return (
        (typeof value === "string" &&
          validCategories.includes(value as StaffCategory)) ||
        `Category must be one of: ${validCategories.join(", ")}`
      );
    },
  },

  experience: {
    validate: (value: unknown) => {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        return true; // Optional field
      }

      if (typeof value !== "string") return "Experience must be a string";

      // Pattern validation
      if (!/^\d+\s*(years?|yrs?|months?|mos?)?$/i.test(value)) {
        return "Experience must be in format like '3 years', '6 months', or '5'";
      }

      // Extract numeric value
      const match = value.match(/(\d+)/);
      if (!match) return "Invalid experience format";

      const years = parseInt(match[1], 10);
      if (years > 50) return "Experience cannot exceed 50 years";
      return true;
    },
  },

  salary: {
    required: "Salary is required",
    validate: (value: unknown) => {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) {
        return "Salary must be a positive number";
      }
      if (numValue > 500000) {
        return "Salary cannot exceed ₹5,00,000";
      }
      return true;
    },
  },

  shift: {
    required: "Shift is required",
    validate: (value: unknown) => {
      const validShifts: StaffShift[] = [
        "MORNING",
        "AFTERNOON",
        "EVENING",
        "NIGHT",
        "ROTATING",
      ];
      return (
        (typeof value === "string" &&
          validShifts.includes(value as StaffShift)) ||
        `Shift must be one of: ${validShifts.join(", ")}`
      );
    },
  },

  gender: {
    required: "Gender is required",
    validate: (value: unknown) => {
      const validGenders: Gender[] = ["MALE", "FEMALE", "OTHER"];
      return (
        (typeof value === "string" && validGenders.includes(value as Gender)) ||
        "Gender must be one of: MALE, FEMALE, OTHER"
      );
    },
  },

  aadhaar: {
    required: "Aadhaar number is required",
    pattern: {
      value: /^\d{12}$/,
      message: "Aadhaar number must be exactly 12 digits",
    },
  },

  address: {
    required: "Address is required",
    minLength: {
      value: 5,
      message: "Address must be at least 5 characters",
    },
    maxLength: {
      value: 255,
      message: "Address cannot exceed 255 characters",
    },
  },

  joiningDate: {
    validate: (value: unknown) => {
      if (!value) return true; // Optional field

      if (typeof value !== "string") return "Joining date must be a string";

      const date = new Date(value);
      const today = new Date();

      if (isNaN(date.getTime())) {
        return "Invalid date format";
      }

      if (date > today) {
        return "Joining date cannot be in the future";
      }

      // Check if date is not too far in the past (more than 50 years)
      const fiftyYearsAgo = new Date();
      fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);

      if (date < fiftyYearsAgo) {
        return "Joining date cannot be more than 50 years ago";
      }

      return true;
    },
  },

  staffCode: {
    pattern: {
      value: /^[A-Za-z0-9\-_]{3,20}$/,
      message:
        "Staff code must be 3-20 alphanumeric characters with hyphens or underscores",
    },
  },

  department: {
    minLength: {
      value: 2,
      message: "Department must be at least 2 characters",
    },
    maxLength: {
      value: 50,
      message: "Department cannot exceed 50 characters",
    },
  },

  registrationNo: {
    pattern: {
      value: /^[A-Za-z0-9\-_\/]{2,30}$/,
      message:
        "Registration number must be 2-30 alphanumeric characters with hyphens, underscores or slashes",
    },
  },

  roleBadge: {
    maxLength: {
      value: 50,
      message: "Role badge cannot exceed 50 characters",
    },
  },

  password: {
    pattern: {
      value:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message:
        "Password must be at least 8 characters with uppercase, lowercase, number and special character",
    },
    validate: (value: unknown) => {
      if (!value) return true; // Password is optional (can be auto-generated)

      if (typeof value !== "string") return "Password must be a string";

      if (value.length < 8) {
        return "Password must be at least 8 characters";
      }

      if (!/[A-Z]/.test(value)) {
        return "Password must contain at least one uppercase letter";
      }

      if (!/[a-z]/.test(value)) {
        return "Password must contain at least one lowercase letter";
      }

      if (!/\d/.test(value)) {
        return "Password must contain at least one number";
      }

      if (!/[@$!%*?&]/.test(value)) {
        return "Password must contain at least one special character (@$!%*?&)";
      }

      return true;
    },
  },
};

// Category-specific validation rules
export const STAFF_CATEGORY_SPECIFIC_RULES: Record<
  string,
  Partial<ValidationRules>
> = {
  DOCTOR: {
    registrationNo: {
      required: "Registration number is required for doctors",
      pattern: {
        value: /^[A-Z]{2}-[A-Z]{3}-\d{5}$/,
        message: "Doctor registration must be in format: ST-MED-12345",
      },
    },
    department: {
      required: "Department is required for doctors",
    },
  },

  NURSE: {
    registrationNo: {
      required: "Registration number is required for nurses",
      pattern: {
        value: /^RN-\d{4,6}$/,
        message: "Nurse registration must be in format: RN-1234",
      },
    },
    department: {
      required: "Department is required for nurses",
    },
  },

  PHARMACIST: {
    registrationNo: {
      required: "Registration number is required for pharmacists",
      pattern: {
        value: /^PH-\d{4,6}$/,
        message: "Pharmacist registration must be in format: PH-1234",
      },
    },
  },

  LAB_TECHNICIAN: {
    department: {
      required: "Department is required for lab technicians",
    },
  },
};

// Get validation rules based on staff category
export function getStaffValidationRules(
  category?: StaffCategory,
): ValidationRules {
  const baseRules = { ...STAFF_VALIDATION_RULES };

  if (category && STAFF_CATEGORY_SPECIFIC_RULES[category]) {
    const categoryRules = STAFF_CATEGORY_SPECIFIC_RULES[category];
    // Merge rules, with category-specific rules taking precedence
    const mergedRules = { ...baseRules };

    (
      Object.entries(categoryRules) as Array<
        [string, NonNullable<(typeof categoryRules)[string]>]
      >
    ).forEach(([key, rule]) => {
      if (mergedRules[key]) {
        // If base rule exists, merge with category rule
        mergedRules[key] = { ...mergedRules[key], ...rule };
      } else {
        mergedRules[key] = rule;
      }
    });

    return mergedRules;
  }

  return baseRules;
}

export function useStaffFormValidation(category?: StaffCategory) {
  const rules = getStaffValidationRules(category);
  return useFormValidation(rules);
}

// Utility functions
export function formatAadhaarNumber(aadhaar: string): string {
  const clean = aadhaar.replace(/[-\s]/g, "");
  if (clean.length !== 12) return aadhaar;
  return `${clean.substring(0, 4)}-${clean.substring(4, 8)}-${clean.substring(8, 12)}`;
}

export function parseExperience(experience: string | undefined): number {
  if (!experience) return 0;

  const match = experience.match(/(\d+)/);
  const years = match ? parseInt(match[1], 10) : 0;

  if (experience.toLowerCase().includes("month")) {
    return years / 12;
  }

  return years;
}
type StaffValidationRule = ValidationRules[string];

type TransformedStaffValidationRule = {
  required?: boolean | string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: StaffValidationRule["validate"];
};

export function transformValidation(rule: StaffValidationRule) {
  if (!rule) return {};

  const transformed: TransformedStaffValidationRule = {};

  if (rule.required) {
    transformed.required = rule.required;
  }

  if (rule.minLength) {
    transformed.minLength = rule.minLength.value;
  }

  if (rule.maxLength) {
    transformed.maxLength = rule.maxLength.value;
  }

  if (rule.pattern) {
    transformed.pattern = rule.pattern.value; // Just the RegExp, not an object
  }

  if (rule.validate) {
    transformed.validate = rule.validate;
  }

  return transformed;
}
