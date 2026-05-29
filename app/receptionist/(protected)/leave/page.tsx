"use client";

import { useState } from "react";
import { 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Info,
  CalendarDays
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
  LeaveType 
} from "@/lib/validations/Admin/leave";
import { format } from "date-fns";

export default function ReceptionistLeavePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockHistory: LeaveResponse[] = [
    {
      _id: "1",
      staffId: "R001",
      staffName: "Sarah Parker",
      leaveType: "CASUAL_LEAVE",
      fromDate: "2026-06-01",
      toDate: "2026-06-02",
      numberOfDays: 2,
      reason: "Personal work",
      appliedOn: "2026-05-20",
      status: "PENDING",
      isHalfDay: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const columns: ColumnDef<LeaveResponse>[] = [
    {
      accessorKey: "leaveType",
      header: "Type",
      cell: ({ row }) => (
        <span className="font-medium">{getLeaveTypeLabel(row.original.leaveType)}</span>
      ),
    },
    {
      accessorKey: "dates",
      header: "Duration",
      cell: ({ row }) => (
        <span className="text-sm">
          {format(new Date(row.original.fromDate), "MMM d")} - {format(new Date(row.original.toDate), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={`${getLeaveStatusBgColor(row.original.status)} border-none`}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" className="text-red-600" disabled={row.original.status !== "PENDING"}>
          Cancel
        </Button>
      ),
    },
  ];

  const leaveFields: FieldConfig[] = [
    { name: "leaveType", label: "Leave Type", type: "select", required: true, options: [
      { label: "Casual Leave", value: "CASUAL_LEAVE" },
      { label: "Sick Leave", value: "SICK_LEAVE" },
      { label: "Half Day", value: "HALF_DAY" },
    ], width: "half" },
    { name: "startDate", label: "Start Date", type: "date", required: true, width: "half" },
    { name: "endDate", label: "End Date", type: "date", required: true, width: "half" },
    { name: "reason", label: "Reason", type: "textarea", required: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 gap-2">
          <Plus className="h-4 w-4" /> Apply Leave
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Remaining Balance</p>
            <h3 className="text-2xl font-bold text-blue-600">14 Days</h3>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Leaves Taken</p>
            <h3 className="text-2xl font-bold text-slate-900">6 Days</h3>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Pending Approval</p>
            <h3 className="text-2xl font-bold text-orange-600">2 Days</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>My Leave Applications</CardTitle>
          <CardDescription>Status and history of applied leaves</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={mockHistory} searchColumn="leaveType" searchPlaceholder="Filter by type..." />
        </CardContent>
      </Card>

      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => setIsModalOpen(false)}
        title="Apply for Leave"
        fields={leaveFields}
        saveButtonText="Submit Application"
      />
    </div>
  );
}
