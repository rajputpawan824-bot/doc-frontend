"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  Users,
  UserPlus,
  UserCog,
  UserMinus,
  Archive,
  Search,
  RefreshCw,
  UserCheck,
  Monitor,
  Phone,
  Mail,
  Calendar,
  Clock,
  IndianRupee,
  MapPin,
  Shield,
  Briefcase,
  Building,
  Key,
  Eye,
  Loader2,
  Stethoscope,
  GraduationCap,
  FileText,
  TrendingUp,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ReusableModal, {
  FormSection,
} from "@/components/reusable/reusable-modal";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DoctorFormData,
  DoctorResponse,
  DOCTOR_VALIDATION_RULES,
  formatAadhaarNumber,
  parseExperience,
} from "@/lib/validations/Admin/doctor";
import DynamicDetailModal, {
  SectionConfig,
  ActionButton,
  transformValidation,
} from "@/components/reusable/detail-modal";
import {
  useAddDoctor,
  useDoctorById,
  useDoctors,
  useUpdateDoctor,
  useUpdateDoctorDisable,
  useUpdateDoctorPassword,
  useDoctorDashboardStats,
  type DoctorDashboardStats,
  useOnLeaveDoctors,
  useDoctorNextCode,
type OnLeaveDoctor,
} from "@/services/admin/doctor";

