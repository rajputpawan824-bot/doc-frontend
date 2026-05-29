// app/features/staff-credentials/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Key,
  RefreshCw,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Building,
  Search,
  Filter,
  Download,
  Copy,
  Edit,
  Trash2,
  Plus,
  Users
} from "lucide-react";
import DataTable from "@/components/reusable/data-table";
import ReusableModal, {
  FormSection,
  FieldConfig,
} from "@/components/reusable/reusable-modal";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
interface StaffCredential {
  id: string;
  staffId: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  role: "ADMIN" | "DOCTOR" | "NURSE" | "STAFF" | "LAB_TECH" | "PHARMACIST";
  username: string;
  currentPassword: string;
  passwordLastChanged: string;
  passwordExpiryDate?: string;
  status: "ACTIVE" | "INACTIVE" | "LOCKED" | "EXPIRED";
  lastLogin?: string;
  failedAttempts: number;
  twoFactorEnabled: boolean;
  createdAt: string;
  createdBy: string;
}

interface PasswordHistory {
  id: string;
  staffId: string;
  passwordHash: string;
  changedAt: string;
  changedBy: string;
  changeReason: "INITIAL" | "RESET" | "EXPIRED" | "COMPROMISED" | "REGULAR";
}

// Mock data
const mockStaffCredentials: StaffCredential[] = [
  {
    id: "1",
    staffId: "EMP001",
    fullName: "Dr. Sarah Johnson",
    email: "sarah.johnson@hospital.com",
    phone: "+1234567890",
    department: "Cardiology",
    role: "DOCTOR",
    username: "sarah.dr",
    currentPassword: "Cardio@2024",
    passwordLastChanged: "2024-01-10",
    passwordExpiryDate: "2024-04-10",
    status: "ACTIVE",
    lastLogin: "2024-01-15 14:30:00",
    failedAttempts: 0,
    twoFactorEnabled: true,
    createdAt: "2023-12-01",
    createdBy: "Admin",
  },
  {
    id: "2",
    staffId: "EMP002",
    fullName: "Admin User",
    email: "admin@hospital.com",
    department: "Administration",
    role: "ADMIN",
    username: "admin",
    currentPassword: "Admin@Secure123",
    passwordLastChanged: "2024-01-15",
    passwordExpiryDate: "2024-04-15",
    status: "ACTIVE",
    lastLogin: "2024-01-15 10:15:00",
    failedAttempts: 0,
    twoFactorEnabled: true,
    createdAt: "2023-11-15",
    createdBy: "System",
  },
  {
    id: "3",
    staffId: "EMP003",
    fullName: "Nurse Lisa Wong",
    email: "lisa.wong@hospital.com",
    phone: "+1234567891",
    department: "ICU",
    role: "NURSE",
    username: "lisa.nurse",
    currentPassword: "Nurse@ICU2024",
    passwordLastChanged: "2024-01-05",
    passwordExpiryDate: "2024-04-05",
    status: "ACTIVE",
    lastLogin: "2024-01-14 08:45:00",
    failedAttempts: 2,
    twoFactorEnabled: false,
    createdAt: "2024-01-01",
    createdBy: "Admin",
  },
  {
    id: "4",
    staffId: "EMP004",
    fullName: "Lab Technician Mike Chen",
    email: "mike.chen@hospital.com",
    department: "Pathology",
    role: "LAB_TECH",
    username: "mike.lab",
    currentPassword: "LabTech#123",
    passwordLastChanged: "2023-12-20",
    passwordExpiryDate: "2024-03-20",
    status: "EXPIRED",
    lastLogin: "2024-01-10 09:30:00",
    failedAttempts: 0,
    twoFactorEnabled: false,
    createdAt: "2023-11-10",
    createdBy: "Admin",
  },
  {
    id: "5",
    staffId: "EMP005",
    fullName: "Pharmacist Robert Kim",
    email: "robert.kim@hospital.com",
    phone: "+1234567892",
    department: "Pharmacy",
    role: "PHARMACIST",
    username: "robert.pharma",
    currentPassword: "Pharma$Secure99",
    passwordLastChanged: "2024-01-12",
    passwordExpiryDate: "2024-04-12",
    status: "LOCKED",
    lastLogin: "2024-01-13 11:20:00",
    failedAttempts: 5,
    twoFactorEnabled: true,
    createdAt: "2023-12-15",
    createdBy: "Admin",
  },
  {
    id: "6",
    staffId: "EMP006",
    fullName: "Reception Staff Emma Davis",
    email: "emma.davis@hospital.com",
    department: "Reception",
    role: "STAFF",
    username: "emma.reception",
    currentPassword: "Reception@2024",
    passwordLastChanged: "2024-01-08",
    passwordExpiryDate: "2024-04-08",
    status: "INACTIVE",
    lastLogin: "2024-01-09 13:45:00",
    failedAttempts: 0,
    twoFactorEnabled: false,
    createdAt: "2024-01-05",
    createdBy: "Admin",
  },
];

