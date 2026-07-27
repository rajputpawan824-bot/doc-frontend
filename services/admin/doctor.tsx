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
type DoctorMeta = {
  page?: number;
  currentPage?: number;
  limit?: number;
  total?: number;
  totalRecords?: number;
  totalPages?: number;
};

type DoctorApiRecord = Omit<DoctorResponse, "availabilityDays"> & {
  _id?: string;
  id: string;
  availabilityDays: DoctorAvailability;
};

export interface DoctorDashboardStats {
  totalDoctors: number;
  activeDoctors: number;
    inactiveDoctors: number;
  onLeaveDoctors: number;
  averageConsultationFee: number;
}

type CreateDoctorRequest = Omit<CreateDoctorPayload, "availabilityDays"> & {
  availabilityDays: string[];
};

type UpdateDoctorRequest = Partial<Omit<DoctorFormData, "availabilityDays" | "documents">> & {
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
 documents: Array.isArray(doctor.documents)
  ? doctor.documents
  : [],
    status: doctor.user?.isActive ? "active" : "inactive",
    availabilityDays:
      Array.isArray(doctor.availabilityDays)
        ? doctor.availabilityDays
        : typeof doctor.availabilityDays === "string"
        ? doctor.availabilityDays.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
        : [],
  };
}

export interface OnLeaveDoctor {
  _id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  status: string;
  reason: string;
  isPaid: boolean;

  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
  };
}

export function useAddDoctor(options?: {
  onSuccess?: (data: DoctorResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<DoctorResponse, Error, DoctorFormData>({
    mutationFn: async (formData: DoctorFormData) => {
      const payload = new FormData();

      payload.append("name", formData.name.trim());
      payload.append("email", formData.email.trim().toLowerCase());
      payload.append("phone", formData.phone.trim());
      payload.append("qualification", formData.qualification.trim());
      payload.append("registrationNo", formData.registrationNo.trim());
      payload.append("salary", String(Number(formData.salary)));
      payload.append("shift", formData.shift);
      payload.append("gender", formData.gender);
      payload.append("joiningDate", formData.joiningDate);
      payload.append("doctorCode", formData.doctorCode);
      payload.append("department", formData.department.trim());
      payload.append("aadhaar", formData.aadhaar.replace(/[-\s]/g, ""));
      payload.append("address", formData.address.trim());
      payload.append("experience", String(Number(formData.experience)));
      payload.append("consultationFee", String(Number(formData.consultationFee)));

      formData.availabilityDays.forEach((day) => {
        payload.append("availabilityDays", day.toUpperCase());
      });

      if (formData.password) {
        payload.append("password", formData.password);
      }

      payload.append("workingHours[start]", formData.workingHours.start);
      payload.append("workingHours[end]", formData.workingHours.end);

const documentTypes: string[] = [];
const customDocumentNames: string[] = [];

formData.documents?.forEach((doc) => {
  payload.append("files", doc.file);

  documentTypes.push(doc.documentType);

  customDocumentNames.push(
    doc.customDocumentName || ""
  );
});

payload.append(
  "documentTypes",
  JSON.stringify(documentTypes)
);

payload.append(
  "customDocumentNames",
  JSON.stringify(customDocumentNames)
);

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
      console.log("FETCHING DOCTOR DETAILS", id);

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

export const useDoctors = (
  params: { status?: string; page?: number; limit?: number; search?: string } = {},
) => {
  const { status, page = 1, limit = 10, search = "" } = params;

  return useQuery({
    queryKey: ["doctors", status, page, limit, search],
    queryFn: async () => {
      const response: ApiResponse<{
        data: DoctorApiRecord[];
        meta?: DoctorMeta;
        pagination?: DoctorMeta;
        currentPage?: number;
        totalPages?: number;
      }> = await clientApi.get("/doctors/all-doctors", {
        params: { status, page, limit, search },
      });

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
        pagination: response.data.pagination ?? response.data.meta ?? {
          page: response.data.currentPage ?? page,
          limit,
          totalRecords: doctors.length,
          totalPages: response.data.totalPages ?? 1,
        },
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
      const payload = new FormData();

      if (data.name !== undefined) payload.append("name", data.name.trim());
      if (data.email !== undefined) payload.append("email", data.email.trim().toLowerCase());
      if (data.phone !== undefined) payload.append("phone", data.phone.trim());
      if (data.qualification !== undefined) payload.append("qualification", data.qualification.trim());
      if (data.registrationNo !== undefined) payload.append("registrationNo", data.registrationNo.trim());
      if (data.salary !== undefined) payload.append("salary", String(Number(data.salary)));
      if (data.shift !== undefined) payload.append("shift", data.shift);
      if (data.gender !== undefined) payload.append("gender", data.gender);
      if (data.joiningDate !== undefined) payload.append("joiningDate", data.joiningDate);
      if (data.doctorCode !== undefined) payload.append("doctorCode", data.doctorCode);
      if (data.department !== undefined) payload.append("department", data.department.trim());
      if (data.aadhaar !== undefined) payload.append("aadhaar", data.aadhaar.replace(/[-\s]/g, ""));
      if (data.address !== undefined) payload.append("address", data.address.trim());
      if (data.experience !== undefined) payload.append("experience", String(Number(data.experience)));
      if (data.consultationFee !== undefined) payload.append("consultationFee", String(Number(data.consultationFee)));

      if (Array.isArray(data.availabilityDays)) {
        data.availabilityDays.forEach((day) => {
          payload.append("availabilityDays", day.toUpperCase());
        });
      }

      if (data.workingHours?.start !== undefined) {
        payload.append("workingHours[start]", data.workingHours.start);
      }

      if (data.workingHours?.end !== undefined) {
        payload.append("workingHours[end]", data.workingHours.end);
      }
if (data.profileImage) {
  payload.append(
    "profileImage",
    data.profileImage
  );
}
const documentTypes: string[] = [];
const customDocumentNames: string[] = [];

(data.documents || []).forEach((doc: any) => {
  if (doc.file instanceof File) {
    payload.append("documents", doc.file);

    documentTypes.push(doc.documentType);

    customDocumentNames.push(
      doc.customDocumentName || ""
    );
  }
});

if (documentTypes.length > 0) {
  payload.append(
    "documentTypes",
    JSON.stringify(documentTypes)
  );

  payload.append(
    "customDocumentNames",
    JSON.stringify(customDocumentNames)
  );
} 
if (data.deletedDocumentIds?.length) {
  payload.append(
    "deletedDocuments",
    JSON.stringify(data.deletedDocumentIds)
  );
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
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
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


export const useOnLeaveDoctors = () => {
  return useQuery({
    queryKey: ["doctors", "on-leave"],
    queryFn: async (): Promise<OnLeaveDoctor[]> => {
      const response: ApiResponse<{ data: OnLeaveDoctor[] }> =
        await clientApi.get("/doctors/on-leave");

      if (!response.success || !response.data) {
        throw new Error(
          getErrorMessage(response.error, "Failed to fetch doctors on leave")
        );
      }

      return response.data.data;
    },
    retry: 2,
    retryDelay: 1000,
  });
};


export const useDoctorNextCode = () => {
  return useQuery({
    queryKey: ["doctor-next-code"],
    queryFn: async () => {
      const response = await clientApi.get<{
        data: {
          doctorCode: string;
        };
      }>("/doctors/next-code");

      if (!response.success || !response.data) {
        throw new Error(
           "Failed to fetch doctors code"
        );
      }

      return response.data.data.doctorCode;
    },
    staleTime: 0,
  });
};
