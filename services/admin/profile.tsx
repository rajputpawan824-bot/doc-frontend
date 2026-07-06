
import { clientApi } from "@/lib/api";
import type { ApiResponse } from "@/lib/types/types";
import {
  useQuery,
  useMutation,
} from "@tanstack/react-query";

import type {
  ProfileResponse,
} from "@/lib/validations/Admin/profile";

// export function useUpdateProfile(options?: {
//   onSuccess?: (data: ProfileResponse) => void;
//   onError?: (error: Error) => void;
// }) {
//   return useMutation<ProfileResponse, Error, ProfileFormData>({
//     mutationFn: async (formData: ProfileFormData) => {
//       const payload: UpdateProfilePayload = {
//         name: formData.name.trim(),
//         email: formData.email.trim().toLowerCase(),
//         phone: formData.phone.trim(),
//       };

//       // Only include password fields if new password is provided
//       if (formData.newPassword) {
//         payload.currentPassword = formData.currentPassword;
//         payload.newPassword = formData.newPassword;
//       }

//       const response: ApiResponse<{ data: ProfileResponse }> =
//         await clientApi.put("/profile/update", payload);

//       if (!response.success || !response.data) {
//         throw new Error(
//           typeof response.error === "string"
//             ? response.error
//             : response.error?.message || "Failed to update profile",
//         );
//       }

//       return response.data.data;
//     },
//     retry: 1,
//     retryDelay: 1000,
//     onSuccess: options?.onSuccess,
//     onError: options?.onError,
//   });
// }

// export function useChangePassword(options?: {
//   onSuccess?: () => void;
//   onError?: (error: Error) => void;
// }) {
//   return useMutation<void, Error, ChangePasswordData>({
//     mutationFn: async (formData: ChangePasswordData) => {
//       const payload = {
//         currentPassword: formData.currentPassword,
//         newPassword: formData.newPassword,
//       };

//       const response: ApiResponse<void> = await clientApi.post(
//         "/profile/change-password",
//         payload,
//       );

//       if (!response.success) {
//         throw new Error(
//           typeof response.error === "string"
//             ? response.error
//             : response.error?.message || "Failed to change password",
//         );
//       }
//     },
//     retry: 1,
//     retryDelay: 1000,
//     onSuccess: options?.onSuccess,
//     onError: options?.onError,
//   });
// }


function getErrorMessage(
  error: ApiResponse["error"],
  fallback: string,
): string {
  if (typeof error === "string") return error;
  return error?.message || fallback;
}

export const useAdminProfile = () => {
  return useQuery({
    queryKey: ["admin-profile"],

    queryFn: async (): Promise<ProfileResponse> => {
      const response: ApiResponse<{
        data: ProfileResponse;
      }> = await clientApi.get("/admins/me");

      if (!response.success || !response.data) {
        throw new Error(
          getErrorMessage(
            response.error,
            "Failed to fetch admin profile",
          ),
        );
      }

      return response.data.data;
    },

    retry: 2,
    retryDelay: 1000,
  });
};

interface SendOtpResponse {
  success: boolean;
  message: string;
  otp: string;
}

export const useSendPasswordOtp = () => {
  return useMutation({
    mutationFn: async (): Promise<SendOtpResponse> => {
      const response: ApiResponse<SendOtpResponse> =
        await clientApi.post(
          "/admins/send-password-otp"
        );

      if (!response.success || !response.data) {
        throw new Error(
          getErrorMessage(
            response.error,
            "Failed to send OTP"
          )
        );
      }

      return response.data;
    },
  });
};


interface ChangePasswordPayload {
  otp: string;
  newPassword: string;
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (
      payload: ChangePasswordPayload
    ) => {
      const response = await clientApi.post(
        "/admins/change-password",
        payload
      );

      if (!response.success) {
        throw new Error(
          getErrorMessage(
            response.error,
            "Failed to change password"
          )
        );
      }

      return response;
    },
  });
};