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
  emergencyContact?: string;
  relation?: string;
  otherRelation?: string;
  diseases?: string | string[];
  allergies?: string[] | string;
  medicalHistory?: string;
  medicalReports?: Patient["medicalReports"];
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
export interface FamilyProfile {
  _id: string;
  patientCode: string;
  name: string;
  relation: string;
  otherRelation?: string | null;
  phone: string;
}

export interface CheckPatientPhoneResponse {
  selfExists: boolean;
  profiles: FamilyProfile[];
}

export type PatientCreateData = {
  name?: string;
  phoneNumber?: string;
  email?: string;
  age?: number;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  adhar?: string;
  bloodGroup?: string;
  relation?: string;
  otherRelation?: string;
  diseases?: string | string[];
  allergies?: string[] | string;
  medicalHistory?: string;
 medicalReports?: {
  documentName: string;
  file: File;
}[];
  deletedDocumentIds?: string[];
  patientCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  emergencyContactOtherRelation?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
    otherRelation?: string;
  };
};

export interface PatientCreatePayload {
  patientCode?: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
 gender?: "MALE" | "FEMALE" | "OTHER";
  bloodGroup?: string;
  aadhaar?: string;
  address?: string;
  relation?: string;
  otherRelation?: string;
  diseases?: string | string[];
  allergies?: string[] | string;
  medicalHistory?: string;
  emergencyContact?: {
  name?: string;
  phone?: string;
  relation?: string;
  otherRelation?: string;
};
}
export interface PatientDashboardResponse {
  profile: {
    _id: string;
    patientCode: string;
    name: string;
    age: number;
    gender: string;
    relation: string;
  };

  currentVisit: {
    appointmentId: string;
    doctorId: string;
    doctorName: string;
    tokenNumber: number;
    currentServingToken: number;
    patientsAhead: number;
    status: string;
  } | null;

  nextAppointment: {
    appointmentId: string;
    doctorId: string;
    doctorName: string;
    department: string;
    date: string;
    slot: string;
    status: string;
  } | null;

  stats: {
    pastVisits: number;
    familyProfiles: number;
  };
}


export interface Clinic {
  adminId: string;
  clinicName: string;
  location: string;
  profileCount: number;
}

export interface MyClinicsResponse {
  success: boolean;
  count: number;
  data: Clinic[];
}

export interface ClinicProfile {
  _id: string;
  patientCode: string;
  name: string;
  relation: string;
  otherRelation?: string | null;
}

export interface ClinicProfilesData {
  clinic: {
    _id: string;
    clinicName: string;
    location: string;
  };
  profiles: ClinicProfile[];
}

type PatientStatusPayload = {
  id: string;
  isActive: boolean;
};

function unwrapData<T>(value: unknown): T {
  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    (value as { data?: unknown }).data !== undefined
  ) {
    return unwrapData<T>((value as { data?: unknown }).data);
  }

  return value as T;
}

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
  const age = data.age;
  const emergencyContact = data.emergencyContact;
  const emergencyContactRelation =
    emergencyContact?.relation ?? data.emergencyContactRelation;
  const emergencyContactOtherRelation =
    emergencyContact?.otherRelation ?? data.emergencyContactOtherRelation;

  return {
    patientCode: String(data.patientCode || "").trim() || undefined,
    name: String(data.name || "").trim(),
    phone: String(data.phoneNumber || "").trim(),
    email: String(data.email || "").trim() || undefined,
    age: age !== undefined && age !== null && String(age) !== "" ? Number(age) : undefined,
    gender: data.gender,
    bloodGroup: data.bloodGroup,
    aadhaar: String(data.adhar || "").replace(/[-\s]/g, "") || undefined,
    address: String(data.address || "").trim() || undefined,
    relation: data.relation ?? "SELF",
    otherRelation: String(data.otherRelation || "").trim() || undefined,
   diseases:
  typeof data.diseases === "string"
    ? data.diseases
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : data.diseases || [],

allergies:
  typeof data.allergies === "string"
    ? data.allergies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : data.allergies || [],
    medicalHistory: data.medicalHistory ?? "",

    emergencyContact: {
  name: (emergencyContact?.name ?? data.emergencyContactName) || undefined,
  phone: (emergencyContact?.phone ?? data.emergencyContactPhone) || undefined,
  relation: emergencyContactRelation || undefined,
  otherRelation:
    emergencyContactRelation === "OTHER"
      ? String(emergencyContactOtherRelation || "").trim() || undefined
      : undefined,
},
  };
}

