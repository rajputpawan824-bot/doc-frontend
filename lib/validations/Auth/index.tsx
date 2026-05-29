import {
  useFormValidation,
  ValidationRules,
} from "@/lib/hooks/useFormValidation";


export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}


export function useLoginValidation() {
  return useFormValidation(LOGIN_VALIDATION_RULES);
}

export const LOGIN_VALIDATION_RULES: ValidationRules = {
  username: {
    required: "Username is required",
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
  },
};
