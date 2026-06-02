"use client";

import { useState } from "react";
import { 
  Calendar, 
  Plus, 
  History
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
  getLeaveStatusBgColor 
} from "@/lib/validations/Admin/leave";
import { useCreateLeave } from "@/services/admin/leave";
import { format } from "date-fns";

export default function StaffLeavePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createLeaveMutation = useCreateLeave({
    onSuccess: (data) => {
      console.log("[DEBUG] Mutation SUCCESS - Leave created:", data);
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error("[DEBUG] Mutation ERROR:", error);
    },
  });

  const handleApplyLeave = (data: any) => {
    console.log("[DEBUG] 1. FORM SUBMIT TRIGGERED - Form data:", data);
    console.log("[DEBUG] 2. FORM SUBMIT - About to call mutate()");
    console.log("[DEBUG] 3. Mutation hook status before mutate:", createLeaveMutation.status);
    console.log("[DEBUG] 4. Payload being sent:", JSON.stringify(data, null, 2));

    try {
      createLeaveMutation.mutate(data);
      console.log("[DEBUG] 5. mutate() called successfully");
    } catch (err) {
      console.error("[DEBUG] 5. ERROR calling mutate():", err);
    }
  };

  const mockHistory: LeaveResponse[] = [
    {
      _id: "1",
      staffId: "S001",
      staffName: "Robert Wilson",
      leaveType: "SICK",
      fromDate: "2026-05-10",
      toDate: "2026-05-11",
      numberOfDays: 2,
      reason: "Recovery from illness",
      appliedOn: "2026-05-09",
      status: "APPROVED",
      isHalfDay: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const columns: ColumnDef<LeaveResponse>[] = [
    {
      accessorKey: "leaveType",
      header: "Type",
      cell: ({ row }) => <span className="text-sm font-medium">{getLeaveTypeLabel(row.original.leaveType)}</span>,
    },
    {
      accessorKey: "fromDate",
      header: "Dates",
      cell: ({ row }) => (
        <span className="text-xs">
          {format(new Date(row.original.fromDate), "MMM d")} - {format(new Date(row.original.toDate), "MMM d")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={`${getLeaveStatusBgColor(row.original.status)} border-none text-[10px] uppercase`}>
          {row.original.status}
        </Badge>
      ),
    },
  ];

  const leaveFields: FieldConfig[] = [
    { name: "leaveType", label: "Type", type: "select", required: true, options: [
      { label: "Casual", value: "CASUAL" },
      { label: "Sick", value: "SICK" },
      { label: "Emergency", value: "EMERGENCY" },
    ], width: "half" },
    { name: "fromDate", label: "Start Date", type: "date", required: true, width: "half" },
    { name: "toDate", label: "End Date", type: "date", required: true, width: "half" },
    { name: "isHalfDay", label: "Half Day Leave", type: "checkbox", width: "half", defaultValue: false },
    { name: "halfDayType", label: "Shift Option", type: "select", options: [
      { label: "First Half", value: "FIRST_HALF" },
      { label: "Second Half", value: "SECOND_HALF" },
    ], width: "half", hidden: (formData) => !Boolean(formData.isHalfDay), required: (formData) => Boolean(formData.isHalfDay) },
    { name: "reason", label: "Reason", type: "textarea", required: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Leaves</h1>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-blue-600 gap-2 h-10">
          <Plus className="h-4 w-4" /> Apply Leave
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm border-none bg-white">
          <CardContent className="pt-6">
            <p className="text-xs text-slate-500 uppercase font-semibold">Remaining</p>
            <h3 className="text-xl font-bold text-blue-600">12 Days</h3>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-white">
          <CardContent className="pt-6">
            <p className="text-xs text-slate-500 uppercase font-semibold">Approved</p>
            <h3 className="text-xl font-bold text-slate-900">4 Days</h3>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-white">
          <CardContent className="pt-6">
            <p className="text-xs text-slate-500 uppercase font-semibold">Pending</p>
            <h3 className="text-xl font-bold text-orange-600">0 Days</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-none bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" /> Leave History
          </CardTitle>
          <CardDescription>Status of your applied leaves</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <DataTable columns={columns} data={mockHistory} searchColumn="leaveType" searchPlaceholder="Filter..." />
        </CardContent>
      </Card>

      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleApplyLeave}
        title="Apply for Leave"
        fields={leaveFields}
        saveButtonText="Submit Application"
      />
    </div>
  );
}