function appendOptional(payload: FormData, key: string, value: unknown) {
  if (value === undefined || value === null || value === "") return;
  payload.append(key, String(value));
}

function buildPatientFormData(data: PatientCreateData) {
  const payload = buildCreatePatientPayload(data);
  const formData = new FormData();

  appendOptional(formData, "patientCode", payload.patientCode);
  formData.append("name", payload.name);
  formData.append("phone", payload.phone);
  appendOptional(formData, "email", payload.email);
  appendOptional(formData, "age", payload.age);
  appendOptional(formData, "gender", payload.gender);
  appendOptional(formData, "bloodGroup", payload.bloodGroup);
  appendOptional(formData, "aadhaar", payload.aadhaar);
  appendOptional(formData, "address", payload.address);
  appendOptional(formData, "relation", payload.relation);
  appendOptional(formData, "otherRelation", payload.otherRelation);
  appendOptional(formData, "medicalHistory", payload.medicalHistory);
  appendOptional(formData, "emergencyContact[name]", payload.emergencyContact?.name);
  appendOptional(formData, "emergencyContact[phone]", payload.emergencyContact?.phone);
  appendOptional(
    formData,
    "emergencyContact[relation]",
    payload.emergencyContact?.relation,
  );
  appendOptional(
    formData,
    "emergencyContact[otherRelation]",
    payload.emergencyContact?.otherRelation,
  );

  const diseases = Array.isArray(payload.diseases)
    ? payload.diseases
    : payload.diseases
    ? [payload.diseases]
    : [];
  diseases.forEach((disease) => formData.append("diseases", disease));

  const allergies = Array.isArray(payload.allergies)
    ? payload.allergies
    : payload.allergies
    ? [payload.allergies]
    : [];
  allergies.forEach((allergy) => formData.append("allergies", allergy));

const documentNames: string[] = [];

data.medicalReports?.forEach((document) => {
  formData.append("files", document.file);

  documentNames.push(document.documentName);
});

if (documentNames.length) {
  formData.append(
    "documentNames",
    JSON.stringify(documentNames)
  );
}
if (data.deletedDocumentIds?.length) {
  formData.append(
    "deletedDocuments",
    JSON.stringify(data.deletedDocumentIds)
  );
}
  return formData;
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
    patientCode: patient.patientCode || id,
    name: patient.name || patient.user?.name || "",
    phoneNumber: patient.phoneNumber || patient.phone || patient.user?.phone || "",
    email: patient.email || patient.user?.email,
    gender: normalizeGender(patient.gender),
    adhar: patient.adhar || patient.aadhaar || "",
    address: patient.address || "",
    emergencyContact: patient.emergencyContact || "",
    relation: patient.relation || "SELF",
    otherRelation: patient.otherRelation || "",
    diseases: patient.diseases ?? [],
    allergies: patient.allergies ?? [],
    status: (isActive ? "ACTIVE" : "INACTIVE") as Patient["status"],
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
      refetchOnMount: "always",
  refetchOnWindowFocus: true,
  staleTime: 0,
  
    retry: 2,
    retryDelay: 1000,
  });
};

