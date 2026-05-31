"use client";

import { useState, useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/reusable/data-table";
import ReusableModal, {
  FormSection,
} from "@/components/reusable/reusable-modal";
import DeleteModal from "@/components/ui/delete-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DynamicDetailModal, {
  SectionConfig,
  ActionButton,
} from "@/components/reusable/detail-modal";

import {
  Users,
  UserCheck,
  UserX,
  DollarSign,
  Stethoscope,
  GraduationCap,
  Calendar,
  Clock,
  IndianRupee,
  Eye,
  Edit2,
  Trash2,
  Plus,
  FileText,
  Building,
  Shield,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  TrendingUp,
  Activity,
  Key,
  Loader2,
  RefreshCw,
  UserCog,
  UserMinus,
  UserPlus,
  HeartPulse,
  Syringe,
  ClipboardList,
  Microscope,
  ShieldAlert,
  Sparkles,
  Home,
  Settings,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Import types and API hooks
import {
  StaffCategory,
  StaffFormData,
  STAFF_VALIDATION_RULES,
  formatAadhaarNumber,
  parseExperience,
  transformValidation,
} from "@/lib/validations/Admin/staff";
import {
  useAddStaff,
  useStaff,
  useStaffById,
  useUpdateStaff,
  useDisableStaff,
  useEnableStaff,
  useStaffDashboardStats,
  useActiveStaff,
  useInactiveStaff,
  useAllStaff,
} from "@/services/admin/staff";

// Define interface for staff data
interface StaffMember {
  id: string;
  userId: string;
  skill: string;
  category: StaffCategory;
  experience?: string;
  salary: number;
  shift: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT" | "ROTATING";
  gender: "MALE" | "FEMALE" | "OTHER";
  aadhaar: string;
  address: string;
  registrationNo?: string;
  department?: string;
  staffCode?: string;
  joiningDate?: string;
  roleBadge?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    phone: string;
    password: string;
    name: string;
    role: "STAFF";
    isActive: boolean;
    isVerified: boolean;
    resetToken: string | null;
    resetTokenExp: string | null;
    otpCode: string | null;
    otpExpiry: string | null;
    lastLogin: string | null;
    createdAt: string;
    updatedAt: string;
  };
  status?: "active" | "inactive";
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

// Form sections for staff
const staffFormSections: FormSection[] = [
  {
    title: "Personal Information",
    icon: <Users className="h-4 w-4" />,
    fields: [
      {
        name: "name",
        label: "Full Name",
        type: "text",
        required: true,
        placeholder: "John Doe",
        width: "full",
        validation: transformValidation(STAFF_VALIDATION_RULES.name),
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        required: true,
        width: "half",
        options: [
          { value: "MALE", label: "Male" },
          { value: "FEMALE", label: "Female" },
          { value: "OTHER", label: "Other" },
        ],
        validation: transformValidation(STAFF_VALIDATION_RULES.gender),
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "staff@hospital.com",
        width: "half",
        validation: transformValidation(STAFF_VALIDATION_RULES.email),
      },
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        required: true,
        placeholder: "9876543210",
        width: "half",
        validation: transformValidation(STAFF_VALIDATION_RULES.phone),
      },
      {
        name: "aadhaar",
        label: "Aadhaar Number",
        type: "text",
        required: true,
        placeholder: "123456789012",
        width: "half",
        validation: transformValidation(STAFF_VALIDATION_RULES.aadhaar),
      },
      {
        name: "address",
        label: "Address",
        type: "textarea",
        required: true,
        placeholder: "Full residential address",
        width: "full",
        rows: 3,
        validation: transformValidation(STAFF_VALIDATION_RULES.address),
      },
    ],
  },
  {
    title: "Professional Details",
    icon: <Briefcase className="h-4 w-4" />,
    fields: [
      {
        name: "category",
        label: "Staff Category",
        type: "select",
        required: true,
        width: "half",
        options: [
          { value: "DOCTOR", label: "Doctor" },
          { value: "NURSE", label: "Nurse" },
          { value: "RECEPTIONIST", label: "Receptionist" },
          { value: "TECHNICIAN", label: "Technician" },
          { value: "PHARMACIST", label: "Pharmacist" },
          { value: "ADMIN", label: "Administrator" },
          { value: "LAB_TECHNICIAN", label: "Lab Technician" },
          { value: "WARD_BOY", label: "Ward Boy" },
          { value: "CLEANING_STAFF", label: "Cleaning Staff" },
          { value: "SECURITY", label: "Security Guard" },
        ],
        validation: transformValidation(STAFF_VALIDATION_RULES.category),
      },
      {
        name: "skill",
        label: "Skill/Specialization",
        type: "text",
        required: true,
        placeholder: "e.g., General Nursing, Lab Testing",
        width: "half",
        validation: transformValidation(STAFF_VALIDATION_RULES.skill),
      },
      {
        name: "experience",
        label: "Experience",
        type: "text",
        placeholder: "3 years or 6 months",
        width: "half",
        validation: transformValidation(STAFF_VALIDATION_RULES.experience),
      },
      {
        name: "salary",
        label: "Monthly Salary (₹)",
        type: "number",
        required: true,
        placeholder: "25000",
        width: "half",
        min: 0,
        validation: transformValidation(STAFF_VALIDATION_RULES.salary),
      },
    ],
  },
  {
    title: "Employment Details",
    icon: <Calendar className="h-4 w-4" />,
    fields: [
      {
        name: "shift",
        label: "Shift",
        type: "select",
        required: true,
        width: "half",
        options: [
          { value: "MORNING", label: "Morning" },
          { value: "AFTERNOON", label: "Afternoon" },
          { value: "EVENING", label: "Evening" },
          { value: "NIGHT", label: "Night" },
          { value: "ROTATING", label: "Rotating" },
        ],
        validation: transformValidation(STAFF_VALIDATION_RULES.shift),
      },
      {
        name: "department",
        label: "Department",
        type: "text",
        placeholder: "NURSING, ICU, LAB, etc.",
        width: "half",
        validation: transformValidation(STAFF_VALIDATION_RULES.department),
      },
      {
        name: "registrationNo",
        label: "Registration Number",
        type: "text",
        placeholder: "RN-1234, PH-5678, etc.",
        width: "half",
        validation: transformValidation(STAFF_VALIDATION_RULES.registrationNo),
      },
      {
        name: "staffCode",
        label: "Staff Code",
        type: "text",
        placeholder: "STF-001",
        width: "half",
        validation: transformValidation(STAFF_VALIDATION_RULES.staffCode),
      },
      {
        name: "joiningDate",
        label: "Joining Date",
        type: "date",
        placeholder: "Select joining date",
        width: "half",
      },
      {
        name: "roleBadge",
        label: "Role Badge",
        type: "text",
        placeholder: "Senior Nurse, Head Technician, etc.",
        width: "half",
        validation: transformValidation(STAFF_VALIDATION_RULES.roleBadge),
      },
    ],
  },
];

