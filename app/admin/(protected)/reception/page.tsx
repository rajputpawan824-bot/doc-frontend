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
  ChevronLeft,
  ChevronRight,
  FileText,
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
  ReusableFormData,
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
  ReceptionFormData,
  ReceptionResponse,
  RECEPTION_VALIDATION_RULES,
  Receptionist,
  Shift,
  Gender,
  getCanEditPatientStatus,
  stringToBoolean,
  
} from "@/lib/validations/Admin/reception";
import DynamicDetailModal, {
  SectionConfig,
  ActionButton,
  transformValidation,
} from "@/components/reusable/detail-modal";
import {
  useReceptionists,
  useDeactivatedReceptionists,
  useToggleReceptionistStatus,
  useTogglePatientEditPermission,
  useAddReception,
  useReceptionistById, // Changed from getReceptionistsById
  useUpdateReceptionist,
   useNextReceptionistCode,
  useUpdateReceptionistPassword,
} from "@/services/admin/reception";

interface PaginatedReceptionistTableProps {
  columns: ColumnDef<Receptionist>[];
  data: Receptionist[];
  emptyMessage: ReactNode;
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function PaginatedReceptionistTable({
  columns,
  data,
  emptyMessage,
  currentPage,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
}: PaginatedReceptionistTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
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

// ==================== MAIN COMPONENT ====================
const ReceptionistManagement = () => {
  const [activeTab, setActiveTab] = useState("view");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordModalKey, setPasswordModalKey] = useState(0);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activationErrorOpen, setActivationErrorOpen] = useState(false);
const [activationErrorMessage, setActivationErrorMessage] = useState("");
  const [selectedReceptionistId, setSelectedReceptionistId] = useState<
    string | null
  >(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryClient = useQueryClient();

  

  // API Hooks
  const {
    data: receptionistsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useReceptionists({ page, limit, search: searchQuery });
  const { data: deactivatedReceptionists = [], refetch: refetchDeactivated } =
    useDeactivatedReceptionists();

  const isString = (value: unknown): value is string =>
    typeof value === "string";

  const isReceptionist = (item: unknown): item is Receptionist => {
    if (!item || typeof item !== "object") return false;
    const receptionist = item as Receptionist;

    return (
      isString(receptionist.id) &&
      receptionist.id.trim().length > 0 &&
      isString(receptionist.userId) &&
      receptionist.userId.trim().length > 0 &&
      isString(receptionist.name) &&
      isString(receptionist.email) &&
      isString(receptionist.phoneNumber) &&
      typeof receptionist.isActive === "boolean" &&
      receptionist.createdAt instanceof Date &&
      receptionist.updatedAt instanceof Date
    );
  };

  const receptionists = receptionistsResponse?.data ?? [];
  const receptionistPagination = receptionistsResponse?.pagination;
  const totalPages = Math.max(receptionistPagination?.totalPages ?? 1, 1);
  const currentPage = Math.min(
    Math.max(
      receptionistPagination?.page ?? receptionistPagination?.currentPage ?? page,
      1,
    ),
    totalPages,
  );
  const totalRecords =
    receptionistPagination?.totalRecords ??
    receptionistPagination?.total ??
    receptionists.length;

  const validReceptionists = receptionists.filter(isReceptionist) as Receptionist[];
  const validDeactivatedReceptionists = deactivatedReceptionists.filter(
    isReceptionist,
  ) as Receptionist[];

  // Fetch detailed receptionist data by ID
  const {
    data: selectedReceptionist,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useReceptionistById(selectedReceptionistId || undefined);

  const addReceptionMutation = useAddReception({
    onSuccess: (data) => {
      toast.success("Receptionist added successfully");
      setIsAddModalOpen(false);
                  queryClient.invalidateQueries({
  queryKey: ["salary-list"],
});

queryClient.invalidateQueries({
  queryKey: ["salary-dashboard-stats"],
});
      queryClient.invalidateQueries({ queryKey: ["receptionists"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add receptionist");
    },
  });

  const toggleStatusMutation = useToggleReceptionistStatus();
  const togglePermissionMutation = useTogglePatientEditPermission();
  const { data: nextReceptionistCode } =
  useNextReceptionistCode();

  // ==================== DATA MANAGEMENT ====================
useEffect(() => {
  refetchDeactivated();
}, [refetchDeactivated]);

useEffect(() => {
  if (activeTab === "deactivated") {
    refetchDeactivated();
  }
}, [activeTab, refetchDeactivated]);
const activeReceptionists = validReceptionists.filter(
  (r) => r.isActive === true,
);

const filteredActiveReceptionists = activeReceptionists.filter((r) => {
  if (!searchQuery) return true;

  const search = searchQuery.toLowerCase();
  const normalizedSearch = searchQuery.replace(/[\s-]/g, "");

  return (
    r.name.toLowerCase().includes(search) ||
    r.email.toLowerCase().includes(search) ||
    r.phoneNumber.includes(searchQuery) ||
    String(r.aadhaar || "")
      .replace(/[\s-]/g, "")
      .includes(normalizedSearch) ||
    String(r.receptionistCode || "")
      .toLowerCase()
      .includes(search) ||
    (r.deskNumber || "")
      .toLowerCase()
      .includes(search)
  );
});

const filteredDeactivatedReceptionists =
  validDeactivatedReceptionists.filter((r) => {
    if (!searchQuery) return true;

    const search = searchQuery.toLowerCase();
    const normalizedSearch = searchQuery.replace(/[\s-]/g, "");

    return (
      r.name.toLowerCase().includes(search) ||
      r.email.toLowerCase().includes(search) ||
      r.phoneNumber.includes(searchQuery) ||
      String(r.aadhaar || "")
        .replace(/[\s-]/g, "")
        .includes(normalizedSearch) ||
      String(r.receptionistCode || "")
        .toLowerCase()
        .includes(search)
    );
  });


    const formatDocumentType = (type?: string) => {
  const types: Record<string, string> = {
    AADHAAR_CARD: "Aadhaar Card",
    EDUCATIONAL: "Educational Certificate",
    EXPERIENCE_CERTIFICATE: "Experience Certificate",
    RESUME: "Resume",
    JOINING_LETTER: "Joining Letter",
    BANK_DETAILS: "Bank Details",
    OTHER: "Other Document",
  };

  return types[type || "OTHER"] || "Other Document";
};



  // ==================== DETAIL MODAL CONFIGURATION ====================
  const detailSections: SectionConfig[] = [
    {
      id: "personal-info",
      title: "Personal Information",
      description: "Basic details and contact information",
      icon: <Users className="h-5 w-5 text-blue-600" />,
      layout: "grid",
      columns: 2,
      bgColor: "#f8fafc",
      borderColor: "#e2e8f0",
      fields: [
        {
          key: "name",
          label: "Full Name",
          type: "text",
          icon: <Users className="w-4 h-4" />,
          width: "full",
          important: true,
        },
        {
          key: "email",
          label: "Email Address",
          type: "email",
          icon: <Mail className="w-4 h-4" />,
          width: "half",
        },
        {
          key: "phoneNumber",
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
        },
        {
          key: "aadhaar",
          label: "Aadhaar Number",
          type: "text",
          icon: <Shield className="w-4 h-4" />,
          width: "half",
      format: (value) => {
  const aadhaar = String(value ?? "");

  if (!aadhaar) return "-";

  return aadhaar.replace(
    /(\d{4})(\d{4})(\d{4})/,
    "$1 $2 $3"
  );
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
      id: "employment-details",
      title: "Employment Details",
      description: "Work-related information and shift details",
      icon: <Briefcase className="h-5 w-5 text-green-600" />,
      layout: "grid",
      columns: 2,
      bgColor: "#f0fdf4",
      borderColor: "#bbf7d0",
      fields: [
        {
          key: "salary",
          label: "Monthly Salary",
          type: "currency",
          icon: <IndianRupee className="w-4 h-4" />,
          width: "half",
          important: true,
        },
        {
          key: "shift",
          label: "Shift",
          type: "badge",
          icon: <Clock className="w-4 h-4" />,
          width: "half",
          format: (value) => (
            <Badge
              className={
                value === "MORNING"
                  ? "bg-yellow-100 text-yellow-800"
                  : value === "AFTERNOON"
                  ? "bg-yellow-100 text-yellow-800"
                  : value === "ROTATIONAL"
                  ? "bg-yellow-100 text-yellow-800"
                  : value === "NIGHT"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-indigo-100 text-indigo-800"
              }
            >
              {String(value ?? "")}
            </Badge>
          ),
        },
        {
          key: "deskNumber",
          label: "Desk Number",
          type: "text",
          icon: <Building className="w-4 h-4" />,
          width: "half",
        },
   {
  key: "receptionistCode",
  label: "Receptionist Code",
  type: "text",
  width: "half",
},

{
  key: "registrationNo",
  label: "Registration Number",
  type: "text",
  width: "half",
},

{
  key: "joiningDate",
  label: "Joining Date",
  type: "date",
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
        {
          key: "previousExperience",
          label: "Previous Experience",
          type: "number",
          icon: <Briefcase className="w-4 h-4" />,
          width: "full",
        },
      ],
    },
    {
      id: "permissions-status",
      size: 50,
      title: "Permissions & Status",
      description: "Access rights and account status",
      icon: <Shield className="h-5 w-5 text-purple-600" />,
      layout: "grid",
      columns: 1,
      bgColor: "#faf5ff",
      borderColor: "#e9d5ff",
      fields: [
        {
          key: "isActive",
          label: "Account Status",
          type: "status",
          icon: <UserCheck className="w-4 h-4" />,
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
          key: "canEditPatient", // Use singular
          label: "Patient Edit Permission",
          type: "boolean",
          icon: <UserCog className="w-4 h-4" />,
          width: "half",
        },
      ],
    },
{
  id: "documents",
  title: "Documents",
  description: "Uploaded staff documents",
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
                 {doc.documentType === "OTHER"
  ? doc.customDocumentName
  : formatDocumentType(doc.documentType)}
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
      id: "system-info",
      size: 50,
      title: "System Information",
      description: "Account creation and update history",
      icon: <Calendar className="h-5 w-5 text-gray-600" />,
      layout: "grid",
      columns: 1,
      fields: [
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
        // {
        //   key: "userId",
        //   label: "User ID",
        //   type: "text",
        //   icon: <Key className="w-4 h-4" />,
        //   width: "half",
        // },
        // {
        //   key: "id",
        //   label: "Receptionist ID",
        //   type: "text",
        //   icon: <Key className="w-4 h-4" />,
        //   width: "half",
        // },
      ],
    },
  ];

  const detailActions: ActionButton[] =
    selectedReceptionist && isReceptionist(selectedReceptionist)
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
            label: getCanEditPatientStatus(selectedReceptionist)
              ? "Disable Patient Edit"
              : "Enable Patient Edit",
            variant: "secondary",
            icon: <UserCog className="w-4 h-4" />,
            onClick: (data) => {
              const receptionistId =
                typeof data.id === "string"
                  ? data.id
                  : selectedReceptionist.id;

              if (!receptionistId) return;

              handleTogglePatientEditMode(
                receptionistId,
                getCanEditPatientStatus(selectedReceptionist),
              );
            },
            loading: togglePermissionMutation.isPending,
          },
          {
            label: selectedReceptionist.isActive ? "Deactivate" : "Activate",
            variant: selectedReceptionist.isActive ? "destructive" : "default",
            icon: selectedReceptionist.isActive ? (
              <UserMinus className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            ),
            onClick: (data) => {
              const receptionistId =
                typeof data.id === "string"
                  ? data.id
                  : selectedReceptionist.id;

              if (!receptionistId) return;

              if (selectedReceptionist.isActive) {
                handleDeactivate(receptionistId);
              } else {
                handleReactivate(receptionistId);
              }
            },
            loading: toggleStatusMutation.isPending,
            confirm: selectedReceptionist.isActive
              ? {
                  title: "Deactivate Receptionist",
                  message:
                    "Are you sure you want to deactivate this receptionist? They will lose access to the system.",
                }
              : {
                  title: "Activate Receptionist",
                  message:
                    "Are you sure you want to reactivate this receptionist?",
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
          required: true,
          placeholder: "Enter full name",
          width: "full",
          validation: transformValidation(RECEPTION_VALIDATION_RULES.name),
        },
        {
          name: "email",
          label: "Email Address",
          type: "email",
          required: true,
          placeholder: "email@example.com",
          width: "half",
          validation: transformValidation(RECEPTION_VALIDATION_RULES.email),
        },
        {
          name: "phone",
          label: "Phone Number",
          type: "tel",
          required: true,
          placeholder: "9876543210",
          width: "half",
          validation: transformValidation(RECEPTION_VALIDATION_RULES.phone),
        },
        {
  name: "password",
  label: "Password",
  type: "password",
  required: true,
  placeholder: "Enter password",
  width: "half",
  validation: transformValidation(
    RECEPTION_VALIDATION_RULES.password
  ),
},
        {
          name: "gender",
          label: "Gender",
          type: "select",
          required: true,
          width: "half",
          options: [
            { value: Gender.MALE, label: "Male" },
            { value: Gender.FEMALE, label: "Female" },
            { value: Gender.OTHERS, label: "Other" },
          ],
          validation: transformValidation(RECEPTION_VALIDATION_RULES.gender),
        },
        {
          name: "aadhaar",
          label: "Aadhaar Number",
          type: "text",
          required: true,
          placeholder: "123456789012",
          width: "half",
          validation: transformValidation(RECEPTION_VALIDATION_RULES.aadhaar),
        },
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
          placeholder: "30000",
          width: "half",
          min: 0,
          max: 100000,
          
          validation: transformValidation(RECEPTION_VALIDATION_RULES.salary),
        },
        {
          name: "shift",
          label: "Shift",
          type: "select",
          required: true,
          width: "half",
          options: [
            { value: Shift.MORNING, label: "Morning" },
            { value: Shift.NIGHT, label: "Night" },
            { value: Shift.AFTERNOON, label: "Afternoon" },
            { value: Shift.ROTATIONAL, label: "Rotational" },

          ],
          validation: transformValidation(RECEPTION_VALIDATION_RULES.shift),
        },
        {
          name: "deskNumber",
          label: "Desk Number (Optional)",
          type: "text",
          placeholder: "e.g., D-01, Reception-1",
          width: "half",

        },
        {
  name: "receptionistCode",
  label: "Receptionist Code",
  type: "text",
  width: "half",
  disabled: true,
  
},

{
  name: "registrationNo",
  label: "Registration Number (Optional)",
  type: "text",
  width: "half",
  placeholder: "REG-2026-001",
},

{
  name: "joiningDate",
  label: "Joining Date",
  type: "date",
  required: true,
  width: "half",
},

{
  name: "workingHourStart",
  label: "Working Hour Start",
  type: "time",
  required: true,
  width: "half",
},

{
  name: "workingHourEnd",
  label: "Working Hour End",
  type: "time",
  required: true,
  width: "half",
},
      ],
    },
    {
      title: "Additional Information",
      icon: <MapPin className="h-4 w-4" />,
      fields: [
        {
          name: "experience",
          label: "Experience (Years)",
          type: "number",
          required: true,
          placeholder: "2",
          width: "half",
          min: 0,
          max: 50,
          step: 1,
          validation: transformValidation(
            RECEPTION_VALIDATION_RULES.experience,
          ),
        },
        {
          name: "address",
          label: "Complete Address",
          type: "textarea",
          required: true,
          placeholder:
            "Enter complete residential address with city, state, and pincode",
          width: "full",
          rows: 3,
          validation: transformValidation(RECEPTION_VALIDATION_RULES.address),
        },
      ],
    },
    {
      title: "Documents",
      icon: <Archive className="h-4 w-4" />,
      fields: [
{
  name: "documents",
  label: "Documents",
  type: "document-manager",
  width: "full",
  documentTypes: [
    { value: "AADHAAR_CARD", label: "Aadhaar Card" },
    { value: "EDUCATIONAL", label: "Education" },
    { value: "EXPERIENCE_CERTIFICATE", label: "Experience Certificate" },
    { value: "RESUME", label: "Resume/CV" },
    { value: "JOINING_LETTER", label: "Joining Letter" },
    { value: "BANK_DETAILS", label: "Bank Passbook/Cancelled Cheque" },
    { value: "OTHER", label: "Other" },
  ],
},
      ],
    },
  ];

  const editFormSections: FormSection[] = [
    {
      title: "Edit Receptionist Details",
      icon: <UserCog className="h-4 w-4" />,
      fields: [
        {
          name: "name",
          label: "Full Name",
          type: "text",
          required: true,
          width: "full",
          validation: transformValidation(RECEPTION_VALIDATION_RULES.name),
        },
        {
          name: "email",
          label: "Email Address",
          type: "email",
          required: true,
          width: "half",
          validation: transformValidation(RECEPTION_VALIDATION_RULES.email),
         
        },
        {
          name: "salary",
          label: "Salary (₹)",
          type: "number",
          disabled: true,
          required: true,
          width: "half",
          min: 0,
          max: 100000,
          step: 1000,
          validation: transformValidation(RECEPTION_VALIDATION_RULES.salary),
        },
        {
          name: "shift",
          label: "Shift",
          type: "select",
          required: true,
          width: "half",
          options: [
            { value: Shift.MORNING, label: "Morning" },
            { value: Shift.NIGHT, label: "Night" },
             { value: Shift.AFTERNOON, label: "Afternoon" },
              { value: Shift.ROTATIONAL, label: "Rotational" },
          ],
          validation: transformValidation(RECEPTION_VALIDATION_RULES.shift),
        },
        {
          name: "phone",
          label: "Phone Number",
          type: "tel",
          required: true,
          width: "half",
          placeholder: "9876543210",
          validation: transformValidation(RECEPTION_VALIDATION_RULES.phone),
        },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          required: true,
          width: "half",
          options: [
            { value: Gender.MALE, label: "Male" },
            { value: Gender.FEMALE, label: "Female" },
            { value: Gender.OTHERS, label: "Other" },
          ],
          validation: transformValidation(RECEPTION_VALIDATION_RULES.gender),
        },
        {
          name: "aadhaar",
          label: "Aadhaar Number",
          type: "text",
          required: true,
          width: "half",
          placeholder: "123456789012",
          validation: transformValidation(RECEPTION_VALIDATION_RULES.aadhaar),
        },
        {
          name: "address",
          label: "Address",
          type: "textarea",
          required: true,
          width: "full",
          rows: 3,
          validation: transformValidation(RECEPTION_VALIDATION_RULES.address),
        },
        {
          name: "experience",
          label: "Experience (Years)",
          type: "number",
          required: true,
          width: "half",
          min: 0,
          max: 50,
          step: 1,
          validation: transformValidation(
            RECEPTION_VALIDATION_RULES.experience,
          ),
        },
        {
  name: "receptionistCode",
  label: "Receptionist Code",
  type: "text",
  width: "half",
  disabled: true,
},

{
  name: "registrationNo",
  label: "Registration Number",
  type: "text",
  width: "half",
},

{
  name: "joiningDate",
  label: "Joining Date",
  type: "date",
  required: true,
  width: "half",
},

{
  name: "workingHourStart",
  label: "Working Hour Start",
  type: "time",
  required: true,
  width: "half",
},

{
  name: "workingHourEnd",
  label: "Working Hour End",
  type: "time",
  required: true,
  width: "half",
},
        {
          name: "deskNumber",
          label: "Desk Number",
          type: "text",
          width: "half",
          validation: transformValidation(
            RECEPTION_VALIDATION_RULES.deskNumber,
          ),
        },
       
      ],
    },
    {
      title: "Documents",
      icon: <Archive className="h-4 w-4" />,
      fields: [
  {
  name: "documents",
  label: "Documents",
  type: "document-manager",
  width: "full",
  documentTypes: [
    { value: "AADHAAR_CARD", label: "Aadhaar Card" },
    { value: "EDUCATIONAL", label: "Education" },
    { value: "EXPERIENCE_CERTIFICATE", label: "Experience Certificate" },
    { value: "RESUME", label: "Resume/CV" },
    { value: "JOINING_LETTER", label: "Joining Letter" },
    { value: "BANK_DETAILS", label: "Bank Passbook/Cancelled Cheque" },
    { value: "OTHER", label: "Other" },
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
 validation: transformValidation(RECEPTION_VALIDATION_RULES.password),
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
  const handleAddReceptionist = (data: ReusableFormData) => {
    if (
      !isString(data.name) ||
      !isString(data.email) ||
      !isString(data.phone) ||
      !isString(data.password)||
      !isString(data.experience) ||
      !isString(data.shift) ||
      !isString(data.gender) ||
      !isString(data.aadhaar) ||
      !isString(data.address)
    ) {
      return;
    }
const workingHours = {
  start: String(data.workingHourStart || ""),
  end: String(data.workingHourEnd || ""),
};
    const formData: ReceptionFormData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      experience: data.experience,
      salary: Number(data.salary),
      shift: data.shift as ReceptionFormData["shift"],
      gender: data.gender as ReceptionFormData["gender"],
      aadhaar: data.aadhaar,
      address: data.address,
      deskNumber: isString(data.deskNumber) ? data.deskNumber : "",
      registrationNo: isString(data.registrationNo)
      ? data.registrationNo
      : "",
      receptionistCode:
  nextReceptionistCode?.receptionistCode || "",

joiningDate: isString(data.joiningDate)
  ? data.joiningDate
  : "",

workingHours,

documents: Array.isArray(data.documents)
  ? data.documents.filter(
      (
        doc,
      ): doc is {
        documentType: string;
        customDocumentName?: string;
        file: File;
      } =>
        !!doc &&
        doc.file instanceof File &&
        typeof doc.documentType === "string",
    )
  : [],
        
      
    };

    addReceptionMutation.mutate(formData);
  };

  const updateReceptionMutation = useUpdateReceptionist({
    onSuccess: (data) => {
      toast.success("Receptionist updated successfully");
      setIsEditModalOpen(false);
   
      queryClient.invalidateQueries({ queryKey: ["receptionists"] });
      queryClient.invalidateQueries({ queryKey: ["receptionist", data.id] });
      refetchDetail();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update receptionist");
    },
  });

  const updateReceptionMutationPassword = useUpdateReceptionistPassword({
    onError: (error) => {
      toast.error(error.message || "Failed to update password");
    },
  });

  const resetAndClosePasswordModal = () => {
    setPasswordModalKey((currentKey) => currentKey + 1);
    setIsPasswordModalOpen(false);
    setSelectedReceptionistId(null);
  };

  const handleEditReceptionist = (data: ReusableFormData) => {
    if (!selectedReceptionist || typeof selectedReceptionist.id !== "string")
      return;

    const receptionistId = selectedReceptionist.id;
    const updateData: Partial<ReceptionFormData> = {};

    if (isString(data.name)) updateData.name = data.name;
    if (isString(data.salary) || typeof data.salary === "number")
      updateData.salary = Number(data.salary);
    if (isString(data.shift))
      updateData.shift = data.shift as ReceptionFormData["shift"];
    if (isString(data.phone)) updateData.phone = data.phone;
    if (isString(data.gender))
      updateData.gender = data.gender as ReceptionFormData["gender"];
    if (isString(data.aadhaar)) updateData.aadhaar = data.aadhaar;
    if (isString(data.address)) updateData.address = data.address;
    if (isString(data.experience)) updateData.experience = data.experience;
    if (isString(data.deskNumber)) updateData.deskNumber = data.deskNumber;
    if (isString(data.registrationNo)) updateData.registrationNo = data.registrationNo;
    if (isString(data.joiningDate))     updateData.joiningDate = data.joiningDate;
updateData.documents =
  Array.isArray(data.documents)
    ? data.documents.filter(
        (
          doc,
        ): doc is {
          documentType: string;
          customDocumentName?: string;
          file: File;
        } =>
          !!doc &&
          doc.file instanceof File &&
          typeof doc.documentType === "string",
      )
    : [];
    updateData.deletedDocumentIds = Array.isArray(data.documentsDeletedIds)
      ? data.documentsDeletedIds.filter((id): id is string => typeof id === "string")
      : [];
      if (
        isString(data.workingHourStart) &&
        isString(data.workingHourEnd)
      ) {updateData.workingHours = {
    start: data.workingHourStart,
    end: data.workingHourEnd,
  };


 
  
}
    

    updateReceptionMutation.mutate({
      id: receptionistId,
      data: updateData,
    });
  };

  const handleUpdatePassword = (data: ReusableFormData) => {
    if (!selectedReceptionistId || !isString(data.newPassword)) return;

    updateReceptionMutationPassword.mutate(
      {
        id: selectedReceptionistId,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password updated successfully");
          resetAndClosePasswordModal();
          queryClient.invalidateQueries({ queryKey: ["receptionists"] });
          queryClient.invalidateQueries({
            queryKey: ["receptionist", selectedReceptionistId],
          });
        },
      },
    );
  };

  const handleTogglePatientEditMode = (
    receptionistId: string,
    currentStatus: boolean,
  ) => {
    togglePermissionMutation.mutate(
      {
        id: receptionistId,
        canEditPatient: !currentStatus, // Singular
      },
      {
        onSuccess: () => {
          toast.success(
            `Patient edit permission ${!currentStatus ? "enabled" : "disabled"}`,
          );
          queryClient.invalidateQueries({ queryKey: ["receptionists"] });
          queryClient.invalidateQueries({
            queryKey: ["receptionist", receptionistId],
          });
        },
        onError: (error) => {
          toast.error("Failed to update permission");
        },
      },
    );
  };

  const handleDeactivate = (receptionistId: string) => {
    toggleStatusMutation.mutate(
      {
        id: receptionistId,
        isActive: false,
      },
      {
onSuccess: () => {
  toast.success("Receptionist deactivated successfully");
  setIsDetailModalOpen(false);

  queryClient.invalidateQueries({
    queryKey: ["receptionists"],
  });

  queryClient.invalidateQueries({
    queryKey: ["deactivated-receptionists"],
  });

  queryClient.invalidateQueries({
    queryKey: ["receptionist", receptionistId],
  });
},
        onError: (error) => {
          toast.error("Failed to deactivate receptionist");
        },
      },
    );
  };

  const handleReactivate = (receptionistId: string) => {
    toggleStatusMutation.mutate(
      {
        id: receptionistId,
        isActive: true,
      },
      {
        onSuccess: () => {
          toast.success("Receptionist reactivated successfully");
          setIsDetailModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["receptionists"] });
          queryClient.invalidateQueries({
            queryKey: ["receptionist", receptionistId],
          });
          queryClient.invalidateQueries({
            queryKey: ["deactivated-receptionists"],
          });
        },
onError: (error) => {
  if (
    error.message?.includes("joining date") ||
    error.message?.includes("future")
  ) {
    setActivationErrorMessage(error.message);
    setActivationErrorOpen(true);
    return;
  }

  toast.error(error.message || "Failed to reactivate receptionist");
},
      },
    );
  };

  const handleRefresh = () => {
    refetch();
    if (activeTab === "deactivated") {
      refetchDeactivated();
    }
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

  const handleViewDetails = (receptionistId: string) => {
    setSelectedReceptionistId(receptionistId);
    setIsDetailModalOpen(true);
  };

  // ==================== TABLE COLUMNS ====================
  const activeColumns: ColumnDef<Receptionist>[] = [
    {
      accessorKey: "name",
      header: "Receptionist",
      cell: ({ row }) => {
        const receptionist = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-medium flex items-center gap-2">
              {receptionist.name}
              {receptionist.deskNumber && (
                <Badge variant="outline" className="text-xs">
                  <Building className="h-3 w-3 mr-1" />
                  {receptionist.deskNumber}
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Mail className="h-3 w-3" />
              {receptionist.email}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              <Phone className="h-3 w-3" />
              {receptionist.phoneNumber}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => {
        const receptionist = row.original;
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
             
              <span className="text-sm font-medium">
                ₹{receptionist.salary.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-blue-600" />
              <Badge variant="secondary" className="capitalize">
                {receptionist.shift.toLowerCase()}
              </Badge>
            </div>
           
          </div>
        );
      },
    },
    {
      accessorKey: "experience",
      header: "Experience",
      cell: ({ row }) => {
        const receptionist = row.original;
        return (
          <div className="text-sm text-muted-foreground max-w-[200px] truncate">
            {receptionist.previousExperience.substring(0, 60)}
          </div>
        );
      },
    },
    {
      accessorKey: "editMode",
      header: "Patient Edit",
      cell: ({ row }) => {
        const receptionist = row.original;
        const canEdit = getCanEditPatientStatus(receptionist);
        return (
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={canEdit}
                onCheckedChange={() =>
                  handleTogglePatientEditMode(receptionist.id, canEdit)
                }
                className={`${canEdit ? "bg-green-500" : "bg-gray-300"}`}
              />
              <span className="text-sm font-medium">
                {canEdit ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {canEdit ? "Can edit patient details" : "View only mode"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const receptionist = row.original;
        return (
          <Badge
            className={
              receptionist.isActive
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-red-100 text-red-800 hover:bg-red-100"
            }
          >
            {receptionist.isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const receptionist = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(receptionist.id)} // Pass ID instead of object
              title="View details"
              disabled={isDetailLoading}
            >
              {isDetailLoading && selectedReceptionistId === receptionist.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // For edit, still use the existing data since we need to populate the form
                setSelectedReceptionistId(receptionist.id);
                setIsEditModalOpen(true);
              }}
              title="Edit receptionist"
            >
              <UserCog className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedReceptionistId(receptionist.id);
                setIsPasswordModalOpen(true);
              }}
              title="Change password"
            >
              <Key className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeactivate(receptionist.id)}
              title="Deactivate receptionist"
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const deactivatedColumns: ColumnDef<Receptionist>[] = [
    {
      accessorKey: "name",
      header: "Receptionist",
      cell: ({ row }) => {
        const receptionist = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-medium text-gray-700">{receptionist.name}</div>
            <div className="text-sm text-gray-500">{receptionist.email}</div>
            <div className="text-xs text-gray-400">
              {receptionist.phoneNumber}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => {
        const receptionist = row.original;
        return (
          <div className="space-y-1">
            <div className="text-sm">
              Salary: ₹{receptionist.salary.toLocaleString()}
            </div>
            <div className="text-sm">
              Shift: {receptionist.shift.toLowerCase()}
            </div>
            <div className="text-xs text-gray-500">
              Last active:{" "}
              {new Date(receptionist.updatedAt).toLocaleDateString()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "experience",
      header: "Experience",
      cell: ({ row }) => {
        const receptionist = row.original;
        return (
   <div className="text-sm text-gray-500">
  {receptionist.previousExperience} Years
</div>
        );
      },
    },
    {
      accessorKey: "deactivationDate",
      header: "Deactivated On",
      cell: ({ row }) => {
        const receptionist = row.original;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-sm">
              {new Date(receptionist.updatedAt).toLocaleDateString()}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const receptionist = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(receptionist.id)} // Pass ID instead of object
              title="View details"
              disabled={isDetailLoading}
            >
              {isDetailLoading && selectedReceptionistId === receptionist.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReactivate(receptionist.id)}
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

  // ==================== RENDER ====================
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Receptionist Management
          </h1>
          <p className="text-muted-foreground">
            Manage receptionists, patient edit permissions, and shift schedules
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
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            disabled={addReceptionMutation.isPending}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {addReceptionMutation.isPending ? "Adding..." : "Add Receptionist"}
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search receptionists..."
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
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active Receptionists ({filteredActiveReceptionists.length})
          </TabsTrigger>
          <TabsTrigger value="deactivated" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Deactivated ({filteredDeactivatedReceptionists.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Receptionists Tab */}
        <TabsContent value="view" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Active Receptionists ({filteredActiveReceptionists.length})
              </CardTitle>
              <CardDescription>
                Manage receptionist details, patient edit permissions, and
                status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <PaginatedReceptionistTable
                  columns={activeColumns}
                  data={filteredActiveReceptionists}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  limit={limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  emptyMessage={
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-semibold">
                        No active receptionists
                      </h3>
                      <p className="text-muted-foreground">
                        Add your first receptionist to get started
                      </p>
                    </div>
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deactivated Receptionists Tab */}
        <TabsContent value="deactivated" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-gray-600" />
                Deactivated Receptionists (
                {filteredDeactivatedReceptionists.length})
              </CardTitle>
              <CardDescription>
                View and restore deactivated receptionists
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                </div>
              ) : (
                <PaginatedReceptionistTable
                  columns={deactivatedColumns}
                  data={filteredDeactivatedReceptionists}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  limit={limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  emptyMessage={
                    <div className="text-center py-12">
                      <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-semibold">
                        All receptionists are active
                      </h3>
                      <p className="text-muted-foreground">
                        No deactivated receptionists found
                      </p>
                    </div>
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Receptionist Modal */}
      <ReusableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddReceptionist}
        title="Add New Receptionist"
        sections={addFormSections}
        initialData={{
    receptionistCode:
      nextReceptionistCode?.receptionistCode || "",
  }}
        size="xl"
        saveButtonText={
          addReceptionMutation.isPending ? "Adding..." : "Add Receptionist"
        }
        cancelButtonText="Cancel"
        saveButtonColor="linear-gradient(135deg, #10b981, #059669)"
        validationOnChange={true}
        // isSubmitting={addReceptionMutation.isPending}
      />

      {/* Edit Receptionist Modal */}
      <ReusableModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedReceptionistId(null);
        }}
        onSave={handleEditReceptionist}
        title="Edit Receptionist"
        sections={editFormSections}
        size="lg"
        saveButtonText="Update Receptionist"
        cancelButtonText="Cancel"
        saveButtonColor="linear-gradient(135deg, #3b82f6, #2563eb)"
        validationOnChange={true}
        initialData={
          selectedReceptionist
            ? {
                name: selectedReceptionist.name,
                email: selectedReceptionist.email,
                salary: selectedReceptionist.salary,
                shift: selectedReceptionist.shift,
                phone: selectedReceptionist.phoneNumber,
                gender: selectedReceptionist.gender,
                aadhaar: selectedReceptionist.aadhaar,
                address: selectedReceptionist.address,
                experience:

                  selectedReceptionist.experience ??
                  selectedReceptionist.previousExperience,
                deskNumber: selectedReceptionist.deskNumber,
                receptionistCode:
  selectedReceptionist.receptionistCode,
                registrationNo: selectedReceptionist.registrationNo,
joiningDate: selectedReceptionist.joiningDate
  ? new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date(selectedReceptionist.joiningDate))
  : "",

workingHourStart:
  selectedReceptionist.workingHours?.start,

workingHourEnd:
  selectedReceptionist.workingHours?.end,
                documents: selectedReceptionist.documents,
                
              



              }
            : undefined
        }
      />

      {/* Change Password Modal */}
      <ReusableModal
        key={passwordModalKey}
        isOpen={isPasswordModalOpen}
        onClose={resetAndClosePasswordModal}
        onSave={handleUpdatePassword}
        title="Change Receptionist Password"
        sections={passwordFormSections}
        size="md"
        saveButtonText={
          updateReceptionMutationPassword.isPending
            ? "Updating..."
            : "Update Password"
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
          setSelectedReceptionistId(null);
        }}
        title="Receptionist Details"
        subtitle={selectedReceptionist?.email}
        data={selectedReceptionist}
        sections={detailSections}
        actions={detailActions}
        size="xl"
        headerColor="#10b981"
        showRawData={false}
        isLoading={isDetailLoading}
      />
      <ReusableModal
  isOpen={activationErrorOpen}
  onClose={() => setActivationErrorOpen(false)}
  title="Cannot Activate Receptionist"
  mode="alert"
  message={
    <div className="space-y-2">
      <p>{activationErrorMessage}</p>
    </div>
  }
  saveButtonText="OK"
  onSave={() => setActivationErrorOpen(false)}
  size="sm"
/>
    </div>
  );
};

export default ReceptionistManagement;