const mockPasswordHistory: PasswordHistory[] = [
  {
    id: "1",
    staffId: "EMP001",
    passwordHash: "hashed_password_1",
    changedAt: "2024-01-10 14:30:00",
    changedBy: "Admin",
    changeReason: "REGULAR",
  },
  {
    id: "2",
    staffId: "EMP001",
    passwordHash: "hashed_password_2",
    changedAt: "2023-12-01 10:15:00",
    changedBy: "System",
    changeReason: "INITIAL",
  },
  {
    id: "3",
    staffId: "EMP002",
    passwordHash: "hashed_password_3",
    changedAt: "2024-01-15 09:00:00",
    changedBy: "Admin",
    changeReason: "RESET",
  },
];

// Role configurations
const roleConfigs = {
  ADMIN: { color: "bg-purple-100 text-purple-800", icon: Shield },
  DOCTOR: { color: "bg-blue-100 text-blue-800", icon: User },
  NURSE: { color: "bg-green-100 text-green-800", icon: User },
  STAFF: { color: "bg-yellow-100 text-yellow-800", icon: User },
  LAB_TECH: { color: "bg-orange-100 text-orange-800", icon: User },
  PHARMACIST: { color: "bg-red-100 text-red-800", icon: User },
};

// Status configurations
const statusConfigs = {
  ACTIVE: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Active",
  },
  INACTIVE: {
    color: "bg-gray-100 text-gray-800",
    icon: User,
    label: "Inactive",
  },
  LOCKED: { color: "bg-red-100 text-red-800", icon: Lock, label: "Locked" },
  EXPIRED: {
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    label: "Expired",
  },
};

