"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api";
import type { ApiResponse } from "@/lib/types/types";
import type {
  DoctorResponse,
  DoctorFormData,
  CreateDoctorPayload,
  // UpdateDoctorPayload,
} from "@/lib/validations/Admin/doctor";

type DoctorAvailability = string | string[];
type DoctorMeta = { page?: number; limit?: number; total?: number; totalPages?: number };

type DoctorApiRecord = Omit<DoctorResponse, "availabilityDays"> & {
  _id?: string;
  id: string;
  availabilityDays: DoctorAvailability;
};

export interface DoctorDashboardStats {
  totalDoctors: number;
  activeDoctors: number;
  onLeaveDoctors: number;
  averageConsultationFee: number;
}

type CreateDoctorRequest = Omit<CreateDoctorPayload, "availabilityDays"> & {
  availabilityDays: string[];
};

type UpdateDoctorRequest = Partial<Omit<DoctorFormData, "availabilityDays">> & {
  availabilityDays?: DoctorAvailability;
};

function getErrorMessage(
  error: ApiResponse["error"],
  fallback: string,
): string {
  if (typeof error === "string") return error;
  return error?.message || fallback;
}

function normalizeDoctor(doctor: DoctorApiRecord): DoctorResponse {
  return {
    ...doctor,
    id: doctor._id || doctor.id,
    status: doctor.user?.isActive ? "active" : "inactive",
    availabilityDays: Array.isArray(doctor.availabilityDays)
      ? doctor.availabilityDays.join(", ")
      : doctor.availabilityDays,
  };
}

export function useAddDoctor(options?: {
  onSuccess?: (data: DoctorResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<DoctorResponse, Error, DoctorFormData>({
    mutationFn: async (formData: DoctorFormData) => {
      const payload: CreateDoctorRequest = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        qualification: formData.qualification.trim(),
        registrationNo: formData.registrationNo.trim(),
        salary: Number(formData.salary),
        shift: formData.shift,
        gender: formData.gender,
        department: formData.department.trim(),
        aadhaar: formData.aadhaar.replace(/[-\s]/g, ""), // Remove hyphens/spaces
        address: formData.address.trim(),
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee),
        availabilityDays: formData.availabilityDays.split(",").map(d => d.trim().toUpperCase()),
        password: formData.password,
       workingHours: {
  start: formData.workingHours.start,
  end: formData.workingHours.end,
}
        
      };

      const response: ApiResponse<{ data: DoctorResponse }> =
        await clientApi.post("/doctors/create-doctor", payload);

      if (!response.success || !response.data) {
        throw new Error(
          getErrorMessage(response.error, "Failed to create doctor"),
        );
      }

      return response.data.data;
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export const useDoctorById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Doctor ID is required");
      }

      const response: ApiResponse<{ data: DoctorApiRecord }> =
        await clientApi.get(`/doctors/${id}`);

      if (!response.success || !response.data) {
        throw new Error(
          getErrorMessage(response.error, "Failed to fetch doctor details"),
        );
      }

      const doctor = normalizeDoctor(response.data.data);

      return {
        ...doctor,
        name: doctor.user?.name,
        email: doctor.user?.email,
        phone: doctor.user?.phone,
      };
    },
    retry: 2,
    retryDelay: 1000,
    enabled: !!id,
  });
};

export const useDoctors = (params: { status?: string, page?: number, limit?: number } = {}) => {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: async () => {
      const response: ApiResponse<{ data: DoctorApiRecord[], meta: DoctorMeta }> =
        await clientApi.get("/doctors/all-doctors", { params });

      if (!response.success) {
        throw new Error(
          getErrorMessage(response.error, "Failed to fetch doctors"),
        );
      }

      if (!response.data) {
        throw new Error("No data received from server");
      }

      // Transform the API response
      const doctors = response.data.data.map(
        (doctor): DoctorResponse => normalizeDoctor(doctor),
      );

      return {
        data: doctors,
        meta: response.data.meta,
      };
    },
    // initialData removed as we now support params
    retry: 2,
    retryDelay: 1000,
  });
};

