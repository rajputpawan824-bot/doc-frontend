import {
  useFormValidation,
  ValidationRules,
} from "@/lib/hooks/useFormValidation";
import { clientApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/types/types";

export interface LoginCredentials {
  email: string;
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

export function useLoginMutation(options?: {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      const response: ApiResponse<{ data: LoginResponse }> =
        await clientApi.post("/super-admin/login", {
          email: credentials.email.trim(),
          password: credentials.password,
        });

      if (!response.success || !response.data) {
        throw new Error(
          typeof response.error === "string"
            ? response.error
            : response.error?.message || "Login failed",
        );
      }

      const { token, user } = response.data.data;

      if (!token) {
        throw new Error("Invalid response: missing access token");
      }

      return { token, user };
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
