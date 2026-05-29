// lib/validations/Profile/profile.ts
import {
  useFormValidation,
  ValidationRules,
} from "@/lib/hooks/useFormValidation";

// Profile Form Data (for editing profile)
export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Clinic Information
export interface ClinicInfo {
  id: string;
  clinicName: string;
  location: string;
  subsValidity: string; // ISO date string
}

// Profile Response Type
export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "PHARMACIST" | "LAB_TECHNICIAN";
  isActive: boolean;
  lastLogin: string; // ISO date string
  createdAt: string; // ISO date string
  clinic: ClinicInfo;
}

// Password change specific interface
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Profile validation rules
export const PROFILE_VALIDATION_RULES: ValidationRules = {
  name: {
    required: "Full name is required",
    minLength: {
      value: 2,
      message: "Name must be at least 2 characters",
    },
    maxLength: {
      value: 100,
      message: "Name cannot exceed 100 characters",
    },
    pattern: {
      value: /^[A-Za-z\s.'-]{2,100}$/,
      message:
        "Name can only contain letters, spaces, hyphens, apostrophes, and dots",
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
      message: "Phone number must be a valid 10-digit Indian number",
    },
  },
};

// Password validation rules (for change password)
export const PASSWORD_VALIDATION_RULES: ValidationRules = {
  currentPassword: {
    required: "Current password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
  },
  newPassword: {
    required: "New password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
    pattern: {
      value:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      message:
        "Password must contain at least one uppercase, one lowercase, one number and one special character",
    },
  },
  confirmPassword: {
    required: "Please confirm your password",
    // Note: Password matching validation needs to be done at form level or in a custom validation hook
    // as validate function only gets the field value, not the entire form data
  },
};

// Combined validation for profile update
export const PROFILE_UPDATE_VALIDATION_RULES: ValidationRules = {
  name: {
    required: "Full name is required",
    minLength: {
      value: 2,
      message: "Name must be at least 2 characters",
    },
    maxLength: {
      value: 100,
      message: "Name cannot exceed 100 characters",
    },
    pattern: {
      value: /^[A-Za-z\s.'-]{2,100}$/,
      message:
        "Name can only contain letters, spaces, hyphens, apostrophes, and dots",
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
      message: "Phone number must be a valid 10-digit Indian number",
    },
  },
  currentPassword: {
    // Current password is optional unless changing password
    validate: (value: unknown) => {
      if (typeof value === 'string' && value.trim()) {
        if (value.length < 6) {
          return "Current password must be at least 6 characters";
        }
      }
      return true;
    },
  },
  newPassword: {
    // New password is optional
    validate: (value: unknown) => {
      if (typeof value === 'string' && value.trim()) {
        if (value.length < 6) {
          return "Password must be at least 6 characters";
        }
        
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(value)) {
          return "Password must contain at least one uppercase, one lowercase, one number and one special character";
        }
      }
      return true;
    },
  },
  confirmPassword: {
    // Confirm password is optional unless new password is provided
    validate: () => {
      // This validation would need access to newPassword field, which isn't available here
      // We'll handle this in a custom validation hook instead
      return true;
    },
  },
};

// Hooks
export function useProfileFormValidation() {
  return useFormValidation(PROFILE_VALIDATION_RULES);
}

export function usePasswordFormValidation() {
  return useFormValidation(PASSWORD_VALIDATION_RULES);
}

export function useProfileUpdateValidation() {
  return useFormValidation(PROFILE_UPDATE_VALIDATION_RULES);
}

// API Mutations
export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone: string;
  currentPassword?: string;
  newPassword?: string;
}

// Utility functions
export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatSubscriptionDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(date.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (date > now) {
    return `Expires in ${diffDays} days`;
  } else {
    return `Expired ${diffDays} days ago`;
  }
}

export function isSubscriptionValid(dateString: string): boolean {
  const expiryDate = new Date(dateString);
  const now = new Date();
  return expiryDate > now;
}

// Role display names
export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  ADMIN: "Admin",
  DOCTOR: "Doctor",
  RECEPTIONIST: "Receptionist",
  PHARMACIST: "Pharmacist",
  LAB_TECHNICIAN: "Lab Technician",
};

export function getRoleDisplayName(role: string): string {
  return ROLE_DISPLAY_NAMES[role] || role;
}
