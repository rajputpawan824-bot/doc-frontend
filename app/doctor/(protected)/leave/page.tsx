"use client";

import { useState } from "react";
import { 
  Calendar, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Info,
  Users,
  CalendarRange
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/reusable/data-table";
import ReusableModal, { FieldConfig } from "@/components/reusable/reusable-modal";
import { ColumnDef } from "@tanstack/react-table";
import { 
  LeaveResponse, 
  getLeaveTypeLabel, 
  getLeaveStatusBgColor, 
  LeaveType, 
  HalfDayType 
} from "@/lib/validations/Admin/leave";
import { useCreateLeave } from "@/services/admin/leave";
import { format } from "date-fns";

export default function DoctorLeavePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // [DEBUGGING] Initialize mutation hook
  const createLeaveMutation = useCreateLeave({
    onSuccess: (data) => {
      console.log("[DEBUG] Mutation SUCCESS - Leave created:", data);
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error("[DEBUG] Mutation ERROR:", error);
    },
  });

  // Mock Summary Data
  const leaveBalance = {
    total: 24,
    used: 10,
    pending: 2,
    remaining: 12,
  };

  // Mock History Data
  const history: LeaveResponse[] = [
    {
      _id: "1",
      staffId: "D001",
      staffName: "Dr. John Smith",
      leaveType: "SICK",
      fromDate: "2026-05-10",
      toDate: "2026-05-12",
      numberOfDays: 3,
      reason: "High fever and flu",
      appliedOn: "2026-05-09",
      status: "APPROVED",
      isHalfDay: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "2",
      staffId: "D001",
      staffName: "Dr. John Smith",
      leaveType: "CASUAL",
      fromDate: "2026-05-20",
      toDate: "2026-05-20",
      numberOfDays: 1,
      reason: "Family event",
      appliedOn: "2026-05-15",
      status: "PENDING",
      isHalfDay: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "3",
      staffId: "D001",
      staffName: "Dr. John Smith",
      leaveType: "EMERGENCY",
      fromDate: "2026-04-15",
      toDate: "2026-04-15",
      numberOfDays: 0.5,
      halfDay: "SECOND_HALF",
      reason: "Personal work",
      appliedOn: "2026-04-14",
      status: "APPROVED",
      isHalfDay: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Mock Employees on Leave
  const otherLeaves = [
    { name: "Dr. Sarah Wilson", type: "Casual Leave", returnDate: "Tomorrow" },
    { name: "Nurse Jane Doe", type: "Sick Leave", returnDate: "May 18" },
  ];

  const columns: ColumnDef<LeaveResponse>[] = [
    {
      accessorKey: "leaveType",
      header: "Leave Type",
      cell: ({ row }) => {
        const type = row.getValue("leaveType") as LeaveType;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{getLeaveTypeLabel(type)}</span>
            {row.original.isHalfDay && (
              <span className="text-xs text-slate-500">
                Half Day ({row.original.halfDay?.replace("_", " ")})
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "dates",
      header: "Duration",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <span>
            {format(new Date(row.original.fromDate), "MMM d")} - {format(new Date(row.original.toDate), "MMM d, yyyy")}
          </span>
          <Badge variant="outline" className="ml-1">
            {row.original.numberOfDays} {row.original.numberOfDays === 1 ? "day" : "days"}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={`${getLeaveStatusBgColor(row.original.status)} border-none shadow-none`}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <span className="text-slate-600 truncate max-w-[200px]" title={row.getValue("reason")}>
          {row.getValue("reason")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-blue-600 hover:text-blue-700"
          disabled={row.original.status !== "PENDING"}
        >
          Cancel
        </Button>
      ),
    },
  ];

  const leaveFormFields: FieldConfig[] = [
    {
      name: "leaveType",
      label: "Type of Leave",
      type: "select",
      required: true,
      options: [
        { label: "Sick Leave", value: "SICK" },
        { label: "Casual Leave", value: "CASUAL" },
        { label: "Emergency Leave", value: "EMERGENCY" },
      ],
      width: "half",
    },
    {
      name: "emergencyContact",
      label: "Emergency Contact",
      type: "tel",
      placeholder: "Enter 10-digit number",
      width: "half",
    },
    {
      name: "fromDate",
      label: "Start Date",
      type: "date",
      required: true,
      width: "half",
    },
    {
      name: "toDate",
      label: "End Date",
      type: "date",
      required: true,
      width: "half",
    },
    {
  name: "isPaid",
  label: "Paid Leave",
  type: "checkbox",
  width: "half",
  defaultValue: true,
},
    {
      name: "isHalfDay",
      label: "Half Day Leave",
      type: "checkbox",
      width: "half",
      defaultValue: false,
    },
    {
      name: "halfDayType",
      label: "Shift Option",
      type: "select",
      options: [
        { label: "First Half", value: "FIRST_HALF" },
        { label: "Second Half", value: "SECOND_HALF" },
      ],
      width: "half",
      hidden: (formData) => !Boolean(formData.isHalfDay),
      required: (formData) => Boolean(formData.isHalfDay),
    },
    {
      name: "reason",
      label: "Reason for Leave",
      type: "textarea",
      required: true,
      placeholder: "Please explain the reason for your leave request...",
      rows: 3,
    },
  ];

  const handleApplyLeave = (data: any) => {
    console.log("[DEBUG] 1. FORM SUBMIT TRIGGERED - Form data:", data);
    console.log("[DEBUG] 2. FORM SUBMIT - About to call mutate()");
    console.log("[DEBUG] 3. Mutation hook status before mutate:", createLeaveMutation.status);
    console.log("[DEBUG] 4. Payload being sent:", JSON.stringify(data, null, 2));
    
    // Call the mutation
    try {
      createLeaveMutation.mutate(data);
      console.log("[DEBUG] 5. mutate() called successfully");
    } catch (err) {
      console.error("[DEBUG] 5. ERROR calling mutate():", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="text-slate-500">Apply for leave and track your leave history</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => {
          console.log("[DEBUG] 0. APPLY LEAVE BUTTON CLICKED");
          setIsModalOpen(true);
        }}>
          <Plus className="h-4 w-4" />
          Apply Leave
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Leave Balance</p>
                <h3 className="text-2xl font-bold text-blue-600">{leaveBalance.remaining} days</h3>
                <p className="text-xs text-slate-400">of {leaveBalance.total} total yearly</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Used Leaves</p>
                <h3 className="text-2xl font-bold text-slate-900">{leaveBalance.used} days</h3>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3" />
                  All approved
                </p>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <CalendarRange className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Pending Requests</p>
                <h3 className="text-2xl font-bold text-orange-600">{leaveBalance.pending} days</h3>
                <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  Awaiting approval
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 text-white shadow-sm overflow-hidden">
          <CardContent className="pt-6 relative">
            <div className="z-10 relative">
              <p className="text-sm font-medium text-slate-400">Next Month Info</p>
              <h3 className="text-xl font-bold">2.5 Days Accrual</h3>
              <p className="text-xs text-slate-500 mt-1">Auto-added on June 1st</p>
            </div>
            <Info className="absolute -right-2 -bottom-2 h-20 w-20 text-white/5" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applied Leaves Table */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg">Applied Leaves History</CardTitle>
              <CardDescription>Track status of your leave applications</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns} 
                data={history} 
                searchColumn="reason"
                searchPlaceholder="Search by reason..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Team on Leave
              </CardTitle>
              <CardDescription>Today / Upcoming</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {otherLeaves.map((leave, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <p className="font-medium text-sm text-slate-900">{leave.name}</p>
                    <p className="text-xs text-slate-500">{leave.type}</p>
                  </div>
                  <Badge variant="outline" className="bg-white text-[10px]">
                    Back {leave.returnDate}
                  </Badge>
                </div>
              ))}
              <Button variant="link" className="w-full text-xs text-blue-600 h-auto p-0">
                View Leave Calendar
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-indigo-50 border-indigo-100">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-indigo-900 text-sm mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Leave Policy Note
              </h4>
              <ul className="text-xs text-indigo-700 space-y-2 list-disc pl-4">
                <li>Sick leaves require a medical certificate for &gt; 2 days.</li>
                <li>Casual leaves should be applied 48h in advance.</li>
                <li>Half-day options are available for morning/afternoon shifts.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleApplyLeave}
        title="Apply for Leave"
        fields={leaveFormFields}
        saveButtonText="Submit Application"
        size="lg"
      />
    </div>
  );
}
