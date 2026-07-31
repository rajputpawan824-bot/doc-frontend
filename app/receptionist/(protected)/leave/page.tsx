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
  LeaveType 
} from "@/lib/validations/Admin/leave";
import { useCreateLeave ,useMyLeaves,useLeaveBalance } from "@/services/admin/leave";
import { format } from "date-fns";

export default function ReceptionistLeavePage() {
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
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [isPaid, setIsPaid] = useState(true);
const [isHalfDay, setIsHalfDay] = useState(false);

    const [
    selectedMonth,
    setSelectedMonth
  ] = useState<number>();
  
  const [
    selectedYear,
    setSelectedYear
  ] = useState<number>();


  const today = new Date().toISOString().split("T")[0];


 const {
  data: leaveBalance,
} = useLeaveBalance(
  undefined,
  selectedMonth,
  selectedYear
);

const {
  data: history = [],
} = useMyLeaves(
  selectedMonth,
  selectedYear
);

const leaveDays =
  fromDate && toDate
    ? isHalfDay
      ? 0.5
      : Math.floor(
          (new Date(toDate).getTime() -
            new Date(fromDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
    : 0;

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
 accessorKey:
  "requestedIsPaid",
 header:
  "Requested As",
 cell: ({row}) =>
  row.original
    .requestedIsPaid
    ? "Paid"
    : "Unpaid"
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
  min: today,
  onChange: (value) => {
    setFromDate(value as string);
  },
},
{
  name: "toDate",
  label: "End Date",
  type: "date",
  required: true,
  width: "half",
  min: fromDate || today,
  onChange: (value) => {
    setToDate(value as string);
  },
},
{
  name: "requestedIsPaid",
  label: "Request Paid Leave",
  type: "checkbox",
  width: "half",
  defaultValue: true,
  onChange: (value) => {
    setIsPaid(Boolean(value));
  },
},
{
  name: "isHalfDay",
  label: "Half Day Leave",
  type: "checkbox",
  width: "half",
  defaultValue: false,
  onChange: (value) => {
    setIsHalfDay(Boolean(value));
  },
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
        <div className="flex items-center gap-2">
   <select
     className="h-10 rounded-md border px-3 text-sm"
     value={selectedMonth ?? ""}
     onChange={(e) =>
       setSelectedMonth(
         e.target.value
           ? Number(e.target.value)
           : undefined
       )
     }
   >
     <option value="">All Months</option>
     <option value="1">January</option>
     <option value="2">February</option>
     <option value="3">March</option>
     <option value="4">April</option>
     <option value="5">May</option>
     <option value="6">June</option>
     <option value="7">July</option>
     <option value="8">August</option>
     <option value="9">September</option>
     <option value="10">October</option>
     <option value="11">November</option>
     <option value="12">December</option>
   </select>
 
   <select
     className="h-10 rounded-md border px-3 text-sm"
     value={selectedYear ?? ""}
     onChange={(e) =>
       setSelectedYear(
         e.target.value
           ? Number(e.target.value)
           : undefined
       )
     }
   >
 <option value="">All Years</option>
 
 {Array.from(
   { length: 20 },
   (_, i) => new Date().getFullYear() - 10 + i
 ).map((year) => (
   <option key={year} value={year}>
     {year}
   </option>
 ))}
   </select>
 
   <Button
     variant="outline"
     onClick={() => {
       setSelectedMonth(undefined);
       setSelectedYear(undefined);
     }}
   >
     Clear
   </Button>
 
   <Button
     className="gap-2 bg-blue-600 hover:bg-blue-700"
     onClick={() => setIsModalOpen(true)}
   >
     <Plus className="h-4 w-4" />
     Apply Leave
   </Button>
 </div>
       </div>
 
       {/* Summary Cards */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <Card className="shadow-sm">
           <CardContent className="pt-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium text-slate-500">Total Allowed Leaves</p>
                 <h3 className="text-2xl font-bold text-blue-600">{leaveBalance?.totalAllowed ?? 0} days</h3>
                <p className="text-xs text-slate-400">
   of {leaveBalance?.totalAllowed ?? 0} total{" "}
   {leaveBalance?.policyType?.toLowerCase()}
 </p>
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
                 <p className="text-sm font-medium text-slate-500">Used Paid Leaves</p>
                 <h3 className="text-2xl font-bold text-slate-900">{leaveBalance?.usedLeaves ?? 0} days</h3>
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
                 <p className="text-sm font-medium text-slate-500">Remaining Leaves</p>
                 <h3 className="text-2xl font-bold text-orange-600">{leaveBalance?.remainingLeaves ?? 0} days</h3>
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
 
             <Card className="shadow-sm">
           <CardContent className="pt-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium text-slate-500">Unpaid Leaves</p>
                 <h3 className="text-2xl font-bold text-orange-600">{ leaveBalance?.unpaidLeaves ?? 0} days</h3>
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
  onClose={() => {
    setIsModalOpen(false);
    setFromDate("");
    setToDate("");
    setIsPaid(true);
    setIsHalfDay(false);
  }}
  onSave={handleApplyLeave}
  title="Apply for Leave"
  fields={leaveFormFields}
  saveButtonText="Submit Application"
  size="lg"
>
  {leaveBalance && (
    <div className="rounded-lg border bg-blue-50 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">Remaining Paid Leaves</span>
        <span className="text-lg font-bold text-blue-700">
          {Math.max(
            0,
            leaveBalance.remainingLeaves - (isPaid ? leaveDays : 0)
          )}{" "}
          days
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Current Balance</span>
        <span>{leaveBalance.remainingLeaves} days</span>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Requested Leave</span>
        <span>{leaveDays} day{leaveDays !== 1 ? "s" : ""}</span>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Leave Type</span>
        <span>{isPaid ? "Paid" : "Unpaid"}</span>
      </div>
    </div>
  )}
</ReusableModal>
     </div>
   );
}