const StaffManagement = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const [filterActive, setFilterActive] = useState<
    "active" | "inactive" | "all"
  >("active");
  const [viewMode, setViewMode] = useState<"all" | "other">("all");
  const queryClient = useQueryClient();
  const {
    data: selectedStaff,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useStaffById(selectedStaffId || undefined);

  // API Hooks
  const {
    data: staffResponse,
    isLoading,
    refetch,
  } = useStaff({ status: filterActive });

  const {
    data: staffStats,
    isLoading: isStatsLoading,
    refetch: refetchStaffStats,
  } = useStaffDashboardStats();

  const addStaffMutation = useAddStaff({
    onSuccess: (data) => {
      toast.success("Staff created successfully");
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "dashboard-stats"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add staff");
    },
  });

  const updateStaffMutation = useUpdateStaff({
    onSuccess: (data) => {
      toast.success("Staff updated successfully");
      setModalOpen(false);
      setEditingStaff(null);
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "dashboard-stats"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update staff");
    },
  });

  const disableStaffMutation = useDisableStaff({
    onSuccess: (data) => {
      toast.success("Staff disabled successfully");
      setDeleteModalOpen(false);
      setStaffToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "dashboard-stats"] });
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.message || "Failed to disable staff");
    },
  });

  const enableStaffMutation = useEnableStaff({
    onSuccess: (data) => {
      toast.success("Staff enabled successfully");
      setDeleteModalOpen(false);
      setStaffToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff", "dashboard-stats"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to enable staff");
    },
  });

  // Get staff data from API response
  const staff = staffResponse?.data || [];



  const staffList: StaffMember[] = (staffResponse?.data || []) as StaffMember[];
  const filteredStaff = useMemo<StaffMember[]>(() => {
    let result = staffList;

    if (viewMode === "other") {
      result = result.filter((s) => s.category !== "DOCTOR");
    }

    return result;
  }, [staffList, viewMode]);

  // Stats data
  const stats = [
    {
      title: "Total Staff",
      value: staffStats?.total?.toString() || "0",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Inactive Staff",
      value: staffStats?.inactive?.toString() || "0",
      icon: Stethoscope,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Active Staff",
      value: staffStats?.active?.toString() || "0",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Payroll",
      value: `₹${staffStats?.totalSalary?.toLocaleString("en-IN") || "0"}`,
      icon: IndianRupee,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
  ];

  // Helper function to get category icon
  const getCategoryIcon = (category: StaffCategory) => {
    const icons: Record<StaffCategory, React.ReactNode> = {
      DOCTOR: <Stethoscope className="h-4 w-4" />,
      NURSE: <HeartPulse className="h-4 w-4" />,
      RECEPTIONIST: <ClipboardList className="h-4 w-4" />,
      TECHNICIAN: <Settings className="h-4 w-4" />,
      PHARMACIST: <Syringe className="h-4 w-4" />,
      ADMIN: <UserCog className="h-4 w-4" />,
      LAB_TECHNICIAN: <Microscope className="h-4 w-4" />,
      WARD_BOY: <Home className="h-4 w-4" />,
      CLEANING_STAFF: <Sparkles className="h-4 w-4" />,
      SECURITY: <ShieldAlert className="h-4 w-4" />,
    };
    return icons[category] || <Users className="h-4 w-4" />;
  };

  // Helper function to get category color
  const getCategoryColor = (category: StaffCategory) => {
    const colors: Record<StaffCategory, string> = {
      DOCTOR: "bg-blue-100 text-blue-800",
      NURSE: "bg-green-100 text-green-800",
      RECEPTIONIST: "bg-purple-100 text-purple-800",
      TECHNICIAN: "bg-yellow-100 text-yellow-800",
      PHARMACIST: "bg-pink-100 text-pink-800",
      ADMIN: "bg-gray-100 text-gray-800",
      LAB_TECHNICIAN: "bg-cyan-100 text-cyan-800",
      WARD_BOY: "bg-orange-100 text-orange-800",
      CLEANING_STAFF: "bg-teal-100 text-teal-800",
      SECURITY: "bg-red-100 text-red-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  // Staff columns
  const staffColumns: ColumnDef<StaffMember>[] = [
    {
      accessorKey: "name",
      header: "Staff Member",
      cell: ({ row }) => {
        const staff = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-medium flex items-center gap-2">
              {staff.user?.name || staff.name}
              <Badge variant="outline" className="text-xs">
                {getCategoryIcon(staff.category)}
                <span className="ml-1">{staff?.category?.replace("_", " ")}</span>
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Mail className="h-3 w-3" />
              {staff.user?.email || staff.email}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              <Phone className="h-3 w-3" />
              {staff.user?.phone || staff.phone}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "professional",
      header: "Professional Details",
      cell: ({ row }) => {
        const staff = row.original;
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-3 w-3 text-blue-600" />
              <span className="text-sm font-medium">{staff.skill}</span>
            </div>
            {staff.department && (
              <div className="flex items-center gap-2">
                <Building className="h-3 w-3 text-gray-600" />
                <span className="text-sm">{staff.department}</span>
              </div>
            )}
            {staff.experience && (
              <div className="text-xs text-muted-foreground">
                Exp: {staff.experience}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "shift",
      header: "Shift",
      cell: ({ row }) => {
        const staff = row.original;
        const shiftColors = {
          MORNING: "bg-yellow-100 text-yellow-800",
          AFTERNOON: "bg-orange-100 text-orange-800",
          EVENING: "bg-purple-100 text-purple-800",
          NIGHT: "bg-indigo-100 text-indigo-800",
          ROTATING:
            "bg-gradient-to-r from-blue-100 to-purple-100 text-purple-800",
        };
        return (
          <Badge
            className={shiftColors[staff.shift] || "bg-gray-100 text-gray-800"}
          >
            {staff.shift}
          </Badge>
        );
      },
    },
    {
      accessorKey: "financial",
      header: "Financial",
      cell: ({ row }) => {
        const staff = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-3 w-3 text-green-600" />
              <span className="text-sm font-medium">
                ₹{staff?.salary?.toLocaleString("en-IN")}
              </span>
            </div>
            {staff.staffCode && (
              <div className="text-xs text-muted-foreground">
                Code: {staff.staffCode}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const staff = row.original;
        const isActive = staff.user?.isActive || staff.isActive;
        return (
          <Badge
            className={
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const staff = row.original;
        const isActive = staff.user?.isActive || staff.isActive;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                ⋯
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewDetails(staff.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditStaff(staff)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {isActive ? (
                <DropdownMenuItem
                  onClick={() => handleDisableStaff(staff)}
                  className="text-red-600"
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Disable
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => handleEnableStaff(staff)}
                  className="text-green-600"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Reactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const shiftColors: Record<string, string> = {
    MORNING: "bg-yellow-100 text-yellow-800",
    AFTERNOON: "bg-orange-100 text-orange-800",
    EVENING: "bg-purple-100 text-purple-800",
    NIGHT: "bg-indigo-100 text-indigo-800",
    ROTATING: "bg-gradient-to-r from-blue-100 to-purple-100 text-purple-800",
  };

  const detailSections: SectionConfig[] = [
    {
      id: "personal-info",
      title: "Personal Information",
      description: "Staff's personal and contact details",
      icon: <Users className="h-5 w-5 text-blue-600" />,
      layout: "grid",
      columns: 2,
      bgColor: "#f8fafc",
      borderColor: "#e2e8f0",
      fields: [
        {
          key: "user.name",
          label: "Full Name",
          type: "text",
          icon: <Users className="w-4 h-4" />,
          width: "full",
          important: true,
        },
        {
          key: "user.email",
          label: "Email Address",
          type: "email",
          icon: <Mail className="w-4 h-4" />,
          width: "half",
        },
        {
          key: "user.phone",
          label: "Phone Number",
          type: "phone",
          icon: <Phone className="w-4 h-4" />,
          width: "half",
        },
        {
          key: "gender",
          label: "Gender",
          type: "badge",
          icon: <Users className="w-4 h-4" />,
          width: "half",
          format: (value) => {
            const genderValue = typeof value === "string" ? value : "";
            return (
              <Badge
                className={
                  genderValue === "MALE"
                    ? "bg-blue-100 text-blue-800"
                    : genderValue === "FEMALE"
                      ? "bg-pink-100 text-pink-800"
                      : "bg-purple-100 text-purple-800"
                }
              >
                {genderValue}
              </Badge>
            );
          },
        },
        {
          key: "aadhaar",
          label: "Aadhaar Number",
          type: "text",
          icon: <Shield className="w-4 h-4" />,
          width: "half",
          format: (value) => {
            const aadhaarValue = typeof value === "string" ? value : "";
            return formatAadhaarNumber(aadhaarValue);
          },
        },
        {
          key: "address",
          label: "Address",
          type: "text",
          icon: <MapPin className="w-4 h-4" />,
          width: "full",
        },
      ],
    },
    {
      id: "professional-details",
      title: "Professional Details",
      description: "Staff qualifications and expertise",
      icon: <Briefcase className="h-5 w-5 text-green-600" />,
      layout: "grid",
      columns: 2,
      bgColor: "#f0fdf4",
      borderColor: "#bbf7d0",
      fields: [
        {
          key: "skill",
          label: "Skill/Specialization",
          type: "text",
          icon: <Briefcase className="w-4 h-4" />,
          width: "full",
          important: true,
        },
          {
            key: "category",
            label: "Category",
            type: "badge",
            icon: <Users className="w-4 h-4" />,
            width: "half",
            format: (value) => {
              const categoryValue =
                typeof value === "string"
                  ? (value as StaffCategory)
                  : ("ADMIN" as StaffCategory);
              return (
                <Badge className={getCategoryColor(categoryValue)}>
                  {categoryValue.replace("_", " ")}
                </Badge>
              );
            },
          },
        {
          key: "department",
          label: "Department",
          type: "text",
          icon: <Building className="w-4 h-4" />,
          width: "half",
        },
        {
          key: "experience",
          label: "Experience",
          type: "text",
          icon: <TrendingUp className="w-4 h-4" />,
          width: "half",
        },
        {
          key: "registrationNo",
          label: "Registration Number",
          type: "text",
          icon: <FileText className="w-4 h-4" />,
          width: "half",
        },
        {
          key: "roleBadge",
          label: "Role Badge",
          type: "text",
          icon: <Star className="w-4 h-4" />,
          width: "half",
        },
      ],
    },
    {
      size: 50,
      id: "employment-details",
      title: "Employment Details",
      description: "Staff employment information",
      icon: <Calendar className="h-5 w-5 text-yellow-600" />,
      layout: "grid",
      columns: 2,
      bgColor: "#fffbeb",
      borderColor: "#fde68a",
      fields: [
        {
          key: "shift",
          label: "Shift",
          type: "badge",
          icon: <Clock className="w-4 h-4" />,
          width: "half",
          format: (value) => {
            const shiftValue = typeof value === "string" ? value : "";
            return (
              <Badge
                className={shiftColors[shiftValue] || "bg-gray-100 text-gray-800"}
              >
                {shiftValue}
              </Badge>
            );
          },
        },
        {
          key: "salary",
          label: "Monthly Salary",
          type: "currency",
          icon: <IndianRupee className="w-4 h-4" />,
          width: "half",
          important: true,
          format: (value) => {
            const amount = typeof value === "number" ? value : Number(value || 0);
            return `₹${amount.toLocaleString("en-IN")}`;
          },
        },
        {
          key: "staffCode",
          label: "Staff Code",
          type: "text",
          icon: <Key className="w-4 h-4" />,
          width: "half",
        },
        {
          key: "joiningDate",
          label: "Joining Date",
          type: "date",
          icon: <Calendar className="w-4 h-4" />,
          width: "half",
        },
      ],
    },
    {
      size: 50,
      id: "status-info",
      title: "Status Information",

      description: "Account and system information",
      icon: <Activity className="h-5 w-5 text-gray-600" />,
      layout: "grid",
      columns: 1,
      fields: [
        {
          key: "user.isActive",
          label: "Account Status",
          type: "status",
          icon: <Activity className="w-4 h-4" />,
          width: "half",
          format: (value) => (
            <Badge
              className={
                value
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {value ? "Active" : "Inactive"}
            </Badge>
          ),
        },
        {
          key: "createdAt",
          label: "Account Created",
          type: "datetime",
          icon: <Calendar className="w-4 h-4" />,
          width: "half",
        },
        {
          key: "updatedAt",
          label: "Last Updated",
          type: "datetime",
          icon: <Clock className="w-4 h-4" />,
          width: "half",
        },
        {
          key: "user.lastLogin",
          label: "Last Login",
          type: "datetime",
          icon: <Clock className="w-4 h-4" />,
          width: "half",
          format: (value) =>
            typeof value === "string" && value ? value : "Never logged in",
        },
      ],
    },
  ];

  // Event handlers
  const handleViewDetails = (staffId: string) => {
    // You can implement a detail modal here
    setSelectedStaffId(staffId);
    setIsDetailModalOpen(true);
  };

  const handleEditStaff = (staffMember: StaffMember) => {
    setEditingStaff(staffMember);
    setModalOpen(true);
  };

  const handleDisableStaff = (staffMember: StaffMember) => {
    setStaffToDelete(staffMember);
    setDeleteModalOpen(true);
  };

  const handleEnableStaff = (staffMember: StaffMember) => {
    setStaffToDelete(staffMember);
    // For enable, we'll show the delete modal but with enable action
    setDeleteModalOpen(true);
  };

  const handleSave = (data: Record<string, unknown>) => {
    console.log("clicked");
    if (editingStaff) {
      // Update staff
      updateStaffMutation.mutate({
        id: editingStaff.id,
        data: data as Partial<StaffFormData>,
      });
    } else {
      console.log("new staff clicked");
      // Add new staff
      const formData: StaffFormData = {
        name: String(data.name || ""),
        email: String(data.email || ""),
        phone: String(data.phone || ""),
        skill: String(data.skill || ""),
        category: data.category as StaffFormData["category"],
        experience: data.experience ? String(data.experience) : undefined,
        salary: Number(data.salary),
        shift: data.shift as StaffFormData["shift"],
        gender: data.gender as StaffFormData["gender"],
        aadhaar: String(data.aadhaar || ""),
        address: String(data.address || ""),
       ...(typeof data.department === "string" && {
  department: data.department,
}),
...(typeof data.registrationNo === "string" && {
  registrationNo: data.registrationNo,
}),
...(typeof data.staffCode === "string" && {
  staffCode: data.staffCode,
}),
...(typeof data.joiningDate === "string" && {
  joiningDate: data.joiningDate,
}),
...(typeof data.roleBadge === "string" && {
  roleBadge: data.roleBadge,
}),
      };

      addStaffMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (staffToDelete) {
      const isActive = staffToDelete.user?.isActive || staffToDelete.isActive;

      if (isActive) {
        disableStaffMutation.mutate({ id: staffToDelete.id, isActive: false });
      } else {
        enableStaffMutation.mutate({ id: staffToDelete.id, isActive: true });
      }
    }
  };

  const handleRefresh = () => {
    refetch();
    refetchStaffStats();
  };

  // Get initial form data for editing
  const getInitialData = () => {
    if (!editingStaff) return {};

    return {
      name: editingStaff.user?.name || editingStaff.name || "",
      email: editingStaff.user?.email || editingStaff.email || "",
      phone: editingStaff.user?.phone || editingStaff.phone || "",
      skill: editingStaff.skill || "",
      category: editingStaff.category,
      experience: editingStaff.experience || "",
      salary: editingStaff.salary,
      shift: editingStaff.shift,
      gender: editingStaff.gender,
      aadhaar: editingStaff.aadhaar,
      address: editingStaff.address,
      department: editingStaff.department || "",
      registrationNo: editingStaff.registrationNo || "",
      staffCode: editingStaff.staffCode || "",
      joiningDate: editingStaff.joiningDate?.split("T")[0] || "",
      roleBadge: editingStaff.roleBadge || "",
    };
  };

  // Loading state
  if (isLoading && !staffResponse) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading staff data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-8 w-8" />
          Staff Management
        </h1>
        <p className="text-gray-600">
          Manage nurses, and other clinic staff members efficiently
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter and Add Button */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2">
            <Button
              variant={filterActive === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterActive("active")}
            >
              <UserCheck className="h-3 w-3 mr-1" />
              Active
            </Button>
            <Button
              variant={filterActive === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterActive("inactive")}
            >
              <UserX className="h-3 w-3 mr-1" />
              Inactive
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setEditingStaff(null);
              setModalOpen(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={addStaffMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            {addStaffMutation.isPending ? "Adding..." : "Add Staff"}
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {viewMode === "other" ? (
                <>
                  <Users className="h-5 w-5 text-blue-600" />
                  Other Staff ({filteredStaff.length})
                </>
              ) : (
                <>
                  <Users className="h-5 w-5 text-blue-600" />
                  All Staff ({filteredStaff.length})
                </>
              )}
            </h3>
            <p className="text-sm text-gray-500">
              {viewMode === "other"
                ? "Nurses, receptionists, technicians, and administrative staff"
                : "All clinic staff members"}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <DataTable<StaffMember, unknown>
              columns={staffColumns}
              data={filteredStaff}
              searchColumn="name"
              searchPlaceholder={`Search ${viewMode === "other" ? "staff" : "staff"} by name, category, or skill...`}
              emptyMessage={
                <div className="text-center py-12">
                  {viewMode === "other" ? (
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                  ) : (
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <h3 className="mt-4 text-lg font-semibold">
                    No staff members found
                  </h3>
                </div>
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Staff Form Modal */}
      <ReusableModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingStaff(null);
        }}
        onSave={handleSave}
        title={editingStaff ? "Edit Staff Member" : "Add New Staff"}
        sections={staffFormSections}
        initialData={getInitialData()}
        isEdit={!editingStaff}
        size="xl"
        saveButtonText={
          editingStaff
            ? updateStaffMutation.isPending
              ? "Updating..."
              : "Update Staff"
            : addStaffMutation.isPending
              ? "Adding..."
              : "Add Staff"
        }
        cancelButtonText="Cancel"
        saveButtonColor={
          editingStaff
            ? "linear-gradient(135deg, #10b981, #059669)"
            : "linear-gradient(135deg, #3b82f6, #1e40af)"
        }
        validationOnChange={true}
      />

      {/* Delete/Enable Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setStaffToDelete(null);
        }}
        onConfirm={handleDelete}
        title={
          staffToDelete?.user?.isActive || staffToDelete?.isActive
            ? "Disable Staff Member"
            : "Enable Staff Member"
        }
        description={
          staffToDelete?.user?.isActive || staffToDelete?.isActive
            ? `Are you sure you want to disable ${staffToDelete?.user?.name || staffToDelete?.name}? They will no longer be able to access the system.`
            : `Are you sure you want to enable ${staffToDelete?.user?.name || staffToDelete?.name}? They will regain access to the system.`
        }
        confirmLabel={
          staffToDelete?.user?.isActive || staffToDelete?.isActive
            ? "Disable"
            : "Enable"
        }
        itemHeading={
          staffToDelete?.user?.isActive || staffToDelete?.isActive
            ? "Item to be disable:"
            : "Item to be enabled:"
        }
        destructive={
          staffToDelete?.user?.isActive || staffToDelete?.isActive
        }
        data={{
          Name: staffToDelete?.user?.name || staffToDelete?.name,
          Category: staffToDelete?.category?.replace("_", " "),
          Email: staffToDelete?.user?.email || staffToDelete?.email,
        }}
        isLoading={
          staffToDelete?.user?.isActive || staffToDelete?.isActive
            ? disableStaffMutation.isPending
            : enableStaffMutation.isPending
        }
      />

      <DynamicDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStaffId(null);
        }}
        title="Staff Details"
        subtitle={selectedStaff?.category?.replace("_", " ")}
        data={selectedStaff as Record<string, unknown> | undefined}
        sections={detailSections}
        // actions={detailActions}
        size="xl"
        headerColor="#3b82f6"
        showRawData={false}
        isLoading={isDetailLoading}
      />
    </div>
  );
};

export default StaffManagement;
