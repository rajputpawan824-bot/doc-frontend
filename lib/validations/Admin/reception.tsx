// ============================================================
// FILE: @/lib/validations/Admin/reception.ts
// ============================================================

import {
  useFormValidation,
  ValidationRules,
} from "@/lib/hooks/useFormValidation";

export interface ReceptionFormData {
  name: string;
  email: string;
  phone: string;
  experience: number | string;
  salary: number;
  shift: "MORNING" | "EVENING" | "NIGHT"| "AFTERNOON"|"ROTATIONAL";
  gender: "MALE" | "FEMALE" | "OTHERS";
  aadhaar: string;
  address: string;
  deskNumber: string;
  password?: string;
  caneditPatient?: boolean;  
    receptionistCode: string;
  registrationNo?: string;

  joiningDate: string;

workingHours: {
  start: string;
  end: string;
};

documents?: File[];

}

export interface ReceptionDocument {
  fileName: string;
  originalName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedAt?: string;
}

export interface ReceptionResponse {
  id: string;
  userId: string;
  experience: string;
  salary: number;
  shift: "MORNING" | "EVENING" | "NIGHT" | "AFTERNOON"|"ROTATIONAL";
  name: string;
  phoneNumber: string;
  email: string
  gender: "MALE" | "FEMALE" | "OTHERS";
  aadhaar: string;
  address: string;
  deskNumber: string;
  receptionistCode: string;

registrationNo?: string;

joiningDate: string;

workingHours: {
  start: string;
  end: string;
};
  documents?: ReceptionDocument[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    phone: string;
    password: string;
    name: string;
    role: "RECEPTIONIST";
    isActive: boolean;
    isVerified: boolean;
    resetToken: string | null;
    resetTokenExp: string | null;
    otpCode: string | null;
    otpExpiry: string | null;
    lastLogin: string | null;
    createdAt: string;
    updatedAt: string;
    canEditPatient?: string; // API returns string
    canEditPatients?: string; // API returns string
  };
  password: string;
}

export type ReceptionFields = ReceptionResponse;

export const RECEPTION_VALIDATION_RULES: ValidationRules = {
  name: {
    required: "Name is required",
    minLength: {
      value: 2,
      message: "Name must be at least 2 characters",
    },
    maxLength: {
      value: 100,
      message: "Name must be less than 100 characters",
    },
    pattern: {
      value: /^[a-zA-Z\s]+$/,
      message: "Name can only contain letters and spaces",
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
    required: "Phone is required",
    pattern: {
      value: /^[6-9]\d{9}$/,
      message:
        "Indian phone number is invalid (must start with 6-9 and be 10 digits)",
    },
  },
  experience: {
    required: "Experience is required",
    validate: (value: unknown) => {
      const numValue = Number(value);
      if (value === "" || value === null || value === undefined) {
        return "Experience is required";
      }
      if (Number.isNaN(numValue) || numValue < 0) {
        return "Experience must be 0 or more years";
      }
      if (numValue > 50) {
        return "Experience cannot exceed 50 years";
      }
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

      return true;
    },
  },
  shift: {
    required: "Shift is required",
    validate: (value: unknown) =>
      (typeof value === "string" &&
        ["MORNING", "EVENING", "NIGHT","AFTERNOON","ROTATIONAL"].includes(value)) ||
      "Invalid shift selection",
  },
  gender: {
    required: "Gender is required",
    validate: (value: unknown) =>
      (typeof value === "string" &&
        ["MALE", "FEMALE", "OTHERS"].includes(value)) ||
      "Invalid gender selection",
  },
  aadhaar: {
    required: "Aadhaar number is required",
    pattern: {
      value: /^\d{12}$/,
      message: "Aadhaar must be 12 digits",
    },
  },
  address: {
    required: "Address is required",

  },
  deskNumber: {
    minLength: {
      value: 2,
      message: "Desk number must be at least 2 characters",
    },
    maxLength: {
      value: 20,
      message: "Desk number must be less than 20 characters",
    },
  },
registrationNo: {
  maxLength: {
    value: 50,
    message: "Registration number must be less than 50 characters",
  },
},

joiningDate: {
  required: "Joining date is required",
},

workingHourStart: {
  required: "Working hour start is required",
},

workingHourEnd: {
  required: "Working hour end is required",
},
  password: {
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
    maxLength: {
      value: 50,
      message: "Password must be less than 50 characters",
    },
  },
};

export function useReceptionFormValidation() {
  return useFormValidation(RECEPTION_VALIDATION_RULES);
}

export interface CreateReceptionPayload {
  name: string;
  email: string;
  phone: string;
  experience: number | string;
  salary: number;
  shift: "MORNING" | "EVENING" | "NIGHT"|"AFTERNOON"|"ROTATIONAL";
  gender: "MALE" | "FEMALE" | "OTHERS";
  aadhaar: string;
  address: string;
 deskNumber: string;
 receptionistCode: string;

registrationNo?: string;

joiningDate: string;

workingHours: {
  start: string;
  end: string;
};

password?: string;
  caneditPatient?: boolean;
}

export enum Shift {
  MORNING = "MORNING",
  EVENING = "EVENING",
  NIGHT = "NIGHT",
  AFTERNOON = "AFTERNOON",
 ROTATIONAL= "ROTATIONAL"
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHERS = "OTHERS",
}

// Helper function to convert string to boolean
export const stringToBoolean = (
  value: string | undefined | boolean,
): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lowerValue = value.toLowerCase().trim();
    return lowerValue === "true" || lowerValue === "1" || lowerValue === "yes";
  }
  return false;
};

// Helper function to get canEditPatient status (checks both fields)
export const getCanEditPatientStatus = (
  receptionist: Receptionist | undefined,
): boolean => {
  if (!receptionist) return false;
  // Check canEditPatient first, then fall back to canEditPatients
  const value = receptionist.canEditPatient ?? receptionist.canEditPatients;
  return stringToBoolean(value);
};

// Update the Receptionist interface to match API response
export interface Receptionist {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  experience: string;
  previousExperience: string;
  salary: number;
  shift: Shift;
  email: string;
  password?: string;
  gender: Gender;
  aadhaar: string; // Changed from 'adhar' to match API
  address: string;
  deskNumber?: string;
  receptionistCode?: string;

registrationNo?: string;

joiningDate?: string;

workingHours?: {
  start: string;
  end: string;
};
  documents?: ReceptionDocument[];
  isActive: boolean;
  canEditPatient: string | boolean | undefined; // Can be string, boolean, or undefined from API
  canEditPatients?: string | boolean | undefined; // Can be string, boolean, or undefined from API
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    phone: string;
    name: string;
    role: string;
    isActive: boolean;
    canEditPatient?: string | boolean | undefined;
    canEditPatients?: string | boolean | undefined;
  };
}