export const useInactiveDoctors = (params: { page?: number, limit?: number } = {}) => {
  return useQuery({
    queryKey: ["doctors", "inactive", params],
    queryFn: async () => {
      const response: ApiResponse<{ data: DoctorApiRecord[], meta: DoctorMeta }> =
        await clientApi.get("/doctors/inactive-doctors", { params });

      if (!response.success || !response.data) {
        throw new Error(getErrorMessage(response.error, "Failed to fetch inactive doctors"));
      }

      return {
        data: response.data.data.map((doctor) => ({
          ...normalizeDoctor(doctor),
          status: "inactive" as const,
        })),
        meta: response.data.meta,
      };
    },
    retry: 2,
  });
};

export const useActiveDoctors = (params: { page?: number, limit?: number } = {}) => {
  return useQuery({
    queryKey: ["doctors", "active", params],
    queryFn: async () => {
      const response: ApiResponse<{ data: DoctorApiRecord[], meta: DoctorMeta }> =
        await clientApi.get("/doctors/active-doctors", { params });

      if (!response.success || !response.data) {
        throw new Error(getErrorMessage(response.error, "Failed to fetch active doctors"));
      }

      return {
        data: response.data.data.map((doctor) => ({
          ...normalizeDoctor(doctor),
          status: "active" as const,
        })),
        meta: response.data.meta,
      };
    },
    retry: 2,
  });
};

// Add this to your validation file
export function useUpdateDoctor(options?: {
  onSuccess?: (data: DoctorResponse) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    DoctorResponse,
    Error,
    { id: string; data: Partial<DoctorFormData> }
  >({
    mutationFn: async ({ id, data }) => {
      const payload: UpdateDoctorRequest = {
        ...data,
      };
      
      if (typeof payload.availabilityDays === "string") {
        payload.availabilityDays = payload.availabilityDays.split(",").map((d: string) => d.trim().toUpperCase());
      }
      
      const response: ApiResponse<{ data: DoctorResponse }> =
        await clientApi.put(`/doctors/update/${id}`, payload);

      if (!response.success || !response.data) {
        throw new Error(
          getErrorMessage(response.error, "Failed to update doctor"),
        );
      }

      return response.data.data;
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor", data.id] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

// In your doctor.ts validation file
type UpdateDoctorStatusPayload = {
  id: string;
  isActive: boolean;
};

export function useUpdateDoctorDisable(options?: {
  onSuccess?: (data: DoctorResponse) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<DoctorResponse, Error, UpdateDoctorStatusPayload>({
    mutationFn: async ({ id, isActive }) => {
      const response: ApiResponse<{ data: DoctorResponse }> =
        await clientApi.put(`/doctors/${id}/disable`, {
          isActive,
        });

      if (!response.success || !response.data) {
        throw new Error(
          getErrorMessage(response.error, "Failed to update doctor"),
        );
      }

      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor", data.id] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

export function useUpdateDoctorPassword() {
  const queryClient = useQueryClient();

  return useMutation<
    DoctorResponse,
    Error,
    { id: string; data: { newPassword: string } }
  >({
    mutationFn: async ({ id, data }) => {
      const response: ApiResponse<{ data: DoctorResponse }> =
        await clientApi.put(`/doctors/${id}/password`, data);

      if (!response.success) {
        throw new Error(
          getErrorMessage(response.error, "Failed to update password"),
        );
      }
      return response.data?.data as DoctorResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["doctor", data.id] });
    },
  });
}

export const useDoctorDashboardStats = () => {
  return useQuery({
    queryKey: ["doctors", "dashboard-stats"],
    queryFn: async (): Promise<DoctorDashboardStats> => {
      const response: ApiResponse<{ data: DoctorDashboardStats }> =
        await clientApi.get("/doctors/dashboard-stats");

      if (!response.success || !response.data) {
        throw new Error(
          getErrorMessage(response.error, "Failed to fetch dashboard stats"),
        );
      }

      return response.data.data;
    },
    retry: 2,
    retryDelay: 1000,
  });
};
