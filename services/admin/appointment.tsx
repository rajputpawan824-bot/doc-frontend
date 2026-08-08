import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api/client";

export interface PatientTokenStatusResponse {
  tokenNumber: number;
  patientsAhead: number;
  currentServingToken: number;
  status: string;
  expectedTime?: string;
  avgWaitPerPatient?: string;
  doctor?: {
    doctorName: string;
    department?: string;
  };
}

export interface PatientAppointment {
  _id?: string;
  id?: string;
  appointmentId?: string;
  doctor?: {
    _id?: string;
    doctorName?: string;
    department?: string;
    user?: {
      name?: string;
    };
  };
  doctorName?: string;
 department?: string;
  date?: string;
  slot?: string;
  time?: string;
  reason?: string;
  status?: string;
  type?: string;
  hasPrescription?: boolean;
  prescription?: unknown;
}

type AppointmentListResponse =
  | PatientAppointment[]
  | {
      data?: PatientAppointment[] | { data?: PatientAppointment[] };
      appointments?: PatientAppointment[];
      result?: PatientAppointment[];
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
function getAppointments(value: AppointmentListResponse | undefined) {
  const unwrapped = unwrapData<any>(value);

  if (Array.isArray(unwrapped)) {
    return unwrapped;
  }

  if (unwrapped && typeof unwrapped === "object") {
    return [
      ...(unwrapped.upcoming ?? []),
      ...(unwrapped.past ?? []),
      ...(unwrapped.cancelled ?? []),
    ];
  }

  return [];
}

export function usePatientAppointments(patientId?: string) {
  return useQuery<PatientAppointment[]>({
    queryKey: ["patient-appointments", patientId],
    queryFn: async () => {
      const response = await clientApi.get(
        `/appointment/profile/${patientId}`
      );

      if (!response.success) {
        throw new Error(
          response.error || "Failed to fetch appointments"
        );
      }

      return getAppointments(response.data as AppointmentListResponse);
    },
    enabled: !!patientId,
  });
}

export function usePatientTokenStatus(
  patientId?: string
) {
  return useQuery<PatientTokenStatusResponse>({
    queryKey: [
      "patient-token-status",
      patientId,
    ],

queryFn: async (): Promise<PatientTokenStatusResponse> => {
  const response = await clientApi.get<PatientTokenStatusResponse | { data?: PatientTokenStatusResponse }>(
    `/appointment/profile/${patientId}/token-status`
  );

  if (!response.success) {
    throw new Error(
      response.error || "Failed to fetch token status"
    );
  }

  return unwrapData<PatientTokenStatusResponse>(response.data);
},

    enabled: !!patientId,
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await clientApi.put(
        `/appointment/${appointmentId}/status`,
        {
          status: "CANCELLED",
        }
      );

      if (!response.success) {
        throw new Error(
          response.error || "Failed to cancel appointment"
        );
      }

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patient-appointments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["patient-token-status"],
      });
      queryClient.invalidateQueries({
        queryKey: ["patient-dashboard"],
      });
    },
  });
}

export function useUpdateAppointmentStatus(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      status,
    }: {
      appointmentId: string;
      status: string;
    }) => {
      const response = await clientApi.put(
        `/appointment/${appointmentId}/status`,
        {
          status,
        }
      );

      if (!response.success) {
        throw new Error(
          response.error || "Failed to update appointment"
        );
      }

      return response.data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["token-appointments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["current-token"],
      });

      options?.onSuccess?.(data);
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}