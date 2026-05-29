"use client";

import { useState, useEffect } from "react";
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
import DataTable from "@/components/reusable/data-table";
import ReusableModal, {
  FormSection,
} from "@/components/reusable/reusable-modal";
import { ColumnDef } from "@tanstack/react-table";
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
} from "@/services/admin/doctor";

// Types
interface Doctor extends DoctorResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
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
  const queryClient = useQueryClient();

  // API Hooks
  const { data: doctorsResponse, isLoading, refetch } = useDoctors();
  const doctors = doctorsResponse?.data || initialDoctors || [];
  const {
    data: selectedDoctor,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useDoctorById(selectedDoctorId || undefined);

  const addDoctorMutation = useAddDoctor({
    onSuccess: (data) => {
      toast.success("Doctor added successfully");
      setIsAddModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
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
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update doctor");
    },
  });

  const blockDoctorMutation = useUpdateDoctorDisable({
    onSuccess: (data) => {
      toast.success(`Doctor ${data.status === "active" ? "activated" : "disabled"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update doctor status");
    },
  });



  const activeDoctors = doctors.filter((d) => d.status === "active");
  const inactiveDoctors = doctors.filter((d) => d.status === "inactive");
  const onLeaveDoctors = doctors.filter((d) => d.status === "on_leave");

  const filteredDoctors = {
    active: activeDoctors.filter(
      (d) =>
        !searchQuery ||
        d?.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d?.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        d?.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d?.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d?.user?.phone.includes(searchQuery) ||
        d.department.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  };

  // ==================== STATS ====================
  const stats = [
    {
      title: "Total Doctors",
      value: doctors.length.toString(),
      icon: Users,
      color: doctorColors.primary,
      bgColor: `${doctorColors.primary}15`,
      change: "+12%",
      trend: "up",
    },
    {
      title: "Active Doctors",
      value: activeDoctors.length.toString(),
      icon: UserCheck,
      color: doctorColors.accent,
      bgColor: `${doctorColors.accent}15`,
      change: "+5%",
      trend: "up",
    },
    {
      title: "On Leave",
      value: onLeaveDoctors.length.toString(),
      icon: UserMinus,
      color: doctorColors.warning,
      bgColor: `${doctorColors.warning}15`,
      change: "+2",
      trend: "up",
    },
    {
      title: "Avg. Consultation Fee",
      value: `₹${
        doctors.length > 0
          ? Math.round(
              doctors.reduce((sum, d) => sum + d.consultationFee, 0) /
                doctors.length,
            )
          : "0"
      }`,
      icon: IndianRupee,
      color: doctorColors.indigo,
      bgColor: `${doctorColors.indigo}15`,
      change: "+8%",
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
  //                 {value}
  //               </Badge>
  //             );
  //           },
  //         },
  // ==================== DETAIL MODAL CONFIGURATION ====================
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
          key: "availabilityDays",
          label: "Availability Days",
          type: "text",
          icon: <Calendar className="w-4 h-4" />,
          width: "half",
        },
      ],
    },
    {
      id: "financial-details",
      title: "Financial Details",
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
          icon: <IndianRupee className="w-4 h-4" />,
          width: "half",
          important: true,
         format: (value) => `₹${Number(value).toLocaleString()}`,
        },
        {
          key: "consultationFee",
          label: "Consultation Fee",
          type: "currency",
          icon: <IndianRupee className="w-4 h-4" />,
          width: "half",
          format: (value) => `₹${value}`,
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
        {
          key: "id",
          label: "Doctor ID",
          type: "text",
          icon: <Key className="w-4 h-4" />,
          width: "half",
        },
      ],
    },
  ];

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
            blockDoctorMutation.mutate(selectedDoctor.id);
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
            { value: "OTHER", label: "Other" },
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
          name: "registrationNo",
          label: "Registration Number",
          type: "text",
          required: true,
          placeholder: "DL-MED-45879",
          width: "half",
          validation: transformValidation(
            DOCTOR_VALIDATION_RULES.registrationNo,
          ),
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
          type: "text",
          required: true,
          placeholder: "6 years",
          width: "half",
          validation: transformValidation(DOCTOR_VALIDATION_RULES.experience),
        },
        {
          name: "consultationFee",
          label: "Consultation Fee (₹)",
          type: "number",
          required: true,
          placeholder: "500",
          width: "half",
          min: 0,
          max: 10000,
          validation: transformValidation(
            DOCTOR_VALIDATION_RULES.consultationFee,
          ),
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
          ],
          validation: transformValidation(DOCTOR_VALIDATION_RULES.shift),
        },
        {
          name: "workingHours.start",
          label: "Working Hour Start",
          type: "time",
          width: "half",
        },
        {
          name: "workingHours.end",
          label: "Working Hour End",
          type: "time",
          width: "half",
        },
        {
          name: "availabilityDays",
          label: "Availability Days",
          type: "text",
          required: true,
          placeholder: "Monday, Wednesday, Friday",
          width: "full",
          validation: transformValidation(
            DOCTOR_VALIDATION_RULES.availabilityDays,
          ),
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
          required: true,
          width: "half",
          validation: transformValidation(
            DOCTOR_VALIDATION_RULES.registrationNo,
          ),
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
            { value: "OTHER", label: "Other" },
          ],
          validation: transformValidation(DOCTOR_VALIDATION_RULES.gender),
        },
        {
          name: "salary",
          label: "Salary (₹)",
          type: "number",
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
          required: true,
          width: "half",
          min: 0,
          max: 10000,
          validation: transformValidation(
            DOCTOR_VALIDATION_RULES.consultationFee,
          ),
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
          ],
          validation: transformValidation(DOCTOR_VALIDATION_RULES.shift),
        },
        {
          name: "workingHours.start",
          label: "Working Hour Start",
          type: "time",
          width: "half",
        },
        {
          name: "workingHours.end",
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
          type: "text",
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
          type: "text",
          required: true,
          width: "full",
          placeholder: "Monday, Wednesday, Friday",
          validation: transformValidation(
            DOCTOR_VALIDATION_RULES.availabilityDays,
          ),
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
      ],
    },
  ];

  // ==================== HANDLERS ====================
  const handleAddDoctor = (data: Record<string, unknown>) => {
    const workingHours = {
      start: String(data["workingHours.start"] || ""),
      end: String(data["workingHours.end"] || ""),
    };

    const formData: DoctorFormData = {
      name: String(data.name || ""),
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
      availabilityDays: String(data.availabilityDays || ""),
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
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update doctor");
    },
  });

  // Then use it in handleEditDoctor
  const handleEditDoctor = (data: Record<string, unknown>) => {
    if (!selectedDoctor) return;

    const workingHours = {
      start: String(data["workingHours.start"] || ""),
      end: String(data["workingHours.end"] || ""),
    };

    const updateData: Partial<DoctorFormData> = {
      name: String(data.name || ""),
      email: String(data.email || ""),
      phone: String(data.phone || ""),
      qualification: String(data.qualification || ""),
      registrationNo: String(data.registrationNo || ""),
      salary: Number(data.salary),
      consultationFee: Number(data.consultationFee),
      shift: data.shift as DoctorFormData["shift"],
      gender: data.gender as DoctorFormData["gender"],
      department: String(data.department || ""),
      aadhaar: String(data.aadhaar || ""),
      address: String(data.address || ""),
      experience: Number(data.experience || ""),
      availabilityDays: String(data.availabilityDays || ""),
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

  const handleViewDetails = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
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

  const handleRefresh = () => {
    refetch();
  };

  // ==================== TABLE COLUMNS ====================
  const activeColumns: ColumnDef<DoctorResponse>[] = [
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
      accessorKey: "financial",
      header: "Financial",
      cell: ({ row }) => {
        const doctor = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-3 w-3 text-green-600" />
              <span className="text-sm font-medium">₹{doctor.salary}</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-3 w-3 text-blue-600" />
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
              onClick={() => {
                setSelectedDoctorId(doctor.id);
                setIsEditModalOpen(true);
              }}
              title="Edit doctor"
            >
              <UserCog className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => blockDoctorMutation.mutate(doctor.id)}
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
                updateDoctorMutationDisabled.mutate(doctor.id);
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
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
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
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
                  className="p-3 rounded-lg"
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

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Active ({filteredDoctors.active.length})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            <UserMinus className="h-4 w-4" />
            Inactive ({filteredDoctors.inactive.length})
          </TabsTrigger>
          <TabsTrigger value="on-leave" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            On Leave ({filteredDoctors["on-leave"].length})
          </TabsTrigger>
        </TabsList>

        {/* Active Doctors Tab */}
        <TabsContent value="active" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Active Doctors ({filteredDoctors.active.length})
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
                <DataTable
                  columns={activeColumns}
                  data={filteredDoctors.active}
                  searchColumn="name"
                  searchPlaceholder="Search active doctors..."
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
                Inactive Doctors ({filteredDoctors.inactive.length})
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
                <DataTable
                  columns={inactiveColumns}
                  data={filteredDoctors.inactive}
                  searchColumn="name"
                  searchPlaceholder="Search inactive doctors..."
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
                On Leave Doctors ({filteredDoctors["on-leave"].length})
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
                <DataTable
                  columns={inactiveColumns}
                  data={filteredDoctors["on-leave"]}
                  searchColumn="name"
                  searchPlaceholder="Search doctors on leave..."
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
                shift: selectedDoctor.shift,
                phone: selectedDoctor.user?.phone, // From user object
                address: selectedDoctor.address,
                availabilityDays: selectedDoctor.availabilityDays,
                qualification: selectedDoctor.qualification,
                registrationNo: selectedDoctor.registrationNo,
                gender: selectedDoctor.gender,
                department: selectedDoctor.department,
                aadhaar: selectedDoctor.aadhaar,
                experience: selectedDoctor.experience,
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
    </div>
  );
};

export default DoctorsPage;
