import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { clientApi } from "@/lib/api/client";

export interface PrescriptionPayload {
  prescription: string;
  medicalNotes: string;
  followUpDate?: string | null;
  isFollowUpRequired?: boolean;
}

export interface PrescriptionData {
  prescription: string;
  medicalNotes: string;
  followUpDate?: string | null;
  isFollowUpRequired?: boolean;
}

export type PrescriptionRequestPayload =
  | PrescriptionPayload
  | FormData;

export interface PrescriptionResponse {
  _id?: string;
  appointmentId?: string;
  prescription: string;
  medicalNotes: string;
  followUpDate?: string | null;
  isFollowUpRequired?: boolean;
  attachments?: PrescriptionAttachment[];
}

export interface PrescriptionAttachment {
  _id?: string;
  fileName?: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number;
  filePath?: string;
  uploadedAt?: string | Date;
  url?: string;
}

function getPrescriptionResponse(value: unknown): PrescriptionResponse | null {
  if (!value || typeof value !== "object") return null;

  const response = value as PrescriptionResponse;
  const envelope = value as { data?: unknown };

  if (
    "prescription" in response ||
    "medicalNotes" in response ||
    "attachments" in response
  ) {
    return response;
  }

  return getPrescriptionResponse(envelope.data);
}

export interface TemporaryDocument {
  id: string;
  originalFileName: string;
  filePath: string;
  mimeType?: string;
  uploadedAt?: string;
  url?: string;
}

function getTemporaryDocuments(value: unknown): TemporaryDocument[] {
  if (Array.isArray(value)) return value as TemporaryDocument[];

  if (value && typeof value === "object") {
    const response = value as {
      data?: unknown;
      documents?: unknown;
      temporaryDocuments?: unknown;
    };

    if (Array.isArray(response.documents)) {
      return response.documents as TemporaryDocument[];
    }

    if (Array.isArray(response.temporaryDocuments)) {
      return response.temporaryDocuments as TemporaryDocument[];
    }

    return getTemporaryDocuments(response.data);
  }

  return [];
}

function normalizePatientId(value: unknown): string {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    const candidate = value as {
      _id?: unknown;
      id?: unknown;
      $oid?: unknown;
    };

    return normalizePatientId(candidate._id ?? candidate.id ?? candidate.$oid);
  }

  return "";
}

export function useTemporaryDocuments(enabled = false) {
  return useQuery<TemporaryDocument[]>({
    queryKey: ["temporary-documents"],
    queryFn: async () => {
      const response = await clientApi.get("/temporary-documents/get-temp-document");

      if (!response.success) {
        throw new Error(
          response.error || "Failed to fetch scanned files",
        );
      }

      return getTemporaryDocuments(response.data).slice(0, 9);
    },
    enabled,
  });
}

export function usePrescription(
  appointmentId?: string
) {
  return useQuery<PrescriptionResponse | null>({
    queryKey: ["prescription", appointmentId],

    queryFn: async () => {
      const response = await clientApi.get(
        `/appointment/${appointmentId}/getprescription`
      );

      if (!response.success) {
        throw new Error(
          response.error || "Failed to fetch prescription"
        );
      }

      if (!response.data) {
        return null;
      }

      return getPrescriptionResponse(response.data);
    },

    enabled: !!appointmentId,
  });
}

export function useSavePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      data,
      isExisting,
      patientId,
    }: {
      appointmentId: string;
      data: PrescriptionRequestPayload;
      isExisting: boolean;
      patientId: string;
    }) => {
      const normalizedPatientId = normalizePatientId(patientId);

      if (!normalizedPatientId) {
        throw new Error("Patient ID is required");
      }

      if (data instanceof FormData) {
        data.set("patientId", normalizedPatientId);
      }

      if (isExisting) {
        const response = await clientApi.put(
          `/appointment/${appointmentId}/updateprescription`,
          data
        );

        if (!response.success) {
          throw new Error(
            response.error ||
              "Failed to update prescription"
          );
        }

        const savedPrescription = getPrescriptionResponse(response.data);

        if (!savedPrescription) {
          throw new Error("Prescription save response did not include prescription data");
        }

        return savedPrescription;
      }

      const response = await clientApi.post(
        `/appointment/${appointmentId}/addprescription`,
        data
      );

      if (!response.success) {
        throw new Error(
          response.error ||
            "Failed to create prescription"
        );
      }

      const savedPrescription = getPrescriptionResponse(response.data);

      if (!savedPrescription) {
        throw new Error("Prescription save response did not include prescription data");
      }

      return savedPrescription;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "prescription",
          variables.appointmentId,
        ],
      });

      const normalizedPatientId = normalizePatientId(variables.patientId);

      if (normalizedPatientId) {
        queryClient.invalidateQueries({
          queryKey: ["prescription-history", normalizedPatientId],
        });
        queryClient.invalidateQueries({
          queryKey: ["patient-medical-history", normalizedPatientId],
        });
      }
    },
  });
}

export async function downloadPrescriptionPdf(
  appointmentId: string
) {
  const response = await clientApi.get<Blob>(
    `/appointment/${appointmentId}/prescription/pdf`,
    {
      responseType: "blob",
    }
  );

  if (!response.success || !response.data) {
    throw new Error(
      "Failed to download prescription"
    );
  }

  const blob = response.data;

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = `prescription-${appointmentId}.pdf`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}

export function usePrescriptionHistory(
  patientId?: string
) {
  return useQuery({
    queryKey: [
      "prescription-history",
      patientId,
    ],

    queryFn: async () => {
      const response = await clientApi.get(
        `/patient/${patientId}/prescriptionhistory`
      );

      if (!response.success) {
        throw new Error(
          response.error ||
            "Failed to fetch prescription history"
        );
      }

      return response.data;
    },

    enabled: !!patientId,
  });
}
