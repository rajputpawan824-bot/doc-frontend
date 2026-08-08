// services/admin/token.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api/client";

// ==================== TYPES ====================

export interface CurrentTokenResponse {
  currentToken: number;
  currentAppointment: any | null;
  nextAppointment: any | null;
}

export interface TokenPayload {
  doctorId: string;
  date: string;
}

export interface AppointmentQuery {
  doctorId: string;
  date: string;
}


// ==================== GET CURRENT TOKEN ====================

export function useCurrentToken(
  doctorId?: string,
  date?: string
) {
  return useQuery({
    queryKey: ["current-token", doctorId, date],
    queryFn: async () => {
      const response = await clientApi.get<CurrentTokenResponse>(
        `/appointment/token/current?doctorId=${doctorId}&date=${date}`
      );

      if (!response.success) {
        throw new Error(
          response.error || "Failed to fetch current token"
        );
      }

      return response.data;
    },
    enabled: !!doctorId && !!date,
  });
}

// ==================== GET TOKEN HISTORY ====================
// Uses existing appointments API

export function useTokenAppointments(
  doctorId?: string,
  date?: string
) {
  return useQuery({
    queryKey: ["token-appointments", doctorId, date],
    queryFn: async () => {
      const response = await clientApi.get(
        `/appointment/appointments?doctorId=${doctorId}&date=${date}`
      );

      if (!response.success) {
        throw new Error(
          response.error || "Failed to fetch appointments"
        );
      }

      return response.data;
    },
    enabled: !!doctorId && !!date,
  });
}

// ==================== INCREMENT TOKEN ====================
interface IncrementTokenResponse {
  success: boolean;
  message: string;
  data: {
    currentToken: number;
    needsConfirmation?: boolean;
    appointment?: any;
  };
}

export function useIncrementToken(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TokenPayload) => {
const response =
  await clientApi.put<IncrementTokenResponse>(
        "/appointment/token/increment",
        payload
      );

      if (!response.success) {
        throw new Error(
          response.error || "Failed to increment token"
        );
      }
console.log("Increment API Response", response);
console.log("Increment Data", response.data);
   return response.data.data;
    },

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "current-token",
          variables.doctorId,
          variables.date,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "token-appointments",
          variables.doctorId,
          variables.date,
        ],
      });

      options?.onSuccess?.(data);
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// ==================== DECREMENT TOKEN ====================

export function useDecrementToken(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TokenPayload) => {
      const response = await clientApi.put(
        "/appointment/token/decrement",
        payload
      );

      if (!response.success) {
        throw new Error(
          response.error || "Failed to decrement token"
        );
      }

      return response.data;
    },

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "current-token",
          variables.doctorId,
          variables.date,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "token-appointments",
          variables.doctorId,
          variables.date,
        ],
      });

      options?.onSuccess?.(data);
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// ==================== RESET TOKEN ====================

export function useResetToken(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TokenPayload) => {
      const response = await clientApi.put(
        "/appointment/token/reset",
        payload
      );

      if (!response.success) {
        throw new Error(
          response.error || "Failed to reset token"
        );
      }

      return response.data;
    },

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "current-token",
          variables.doctorId,
          variables.date,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "token-appointments",
          variables.doctorId,
          variables.date,
        ],
      });

      options?.onSuccess?.(data);
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}



export interface PatientAvailabilityPayload {
  appointmentId: string;
  available: boolean;
}

export function usePatientAvailability(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: PatientAvailabilityPayload
    ) => {
      const response = await clientApi.put(
        "/appointment/token/patient-availability",
        payload
      );

      if (!response.success) {
        throw new Error(
          response.error ||
            "Failed to update patient availability"
        );
      }
console.log("Increment API Response", response);
      return response.data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["current-token"],
      });

      queryClient.invalidateQueries({
        queryKey: ["token-appointments"],
      });

      options?.onSuccess?.(data);
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}


