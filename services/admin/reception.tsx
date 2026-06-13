import {
  ReceptionResponse,
  Shift,
  Gender,
  ReceptionFormData,
  CreateReceptionPayload,
} from "@/lib/validations/Admin/reception";
import { clientApi } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/api";

// Raw shape returned by the MongoDB/Node backend for receptionist list
interface RawReceptionistUser {
  _id?: string;
  id?: string;
  email: string;
  phone: string;
  name: string;
  isActive: boolean;
  role?: string;
  password?: string;
  isVerified?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface RawReceptionist {
  _id?: string;
  id?: string;
  userId?: string;
  user?: RawReceptionistUser;
  experience?: string | number;
  salary: number;
  shift: string;
  gender: string;
  aadhaar: string;
  address: string;
  deskNumber: string;
 receptionistCode: string;

registrationNo?: string;

joiningDate: string;

workingHours: {
  start: string;
  end: string;
};
  canEditPatient?: boolean | string;
  createdAt: string;
  updatedAt?: string;
  password?: string;
}

interface RawListResponse {
  data: RawReceptionist[];
  meta?: { page?: number; currentPage?: number; limit?: number; total?: number; totalRecords?: number; totalPages?: number };
  pagination?: { page?: number; currentPage?: number; limit?: number; total?: number; totalRecords?: number; totalPages?: number };
  currentPage?: number;
  totalPages?: number;
}

export function useAddReception(options?: {
  onSuccess?: (data: ReceptionResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<ReceptionResponse, Error, ReceptionFormData>({
    mutationFn: async (formData: ReceptionFormData) => {
      const exp = formData.experience;
      const payload: CreateReceptionPayload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password?.trim(),
        experience: typeof exp === "string" ? Number(exp) || exp : exp,
        salary: Number(formData.salary),
        shift: formData.shift,
        gender: formData.gender,
        aadhaar: formData.aadhaar.trim(),
        address: formData.address.trim(),
        deskNumber: formData.deskNumber.trim(),
    
        receptionistCode: formData.receptionistCode?.trim(),

        registrationNo: formData.registrationNo?.trim() || "",

joiningDate: formData.joiningDate,

workingHours: {
  start: formData.workingHours.start,
  end: formData.workingHours.end,
},
       
        caneditPatient: formData.caneditPatient ?? false,
      };

      const response: ApiResponse<{ data: ReceptionResponse }> =
        await clientApi.post("/receptionists/create-receptionist", payload);

      if (!response.success) {
        throw new Error(response.error || "Failed to create receptionist");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      return response.data.data;
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export const useReceptionists = (
  params: { page?: number; limit?: number; search?: string } = {},
) => {
  const { page = 1, limit = 10, search = "" } = params;

  return useQuery({
    queryKey: ["receptionists", page, limit, search],
    queryFn: async () => {
      const urlParams = new URLSearchParams();
      urlParams.append("page", String(page));
      urlParams.append("limit", String(limit));
      urlParams.append("search", search);

      const response = await clientApi.get<RawListResponse>(
        `/receptionists/all-receptionists?${urlParams.toString()}`,
      );

      if (!response.success) {
        throw new Error(
          !response.success ? response.error : "Failed to fetch receptionists",
        );
      }

      if (!response.data) {
        throw new Error("No data received from server");
      }

      // API response shape: { data: [...], meta: {...} }
      const list: RawReceptionist[] = response.data.data ?? [];

      // Transform API response to UI format
      const receptionists = list.map((reception: RawReceptionist) => ({
        id: reception._id || reception.id,
        userId: reception.user?._id || reception.user?.id || reception.userId,
        name: reception.user?.name || "",
        phoneNumber: reception.user?.phone || "",
        experience: String(reception.experience ?? ""),
        previousExperience: String(reception.experience ?? ""),
        salary: reception.salary,
        shift: reception.shift as Shift,
        email: reception.user?.email || "",
        gender: reception.gender as Gender,
        aadhaar: reception.aadhaar,
        address: reception.address,
        deskNumber: reception.deskNumber,
        receptionistCode: reception.receptionistCode,

registrationNo: reception.registrationNo,

joiningDate: reception.joiningDate,

workingHours: reception.workingHours,
        isActive: reception.user?.isActive ?? true,
        // canEditPatient is at the top-level of each receptionist (not inside user)
        canEditPatient: reception.canEditPatient,
        canEditPatients: reception.canEditPatient, // For compatibility
        createdAt: new Date(reception.createdAt),
        updatedAt: new Date(reception.updatedAt ?? reception.createdAt),
        user: reception.user,
      }));

      return {
        data: receptionists,
        pagination: response.data.pagination ?? response.data.meta ?? {
          page: response.data.currentPage ?? page,
          limit,
          totalRecords: receptionists.length,
          totalPages: response.data.totalPages ?? 1,
        },
        meta: response.data.meta,
      };
    },
    retry: 2,
    retryDelay: 1000,
  });
};

// Add this to your validation file
export function useUpdateReceptionist(options?: {
  onSuccess?: (data: ReceptionResponse) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    ReceptionResponse,
    Error,
    { id: string; data: Partial<ReceptionFormData> }
  >({
    mutationFn: async ({ id, data }) => {
      const updatePayload: Partial<ReceptionFormData> = {};

      if (data.name !== undefined) updatePayload.name = data.name.trim();
      if (data.email !== undefined) {
        updatePayload.email = data.email.trim().toLowerCase();
      }
      if (data.phone !== undefined) updatePayload.phone = data.phone.trim();
      if (data.experience !== undefined) {
        const exp = data.experience;
        updatePayload.experience =
          typeof exp === "string" ? Number(exp) || exp.trim() : exp;
      }
      if (data.salary !== undefined) updatePayload.salary = Number(data.salary);
      if (data.shift !== undefined) updatePayload.shift = data.shift;
      if (data.gender !== undefined) updatePayload.gender = data.gender;
      if (data.aadhaar !== undefined) {
        updatePayload.aadhaar = data.aadhaar.replace(/[-\s]/g, "");
      }
      if (data.address !== undefined) updatePayload.address = data.address.trim();
      if (data.deskNumber !== undefined) {
        updatePayload.deskNumber = data.deskNumber.trim();
      }
      if (data.registrationNo !== undefined) {
  updatePayload.registrationNo = data.registrationNo.trim();
}

if (data.joiningDate !== undefined) {
  updatePayload.joiningDate = data.joiningDate;
}

if (data.workingHours !== undefined) {
  updatePayload.workingHours = {
    start: data.workingHours.start,
    end: data.workingHours.end,
  };
}
     
      if (data.password !== undefined) {
        updatePayload.password = data.password.trim();
      }
      if (data.caneditPatient !== undefined) {
        updatePayload.caneditPatient = data.caneditPatient;
      }

      const response: ApiResponse<{ data: ReceptionResponse }> =
        await clientApi.put(`/receptionists/update/${id}`, updatePayload);

      if (!response.success) {
        throw new Error(response.error || "Failed to update receptionist");
      }
      if (!response.data) {
        throw new Error("No data received for update");
      }

      return response.data.data;
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["receptionists"] });
      queryClient.invalidateQueries({ queryKey: ["receptionist", data.id] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

export function useUpdateReceptionistPassword(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { id: string; newPassword: string }
  >({
    mutationFn: async ({ id, newPassword }) => {
      const response: ApiResponse<{
        data?: ReceptionResponse;
        message?: string;
      }> = await clientApi.put(`/receptionists/password/${id}`, {
          newPassword,
        });

      if (!response.success) {
        throw new Error(response.error || "Failed to update receptionist");
      }
      return;
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["receptionists"] });
      queryClient.invalidateQueries({ queryKey: ["receptionist", variables.id] });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}

export const useReceptionistById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["receptionist", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Receptionist ID is required");
      }

      const response = await clientApi.get<{ data: RawReceptionist }>(`/receptionists/${id}`);

      if (!response.success || !response.data) {
        throw new Error(
          !response.success
            ? response.error
            : "Failed to fetch receptionist details",
        );
      }

      const reception: RawReceptionist = response.data.data;

      // Transform API response to UI format
      return {
        id: reception._id || reception.id,
        userId: reception.user?._id || reception.user?.id || reception.userId,
        name: reception.user?.name || "",
        phoneNumber: reception.user?.phone || "",
        experience: String(reception.experience ?? ""),
        previousExperience: String(reception.experience ?? ""),
        salary: reception.salary,
        shift: reception.shift as Shift,
        email: reception.user?.email || "",
        gender: reception.gender as Gender,
        aadhaar: reception.aadhaar,
        address: reception.address,
        deskNumber: reception.deskNumber,
        receptionistCode: reception.receptionistCode,

registrationNo: reception.registrationNo,

joiningDate: reception.joiningDate,

workingHours: reception.workingHours,
        isActive: reception.user?.isActive ?? true,
        // canEditPatient is at the top-level of each receptionist (not inside user)
        canEditPatient: reception.canEditPatient,
        canEditPatients: reception.canEditPatient, // For compatibility
        createdAt: new Date(reception.createdAt),
        updatedAt: new Date(reception.updatedAt ?? reception.createdAt),
        user: reception.user,
      };
    },
    retry: 2,
    retryDelay: 1000,
    enabled: !!id,
  });
};

export const useDeactivatedReceptionists = () => {
  return useQuery({
    queryKey: ["deactivated-receptionists"],
    queryFn: async () => {
      const response = await clientApi.get<RawListResponse>(
        "/receptionists/all-receptionists?status=inactive",
      );

      if (!response.success) {
        throw new Error(
          response.error || "Failed to fetch deactivated receptionists",
        );
      }

      if (!response.data) {
        throw new Error("No data received from server");
      }

      const list: RawReceptionist[] = response.data.data ?? [];

      // Transform API response to UI format
      return list.map((reception: RawReceptionist) => ({
        id: reception._id || reception.id,
        userId: reception.user?._id || reception.user?.id || reception.userId,
        name: reception.user?.name || "",
        phoneNumber: reception.user?.phone || "",
        experience: String(reception.experience ?? ""),
        previousExperience: String(reception.experience ?? ""),
        salary: reception.salary,
        shift: reception.shift as Shift,
        email: reception.user?.email || "",
        gender: reception.gender as Gender,
        adhar: reception.aadhaar,
        aadhaar: reception.aadhaar,
        address: reception.address,
        deskNumber: reception.deskNumber,
  receptionistCode: reception.receptionistCode,

registrationNo: reception.registrationNo,

joiningDate: reception.joiningDate,

workingHours: reception.workingHours,      
        isActive: reception.user?.isActive ?? false,
        canEditPatient: reception.canEditPatient,
        canEditPatients: reception.canEditPatient,
        createdAt: new Date(reception.createdAt),
        updatedAt: new Date(reception.updatedAt ?? reception.createdAt),
      }));
    },
    enabled: false, // Only fetch when needed
    retry: 2,
    retryDelay: 1000,
  });
};

export const useToggleReceptionistStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response: ApiResponse<{ data: ReceptionResponse }> =
        await clientApi.put(`/receptionists/disable/${id}`, { isActive });

      if (!response.success) {
        throw new Error(response.error || "Failed to update receptionist status");
      }
      if (!response.data) {
        throw new Error("No data received for status update");
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receptionists"] });
      queryClient.invalidateQueries({
        queryKey: ["deactivated-receptionists"],
      });
    },
  });
};

export const useTogglePatientEditPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      canEditPatient, // Change parameter name to singular
    }: {
      id: string;
      canEditPatient: boolean; // Singular
    }) => {
      const response: ApiResponse<{ data: ReceptionResponse }> =
        await clientApi.put(`/receptionists/${id}/patient-edit-permission`, {
          canEditPatient, // Singular in API payload
        });

      if (!response.success) {
        throw new Error(response.error || "Failed to update permissions");
      }
      if (!response.data) {
        throw new Error("No data received for permissions update");
      }

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receptionists"] });
      queryClient.invalidateQueries({ queryKey: ["receptionist"] });
    },
  });
};



interface NextReceptionistCodeResponse {
  receptionistCode: string;
}

export const useNextReceptionistCode = () => {
  return useQuery({
    queryKey: ["next-receptionist-code"],
    queryFn: async () => {
      const response = await clientApi.get<{
        data: NextReceptionistCodeResponse;
      }>("/receptionists/next-code");

      if (!response.success || !response.data) {
       throw new Error(
   "Failed to fetch receptionist code"
);
      }

      return response.data.data;
    },
    staleTime: 0,
  });
};