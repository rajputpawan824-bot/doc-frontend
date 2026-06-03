"use client";

import { useQuery } from "@tanstack/react-query";
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
  dateOfBirth?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type RawPatientListResponse = {
  data: RawPatient[];
  pagination?: PaginationMeta;
  meta?: PaginationMeta;
  currentPage?: number;
  totalPages?: number;
};

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
}

function normalizePatient(patient: RawPatient): Patient {
  const id = patient._id || patient.id || "";

  return {
    ...patient,
    id,
    patientId: patient.patientId || id,
    name: patient.name || patient.user?.name || "",
    phoneNumber: patient.phoneNumber || patient.phone || patient.user?.phone || "",
    email: patient.email || patient.user?.email,
    adhar: patient.adhar || patient.aadhaar || "",
    medicalNotes: patient.medicalNotes || [],
    medicalReports: patient.medicalReports || [],
    createdAt: patient.createdAt ? new Date(patient.createdAt) : new Date(),
    updatedAt: patient.updatedAt ? new Date(patient.updatedAt) : new Date(),
    dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : undefined,
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
        await clientApi.get(`/create-patient?${urlParams.toString()}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch patients");
      }

      if (!response.data) {
        throw new Error("No data received from server");
      }

      const patients = (response.data.data ?? []).map(normalizePatient);

      return {
        data: patients,
        pagination: response.data.pagination ?? response.data.meta ?? {
          page: response.data.currentPage ?? page,
          limit,
          totalRecords: patients.length,
          totalPages: response.data.totalPages ?? 1,
        },
        meta: response.data.meta,
      };
    },
    retry: 2,
    retryDelay: 1000,
  });
};