export const usePatientById = (patientId?: string) => {
  return useQuery({
    queryKey: ["patient", patientId],
    enabled: Boolean(patientId),
    queryFn: async () => {
      if (!patientId) {
        throw new Error("Patient ID is required");
      }

      const response: ApiResponse<RawPatientResponse> =
        await clientApi.get(`/patient/${patientId}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch patient details");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      const patient = getRawPatient(unwrapData<RawPatientResponse>(response.data));
      if (!patient) {
        throw new Error("No patient data received from server");
      }

      return normalizePatient(patient);
    },
  });
};

export function useAddPatient(options?: {
  onSuccess?: (data: Patient) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<Patient, Error, PatientCreateData>({
    mutationFn: async (formData: PatientCreateData) => {
      const payload = buildPatientFormData(formData);
      console.log(
        "[Patient create] API request body",
        Object.fromEntries(payload.entries()),
      );

      const response: ApiResponse<RawPatientResponse> =
        await clientApi.post("/patient/create-patient-admin", payload);

      if (!response.success) {
        throw new Error(response.error || "Failed to create patient");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      const patient = getRawPatient(unwrapData<RawPatientResponse>(response.data));
      if (!patient) {
        throw new Error("No patient data received from server");
      }

      return normalizePatient(patient);
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", data.id] });
      queryClient.invalidateQueries({ queryKey: ["patient-dashboard", data.id] });
      queryClient.invalidateQueries({ queryKey: ["patient-medical-history", data.id] });
      queryClient.invalidateQueries({ queryKey: ["prescription-history", data.id] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

export function useAddPatientProfile(options?: {
  onSuccess?: (data: Patient) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<Patient, Error, PatientCreateData>({
    mutationFn: async (formData: PatientCreateData) => {
      const payload = buildPatientFormData(formData);

      const response: ApiResponse<RawPatientResponse> =
        await clientApi.post("/patient/create-patient", payload);

      if (!response.success) {
        throw new Error(response.error || "Failed to create patient");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      const patient = getRawPatient(unwrapData<RawPatientResponse>(response.data));
      if (!patient) {
        throw new Error("No patient data received from server");
      }

      return normalizePatient(patient);
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clinic-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["patient-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["patient", data.id] });
      queryClient.invalidateQueries({ queryKey: ["patient-dashboard", data.id] });
      queryClient.invalidateQueries({ queryKey: ["patient-medical-history", data.id] });
      queryClient.invalidateQueries({ queryKey: ["prescription-history", data.id] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

export function useUpdatePatient(options?: {
  onSuccess?: (data: Patient) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<Patient, Error, { id: string; data: PatientCreateData }>({
    mutationFn: async ({ id, data }) => {
      if (!id) {
        throw new Error("Patient ID is required for update");
      }

      const payload = buildPatientFormData(data);
      const response: ApiResponse<RawPatientResponse> =
        await clientApi.put(`/patient/update/${id}`, payload);

      if (!response.success) {
        throw new Error(response.error || "Failed to update patient");
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
      queryClient.invalidateQueries({ queryKey: ["patient", data.id] });
      queryClient.invalidateQueries({ queryKey: ["patient-dashboard", data.id] });
      queryClient.invalidateQueries({ queryKey: ["patient-medical-history", data.id] });
      queryClient.invalidateQueries({ queryKey: ["prescription-history", data.id] });
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
      if (!payload || typeof payload !== "object") {
        throw new Error("Invalid request: payload must be an object containing id and isActive");
      }

      const { id, isActive } = payload;
      if (!id) {
        throw new Error("Patient ID is required for status update");
      }

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
interface NextPatientCodeResponse {
  patientCode: string;
}

export const useNextPatientCode = () => {
  return useQuery({
    queryKey: ["next-patient-code"],
    queryFn: async () => {
      const response = await clientApi.get<{
        data: NextPatientCodeResponse;
      }>("/patient/next-code");

      if (!response.success || !response.data) {
        throw new Error("Failed to fetch patient code");
      }

      return response.data.data.patientCode;
    },
  });
};



export function usePatientLogin() {
  return useMutation({
    mutationFn: async (data: {
      phone: string;
      otp?: string;
    }) => {
      const response = await clientApi.post(
        "/patient/login",
        data
      );

      if (!response.success) {
        throw new Error(
          response.error || "Login failed"
        );
      }

      return response.data;
    },
  });
}


export function useMyClinics() {
  return useQuery<MyClinicsResponse>({
    queryKey: ["my-clinics"],

    queryFn: async () => {
      const response =
        await clientApi.get<MyClinicsResponse>(
          "/patient/my-clinics"
        );

      if (!response.success) {
        throw new Error(
          response.error ||
            "Failed to fetch clinics"
        );
      }

      return response.data;
    },
  });
}

export function useMyClinic(
  adminId?: string
) {
  return useQuery({
    queryKey: ["my-clinic", adminId],

    queryFn: async () => {
      const response = await clientApi.get(
        `/patient/my-clinic/${adminId}`
      );

      if (!response.success) {
        throw new Error(
          response.error ||
            "Failed to fetch clinic"
        );
      }

      return response.data;
    },

    enabled: !!adminId,
  });
}



export function useClinicProfiles(
  adminId?: string
) {
  return useQuery<ClinicProfilesData>({
    queryKey: ["clinic-profiles", adminId],

    queryFn: async () => {
      const response = await clientApi.get<{
        success: boolean;
        data: ClinicProfilesData;
      }>(
        `/patient/my-clinic/${adminId}/profiles`
      );

      if (!response.success || !response.data) {
        throw new Error(
          "Failed to fetch profiles"
        );
      }

      return unwrapData<ClinicProfilesData>(response.data);
    },

    enabled: !!adminId,
  });
}


export function useMyClinicAppointments(
  adminId?: string
) {
  return useQuery({
    queryKey: [
      "clinic-appointments",
      adminId,
    ],

    queryFn: async () => {
      const response = await clientApi.get(
        `/patient/my-clinic/${adminId}/appointments`
      );

      if (!response.success) {
        throw new Error(
          response.error ||
            "Failed to fetch appointments"
        );
      }

      return response.data;
    },

    enabled: !!adminId,
  });
}


export function usePatientDashboard(
  patientId?: string
) {
  return useQuery<PatientDashboardResponse>({
    queryKey: [
      "patient-dashboard",
      patientId,
    ],

    queryFn: async () => {
      const response =
        await clientApi.get<{
          success: boolean;
          data: PatientDashboardResponse;
        }>(
          `/patient/profile/${patientId}/dashboard`
        );

      if (!response.success) {
        throw new Error(
          response.error ||
          "Failed to fetch dashboard"
        );
      }

      if (!response.data) {
        throw new Error(
          "No dashboard data received"
        );
      }

      return unwrapData<PatientDashboardResponse>(response.data);
    },

    enabled: !!patientId,
  });
}


export function usePatientMedicalHistory(
  patientId?: string
) {
  return useQuery({
    queryKey: [
      "patient-medical-history",
      patientId,
    ],

    queryFn: async () => {
      const response = await clientApi.get(
        `/patient/profile/${patientId}/medical-history`
      );

      if (!response.success) {
        throw new Error(
          response.error ||
            "Failed to fetch medical history"
        );
      }

      return response.data;
    },

    enabled: !!patientId,
  });
}


export function useCheckPatientPhone() {
  return useMutation<CheckPatientPhoneResponse, Error, string>({
    mutationFn: async (phone: string) => {
      const response = await clientApi.post<CheckPatientPhoneResponse>(
        "/patient/check-phone",
        { phone }
      );

      if (!response.success) {
        throw new Error(
          response.error || "Failed to check phone"
        );
      }

     return unwrapData<CheckPatientPhoneResponse>(response.data);
    },
  });
}
