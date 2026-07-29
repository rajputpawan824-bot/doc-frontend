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
  Users,
    CheckCircle2,
  XCircle,
  CalendarDays,
  Clock3,
  UserMinus,
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

import type { AttendanceRecord } from "@/lib/validations/Admin/attendance";
import{useAttendanceDashboardStats,useAttendanceList,
useEmployeeAttendanceSummary} from "@/services/admin/attendance"


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

const getTodayISTDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function StaffCredentialsPage() {

  const [role, setRole] = useState("ALL");

const [selectedDate, setSelectedDate] =
  useState(getTodayISTDate());

const [month, setMonth] =
  useState<number>();

const [year, setYear] =
  useState<number>();

  const currentYear =
  new Date().getFullYear();

const years = Array.from(
  { length: 5 },
  (_, i) => currentYear - i
);

const [page, setPage] =
  useState(1);
const [limit, setLimit] = useState(10);
const [search, setSearch] =
  useState("");

const [status, setStatus] =
  useState("ALL");

const {
  data: dashboardStats,
} = useAttendanceDashboardStats(
  role,
  selectedDate,
  month,
  year
);

const {
  data: attendanceList,
} = useAttendanceList({
  page,
  limit,
  role,
  status,
  date: selectedDate,
  search,
});

console.log("attendanceList", attendanceList);

const {
  data: employeeSummary,
} = useEmployeeAttendanceSummary(
  role,
  month,
  year
);


  // Columns for DataTable


const columns: ColumnDef<AttendanceRecord>[] = [
  {
    accessorKey: "employeeName",
    header: "Employee",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600" />
        </div>

        <div>
          <p className="font-medium">
            {row.original.employeeName}
          </p>
        </div>
      </div>
    ),
  },

  {
    accessorKey: "userRole",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.userRole;

      return (
        <Badge
          className={
            role === "DOCTOR"
              ? "bg-blue-100 text-blue-800"
              : role === "STAFF"
              ? "bg-green-100 text-green-800"
              : "bg-purple-100 text-purple-800"
          }
        >
          {role}
        </Badge>
      );
    },
  },

  {
    accessorKey: "attendanceDate",
    header: "Date",
    cell: ({ row }) => (
      <span>
        {new Date(
          row.original.attendanceDate
        ).toLocaleDateString()}
      </span>
    ),
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <Badge
          className={
            status === "PRESENT"
              ? "bg-green-100 text-green-800"
              : status === "ABSENT"
              ? "bg-red-100 text-red-800"
              : status === "LEAVE"
              ? "bg-yellow-100 text-yellow-800"
              : status === "LATE"
              ? "bg-orange-100 text-orange-800"
              : "bg-purple-100 text-purple-800"
          }
        >
          {status.replace("_", " ")}
        </Badge>
      );
    },
  },

  {
    accessorKey: "clockInTime",
    header: "Clock In",
    cell: ({ row }) =>
      row.original.clockInTime
        ? new Date(
            row.original.clockInTime
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "--",
  },

  {
    accessorKey: "clockOutTime",
    header: "Clock Out",
    cell: ({ row }) =>
      row.original.clockOutTime
        ? new Date(
            row.original.clockOutTime
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "--",
  },

  {
    accessorKey: "totalWorkingMinutes",
    header: "Working Hours",
    cell: ({ row }) => {
      const minutes =
        row.original.totalWorkingMinutes || 0;

      const hours = Math.floor(
        minutes / 60
      );

      const remainingMinutes =
        minutes % 60;

      return (
        <Badge
          variant="outline"
          className="font-medium"
        >
          {hours}h {remainingMinutes}m
        </Badge>
      );
    },
  },

  {
    accessorKey: "shiftStart",
    header: "Shift",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.shiftStart || "--"}
        {" - "}
        {row.original.shiftEnd || "--"}
      </div>
    ),
  },
];


  


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
         
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Total Employees</p>
                <p className="text-2xl font-bold">{dashboardStats?.totalEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Present</p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardStats?.presentToday}
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
                <p className="text-sm text-slate-500">Absent</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardStats?.absentToday}
                </p>
              </div>
             <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Leave</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardStats?.leaveToday}
                </p>
              </div>
          <CalendarDays className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

                <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Late</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardStats?.lateToday}
                </p>
              </div>
              <Clock3 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

                <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Half Day</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardStats?.halfDayToday}
                </p>
              </div>
            <UserMinus className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

<Card>
  <CardContent className="pt-6">
    <div className="flex flex-wrap items-center gap-3">
<div className="w-full md:w-[220px]">
  <Input
    placeholder="Search employee..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</div>
<div className="w-full md:w-[180px]">
      <Select
        value={role}
        onValueChange={setRole}
      >
        <SelectTrigger>
          <SelectValue placeholder="Role" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="ALL">
            All Roles
          </SelectItem>

          <SelectItem value="DOCTOR">
            Doctor
          </SelectItem>

          <SelectItem value="STAFF">
            Staff
          </SelectItem>

          <SelectItem value="RECEPTIONIST">
            Receptionist
          </SelectItem>
        </SelectContent>
      </Select>
</div>

<div className="w-full md:w-[180px]">
      <Select
        value={status}
        onValueChange={setStatus}
      >
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="ALL">
            All Status
          </SelectItem>

          <SelectItem value="PRESENT">
            Present
          </SelectItem>

          <SelectItem value="ABSENT">
            Absent
          </SelectItem>

          <SelectItem value="LEAVE">
            Leave
          </SelectItem>

          <SelectItem value="LATE">
            Late
          </SelectItem>

          <SelectItem value="HALF_DAY">
            Half Day
          </SelectItem>
        </SelectContent>
      </Select>
</div>


<div className="w-full md:w-[180px]">
      <Input
        type="date"
        value={selectedDate}
        onChange={(e) =>
          setSelectedDate(e.target.value)
        }
      />
</div>


      <Button
        variant="outline"
        onClick={() => {
          setRole("ALL");
          setStatus("ALL");
  setSelectedDate(getTodayISTDate());
          setSearch("");
        }}
      >
        Reset
      </Button>

    </div>
  </CardContent>
</Card>


      {/* Credentials Table */}
      <Card>
        <CardHeader>
       <CardTitle>
  Attendance Records
</CardTitle>
          <div className="text-sm text-slate-500">
            Showing {attendanceList?.total || 0} records
            credentials
          </div>
        </CardHeader>
        <CardContent>
<DataTable
  columns={columns}
  data={attendanceList?.data || []}
  page={page}
  total={attendanceList?.total || 0}
  pageSize={limit}
  onPageChange={setPage}
  onPageSizeChange={(newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }}
  searchColumn="employeeName"
  searchPlaceholder="Search employee..."
  emptyMessage="No attendance records found"
/>
        </CardContent>
      </Card>

      

    </div>
  );
}
