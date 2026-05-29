// lib/validations/SuperAdmin/clinic.ts
import {
  useFormValidation,
  ValidationRules,
} from "@/lib/hooks/useFormValidation";
import { clientApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export interface ClinicFormData {
  clinicName: string;
  type?: string;
  adminName: string;
  email: string;
  phone?: string;
  location: string;
  subscription?: string;
  subsValidity?: string;
  description?: string;
  website?: string;
  password?: string;
}

export interface ClinicResponse {
  id: string;
  _id?: string;
  clinicName: string;
  type: string;
  adminName: string;
  email: string;
  phone: string;
  location: string;
  subscription: string;
  subsValidity: string;
  status: "active" | "expiring" | "expired" | "inactive";
  description?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface ClinicFields extends ClinicResponse {
  beds?: number;
  doctors?: number;
  lastActive?: string;
}

export const CLINIC_VALIDATION_RULES: ValidationRules = {
  clinicName: {
    required: "Clinic name is required",
    minLength: {
      value: 3,
      message: "Clinic name must be at least 3 characters",
    },
  },
  adminName: {
    required: "Admin name is required",
    minLength: {
      value: 2,
      message: "Admin name must be at least 2 characters",
    },
  },
  email: {
    required: "Email is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
      message: "Email is invalid",
    },
  },
  location: {
    required: "Location is required",
    minLength: {
      value: 2,
      message: "Location must be at least 2 characters",
    },
  },
  subsValidity: {
    required: "Subscription validity is required",
  },
};

export function useClinicFormValidation() {
  return useFormValidation(CLINIC_VALIDATION_RULES);
}

interface CreateAdminPayload {
  email: string;
  role: string;
  name: string;
  clinicName: string;
  location: string;
  subsValidity: string;
  password?: string;
}

export function useAddClinic(options?: {
  onSuccess?: (data: ClinicResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<ClinicResponse, Error, ClinicFormData>({
    mutationFn: async (formData: ClinicFormData) => {
      const payload: CreateAdminPayload = {
        email: formData.email.trim(),
        role: "ADMIN",
        name: formData.adminName.trim(),
        clinicName: formData.clinicName.trim(),
        location: formData.location.trim(),
        subsValidity: formData.subsValidity || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        password: formData.password || "raunak07",
      };

      const response = await clientApi.post<{success: boolean, message: string, data?: ClinicResponse}>("/admins/create-admin", payload);

      const resData = response as { success?: boolean, message?: string, data?: { success?: boolean, message?: string, data?: ClinicResponse } };

      if (!response.success && !resData.data?.success) {
        throw new Error(response.message || resData.data?.message || "Failed to create clinic");
      }

      return resData.data?.data || response.data;
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export function useUpdateClinic(options?: {
  onSuccess?: (data: ClinicResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<ClinicResponse, Error, { id: string } & ClinicFormData>({
    mutationFn: async ({ id, ...formData }) => {
      const payload = {
        adminName: formData.adminName.trim(),
        subsValidity: formData.subsValidity,
        isActive: true,
      };

      const response = await clientApi.put<{success: boolean, message: string, data?: ClinicResponse}>(`/admins/update/${id}`, payload);

      const resData = response as { success?: boolean, message?: string, data?: { success?: boolean, message?: string, data?: ClinicResponse } };

      if (!response.success && !resData.data?.success) {
        throw new Error(response.message || resData.data?.message || "Failed to update clinic");
      }

      return resData.data?.data || response.data;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export function useDeleteClinic(options?: {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<unknown, Error, string>({
    mutationFn: async (id: string) => {
      const payload = {
        isActive: false,
      };

      const response = await clientApi.put<{success: boolean, message: string}>(`/admins/status/${id}`, payload);

      const resData = response as { success?: boolean, message?: string, data?: { success?: boolean, message?: string } };

      if (!response.success && !resData.data?.success) {
        throw new Error(response.message || resData.data?.message || "Failed to disable clinic");
      }

      return response;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

