"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api";
import type { ApiResponse } from "@/lib/api";
import type { Patient } from "@/app/admin/(protected)/patient/page";

type PaginationMeta = {
  page?: number;
  currentPage?: number;
  limit?: number;
  total?: number;
  totalRecords?: number;
  totalPages?: number;
};

type RawPatient = Partial<Patient> & {
  _id?: string;
  id?: string;
  user?: {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  phone?: string;
  phoneNumber?: string;
  aadhaar?: string;
  adhar?: string;
  relation?: string;
  otherRelation?: string;
  diseases?: string | string[];
  allergies?: string[] | string;
  medicalHistory?: string;
  isActive?: boolean;
  dateOfBirth?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type RawPatientListResponse =
  | RawPatient[]
  | {
      data?: RawPatient[];
      patients?: RawPatient[];
      result?: RawPatient[];
      pagination?: PaginationMeta;
      meta?: PaginationMeta;
      currentPage?: number;
      totalPages?: number;
    };

type RawPatientResponse =
  | RawPatient
  | {
      data?: RawPatient;
      patient?: RawPatient;
    };

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export type PatientCreateData = Partial<Patient> & {
  relation?: string;
  otherRelation?: string;
  diseases?: string | string[];
  allergies?: string[] | string;
  medicalHistory?: string;
};

export interface PatientCreatePayload {
  name: string;
  phone: string;
  age?: number;
  gender?: Patient["gender"];
  bloodGroup?: Patient["bloodGroup"];
  relation?: string;
  otherRelation?: string;
  diseases?: string | string[];
  allergies?: string[] | string;
  medicalHistory?: string;
}

type PatientStatusPayload = {
  id: string;
  isActive: boolean;
};

function getRawPatientList(response: RawPatientListResponse | undefined) {
  if (Array.isArray(response)) return response;
  return response?.data ?? response?.patients ?? response?.result ?? [];
}

function getPaginationMeta(
  response: RawPatientListResponse | undefined,
  patients: Patient[],
  page: number,
  limit: number,
) {
  if (Array.isArray(response)) {
    return {
      page,
      limit,
      totalRecords: patients.length,
      totalPages: 1,
    };
  }

  return response?.pagination ?? response?.meta ?? {
    page: response?.currentPage ?? page,
    limit,
    totalRecords: patients.length,
    totalPages: response?.totalPages ?? 1,
  };
}

function getRawPatient(
  response: RawPatientResponse | undefined
): RawPatient | null {
  if (!response) return null;

  if ("data" in response || "patient" in response) {
    return response.data ?? response.patient ?? null;
  }

    return response as RawPatient;
}

function normalizeGender(gender: unknown): Patient["gender"] {
  if (gender === "MALE" || gender === "male") return "MALE" as Patient["gender"];
  if (gender === "FEMALE" || gender === "female") {
    return "FEMALE" as Patient["gender"];
  }
  return "OTHER" as Patient["gender"];
}

function normalizeStringArray(value: string[] | string | undefined) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function buildCreatePatientPayload(data: PatientCreateData): PatientCreatePayload {
  const medicalHistory =
    data.medicalHistory ??
    (Array.isArray(data.diseases) ? data.diseases.join(", ") : data.diseases);

  return {
    name: String(data.name || "").trim(),
    phone: String(data.phoneNumber || "").trim(),
    age: data.age !== undefined ? Number(data.age) : undefined,
    gender: data.gender,
    bloodGroup: data.bloodGroup,
    relation: data.relation ?? data.emergencyContact,
    otherRelation: data.otherRelation ?? "",
    diseases: data.diseases ?? medicalHistory ?? "",
    allergies: data.allergies ?? [],
    medicalHistory: medicalHistory ?? "",
  };
}

function normalizePatient(patient: RawPatient): Patient {
  const id = patient._id || patient.id || "";
  const isActive =
    patient.isActive ??
    (patient.status ? patient.status !== "INACTIVE" : true);
  const createdAt = patient.createdAt ? new Date(patient.createdAt) : new Date();
  const updatedAt = patient.updatedAt ? new Date(patient.updatedAt) : createdAt;

  return {
    ...patient,
    id,
    patientId: patient.patientId || id,
    name: patient.name || patient.user?.name || "",
    phoneNumber: patient.phoneNumber || patient.phone || patient.user?.phone || "",
    email: patient.email || patient.user?.email,
    gender: normalizeGender(patient.gender),
    adhar: patient.adhar || patient.aadhaar || "",
    emergencyContact:
      patient.emergencyContact ||
      patient.relation ||
      patient.otherRelation ||
      "",
    status: (isActive ? "ACTIVE" : "INACTIVE") as Patient["status"],
    medicalNotes: patient.medicalNotes || [],
    medicalReports: patient.medicalReports || [],
    createdAt,
    updatedAt,
    dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : undefined,
    age: patient.age !== undefined ? Number(patient.age) : undefined,
    medicalHistory:
      patient.medicalHistory ||
      normalizeStringArray(patient.diseases).join(", "),
  } as Patient;
}

export const usePatients = (params: PatientListParams = {}) => {
  const { page = 1, limit = 10, search = "" } = params;

  return useQuery({
    queryKey: ["patients", page, limit, search],
    queryFn: async () => {
      const urlParams = new URLSearchParams();
      urlParams.append("page", String(page));
      urlParams.append("limit", String(limit));
      urlParams.append("search", search);

      const response: ApiResponse<RawPatientListResponse> =
        await clientApi.get(`/patient/all-patient?${urlParams.toString()}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch patients");
      }

      if (!response.data) {
        throw new Error("No data received from server");
      }

      const patients = getRawPatientList(response.data).map(normalizePatient);

      return {
        data: patients,
        pagination: getPaginationMeta(response.data, patients, page, limit),
        meta: Array.isArray(response.data) ? undefined : response.data.meta,
      };
    },
    retry: 2,
    retryDelay: 1000,
  });
};

export function useAddPatient(options?: {
  onSuccess?: (data: Patient) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<Patient, Error, PatientCreateData>({
    mutationFn: async (formData: PatientCreateData) => {
      const payload = buildCreatePatientPayload(formData);

      const response: ApiResponse<RawPatientResponse> =
        await clientApi.post("/patient/create-patient-admin", payload);

      if (!response.success) {
        throw new Error(response.error || "Failed to create patient");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      const patient = getRawPatient(response.data);
      if (!patient) {
        throw new Error("No patient data received from server");
      }

      return normalizePatient(patient);
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

export function useUpdatePatientStatus(options?: {
  onSuccess?: (data: Patient | null) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<Patient | null, Error, PatientStatusPayload>({
    mutationFn: async (payload) => {
      console.log("[DEBUG] Patient toggle status called with payload:", payload);

      // Defensive check to prevent runtime destructuring errors
      if (!payload || typeof payload !== "object") {
        console.error("[DEBUG] Invalid payload provided to mutation:", payload);
        throw new Error("Invalid request: payload must be an object containing id and isActive");
      }

      const { id, isActive } = payload;
      if (!id) {
        throw new Error("Patient ID is required for status update");
      }

      // Updated URL to match specified requirement: /patient-status/:id
      const response: ApiResponse<RawPatientResponse> =
        await clientApi.put(`/patient/patient-status/${id}`, { isActive });

      if (!response.success) {
        throw new Error(response.error || "Failed to update patient status");
      }

      const patient = getRawPatient(response.data);
      return patient ? normalizePatient(patient) : null;
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}
