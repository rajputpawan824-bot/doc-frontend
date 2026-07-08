import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api/client";


export interface PrescriptionPayload {
  prescription: string;
  medicalNotes: string;
  followUpDate?: string | null;
  isFollowUpRequired?: boolean;
}

export type PrescriptionRequestPayload = PrescriptionPayload | FormData;


export function usePrescription(
  appointmentId?: string
) {
  return useQuery({
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

      return response.data;
    },

    enabled: !!appointmentId,
  });
}


export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      data,
    }: {
      appointmentId: string;
      data: PrescriptionRequestPayload;
    }) => {
      const response = await clientApi.post(
        `/appointment/${appointmentId}/addprescription`,
        data
      );

      if (!response.success) {
        throw new Error(
          response.error || "Failed to create prescription"
        );
      }

      return response.data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "prescription",
          variables.appointmentId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["prescription-history"],
      });
    },
  });
}


export function useUpdatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      data,
    }: {
      appointmentId: string;
      data: PrescriptionRequestPayload;
    }) => {
      const response = await clientApi.put(
        `/appointment/${appointmentId}/updateprescription`,
        data
      );

      if (!response.success) {
        throw new Error(
          response.error || "Failed to update prescription"
        );
      }

      return response.data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "prescription",
          variables.appointmentId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["prescription-history"],
      });
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
    throw new Error("Failed to download prescription");
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
