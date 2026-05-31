// services/admin/staff.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api";
import type { ApiResponse } from "@/lib/api";
import type {
  StaffResponse,
  StaffFormData,
  CreateStaffPayload,
  StaffCategory,
  StaffShift,
  Gender,
} from "@/lib/validations/Admin/staff";

// Raw shape returned by the MongoDB backend
interface RawStaffUser {
  _id?: string;
  id?: string;
  email: string;
  phone?: string;
  name: string;
  isActive: boolean;
  role?: string;
  isVerified?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
  password?: string;
}

interface RawStaff {
  _id?: string;
  id?: string;
  userId?: string;
  user?: RawStaffUser;
  skill: string;
  category: string;
  experience?: string | number;
  salary: number;
  shift: string;
  gender: string;
  aadhaar: string;
  address: string;
  registrationNo?: string;
  department?: string;
  staffCode?: string;
  joiningDate?: string;
  roleBadge?: string;
  createdAt: string;
  updatedAt?: string;
  isActive?: boolean;
  password?: string;
}

interface RawStaffListResponse {
  data: RawStaff[];
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export interface StaffListParams {
  status?: "active" | "inactive" | "all";
  category?: StaffCategory;
  page?: number;
  limit?: number;
}

export interface StaffListResponse {
  success: boolean;
  page: number;
  limit: number;
  data: StaffResponse[];
  total?: number;
}

export interface StaffDashboardStats {
  total?: number;
  active?: number;
  inactive?: number;
  totalSalary?: number;
  categoryCounts?: Record<string, number>;
}

export function useAddStaff(options?: {
  onSuccess?: (data: StaffResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation<StaffResponse, Error, StaffFormData>({
    mutationFn: async (formData: StaffFormData) => {
      const payload: CreateStaffPayload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        skill: formData.skill.trim(),
        category: formData.category,
        // experience sent as number per API spec
        experience: formData.experience ? Number(formData.experience) || formData.experience : undefined,
        salary: Number(formData.salary),
        shift: formData.shift,
        gender: formData.gender,
        aadhaar: formData.aadhaar.replace(/[-\s]/g, ""),
        address: formData.address.trim(),
        ...(formData.joiningDate && { joiningDate: formData.joiningDate }),
        ...(formData.staffCode && { staffCode: formData.staffCode.trim() }),
        ...(formData.department && { department: formData.department.trim() }),
        ...(formData.registrationNo && { registrationNo: formData.registrationNo.trim() }),
        ...(formData.roleBadge && { roleBadge: formData.roleBadge.trim() }),
        ...(formData.password && { password: formData.password }),
      };

      console.log("CREATE STAFF PAYLOAD", payload);
      const response: ApiResponse<{ data: StaffResponse }> =
        await clientApi.post("/staff/create-staff", payload);

      if (!response.success) {
        throw new Error(response.error || "Failed to create staff");
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

export const useStaffById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["staff", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Staff ID is required");
      }

      const response = await clientApi.get<{ data: RawStaff }>(`/staff/${id}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch staff details");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      const staff: RawStaff = response.data.data;
      const staffId = staff._id || staff.id || "";

      return {
        ...staff,
        id: staffId,
        _id: staffId,
        userId: staff.user?._id || staff.user?.id || staff.userId || "",
        name: staff.user?.name || "",
        email: staff.user?.email || "",
        phone: staff.user?.phone || "",
        isActive: staff.isActive ?? staff.user?.isActive ?? true,
        status: (staff.isActive ?? staff.user?.isActive) ? "active" as const : "inactive" as const,
        lastLogin: staff.user?.lastLogin ?? null,
        experience: String(staff.experience ?? ""),
      } as StaffResponse;
    },
    retry: 2,
    retryDelay: 1000,
    enabled: !!id,
  });
};

// Get active staff — uses /staff/isActive endpoint
export const useActiveStaff = (category?: StaffCategory) => {
  return useQuery({
    queryKey: ["staff", "active", category],
    queryFn: async () => {
      const url = category
        ? `/staff/isActive?category=${category}`
        : "/staff/isActive";

      const response = await clientApi.get<RawStaffListResponse>(url);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch active staff");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      const list: RawStaff[] = response.data.data ?? [];

      return list.map((staff: RawStaff): StaffResponse => ({
        ...staff,
        id: staff._id || staff.id || "",
        _id: staff._id || staff.id || "",
        userId: staff.user?._id || staff.user?.id || staff.userId || "",
        category: staff.category as StaffCategory,
        experience: String(staff.experience ?? ""),
        shift: staff.shift as StaffShift,
        gender: staff.gender as Gender,
        updatedAt: staff.updatedAt || staff.createdAt,
        user: {
          ...staff.user,
          name: staff.user?.name || "",
          email: staff.user?.email || "",
          isActive: staff.user?.isActive ?? true,
        } as StaffResponse["user"],
        // Derived fields
        name: staff.user?.name || "",
        email: staff.user?.email || "",
        phone: staff.user?.phone || "",
        isActive: staff.user?.isActive ?? true,
        status: (staff.user?.isActive ?? true) ? "active" : "inactive",
        lastLogin: staff.user?.lastLogin ?? null,
      }));
    },
    retry: 2,
    retryDelay: 1000,
  });
};

// Main hook — routes to the correct endpoint based on status filter
export const useStaff = (params?: StaffListParams) => {
  const status = params?.status ?? "active";
  const category = params?.category;

  return useQuery({
    queryKey: ["staff", status, category],
    queryFn: async () => {
      let url: string;

      if (status === "inactive") {
        url = category ? `/staff/inActive?category=${category}` : "/staff/inActive";
      } else if (status === "all") {
        url = category ? `/staff/all-staff?category=${category}` : "/staff/all-staff";
      } else {
        // default: active
        url = category ? `/staff/isActive?category=${category}` : "/staff/isActive";
      }

      const response = await clientApi.get<RawStaffListResponse>(url);

      if (!response.success) {
        throw new Error(response.error || `Failed to fetch ${status} staff`);
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      const list: RawStaff[] = response.data.data ?? [];

      return {
        data: list.map((staff: RawStaff): StaffResponse => ({
          ...staff,
          id: staff._id || staff.id || "",
          _id: staff._id || staff.id || "",
          userId: staff.user?._id || staff.user?.id || staff.userId || "",
          category: staff.category as StaffCategory,
          experience: String(staff.experience ?? ""),
          shift: staff.shift as StaffShift,
          gender: staff.gender as Gender,
          updatedAt: staff.updatedAt || staff.createdAt,
          user: {
            ...staff.user,
            name: staff.user?.name || "",
            email: staff.user?.email || "",
            isActive: staff.user?.isActive ?? (status !== "inactive"),
          } as StaffResponse["user"],
          name: staff.user?.name || "",
          email: staff.user?.email || "",
          phone: staff.user?.phone || "",
          isActive: staff.user?.isActive ?? (status !== "inactive"),
          status: (staff.user?.isActive ?? (status !== "inactive")) ? "active" : "inactive",
          lastLogin: staff.user?.lastLogin ?? null,
        })),
        meta: response.data.meta,
      };
    },
    retry: 2,
    retryDelay: 1000,
  });
};

// Get inactive staff only — uses /staff/inActive endpoint
export const useInactiveStaff = (category?: StaffCategory) => {
  return useQuery({
    queryKey: ["staff", "inactive", category],
    queryFn: async () => {
      const url = category
        ? `/staff/inActive?category=${category}`
        : "/staff/inActive";

      const response = await clientApi.get<RawStaffListResponse>(url);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch inactive staff");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      const list: RawStaff[] = response.data.data ?? [];

      return list.map((staff: RawStaff): StaffResponse => ({
        ...staff,
        id: staff._id || staff.id || "",
        _id: staff._id || staff.id || "",
        userId: staff.user?._id || staff.user?.id || staff.userId || "",
        category: staff.category as StaffCategory,
        experience: String(staff.experience ?? ""),
        shift: staff.shift as StaffShift,
        gender: staff.gender as Gender,
        updatedAt: staff.updatedAt || staff.createdAt,
        user: {
          ...staff.user,
          name: staff.user?.name || "",
          email: staff.user?.email || "",
          isActive: staff.user?.isActive ?? false,
        } as StaffResponse["user"],
        name: staff.user?.name || "",
        email: staff.user?.email || "",
        phone: staff.user?.phone || "",
        isActive: staff.user?.isActive ?? false,
        status: "inactive",
        lastLogin: staff.user?.lastLogin ?? null,
      }));
    },
    retry: 2,
    retryDelay: 1000,
  });
};

// Get all staff (active + inactive) — uses /staff/all-staff endpoint
export const useAllStaff = (category?: StaffCategory) => {
  return useQuery({
    queryKey: ["staff", "all", category],
    queryFn: async () => {
      const url = category
        ? `/staff/all-staff?category=${category}`
        : "/staff/all-staff";

      const response = await clientApi.get<RawStaffListResponse>(url);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch all staff");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      const list: RawStaff[] = response.data.data ?? [];

      return list.map((staff: RawStaff): StaffResponse => ({
        ...staff,
        id: staff._id || staff.id || "",
        _id: staff._id || staff.id || "",
        userId: staff.user?._id || staff.user?.id || staff.userId || "",
        category: staff.category as StaffCategory,
        experience: String(staff.experience ?? ""),
        shift: staff.shift as StaffShift,
        gender: staff.gender as Gender,
        updatedAt: staff.updatedAt || staff.createdAt,
        user: {
          ...staff.user,
          name: staff.user?.name || "",
          email: staff.user?.email || "",
          isActive: staff.user?.isActive ?? true,
        } as StaffResponse["user"],
        name: staff.user?.name || "",
        email: staff.user?.email || "",
        phone: staff.user?.phone || "",
        isActive: staff.user?.isActive ?? true,
        status: (staff.user?.isActive ?? true) ? "active" : "inactive",
        lastLogin: staff.user?.lastLogin ?? null,
      }));
    },
    retry: 2,
    retryDelay: 1000,
  });
};

export function useUpdateStaff(options?: {
  onSuccess?: (data: StaffResponse) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    StaffResponse,
    Error,
    { id: string; data: Partial<StaffFormData> }
  >({
    mutationFn: async ({ id, data }) => {
      const updatePayload: Partial<StaffFormData> = {};

      if (data.name !== undefined) updatePayload.name = data.name.trim();
      if (data.email !== undefined) updatePayload.email = data.email.trim().toLowerCase();
      if (data.phone !== undefined) updatePayload.phone = data.phone.trim();
      if (data.skill !== undefined) updatePayload.skill = data.skill.trim();
      if (data.category !== undefined) updatePayload.category = data.category;
      if (data.experience !== undefined) updatePayload.experience = data.experience;
      if (data.salary !== undefined) updatePayload.salary = Number(data.salary);
      if (data.shift !== undefined) updatePayload.shift = data.shift;
      if (data.gender !== undefined) updatePayload.gender = data.gender;
      if (data.aadhaar !== undefined) updatePayload.aadhaar = data.aadhaar.replace(/[-\s]/g, "");
      if (data.address !== undefined) updatePayload.address = data.address.trim();
      if (data.joiningDate !== undefined) updatePayload.joiningDate = data.joiningDate;
      if (data.staffCode !== undefined) updatePayload.staffCode = data.staffCode?.trim();
      if (data.department !== undefined) updatePayload.department = data.department?.trim();
      if (data.registrationNo !== undefined) updatePayload.registrationNo = data.registrationNo?.trim();
      if (data.roleBadge !== undefined) updatePayload.roleBadge = data.roleBadge?.trim();

      const response: ApiResponse<{ data: StaffResponse }> =
        await clientApi.put(`/staff/update/${id}`, updatePayload);

      if (!response.success) {
        throw new Error(response.error || "Failed to update staff");
      }
      if (!response.data) {
        throw new Error("No data received for update");
      }

      return response.data.data;
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", data._id || data.id] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

export function useUpdateStaffPassword(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; newPassword: string }>({
    mutationFn: async ({ id, newPassword }) => {
      const response: ApiResponse<{ message: string }> = await clientApi.put(
        `/staff/${id}/password`,
        { newPassword },
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to update password");
      }

      return;
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}
type DisableStaffPayload = {
  id: string;
  isActive: boolean;
};

export function useDisableStaff(options?: {
  onSuccess?: (data: StaffResponse) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<StaffResponse, Error, DisableStaffPayload>({
    mutationFn: async ({ id, isActive }) => {
      const response: ApiResponse<{ data: StaffResponse }> =
        await clientApi.put(`/staff/disable/${id}`, {
          isActive,
        });

      if (!response.success) {
        throw new Error(response.error || "Failed to disable staff");
      }
      if (!response.data) {
        throw new Error("No data received for disable");
      }

      return response.data.data;
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", data?._id || data?.id] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

export function useEnableStaff(options?: {
  onSuccess?: (data: StaffResponse) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<StaffResponse, Error, DisableStaffPayload>({
    mutationFn: async ({ id, isActive }) => {
      const response: ApiResponse<{ data: StaffResponse }> =
        await clientApi.put(`/staff/disable/${id}`, { isActive });

      if (!response.success) {
        throw new Error(response.error || "Failed to enable staff");
      }
      if (!response.data) {
        throw new Error("No data received for enable");
      }

      return response.data.data;
    },
    retry: 1,
    retryDelay: 1000,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", data._id || data.id] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

// Hook to search staff by various criteria
export function useSearchStaff(searchTerm: string, category?: StaffCategory) {
  return useQuery({
    queryKey: ["staff-search", searchTerm, category],
    queryFn: async () => {
      if (!searchTerm.trim()) {
        return { data: [] };
      }

      // Get all staff and filter locally since API doesn't have search endpoint
      const response = await clientApi.get<RawStaffListResponse>(
        "/staff/all-staff",
      );

      if (!response.success || !response.data) {
        throw new Error("Failed to search staff");
      }

      const staffList: RawStaff[] = response.data.data ?? [];

      // Filter staff based on search term
      const filteredStaff = staffList.filter((staff) => {
        const searchLower = searchTerm.toLowerCase();

        return (
          (staff.user?.name || "").toLowerCase().includes(searchLower) ||
          (staff.user?.email || "").toLowerCase().includes(searchLower) ||
          (staff.user?.phone ?? "").includes(searchTerm) ||
          (staff.staffCode &&
            staff.staffCode.toLowerCase().includes(searchLower)) ||
          (staff.skill && staff.skill.toLowerCase().includes(searchLower)) ||
          (staff.department &&
            staff.department.toLowerCase().includes(searchLower)) ||
          (category && staff.category === category)
        );
      });

      return {
        data: filteredStaff.map((staff) => ({
          ...staff,
          id: staff._id || staff.id || "",
          _id: staff._id || staff.id || "",
          status: (staff.user?.isActive ?? false) ? "active" : "inactive",
          name: staff.user?.name || "",
          email: staff.user?.email || "",
          phone: staff.user?.phone || "",
        })),
      };
    },
    retry: 1,
    retryDelay: 1000,
    enabled: !!searchTerm.trim(),
  });
}

export function useStaffDashboardStats() {
  return useQuery<StaffDashboardStats>({
    queryKey: ["staff", "dashboard-stats"],
    queryFn: async () => {
      const response: ApiResponse<{ data: StaffDashboardStats }> =
        await clientApi.get("/staff/dashboard-stats");

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch dashboard stats");
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }

      const data = response.data.data;

      return {
        total: data.total ?? (data as any).totalStaff ?? 0,
        active: data.active ?? (data as any).activeStaff ?? 0,
        inactive: data.inactive ?? (data as any).inactiveStaff ?? 0,
        totalSalary:
          data.totalSalary ?? (data as any).totalPayroll ?? (data as any).totalSalary ?? 0,
        categoryCounts: data.categoryCounts ?? (data as any).countByCategory ?? {},
      };
    },
    retry: 2,
    retryDelay: 1000,
  });
}
