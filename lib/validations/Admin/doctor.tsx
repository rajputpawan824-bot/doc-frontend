// lib/validations/Doctor/doctor.ts
import {
  useFormValidation,
  ValidationRules,
} from "@/lib/hooks/useFormValidation";

export interface DoctorFormData {
  name: string;
  email: string;
  phone: string;
  qualification: string;
  registrationNo: string;
  salary: number;
  shift: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT"|"ROTATIONAL";
  gender: "MALE" | "FEMALE" | "OTHERS";
  department: string;
  aadhaar: string;
  address: string;
  experience: number;
  joiningDate: string;
  doctorCode: string;
  consultationFee: number;
  availabilityDays: string[];
  workingHours: {
    start: string;
    end: string;
  };
  password?: string;
}

export interface DoctorResponse {
  id: string;
  userId: string;
  qualification: string;
  registrationNo: string;
experience: number;
  salary: number;
  shift: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT"|"ROTATIONAL";
  gender: "MALE" | "FEMALE" | "OTHERS";
  department: string;
  aadhaar: string;
  address: string;
  doctorCode: string;
joiningDate: string;
  consultationFee: number;
  availabilityDays: string[];
  documentUrl: string[];
  createdAt: string;
  updatedAt: string;
  workingHours?: {
  start?: string;
  end?: string;
};
  user: {
    id: string;
    email: string;
    phone: string;
    password: string;
    name: string;
    role: "DOCTOR";
    isActive: boolean;
    isVerified: boolean;
    resetToken: string | null;
    resetTokenExp: string | null;
    otpCode: string | null;
    otpExpiry: string | null;
    lastLogin: string | null;
    createdAt: string;
    updatedAt: string;
 
  };
  // Add status field derived from user.isActive
  status?: "active" | "inactive" | "on_leave";
}

export const DOCTOR_VALIDATION_RULES: ValidationRules = {
  password: {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
  },
  name: {
    required: "Doctor name is required",
    minLength: {
      value: 2,
      message: "Doctor name must be at least 2 characters",
    },
    pattern: {
      value: /^[A-Za-z\s.]{2,50}$/,
      message: "Name can only contain letters, spaces, and dots",
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
  qualification: {
    required: "Qualification is required",
    minLength: {
      value: 3,
      message: "Qualification must be at least 3 characters",
    },
  },

  salary: {
    required: "Salary is required",
    validate: (value: unknown) => {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) {
        return "Salary must be a positive number";
      }

      return true;
    },
  },
  shift: {
    required: "Shift is required",
    validate: (value: unknown) =>
      (typeof value === "string" &&
        ["MORNING", "AFTERNOON", "EVENING", "NIGHT","ROTATIONAL"].includes(value)) ||
      "Shift must be one of: MORNING, AFTERNOON, EVENING, NIGHT,ROTATIONAL"
  },
  gender: {
    required: "Gender is required",
    validate: (value: unknown) =>
      (typeof value === "string" &&
        ["MALE", "FEMALE", "OTHERS"].includes(value)) ||
      "Gender must be one of: MALE, FEMALE, OTHER",
  },
department: {
  required: "Department is required",
  pattern: {
    value: /^[A-Za-z\s&-]+$/,
    message: "Department can only contain letters, spaces, '&' and '-'",
  },
  minLength: {
    value: 2,
    message: "Department must be at least 2 characters",
  },
},
  aadhaar: {
    required: "Aadhaar number is required",
    pattern: {
      value: /^\d{4}[-\s]?\d{4}[-\s]?\d{4}$/,
      message: "Aadhaar number must be 12 digits (XXXX-XXXX-XXXX format)",
    },
  },
  address: {
    required: "Address is required",
    minLength: {
      value: 10,
      message: "Address must be at least 10 characters",
    },
    maxLength: {
      value: 200,
      message: "Address cannot exceed 200 characters",
    },
  },
experience: {
  required: "Experience is required",
  validate: (value: unknown) => {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      return "Experience must be a valid number";
    }
    return true;
  },
},
  consultationFee: {
    required: "Consultation fee is required",
    validate: (value: unknown) => {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) {
        return "Consultation fee must be a positive number";
      }
      if (numValue > 10000) {
        return "Consultation fee cannot exceed 10,000";
      }
      return true;
    },
  },
availabilityDays: {
  required: "Availability days are required",
  validate: (value: unknown) => {
    if (!Array.isArray(value)) {
      return "Availability days must be an array";
    }
    if (value.length === 0) {
      return "At least one availability day is required";
    }

    return true;
  },
},
};
      
export function useDoctorFormValidation() {
  return useFormValidation(DOCTOR_VALIDATION_RULES);
}


export interface CreateDoctorPayload {
  name: string;
  email: string;
  phone: string;
  qualification: string;
  registrationNo: string;
  salary: number;
  shift: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT"|"ROTATIONAL";
  gender: "MALE" | "FEMALE" | "OTHERS";
  department: string;
  aadhaar: string;
  address: string;
   doctorCode: string;      
  joiningDate: string; 
  experience: number;
  consultationFee: number;
  availabilityDays: string[];
  password?: string;
  workingHours: {
  start: string;
  end: string;
};
}

export function formatAadhaarNumber(value: unknown): string {
  const aadhaar = String(value ?? "");

  const clean = aadhaar.replace(/[-\s]/g, "");

  if (clean.length !== 12) {
    return aadhaar;
  }

  return `${clean.substring(0, 4)}-${clean.substring(
    4,
    8
  )}-${clean.substring(8, 12)}`;
}

// Utility function to calculate years of experience
export function parseExperience(experience: string): number {
  const match = experience.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
