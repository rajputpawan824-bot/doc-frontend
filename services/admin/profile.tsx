import { clientApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/types/types";
import {
  ProfileResponse,
  ProfileFormData,
  UpdateProfilePayload,
  ChangePasswordData,
} from "@/lib/validations/Admin/profile";

export function useUpdateProfile(options?: {
  onSuccess?: (data: ProfileResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<ProfileResponse, Error, ProfileFormData>({
    mutationFn: async (formData: ProfileFormData) => {
      const payload: UpdateProfilePayload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
      };

      // Only include password fields if new password is provided
      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const response: ApiResponse<{ data: ProfileResponse }> =
        await clientApi.put("/profile/update", payload);

      if (!response.success || !response.data) {
        throw new Error(
          typeof response.error === "string"
            ? response.error
            : response.error?.message || "Failed to update profile",
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

export function useChangePassword(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<void, Error, ChangePasswordData>({
    mutationFn: async (formData: ChangePasswordData) => {
      const payload = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      };

      const response: ApiResponse<void> = await clientApi.post(
        "/profile/change-password",
        payload,
      );

      if (!response.success) {
        throw new Error(
          typeof response.error === "string"
            ? response.error
            : response.error?.message || "Failed to change password",
        );
      }
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