export default function StaffCredentialsPage() {
  const [credentials, setCredentials] =
    useState<StaffCredential[]>(mockStaffCredentials);
  const [passwordHistory, setPasswordHistory] =
    useState<PasswordHistory[]>(mockPasswordHistory);
  const [selectedCredential, setSelectedCredential] =
    useState<StaffCredential | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [tempPassword, setTempPassword] = useState("");

  // Filter credentials
  const filteredCredentials = credentials.filter((credential) => {
    const matchesSearch =
      credential.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.staffId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || credential.status === statusFilter;
    const matchesRole = roleFilter === "ALL" || credential.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Get stats
  const stats = {
    total: credentials.length,
    active: credentials.filter((c) => c.status === "ACTIVE").length,
    locked: credentials.filter((c) => c.status === "LOCKED").length,
    expired: credentials.filter((c) => c.status === "EXPIRED").length,
    twoFactorEnabled: credentials.filter((c) => c.twoFactorEnabled).length,
    recentChanges: credentials.filter((c) => {
      const lastChanged = new Date(c.passwordLastChanged);
      const now = new Date();
      const diffDays =
        (now.getTime() - lastChanged.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7;
    }).length,
  };

  // Columns for DataTable
  const columns: ColumnDef<StaffCredential>[] = [
    {
      accessorKey: "staffId",
      header: "Staff ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm font-semibold">
          {row.original.staffId}
        </div>
      ),
    },
    {
      accessorKey: "fullName",
      header: "Staff Member",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="font-medium">{row.original.fullName}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {row.original.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Building className="w-3 h-3 text-slate-400" />
          {row.original.department}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const config = roleConfigs[row.original.role];
        const Icon = config.icon;
        return (
          <Badge className={config.color}>
            <Icon className="w-3 h-3 mr-1" />
            {row.original.role.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "currentPassword",
      header: "Password",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              type={showPassword === row.original.id ? "text" : "password"}
              value={row.original.currentPassword}
              readOnly
              className="font-mono text-sm pr-10"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() =>
                setShowPassword(
                  showPassword === row.original.id ? null : row.original.id
                )
              }
            >
              {showPassword === row.original.id ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleCopyPassword(row.original.currentPassword)}
            title="Copy password"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const config = statusConfigs[row.original.status];
        const Icon = config.icon;
        return (
          <Badge className={`${config.color} flex items-center gap-1`}>
            <Icon className="w-3 h-3" />
            {config.label}
            {row.original.status === "LOCKED" &&
              row.original.failedAttempts > 0 && (
                <span className="ml-1">({row.original.failedAttempts})</span>
              )}
          </Badge>
        );
      },
    },
    {
      accessorKey: "passwordLastChanged",
      header: "Last Changed",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-sm">
            {new Date(row.original.passwordLastChanged).toLocaleDateString()}
          </div>
          {row.original.passwordExpiryDate && (
            <div className="text-xs text-slate-500">
              Expires:{" "}
              {new Date(row.original.passwordExpiryDate).toLocaleDateString()}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleChangePassword(row.original)}
          >
            <Key className="w-4 h-4 mr-1" />
            Change
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleResetPassword(row.original)}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewHistory(row.original.id)}
            title="Password History"
          >
            <Clock className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleToggleStatus(row.original.id)}
            title={row.original.status === "ACTIVE" ? "Deactivate" : "Activate"}
          >
            {row.original.status === "ACTIVE" ? (
              <Lock className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteCredential(row.original.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Form sections for adding/editing staff
  const staffFormSections: FormSection[] = [
    {
      title: "Staff Information",
      icon: <User className="w-4 h-4" />,
      fields: [
        {
          name: "staffId",
          label: "Staff ID",
          type: "text",
          required: true,
          placeholder: "EMP001",
          width: "half",
        },
        {
          name: "fullName",
          label: "Full Name",
          type: "text",
          required: true,
          placeholder: "John Doe",
          width: "half",
        },
        {
          name: "email",
          label: "Email Address",
          type: "email",
          required: true,
          placeholder: "john.doe@hospital.com",
          width: "half",
        },
        {
          name: "phone",
          label: "Phone Number",
          type: "tel",
          placeholder: "+1234567890",
          width: "half",
        },
        {
          name: "department",
          label: "Department",
          type: "select",
          required: true,
          options: [
            { value: "Administration", label: "Administration" },
            { value: "Cardiology", label: "Cardiology" },
            { value: "ICU", label: "ICU" },
            { value: "Pathology", label: "Pathology" },
            { value: "Pharmacy", label: "Pharmacy" },
            { value: "Radiology", label: "Radiology" },
            { value: "Reception", label: "Reception" },
            { value: "General Ward", label: "General Ward" },
          ],
          width: "half",
        },
        {
          name: "role",
          label: "Role",
          type: "select",
          required: true,
          options: [
            { value: "ADMIN", label: "Administrator" },
            { value: "DOCTOR", label: "Doctor" },
            { value: "NURSE", label: "Nurse" },
            { value: "STAFF", label: "Staff" },
            { value: "LAB_TECH", label: "Lab Technician" },
            { value: "PHARMACIST", label: "Pharmacist" },
          ],
          width: "half",
        },
      ],
    },
    {
      title: "Login Credentials",
      icon: <Lock className="w-4 h-4" />,
      fields: [
        {
          name: "username",
          label: "Username",
          type: "text",
          required: true,
          placeholder: "john.doe",
          validation: {
            minLength: 3,
            pattern: /^[a-zA-Z0-9._-]+$/,
            custom: (value) => {
              if (value.includes(" ")) return "Username cannot contain spaces";
              return null;
            },
          },
          width: "half",
        },
        {
          name: "initialPassword",
          label: "Initial Password",
          type: "password",
          required: true,
          placeholder: "Enter initial password",
          validation: {
            minLength: 8,
            pattern:
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            custom: (value) => {
              if (!/(?=.*[a-z])/.test(value))
                return "Must contain lowercase letter";
              if (!/(?=.*[A-Z])/.test(value))
                return "Must contain uppercase letter";
              if (!/(?=.*\d)/.test(value)) return "Must contain number";
              if (!/(?=.*[@$!%*?&])/.test(value))
                return "Must contain special character";
              return null;
            },
          },
          width: "half",
        },
        {
          name: "twoFactorEnabled",
          label: "Enable Two-Factor Authentication",
          type: "checkbox",
          width: "full",
        },
        {
          name: "status",
          label: "Account Status",
          type: "select",
          required: true,
          options: [
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
          ],
          width: "half",
        },
      ],
    },
  ];

  // Password change form sections
  const passwordFormSections: FormSection[] = [
    {
      title: "Change Password",
      icon: <Key className="w-4 h-4" />,
      fields: [
        {
          name: "currentPassword",
          label: "Current Password",
          type: "password",
          required: true,
          placeholder: "Enter current password",
          width: "full",
        },
        {
          name: "newPassword",
          label: "New Password",
          type: "password",
          required: true,
          placeholder: "Enter new password",
          validation: {
            minLength: 8,
            pattern:
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            custom: (value) => {
              if (!/(?=.*[a-z])/.test(value))
                return "Must contain lowercase letter";
              if (!/(?=.*[A-Z])/.test(value))
                return "Must contain uppercase letter";
              if (!/(?=.*\d)/.test(value)) return "Must contain number";
              if (!/(?=.*[@$!%*?&])/.test(value))
                return "Must contain special character";
              return null;
            },
          },
          width: "full",
        },
        {
          name: "confirmPassword",
          label: "Confirm New Password",
          type: "password",
          required: true,
          placeholder: "Confirm new password",
          width: "full",
        },
        {
          name: "forcePasswordChange",
          label: "Force password change on next login",
          type: "checkbox",
          width: "full",
        },
        {
          name: "expiryDays",
          label: "Password Expiry (days)",
          type: "number",
          placeholder: "90",
          defaultValue: 90,
          width: "half",
          min: 1,
          max: 365,
        },
      ],
    },
  ];

  // Handler functions
  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard");
  };

  const handleChangePassword = (credential: StaffCredential) => {
    setSelectedCredential(credential);
    setIsPasswordModalOpen(true);
  };

  const handleResetPassword = (credential: StaffCredential) => {
    const newPassword = generateSecurePassword();
    setTempPassword(newPassword);

    setCredentials((prev) =>
      prev.map((c) => {
        if (c.id === credential.id) {
          return {
            ...c,
            currentPassword: newPassword,
            passwordLastChanged: new Date().toISOString().split("T")[0],
            passwordExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            failedAttempts: 0,
            status: "ACTIVE",
          };
        }
        return c;
      })
    );

    // Add to password history
    setPasswordHistory((prev) => [
      {
        id: Date.now().toString(),
        staffId: credential.staffId,
        passwordHash: `hashed_${newPassword}`,
        changedAt: new Date().toISOString(),
        changedBy: "Admin",
        changeReason: "RESET",
      },
      ...prev,
    ]);

    toast.success("Password reset successfully", {
      description: `New password: ${newPassword}`,
      action: {
        label: "Copy",
        onClick: () => {
          navigator.clipboard.writeText(newPassword);
          toast.success("Password copied");
        },
      },
    });
  };

  const handleSavePassword = (data: Record<string, unknown>) => {
    if (!selectedCredential) return;

    // Verify current password matches
    if (String(data.currentPassword || "") !== selectedCredential.currentPassword) {
      toast.error("Current password is incorrect");
      return;
    }

    // Update credential with new password
    setCredentials((prev) =>
      prev.map((c) => {
        if (c.id === selectedCredential.id) {
          return {
            ...c,
            currentPassword: String(data.newPassword || ""),
            passwordLastChanged: new Date().toISOString().split("T")[0],
            passwordExpiryDate: new Date(
              Date.now() + Number(data.expiryDays || 90) * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0],
            failedAttempts: 0,
          };
        }
        return c;
      })
    );

    // Add to password history
    setPasswordHistory((prev) => [
      {
        id: Date.now().toString(),
        staffId: selectedCredential.staffId,
        passwordHash: `hashed_${String(data.newPassword || "")}`,
        changedAt: new Date().toISOString(),
        changedBy: "Admin",
        changeReason: "REGULAR",
      },
      ...prev,
    ]);

    setIsPasswordModalOpen(false);
    toast.success("Password changed successfully");
  };

  const handleViewHistory = (credentialId: string) => {
    const credential = credentials.find((c) => c.id === credentialId);
    setSelectedCredential(credential || null);
    setIsHistoryModalOpen(true);
  };

  const handleToggleStatus = (credentialId: string) => {
    setCredentials((prev) =>
      prev.map((c) => {
        if (c.id === credentialId) {
          const newStatus = c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
          toast.success(`Account ${newStatus.toLowerCase()}d`);
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  const handleDeleteCredential = (credentialId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this credential? This action cannot be undone."
      )
    ) {
      setCredentials((prev) => prev.filter((c) => c.id !== credentialId));
      toast.success("Credential deleted successfully");
    }
  };

  const handleCreateCredential = () => {
    setSelectedCredential(null);
    setIsModalOpen(true);
  };

  const handleSaveCredential = (data: Record<string, unknown>) => {
    const newCredential: StaffCredential = {
      id: Date.now().toString(),
      staffId: String(data.staffId || ""),
      fullName: String(data.fullName || ""),
      email: String(data.email || ""),
      phone: String(data.phone || ""),
      department: String(data.department || ""),
      role: String(data.role || ""),
      username: String(data.username || ""),
      currentPassword: String(data.initialPassword || ""),
      passwordLastChanged: new Date().toISOString().split("T")[0],
      passwordExpiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: String(data.status || "ACTIVE") as StaffCredential["status"],
      failedAttempts: 0,
      twoFactorEnabled: Boolean(data.twoFactorEnabled),
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: "Admin",
    };

    setCredentials((prev) => [newCredential, ...prev]);

    // Add to password history
    setPasswordHistory((prev) => [
      {
        id: Date.now().toString(),
        staffId: newCredential.staffId,
        passwordHash: `hashed_${String(data.initialPassword || "")}`,
        changedAt: new Date().toISOString(),
        changedBy: "Admin",
        changeReason: "INITIAL",
      },
      ...prev,
    ]);

    setIsModalOpen(false);
    toast.success("Staff credential created successfully", {
      description: `Username: ${data.username}, Password: ${data.initialPassword}`,
    });
  };

  const generateSecurePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleExportCredentials = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Staff ID,Name,Username,Password,Department,Role,Status"].join(",") +
      "\n" +
      credentials
        .map(
          (c) =>
            `${c.staffId},${c.fullName},${c.username},${c.currentPassword},${c.department},${c.role},${c.status}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "staff_credentials.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Credentials exported successfully");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Staff Login Credentials
          </h1>
          <p className="text-slate-600 mt-1">
            Manage staff login credentials, passwords, and access permissions
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleCreateCredential}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Staff Credential
          </Button>
          <Button variant="outline" onClick={handleExportCredentials}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Total Staff</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Active Accounts</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">2FA Enabled</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.twoFactorEnabled}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Recent Changes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.recentChanges}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, username, or staff ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <div className="w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="LOCKED">Locked</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <User className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="DOCTOR">Doctor</SelectItem>
                    <SelectItem value="NURSE">Nurse</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="LAB_TECH">Lab Tech</SelectItem>
                    <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Credentials</CardTitle>
          <div className="text-sm text-slate-500">
            Showing {filteredCredentials.length} of {credentials.length}{" "}
            credentials
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredCredentials}
            searchColumn="fullName"
            searchPlaceholder="Search credentials..."
            emptyMessage="No staff credentials found."
          />
        </CardContent>
      </Card>

      {/* Add/Edit Staff Modal */}
      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCredential}
        title={
          selectedCredential ? "Edit Staff Credential" : "Add Staff Credential"
        }
        sections={staffFormSections}
        initialData={selectedCredential || {}}
        isEdit={!!selectedCredential}
        size="lg"
        saveButtonText={
          selectedCredential ? "Update Credential" : "Create Credential"
        }
        cancelButtonText="Cancel"
        validationOnChange={true}
      />

      {/* Change Password Modal */}
      <ReusableModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSave={handleSavePassword}
        title={`Change Password - ${selectedCredential?.fullName}`}
        sections={passwordFormSections}
        initialData={{
          currentPassword: selectedCredential?.currentPassword || "",
          expiryDays: 90,
        }}
        isEdit={true}
        size="md"
        saveButtonText="Change Password"
        cancelButtonText="Cancel"
        validationOnChange={true}
      />

      {/* Password History Modal */}
      {isHistoryModalOpen && selectedCredential && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Password History - {selectedCredential.fullName}
                <Badge variant="outline">{selectedCredential.staffId}</Badge>
              </h3>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <DataTable
                columns={[
                  {
                    accessorKey: "changedAt",
                    header: "Changed At",
                    cell: ({ row }) =>
                      new Date(row.original.changedAt).toLocaleString(),
                  },
                  {
                    accessorKey: "changedBy",
                    header: "Changed By",
                  },
                  {
                    accessorKey: "changeReason",
                    header: "Reason",
                    cell: ({ row }) => (
                      <Badge variant="outline">
                        {row.original.changeReason}
                      </Badge>
                    ),
                  },
                ]}
                data={passwordHistory.filter(
                  (h) => h.staffId === selectedCredential.staffId
                )}
                searchPlaceholder="Search history..."
                emptyMessage="No password history found."
              />
            </div>
            <div className="p-6 border-t flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsHistoryModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Password Modal */}
      {tempPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
                <Key className="w-5 h-5" />
                Password Reset Successful
              </h3>
            </div>
            <div className="p-6">
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-green-800 mb-2">
                  New password has been generated:
                </p>
                <div className="bg-white p-3 rounded border">
                  <code className="font-mono text-lg font-bold text-center block">
                    {tempPassword}
                  </code>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  This password will be visible only once. Please provide it to
                  the staff member securely.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(tempPassword);
                    toast.success("Password copied to clipboard");
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Password
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => setTempPassword("")}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
