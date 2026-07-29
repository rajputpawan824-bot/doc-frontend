// services/admin/staff.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api";
import type { ApiResponse } from "@/lib/api";
import type {
  StaffResponse,
  StaffFormData,
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
  workingHours?: {
  start: string;
  end: string;
};
  roleBadge?: string;
  createdAt: string;
  updatedAt?: string;
  isActive?: boolean;
  password?: string;
  profileImageUrl?: string;
  documents?: StaffResponse["documents"];
}

interface RawStaffListResponse {
  data: RawStaff[];
  meta?: { page?: number; currentPage?: number; limit?: number; total?: number; totalRecords?: number; totalPages?: number };
  pagination?: { page?: number; currentPage?: number; limit?: number; total?: number; totalRecords?: number; totalPages?: number };
  currentPage?: number;
  totalPages?: number;
}

export interface StaffListParams {
  status?: "active" | "inactive" | "all";
  category?: StaffCategory;
  page?: number;
  limit?: number;
  search?: string;
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
  const queryClient = useQueryClient();

  return useMutation<StaffResponse, Error, StaffFormData>({
    mutationFn: async (formData: StaffFormData) => {
      const payload = new FormData();

      payload.append("name", formData.name.trim());
      payload.append("email", formData.email.trim().toLowerCase());
      payload.append("phone", formData.phone.trim());
      if (formData.skill) payload.append("skill", formData.skill.trim());
      payload.append("category", formData.category);
      if (formData.experience) {
        payload.append(
          "experience",
          String(Number(formData.experience) || formData.experience),
        );
      }
      payload.append("salary", String(Number(formData.salary)));
      payload.append("shift", formData.shift);
      payload.append("gender", formData.gender);
      payload.append("aadhaar", formData.aadhaar.replace(/[-\s]/g, ""));
      payload.append("address", formData.address.trim());
      if (formData.joiningDate) payload.append("joiningDate", formData.joiningDate);
      if (formData.workingHours) {
        payload.append("workingHours[start]", formData.workingHours.start);
        payload.append("workingHours[end]", formData.workingHours.end);
      }
      if (formData.staffCode) payload.append("staffCode", formData.staffCode.trim());
      if (formData.department) payload.append("department", formData.department.trim());
      if (formData.registrationNo) payload.append("registrationNo", formData.registrationNo.trim());
      if (formData.roleBadge) payload.append("roleBadge", formData.roleBadge.trim());
      if (formData.password) payload.append("password", formData.password);
const documentTypes: string[] = [];
const customDocumentNames: string[] = [];

formData.documents?.forEach((doc) => {
if (!doc.file) return;

payload.append("files", doc.file);

  documentTypes.push(doc.documentType);
  customDocumentNames.push(doc.customDocumentName || "");
});

payload.append(
  "documentTypes",
  JSON.stringify(documentTypes)
);

payload.append(
  "customDocumentNames",
  JSON.stringify(customDocumentNames)
);

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", data._id || data.id] });
      queryClient.invalidateQueries({ queryKey: ["staff", "profile"] });
      options?.onSuccess?.(data);
    },
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
        profileImageUrl: staff.profileImageUrl,
        documents: staff.documents ?? [],
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
        documents: staff.documents ?? [],
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
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const search = params?.search ?? "";

  return useQuery({
    queryKey: ["staff", status, category, page, limit, search],
    queryFn: async () => {
      const urlParams = new URLSearchParams();
      urlParams.append("page", String(page));
      urlParams.append("limit", String(limit));
      urlParams.append("search", search);
      if (category) {
        urlParams.append("category", category);
      }

      let endpoint: string;

      if (status === "inactive") {
        endpoint = "/staff/inActive";
      } else if (status === "all") {
        endpoint = "/staff/all-staff";
      } else {
        // default: active
        endpoint = "/staff/isActive";
      }

      const response = await clientApi.get<RawStaffListResponse>(
        `${endpoint}?${urlParams.toString()}`,
      );

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
          documents: staff.documents ?? [],
        })),
        pagination: response.data.pagination ?? response.data.meta ?? {
          page: response.data.currentPage ?? page,
          limit,
          totalRecords: list.length,
          totalPages: response.data.totalPages ?? 1,
        },
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
        documents: staff.documents ?? [],
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
        documents: staff.documents ?? [],
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
      const updatePayload = new FormData();

      if (data.name !== undefined) updatePayload.append("name", data.name.trim());
      if (data.email !== undefined) updatePayload.append("email", data.email.trim().toLowerCase());
      if (data.phone !== undefined) updatePayload.append("phone", data.phone.trim());
      if (data.skill !== undefined) updatePayload.append("skill", data.skill.trim());
      if (data.category !== undefined) updatePayload.append("category", data.category);
      if (data.experience !== undefined) updatePayload.append("experience", data.experience);
      if (data.salary !== undefined) updatePayload.append("salary", String(Number(data.salary)));
      if (data.shift !== undefined) updatePayload.append("shift", data.shift);
      if (data.gender !== undefined) updatePayload.append("gender", data.gender);
      if (data.aadhaar !== undefined) updatePayload.append("aadhaar", data.aadhaar.replace(/[-\s]/g, ""));
      if (data.address !== undefined) updatePayload.append("address", data.address.trim());
      if (data.joiningDate !== undefined) updatePayload.append("joiningDate", data.joiningDate);
      if (data.workingHours !== undefined) {
  updatePayload.append("workingHours[start]", data.workingHours.start);
  updatePayload.append("workingHours[end]", data.workingHours.end);
}
      if (data.staffCode !== undefined) updatePayload.append("staffCode", data.staffCode.trim());
      if (data.department !== undefined) updatePayload.append("department", data.department.trim());
      if (data.registrationNo !== undefined) updatePayload.append("registrationNo", data.registrationNo.trim());
      if (data.roleBadge !== undefined) updatePayload.append("roleBadge", data.roleBadge.trim());
      if (data.profileImage) {
        updatePayload.append("profileImage", data.profileImage);
      }
const documentTypes: string[] = [];
const customDocumentNames: string[] = [];

data.documents?.forEach((doc) => {
  if (!doc.file) return;

updatePayload.append("documents", doc.file);

  documentTypes.push(doc.documentType);
  customDocumentNames.push(doc.customDocumentName || "");
});

updatePayload.append(
  "documentTypes",
  JSON.stringify(documentTypes)
);

updatePayload.append(
  "customDocumentNames",
  JSON.stringify(customDocumentNames)
);
if (data.deletedDocumentIds?.length) {
  updatePayload.append(
    "deletedDocuments",
    JSON.stringify(data.deletedDocumentIds)
  );
}

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
      queryClient.invalidateQueries({ queryKey: ["staff", "profile"] });
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
        `/staff/password/${id}`,
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
  const normalizedSearch = searchTerm.replace(/[\s-]/g, "");

  return (
    (staff.user?.name || "").toLowerCase().includes(searchLower) ||
    (staff.user?.email || "").toLowerCase().includes(searchLower) ||
    (staff.user?.phone ?? "").includes(searchTerm) ||
    String(staff.aadhaar || "")
      .replace(/[\s-]/g, "")
      .includes(normalizedSearch) ||
    (staff.staffCode &&
      staff.staffCode.toLowerCase().includes(searchLower)) ||
    (staff.skill &&
      staff.skill.toLowerCase().includes(searchLower)) ||
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



export const useNextStaffCode = () => {
  return useQuery({
    queryKey: ["next-staff-code"],
    queryFn: async () => {
      const response = await clientApi.get<{
        data: {
          staffCode: string;
        };
      }>("/staff/next-code");

      if (!response.success || !response.data) {
        throw new Error("Failed to fetch staff code");
      }

      return response.data.data;
    },
    staleTime: 0,
  });
};