// Types
interface Doctor extends DoctorResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedDoctorTableProps {
 columns: ColumnDef<any>[];
  data: any[];
  emptyMessage: ReactNode;
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function PaginatedDoctorTable({
  columns,
  data,
  emptyMessage,
  currentPage,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
}: PaginatedDoctorTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <span>Page</span>
            <strong>
              {currentPage} of {totalPages}
            </strong>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>

          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
          >
            {[10, 20, 30, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

const doctorColors = {
  primary: "#1e40af",
  secondary: "#3b82f6",
  accent: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  teal: "#0d9488",
  purple: "#8b5cf6",
  pink: "#ec4899",
  indigo: "#6366f1",
};

// ==================== MAIN COMPONENT ====================
const DoctorsPage = ({ initialDoctors }: { initialDoctors?: DoctorResponse[] }) => {
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [activationErrorOpen, setActivationErrorOpen] = useState(false);
const [activationErrorMessage, setActivationErrorMessage] = useState("");
   
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryClient = useQueryClient();
  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // API Hooks
const {
  data: doctorsResponse,
  isLoading,
  isFetching,
  refetch: refetchDoctors,
} = useDoctors({
  status: activeTab === "on-leave" ? "on_leave" : activeTab,
  page,
  limit,
  search: searchQuery,
});


  const doctors = doctorsResponse?.data || initialDoctors || [];
  console.log("Doctors Response:", doctorsResponse);
console.log("Doctors Data:", doctors);
console.log("First Doctor:", doctors[0]);
  const doctorPagination = doctorsResponse?.pagination;
  const totalPages = Math.max(doctorPagination?.totalPages ?? 1, 1);
  const currentPage = Math.min(
    Math.max(doctorPagination?.page ?? doctorPagination?.currentPage ?? page, 1),
    totalPages,
  );
  const totalRecords =
    doctorPagination?.totalRecords ??
    doctorPagination?.total ??
    doctors.length;
 const {
  data,
  refetch: refetchDashboardStats,
} = useDoctorDashboardStats();
  const dashboardStats = data as DoctorDashboardStats | undefined;

const { data: nextDoctorCode } = useDoctorNextCode();

  const {
  data: onLeaveData,
  isLoading: isOnLeaveLoading,
  refetch: refetchOnLeaveDoctors,
} = useOnLeaveDoctors();

console.log("On Leave Data:", onLeaveData);
  const {
    data: selectedDoctor,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useDoctorById(selectedDoctorId || undefined);

  const addDoctorMutation = useAddDoctor({
    onSuccess: (data) => {
      toast.success("Doctor added successfully");
      setIsAddModalOpen(false);
      queryClient.invalidateQueries({
  queryKey: ["salary-list"],
});

queryClient.invalidateQueries({
  queryKey: ["salary-dashboard-stats"],
});
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctors", "dashboard-stats"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add doctor");
    },
  });

  const updatePasswordMutation = useUpdateDoctorPassword();

  const editDoctorMutation = useUpdateDoctor({
    onSuccess: () => {
      toast.success("Doctor updated successfully");
      setIsEditModalOpen(false);

         queryClient.invalidateQueries({
      queryKey: ["doctors"],
    });
         queryClient.invalidateQueries({
      queryKey: ["doctors", "dashboard-stats"],
    });

    queryClient.invalidateQueries({
      queryKey: ["doctor", selectedDoctorId],
    });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update doctor");
    },
  });

  const blockDoctorMutation = useUpdateDoctorDisable({
    onSuccess: (data) => {
      toast.success(`Doctor ${data.status === "active" ? "activated" : "disabled"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctors", "dashboard-stats"] });

    },
onError: (error) => {
    console.log("Nahi" , error);

  setActivationErrorMessage(
    error.message ||
      "This employee cannot be activated because the joining date is in the future."
  );

  setActivationErrorOpen(true);
},
  });



  const activeDoctors = doctors.filter((d) => d.status === "active");
  const inactiveDoctors = doctors.filter((d) => d.status === "inactive");
const onLeaveDoctors = onLeaveData || [];

  const filteredDoctors = {
    active: activeDoctors.filter(
      (d) =>
        !searchQuery ||
        d?.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d?.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(d?.aadhaar || "")
        .replace(/[\s-]/g, "")
        .includes(searchQuery.replace(/[\s-]/g, ""))||
        
        d?.user?.phone.includes(searchQuery) ||
        d.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.registrationNo.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
    inactive: inactiveDoctors.filter(
      (d) =>
        !searchQuery ||
        d?.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d?.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d?.user?.phone.includes(searchQuery) ||
        d.department.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
   "on-leave": onLeaveDoctors.filter(
    (d) =>
      !searchQuery ||
      d.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.user?.phone.includes(searchQuery) ||
      d.leaveType.toLowerCase().includes(searchQuery.toLowerCase())
  ),
  };

  // ==================== STATS ====================
  const stats = [
    {
      title: "Total Doctors",
      value: (dashboardStats?.totalDoctors ?? 0).toString(),
      icon: Users,
      color: doctorColors.primary,
      bgColor: `${doctorColors.primary}15`,
      //change: "+12%",
      trend: "up",
    },
    {
      title: "Active Doctors",
      value: (dashboardStats?.activeDoctors ?? 0).toString(),
      icon: UserCheck,
      color: doctorColors.accent,
      bgColor: `${doctorColors.accent}15`,
     // change: "+5%",
      trend: "up",
    },
    {
      title: "On Leave",
      value: (dashboardStats?.onLeaveDoctors ?? 0).toString(),
      icon: UserMinus,
      color: doctorColors.warning,
      bgColor: `${doctorColors.warning}15`,
    //  change: "+2",
      trend: "up",
    },
    {
      title: "Avg. Consultation Fee",
      value: `₹${dashboardStats?.averageConsultationFee ?? 0}`,
      icon: IndianRupee,
      color: doctorColors.indigo,
      bgColor: `${doctorColors.indigo}15`,
     // change: "+8%",
     change:"",
      trend: "up",
    },
  ];
  //  {
  //           key: "shift",
  //           label: "Shift",
  //           type: "badge",
  //           icon: <Clock className="w-4 h-4" />,
  //           width: "half",
  //           format: (value) => {
  //             const shiftColors = {
  //               MORNING: "bg-yellow-100 text-yellow-800",
  //               AFTERNOON: "bg-orange-100 text-orange-800",
  //               EVENING: "bg-purple-100 text-purple-800",
  //               NIGHT: "bg-indigo-100 text-indigo-800",
  //             };
  //             return (
  //               <Badge
  //                 className={shiftColors[value] || "bg-gray-100 text-gray-800"}
  //               >
  //                 {String(value ?? "")}
  //               </Badge>
  //             );
  //           },
  //         },
  // ==================== DETAIL MODAL CONFIGURATION ====================


  const formatDocumentType = (type?: string) => {
  const types: Record<string, string> = {
    MBBS_DEGREE: "MBBS Degree",
    MD_MS_DEGREE: "MD/MS Degree",
    DM_MCH_DEGREE: "DM/MCh Degree",
    REGISTRATION_CERTIFICATE: "Registration Certificate",
    AADHAAR_CARD: "Aadhaar Card",
    PAN_CARD: "PAN Card",
    EXPERIENCE_CERTIFICATE: "Experience Certificate",
    RESUME: "Resume",
    OTHER: "Other Document",
  };

  return types[type || "OTHER"] || "Other Document";
};

const getDocumentLabel = (doc: any) => {
  if (doc.documentType === "OTHER") {
    return doc.customDocumentName || "Other Document";
  }

  return formatDocumentType(doc.documentType);
};

  const detailSections: SectionConfig[] = [
    {
      id: "personal-info",
      title: "Personal Information",
      description: "Doctor's personal and contact details",
      icon: <Users className="h-5 w-5 text-blue-600" />,
      layout: "grid",
      columns: 2,
      bgColor: "#f8fafc",
      borderColor: "#e2e8f0",
      fields: [
        {
          key: "user.name", // Use dot notation for nested objects
          label: "Full Name",
          type: "text",
          icon: <Users className="w-4 h-4" />,
          width: "full",
          important: true,
        },
        {
          key: "user.email", // Use dot notation
          label: "Email Address",
          type: "email",
          icon: <Mail className="w-4 h-4" />,
          width: "half",
        },
        
        {
          key: "user.phone", // Use dot notation
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
          format: (value) => (
            <Badge
              className={
                value === "MALE"
                  ? "bg-blue-100 text-blue-800"
                  : value === "FEMALE"
                    ? "bg-pink-100 text-pink-800"
                    : "bg-purple-100 text-purple-800"
              }
            >
              {String(value)}
            </Badge>
          ),
        },
        {
          key: "aadhaar",
          label: "Aadhaar Number",
          type: "text",
          icon: <Shield className="w-4 h-4" />,
          width: "half",
          format: formatAadhaarNumber,
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
  id: "documents",
  title: "Documents",
  description: "Uploaded doctor documents",
  icon: <FileText className="h-5 w-5 text-blue-600" />,
  layout: "grid",
  columns: 1,
  fields: [
    {
      key: "documents",
      label: "Uploaded Documents",
      type: "custom",
      width: "full",


      
format: (value) => {
  if (!Array.isArray(value) || value.length === 0) {
    return "No documents uploaded";
  }

  
  return (
    <div className="space-y-2">
      {value.map((doc: any, index: number) => {
  const count =
    value
      .slice(0, index + 1)
      .filter((d: any) => d.documentType === doc.documentType)
      .length;

  return (
    <a
      key={index}
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline block font-medium"
    >
      {getDocumentLabel(doc)}
      {count > 1 ? ` (${count})` : ""}
    </a>
  );
})}
    </div>
  );
},
    },
  ],
},
    {
      id: "professional-details",
      title: "Professional Details",
      description: "Medical qualifications and expertise",
      icon: <GraduationCap className="h-5 w-5 text-green-600" />,
      layout: "grid",
      columns: 2,
      bgColor: "#f0fdf4",
      borderColor: "#bbf7d0",
      fields: [
        {
          key: "qualification",
          label: "Qualification",
          type: "text",
          icon: <GraduationCap className="w-4 h-4" />,
          width: "full",
          important: true,
        },
        {
          key: "registrationNo",
          label: "Registration Number",
          type: "text",
          icon: <FileText className="w-4 h-4" />,
          width: "half",
        },
{
  key: "doctorCode",
  label: "Doctor Code",
  type: "text",
  icon: <FileText className="w-4 h-4" />,
  width: "half",
},
{
  key: "joiningDate",
  label: "Joining Date",
  type: "date",
  icon: <Calendar className="w-4 h-4" />,
  width: "half",
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
          type: "number",
          icon: <TrendingUp className="w-4 h-4" />,
          width: "half",
        },
        {
          key: "availabilityDays",
          label: "Availability Days",
          type: "tags",
          icon: <Calendar className="w-4 h-4" />,
          width: "half",
        },
        {
  key: "workingHours",
  label: "Working Hours",
  type: "text",
  icon: <Clock className="w-4 h-4" />,
  width: "half",
  format: (value) => {
    if (!value) return "-";

    const hours = value as { start?: string; end?: string };

    return `${hours.start || "-"} - ${hours.end || "-"}`;
  },
},
      ],
    },
    {
      id: "Fees-details",
      title: "Fees Details",
      size: 50,
      description: "Salary and consultation fees",
      icon: <IndianRupee className="h-5 w-5 text-yellow-600" />,
      layout: "grid",
      columns: 2,
      bgColor: "#fffbeb",
      borderColor: "#fde68a",
      fields: [
        {
          key: "salary",
          label: "Monthly Salary",
          type: "currency",
         
          width: "half",
          important: true,
         format: (value) => `₹${Number(value).toLocaleString()}`,
        },
        {
          key: "consultationFee",
          label: "Consultation Fee",
          type: "currency",
         
          width: "half",
          format: (value) => `₹${String(value ?? "")}`,
        },
        {
          key: "slotDuration",
          label: "Slot Duration",
          type: "text",
          width: "half",
          format: (value) => value ? `${value} minutes` : "-",
        },
      ],
    },

    {
      id: "status-info",
      title: "Status Information",
      size: 50,
      description: "Account and system information",
      icon: <Activity className="h-5 w-5 text-gray-600" />,
      layout: "grid",
      columns: 1,
      fields: [
        {
          key: "status",
          label: "Account Status",
          type: "status",
          icon: <Activity className="w-4 h-4" />,
          width: "half",
          format: (value) => (
            <Badge
              className={
                value === "active"
                  ? "bg-green-100 text-green-800"
                  : value === "inactive"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }
            >
              {value === "active"
                ? "Active"
                : value === "inactive"
                  ? "Inactive"
                  : "On Leave"}
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
   
      ],
    },
  ];
console.log("Selected Doctor Status:", selectedDoctor?.status);
console.log("Selected Doctor:", selectedDoctor);
console.log("Edit Modal Doctor:", selectedDoctor);
  const detailActions: ActionButton[] = selectedDoctor
    ? [
        {
          label: "Edit Details",
          variant: "outline",
          icon: <UserCog className="w-4 h-4" />,
          onClick: (data) => {
            setIsDetailModalOpen(false);
            setIsEditModalOpen(true);
          },
        },
        {
          label:
            selectedDoctor.status === "active"
              ? "Mark as Inactive"
              : "Mark as Active",
          variant:
            selectedDoctor.status === "active" ? "destructive" : "default",
          icon:
            selectedDoctor.status === "active" ? (
              <UserMinus className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            ),
onClick: () => {
  blockDoctorMutation.mutate({
    id: selectedDoctor.id,
    isActive: selectedDoctor.status !== "active",
  });
  setIsDetailModalOpen(false);
},
        },
        {
          label: "Change Password",
          variant: "outline",
          icon: <Key className="w-4 h-4" />,
          onClick: () => {
            setIsDetailModalOpen(false);
            setIsPasswordModalOpen(true);
          },
        },
      ]
    : [];

  // ==================== FORM SECTIONS ====================
  const addFormSections: FormSection[] = [
    {
      title: "Personal Information",
      icon: <Users className="h-4 w-4" />,
      fields: [
        {
          name: "name",
          label: "Full Name",
          type: "text",
            prefix: "Dr.",
          required: true,
          placeholder: "Dr. John Doe",
          width: "full",
          validation: transformValidation(DOCTOR_VALIDATION_RULES.name),
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
            { value: "OTHERS", label: "Other" },
          ],
          validation: transformValidation(DOCTOR_VALIDATION_RULES.gender),
        },
        {
          name: "email",
          label: "Email Address",
          type: "email",
          required: true,
          placeholder: "doctor@hospital.com",
          width: "half",
          validation: transformValidation(DOCTOR_VALIDATION_RULES.email),
        },
        {
          name: "phone",
          label: "Phone Number",
          type: "tel",
          required: true,
          placeholder: "9876543210",
          width: "half",
          validation: transformValidation(DOCTOR_VALIDATION_RULES.phone),
        },
        {
          name: "aadhaar",
          label: "Aadhaar Number",
          type: "text",
          required: true,
          placeholder: "1234-5678-9012",
          width: "half",
          validation: transformValidation(DOCTOR_VALIDATION_RULES.aadhaar),
        },
        {
          name: "address",
          label: "Address",
          type: "textarea",
          required: true,
          placeholder: "Full residential address with city, state, and pincode",
          width: "full",
          rows: 3,
          validation: transformValidation(DOCTOR_VALIDATION_RULES.address),
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          required: true,
          placeholder: "Create a strong password",
          width: "full",
          validation: transformValidation(DOCTOR_VALIDATION_RULES.password),
        },
      ],
    },
    {
      title: "Professional Details",
      icon: <GraduationCap className="h-4 w-4" />,
      fields: [
        {
          name: "qualification",
          label: "Qualification",
          type: "text",
          required: true,
          placeholder: "MBBS, MD (Specialization)",
          width: "full",
          validation: transformValidation(
            DOCTOR_VALIDATION_RULES.qualification,
          ),
        },

        {
  name: "doctorCode",
  label: "Doctor Code",
  type: "text",
  disabled: true,
  width: "half",
}
,
        {
          name: "registrationNo",
          label: "Registration Number",
          type: "text",
          required: false,
          placeholder: "DL-MED-45879",
          width: "half",
          // validation: transformValidation(
          //   DOCTOR_VALIDATION_RULES.registrationNo,
          // ),
        },
        {
          name: "department",
          label: "Department",
          type: "text",
          required: true,
          placeholder: "Dermatology",
          width: "half",
          validation: transformValidation(DOCTOR_VALIDATION_RULES.department),
        },
        {
          name: "experience",
          label: "Experience",
          type: "number",
          required: true,
          placeholder: "6 years",
          width: "half",
          validation: transformValidation(DOCTOR_VALIDATION_RULES.experience),
        },
        {
          name: "consultationFee",
          label: "Consultation Fee (₹)",
          type: "number",
          required: false,
          placeholder: "500",
          width: "half",
          min: 0,
          max: 10000,
          // validation: transformValidation(
          //   DOCTOR_VALIDATION_RULES.consultationFee,
          // ),
        },
        {
          name: "slotDuration",
          label: "Slot Duration (minutes)",
          type: "number",
          required: true,
          placeholder: "30",
          width: "half",
          min: 1,
          validation: transformValidation(DOCTOR_VALIDATION_RULES.slotDuration),
        },
      ],
    },

    {
  title: "Documents",
  icon: <FileText className="h-4 w-4" />,
  fields: [
{
  name: "documents",
  label: "Documents",
  type: "document-manager",
  width: "full",
}
  ],
},

    {
      title: "Employment Details",
      icon: <Briefcase className="h-4 w-4" />,
      fields: [
        {
          name: "salary",
          label: "Salary (₹)",
          type: "number",
          required: true,
          placeholder: "65000",
          width: "half",
          min: 0,
          max: 1000000,
          validation: transformValidation(DOCTOR_VALIDATION_RULES.salary),
        },
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
             { value: "ROTATIONAL", label: "Rotational" },
          ],
          validation: transformValidation(DOCTOR_VALIDATION_RULES.shift),
        },

        {
  name: "joiningDate",
  label: "Joining Date",
   required: true,
  type: "date",
  width: "half",
  validation: transformValidation(DOCTOR_VALIDATION_RULES.joiningDate),
},


        {
          name: "workingHourStart",
          label: "Working Hour Start",
          type: "time",
          width: "half",
          required: true,
        },
        {
          name: "workingHourEnd",
          label: "Working Hour End",
          type: "time",
          width: "half",
          required: true,
        },
        {
          name: "availabilityDays",
          label: "Availability Days",
          type: "checkbox-group",
           required: true,
          // placeholder: "Monday, Wednesday, Friday",
          width: "full",
          // validation: transformValidation(
          //   DOCTOR_VALIDATION_RULES.availabilityDays,
          // ),
          options: [
            { value: "MONDAY", label: "Monday" },
            { value: "TUESDAY", label: "Tuesday" },
            { value: "WEDNESDAY", label: "Wednesday" },
            { value: "THURSDAY", label: "Thursday" },
            { value: "FRIDAY", label: "Friday" },
            { value: "SATURDAY", label: "Saturday" },
            { value: "SUNDAY", label: "Sunday" },
          ],
        },
      ],
    },
  ];

  const editFormSections: FormSection[] = [
    {
      title: "Edit Doctor Details",
      icon: <UserCog className="h-4 w-4" />,
      fields: [
        {
          name: "name",
          label: "Full Name",

          type: "text",
          required: true,
          width: "full",
          validation: transformValidation(DOCTOR_VALIDATION_RULES.name),
        },
        {
          name: "email",
          label: "Email Address",

          type: "email",
          required: true,
          width: "half",
          validation: transformValidation(DOCTOR_VALIDATION_RULES.email),
        },
        {
          name: "phone",
          label: "Phone Number",
          type: "tel",
          required: true,
          width: "half",
          placeholder: "9876543210",
          validation: transformValidation(DOCTOR_VALIDATION_RULES.phone),
        },
        {
          name: "qualification",
          label: "Qualification",
          type: "text",

          required: true,
          width: "half",
          validation: transformValidation(
            DOCTOR_VALIDATION_RULES.qualification,
          ),
        },
        {
          name: "registrationNo",
          label: "Registration Number",
          type: "text",
   
          required: false,
          width: "half",
          validation: transformValidation(
            DOCTOR_VALIDATION_RULES.registrationNo,
          ),
        },
{
  name: "documents",
  label: "Documents",
  type: "document-manager",
  width: "full",
},
        {
          name: "department",
          label: "Department",

          type: "text",
          required: true,
          width: "half",
          validation: transformValidation(DOCTOR_VALIDATION_RULES.department),
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
            { value: "OTHERS", label: "Other" },
          ],
          validation: transformValidation(DOCTOR_VALIDATION_RULES.gender),
        },

//         {
//   name: "doctorCode",
//   label: "Doctor Code",
//   type: "text",
//   disabled: true,
//   width: "half",
// },

        {
          name: "salary",
          label: "Salary (₹)",
          type: "number",
            disabled: true,
          required: true,
          width: "half",
          min: 0,
          max: 1000000,
          validation: transformValidation(DOCTOR_VALIDATION_RULES.salary),
        },
        {
          name: "consultationFee",
          label: "Consultation Fee (₹)",
          type: "number",

          required: false,
          width: "half",
          min: 0,
          max: 10000,
          // validation: transformValidation(
          //   DOCTOR_VALIDATION_RULES.consultationFee,
          // ),
        },
        {
          name: "slotDuration",
          label: "Slot Duration (minutes)",
          type: "number",
          required: true,
          width: "half",
          min: 1,
          validation: transformValidation(DOCTOR_VALIDATION_RULES.slotDuration),
        },

        {
  name: "joiningDate",
  label: "Joining Date",

  type: "date",
  width: "half",
},
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
                { value: "ROTATIONAL", label: "Rotational" },
          ],
          validation: transformValidation(DOCTOR_VALIDATION_RULES.shift),
        },
        {
          name: "workingHourStart",
          label: "Working Hour Start",
          type: "time",
          width: "half",
        },
        {
          name: "workingHourEnd",
          label: "Working Hour End",
          type: "time",
          width: "half",
        },
        {
          name: "aadhaar",
          label: "Aadhaar Number",

          type: "text",
          required: true,
          width: "half",
          validation: transformValidation(DOCTOR_VALIDATION_RULES.aadhaar),
        },
        {
          name: "experience",
          label: "Experience",

          type: "number",
          required: true,
          width: "half",
          validation: transformValidation(DOCTOR_VALIDATION_RULES.experience),
        },
        {
          name: "address",
          label: "Address",
          
          type: "textarea",
          required: true,
          width: "full",
          rows: 3,
          validation: transformValidation(DOCTOR_VALIDATION_RULES.address),
        },
        {
          name: "availabilityDays",
          label: "Availability Days",

          type: "checkbox-group",
          required: false,
          width: "full",
         // placeholder: "Monday, Wednesday, Friday",
          // validation: transformValidation(
          //   DOCTOR_VALIDATION_RULES.availabilityDays,
          // ),
          options: [
            { value: "MONDAY", label: "Monday" },
            { value: "TUESDAY", label: "Tuesday" },
            { value: "WEDNESDAY", label: "Wednesday" },
            { value: "THURSDAY", label: "Thursday" },
            { value: "FRIDAY", label: "Friday" },
            { value: "SATURDAY", label: "Saturday" },
            { value: "SUNDAY", label: "Sunday" },
          ],
        },
      ],
    },
  ];

  const passwordFormSections: FormSection[] = [
    {
      title: "Change Password",
      icon: <Key className="h-4 w-4" />,
      fields: [
        {
          name: "newPassword",
          label: "New Password",
          type: "password",
          required: true,
          width: "full",
 validation: transformValidation(DOCTOR_VALIDATION_RULES.password),
        },
        {
          name: "confirmPassword",
          label: "Confirm Password",
          type: "password",
          required: true,
          width: "full",
          validation: {
            minLength: 6,
            custom: (value, formData) =>
              value === formData.newPassword ? null : "Passwords must match",
          },
        },
      ],
    },
  ];


  // ==================== HANDLERS ====================
  const handleAddDoctor = (data: Record<string, unknown>) => {


 const workingHours = {
  start: String(data.workingHourStart || ""),
  end: String(data.workingHourEnd || ""),
};




const cleanName = String(data.name || "")
  .replace(/^Dr\.?\s*/i, "")
  .trim();

    const formData: DoctorFormData = {
  name: `Dr. ${cleanName}`,
      email: String(data.email || ""),
      phone: String(data.phone || ""),
      qualification: String(data.qualification || ""),
      registrationNo: String(data.registrationNo || ""),
      salary: Number(data.salary),
      shift: data.shift as DoctorFormData["shift"],
      gender: data.gender as DoctorFormData["gender"],
      department: String(data.department || ""),
      aadhaar: String(data.aadhaar || ""),
      address: String(data.address || ""),
      experience: Number(data.experience || ""),
      consultationFee: Number(data.consultationFee),
      slotDuration: Number(data.slotDuration),
      joiningDate: String(data.joiningDate || ""),
      doctorCode: String(data.doctorCode || ""),
      
documents: Array.isArray(data.documents)
  ? data.documents as {
      documentType: string;
      file: File;
    }[]
  : [],
      deletedDocumentIds: Array.isArray(data.documentsDeletedIds)
        ? data.documentsDeletedIds.filter((id): id is string => typeof id === "string")
        : [],
      availabilityDays: Array.isArray(data.availabilityDays)
      
  ? data.availabilityDays
  : [],
      password: data.password ? String(data.password) : undefined,
      workingHours,
    };

    addDoctorMutation.mutate(formData);
  };

  // In your component, add the update mutation
  const updateDoctorMutation = useUpdateDoctor({
    onSuccess: (data) => {
      toast.success("Doctor updated successfully");
      setIsEditModalOpen(false);
      setSelectedDoctorId(null);
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor", data.id] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update doctor");
    },
  });

  const updateDoctorMutationDisabled = useUpdateDoctorDisable({
    onSuccess: (data) => {
      toast.success("Doctor updated successfully");
      setIsEditModalOpen(false);
      setSelectedDoctorId(null);
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor", data.id] });
      queryClient.refetchQueries({
      queryKey: ["doctor", data.id],
      
    });
    queryClient.removeQueries({
  queryKey: ["doctor", data.id],
});
    },
onError: (error) => {
  setActivationErrorMessage(
    error.message ||
      "This employee cannot be activated because the joining date is in the future."
  );

  setActivationErrorOpen(true);
},
  });

  // Then use it in handleEditDoctor
  const handleEditDoctor = (data: Record<string, unknown>) => {
    console.log("Doctor documents:", data.documents);
    if (!selectedDoctor) return;

 const workingHours = {
  start: String(data.workingHourStart || ""),
  end: String(data.workingHourEnd || ""),
};

    const updateData: Partial<DoctorFormData> = {
      name: String(data.name || ""),
      email: String(data.email || ""),
      phone: String(data.phone || ""),
      qualification: String(data.qualification || ""),
      registrationNo: String(data.registrationNo || ""),
      salary: Number(data.salary),
      consultationFee: Number(data.consultationFee),
      slotDuration: Number(data.slotDuration),
      shift: data.shift as DoctorFormData["shift"],
      gender: data.gender as DoctorFormData["gender"],
      department: String(data.department || ""),
      aadhaar: String(data.aadhaar || ""),
      address: String(data.address || ""),
      experience: Number(data.experience || ""),
      joiningDate: String(data.joiningDate || ""),
 
documents: Array.isArray(data.documents)
  ? data.documents as {
      documentType: string;
      file: File;
    }[]
  : [],

    deletedDocumentIds: Array.isArray(data.documentsDeletedIds)
    ? data.documentsDeletedIds.filter(
        (id): id is string => typeof id === "string"
      )
    : [],

      availabilityDays: Array.isArray(data.availabilityDays)
  ? data.availabilityDays
  : [],
      workingHours,
    };

    editDoctorMutation.mutate({
      id: selectedDoctor.id,
      data: updateData,
    });
  };

  const handleUpdatePassword = (data: Record<string, unknown>) => {
    if (!selectedDoctor) return;
    updatePasswordMutation.mutate(
      {
        id: selectedDoctor.id,
        data: { newPassword: String(data.newPassword || "") },
      },
      
      {
        onSuccess: () => {
          toast.success("Password updated successfully");
          setIsPasswordModalOpen(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update password");
        },
      }
    );
  };
  
const handleViewDetails = async (doctorId: string) => {
  setSelectedDoctorId(doctorId);

  await queryClient.invalidateQueries({
    queryKey: ["doctor", doctorId],
  });

  await queryClient.refetchQueries({
    queryKey: ["doctor", doctorId],
  });
  await queryClient.refetchQueries({
  queryKey: ["doctors", "on-leave"],
});

await queryClient.refetchQueries({
  queryKey: ["doctors", "dashboard-stats"],
});

  setIsDetailModalOpen(true);
};
  

  // If needed, transform the data before passing to the modal
  const transformedDoctorData = selectedDoctor
    ? {
        ...selectedDoctor,
        name: selectedDoctor.user.name,
        email: selectedDoctor.user.email,
        phone: selectedDoctor.user.phone,
        isActive: selectedDoctor.user.isActive,
      }
    : null;

  const handleRefresh = async () => {
  await Promise.all([
    refetchDoctors(),
    refetchDashboardStats(),
  ]);

  toast.success("Data refreshed");
};

  const handlePageChange = (nextPage: number) => {
    if (nextPage < currentPage) {
      setPage((p) => Math.max(1, p - 1));
      return;
    }
    setPage((p) => Math.min(totalPages, p + 1));
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  // ==================== TABLE COLUMNS ====================
  const searchColumn: ColumnDef<DoctorResponse>[] = [
    {
      id: "Index",
      accessorFn: (doctor) =>
        `${doctor.user?.name ?? ""} ${doctor.user?.email ?? ""} ${doctor.user?.phone ?? ""} ${doctor.registrationNo ?? "N/A"} ${doctor.id ?? ""}`.toLowerCase(),
      header: "Index",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: true,
      filterFn: (row, columnId, filterValue) =>
        String(row.getValue(columnId) ?? "")
          .toLowerCase()
          .includes(String(filterValue ?? "").toLowerCase()),
    },
  ];

  const activeColumns: ColumnDef<DoctorResponse>[] = [
    ...searchColumn,
    {
      accessorKey: "name",
      header: "Doctor",
      cell: ({ row }) => {
        const doctor = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-medium flex items-center gap-2">
              {doctor.user.name} {/* Access through user object */}
              <Badge variant="outline" className="text-xs">
                <GraduationCap className="h-3 w-3 mr-1" />
                {doctor.department}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Mail className="h-3 w-3" />
              {doctor.user.email} {/* Access through user object */}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              <Phone className="h-3 w-3" />
              {doctor.user.phone} {/* Access through user object */}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => {
        const doctor = row.original;
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-3 w-3 text-blue-600" />
              <span className="text-sm font-medium">
                {doctor.qualification}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-gray-600" />
              <span className="text-sm">{doctor.registrationNo}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Exp: {doctor.experience}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "shift",
      header: "Shift",
      cell: ({ row }) => {
        const doctor = row.original;
        const shiftColors = {
          MORNING: "bg-yellow-100 text-yellow-800",
          AFTERNOON: "bg-orange-100 text-orange-800",
          EVENING: "bg-purple-100 text-purple-800",
          NIGHT: "bg-indigo-100 text-indigo-800",
          ROTATIONAL:"bg-indigo-100 text-red-800",
        };
        return (
          <Badge
            className={shiftColors[doctor.shift] || "bg-gray-100 text-gray-800"}
          >
            {doctor.shift}
          </Badge>
        );
      },
    },
    {
      accessorKey: "Fees",
      header: "Fees",
      cell: ({ row }) => {
        const doctor = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              
             
            </div>
            <div className="flex items-center gap-2">
              
              <span className="text-sm">₹{doctor.consultationFee}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const doctor = row.original;
        const status = doctor.user.isActive ? "active" : "inactive";
        return (
          <Badge
            className={
              status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }
          >
            {status === "active" ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const doctor = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(doctor.id)}
              title="View details"
              disabled={isDetailLoading}
            >
              {isDetailLoading && selectedDoctorId === doctor.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
onClick={async () => {
  setSelectedDoctorId(doctor.id);

  await queryClient.invalidateQueries({
    queryKey: ["doctor", doctor.id],
  });

  await queryClient.refetchQueries({
    queryKey: ["doctor", doctor.id],
  });

  setIsEditModalOpen(true);
}}
              title="Edit doctor"
            >
              <UserCog className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
            onClick={() =>
    blockDoctorMutation.mutate({
      id: doctor.id,
      isActive: false,
    })
  }
              title="Delete doctor"
              disabled={blockDoctorMutation.isPending}
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];


  const onLeaveColumns: ColumnDef<any>[] = [
  {
    header: "Doctor",
    cell: ({ row }) => {
      const leave = row.original;

      return (
        <div className="flex flex-col">
          <div className="font-medium">
            {leave.user?.name}
          </div>
          <div className="text-sm text-gray-500">
            {leave.user?.email}
          </div>
          <div className="text-xs text-gray-400">
            {leave.user?.phone}
          </div>
        </div>
      );
    },
  },
  {
    header: "Leave Type",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.leaveType}
      </Badge>
    ),
  },
  {
    header: "From Date",
    cell: ({ row }) =>
      new Date(row.original.fromDate).toLocaleDateString(),
  },
  {
    header: "To Date",
    cell: ({ row }) =>
      new Date(row.original.toDate).toLocaleDateString(),
  },
  {
    header: "Days",
    cell: ({ row }) => row.original.totalDays,
  },
  {
    header: "Status",
    cell: ({ row }) => (
      <Badge className="bg-yellow-100 text-yellow-800">
        {row.original.status}
      </Badge>
    ),
  },
];


  const inactiveColumns: ColumnDef<DoctorResponse>[] = [
    {
      accessorKey: "name",
      header: "Doctor",
      cell: ({ row }) => {
        const doctor = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-medium text-gray-700">
              {doctor?.user?.name}
            </div>
            <div className="text-sm text-gray-500">{doctor?.user?.email}</div>
            <div className="text-xs text-gray-400">{doctor?.user?.phone}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => {
        const doctor = row.original;
        return <div className="text-sm">{doctor.department}</div>;
      },
    },
    {
      accessorKey: "qualification",
      header: "Qualification",
      cell: ({ row }) => {
        const doctor = row.original;
        return (
          <div className="text-sm text-gray-600">{doctor.qualification}</div>
        );
      },
    },
    {
      accessorKey: "lastActive",
      header: "Last Active",
      cell: ({ row }) => {
        const doctor = row.original;
        console.log("Inactive Doctor:", doctor);
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-sm">
              {new Date(doctor.updatedAt).toLocaleDateString()}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const doctor = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(doctor.id)}
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
            onClick={() => {
    blockDoctorMutation.mutate({
      id: doctor.id,
      isActive: true,
    });
  }}
              disabled={updateDoctorMutationDisabled.isPending}
              className="hover:bg-green-50 hover:text-green-700 hover:border-green-200"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Reactivate
            </Button>
          </div>
        );
      },
    },
  ];

  return (
   <div className="container mx-auto px-4 py-6 space-y-6 overflow-x-hidden">
      {/* Header */}
     <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Stethoscope className="h-8 w-8" />
            Doctor Management
          </h1>
          <p className="text-muted-foreground">
            Manage doctors, their schedules, consultation fees, and availability
          </p>
        </div>
        <div className="flex gap-2">
         <Button
            variant="outline"
            onClick={handleRefresh}
            className="hover:bg-gray-50"
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
             {isFetching ? "Refreshing..." : "Refresh"}
            
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={addDoctorMutation.isPending}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {addDoctorMutation.isPending ? "Adding..." : "Add Doctor"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.change && (
                    <p
                      className={`text-xs ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change} from last month
                    </p>
                  )}
                </div>
<div
  className="shrink-0 p-3 rounded-lg"
  style={{ backgroundColor: stat.bgColor }}
>
                  <stat.icon
                    className="w-6 h-6"
                    style={{ color: stat.color }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search doctors..."
          className="pl-10"
          value={searchQuery}
          onChange={(event) => {
            setPage(1);
            setSearchQuery(event.target.value);
          }}
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setPage(1);
        }}
        className="space-y-4"
      >
      <div className="overflow-x-auto">
  <TabsList className="min-w-[500px] grid grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Active ({dashboardStats?.activeDoctors ?? 0})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            <UserMinus className="h-4 w-4" />
            Inactive ({dashboardStats?.inactiveDoctors ?? 0})
          </TabsTrigger>
          <TabsTrigger value="on-leave" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
           On Leave ({dashboardStats?.onLeaveDoctors ?? 0})
          </TabsTrigger>
        </TabsList>
        </div>

        {/* Active Doctors Tab */}
        <TabsContent value="active" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Active Doctors ({totalRecords})
              </CardTitle>
              <CardDescription>
                Currently working doctors and their schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <PaginatedDoctorTable
                  columns={activeColumns}
                  data={filteredDoctors.active}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  limit={limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  emptyMessage={
                    <div className="text-center py-12">
                      <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-semibold">
                        No active doctors
                      </h3>
                      <p className="text-muted-foreground">
                        Add your first doctor to get started
                      </p>
                    </div>
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inactive Doctors Tab */}
        <TabsContent value="inactive" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserMinus className="h-5 w-5 text-gray-600" />
                Inactive Doctors ({totalRecords})
              </CardTitle>
              <CardDescription>
                Doctors who are currently not active
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                </div>
              ) : (
                <PaginatedDoctorTable
                  columns={inactiveColumns}
                  data={filteredDoctors.inactive}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  limit={limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  emptyMessage={
                    <div className="text-center py-12">
                      <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-semibold">
                        No inactive doctors
                      </h3>
                      <p className="text-muted-foreground">
                        All doctors are currently active
                      </p>
                    </div>
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* On Leave Doctors Tab */}
        <TabsContent value="on-leave" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-yellow-600" />
                On Leave Doctors ({onLeaveDoctors.length})
              </CardTitle>
              <CardDescription>
                Doctors who are currently on leave
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                </div>
              ) : (
                <PaginatedDoctorTable
                  columns={onLeaveColumns}
                  data={filteredDoctors["on-leave"]}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  limit={limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  emptyMessage={
                    <div className="text-center py-12">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-semibold">
                        No doctors on leave
                      </h3>
                      <p className="text-muted-foreground">
                        All doctors are currently working
                      </p>
                    </div>
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Doctor Modal */}
      <ReusableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddDoctor}
        title="Add New Doctor"
        sections={addFormSections}
          initialData={{
    doctorCode: nextDoctorCode || "",
  }}
        size="xl"
        saveButtonText={
          addDoctorMutation.isPending ? "Adding..." : "Add Doctor"
        }
        cancelButtonText="Cancel"
        saveButtonColor="linear-gradient(135deg, #3b82f6, #1e40af)"
        validationOnChange={true}
        // isSubmitting={addDoctorMutation.isPending}
      />




      {/* Edit Doctor Modal */}
      <ReusableModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDoctorId(null);
        }}
        onSave={handleEditDoctor}
        title="Edit Doctor"
        sections={editFormSections}
        size="lg"
        saveButtonText="Update Doctor"
        cancelButtonText="Cancel"
        saveButtonColor="linear-gradient(135deg, #10b981, #059669)"
        validationOnChange={true}
        // Update the edit modal initialData:
        initialData={
          selectedDoctor
            ? {
                name: selectedDoctor.user?.name, // From user object
                email: selectedDoctor.user?.email, // From user object
                salary: selectedDoctor.salary,
                consultationFee: selectedDoctor.consultationFee,
                slotDuration: selectedDoctor.slotDuration,
                shift: selectedDoctor.shift,
                phone: selectedDoctor.user?.phone, // From user object
                address: selectedDoctor.address,
                availabilityDays: selectedDoctor.availabilityDays,
                qualification: selectedDoctor.qualification,
                registrationNo: selectedDoctor.registrationNo,
                gender: selectedDoctor.gender,
                // doctorCode: selectedDoctor.doctorCode,
                department: selectedDoctor.department,
                aadhaar: selectedDoctor.aadhaar,
                experience: selectedDoctor.experience,
                documents: selectedDoctor.documents,
              
joiningDate: selectedDoctor.joiningDate
  ? new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date(selectedDoctor.joiningDate))
  : "",
             workingHourStart: selectedDoctor.workingHours?.start,
  workingHourEnd: selectedDoctor.workingHours?.end,

              }
            : undefined
        }
      />
      

      <ReusableModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSave={handleUpdatePassword}
        title="Change Doctor Password"
        sections={passwordFormSections}
        size="md"
        saveButtonText={
          updatePasswordMutation.isPending ? "Updating..." : "Update Password"
        }
        cancelButtonText="Cancel"
        saveButtonColor="linear-gradient(135deg, #10b981, #059669)"
        validationOnChange={true}
      />
      

      {/* Detail Modal */}
      <DynamicDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDoctorId(null);
        }}
        title="Doctor Details"
        subtitle={selectedDoctor?.department}
        data={selectedDoctor}
        sections={detailSections}
        actions={detailActions}
        size="xl"
        headerColor="#3b82f6"
        showRawData={false}
        isLoading={isDetailLoading}
      />
      <ReusableModal
  isOpen={activationErrorOpen}
  onClose={() => setActivationErrorOpen(false)}
  title="Cannot Activate Employee"
  mode="alert"
  message={activationErrorMessage}
/>
    </div>
  );
};

export default DoctorsPage;
