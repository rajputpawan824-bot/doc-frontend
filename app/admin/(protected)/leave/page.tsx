"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  RefreshCw,
  Search,
  Loader2,
  Eye,
  Plus,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  useAllLeaves,
  useApproveLeave,
  useRejectLeave,
  useLeaveStats,
  useCreateLeave,
  useEmployeesForLeave,
  useOnLeave,
  useLeavePolicy,
  useCreateLeavePolicy,
} from "@/services/admin/leave";

import type {
  LeaveResponse,
  LeaveStatus,
  LeaveType,
  HalfDayType,
  LeaveFormData,
} from "@/lib/validations/Admin/leave";
import ReusableModal from "@/components/reusable/reusable-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "rejected" | "on-leave"
  >("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const today = format(new Date(), "yyyy-MM-dd");
  const [onLeaveRole, setOnLeaveRole] = useState<
    "ALL" | "DOCTOR" | "STAFF" | "RECEPTIONIST" | "ADMIN"
  >("ALL");
const [onLeaveDate, setOnLeaveDate] = useState(
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date())
);
const [showPolicyModal, setShowPolicyModal] =
  useState(false);

const [policyRole, setPolicyRole] =
  useState<
    "DOCTOR" | "STAFF" | "RECEPTIONIST"
  >("DOCTOR");

const [policyType, setPolicyType] =
  useState<
    "MONTHLY" | "YEARLY"
  >("MONTHLY");

const [allowedLeaves, setAllowedLeaves] =
  useState("");
  const [selectedLeave, setSelectedLeave] = useState<LeaveResponse | null>(
    null,
  );
  const [isPaid, setIsPaid] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approveTargetLeave, setApproveTargetLeave] = useState<LeaveResponse | null>(null);
  const [approvalIsPaid, setApprovalIsPaid] = useState<boolean | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [viewLeave, setViewLeave] = useState<LeaveResponse | null>(null);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
  "DOCTOR" | "STAFF" | "RECEPTIONIST" | undefined
>();

const { data: employees = [] } =
  useEmployeesForLeave(selectedCategory);

const savePolicy = useCreateLeavePolicy({
  onSuccess: () => {
    toast.success("Leave policy saved");
    setShowPolicyModal(false);
  },

  onError: (error) => {
    toast.error(
      error.message ||
      "Failed to save leave policy"
    );
  },
});

const {
  data: leavePolicies,
  isLoading: isPolicyLoading,
} = useLeavePolicy();


  const createLeave = useCreateLeave({
    onSuccess: () => {
      toast.success("Leave applied successfully");
      setIsApplyModalOpen(false);
      refetch();
      refetchOnLeave();
      refetchOnLeaveToday();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to apply leave");
    },
  });

  // API Hooks
  const {
    data: allLeaves = [],
    isLoading,
    isFetching,
    refetch,
  } = useAllLeaves({
    onError: (error) => {
       toast.error(error.message || "Failed to fetch leave applications"  );
     
    },
  });

  const { data: statsData, refetch: refetchStats } = useLeaveStats({
    onError: (error) => {
      toast.error(error.message || "Failed to fetch leave stats");
    },
  });

  const {
    data: onLeaveToday = [],
    isFetching: isOnLeaveTodayFetching,
    refetch: refetchOnLeaveToday,
  } = useOnLeave({
    onError: (error) => {
      toast.error(error.message || "Failed to fetch employees on leave today");
    },
  });

const {
  data: onLeaveLeaves = [],
  isLoading: isOnLeaveLoading,
  isFetching: isOnLeaveFetching,
  refetch: refetchOnLeave,
} = useOnLeave({
  userRole: onLeaveRole === "ALL" ? undefined : onLeaveRole,
  date: onLeaveDate,
  onError: (error) => {
    toast.error(error.message || "Failed to fetch employees on leave");
  },
});

  const approveLeave = useApproveLeave({
    onSuccess: () => {
      toast.success("Leave approved successfully");
      setSelectedLeave(null);
      setShowApproveDialog(false);
      setApproveTargetLeave(null);
      setApprovalIsPaid(null);
      refetch();
      refetchOnLeave();
      refetchOnLeaveToday();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve leave");
    },
  });

  const rejectLeave = useRejectLeave({
    onSuccess: () => {
      toast.success("Leave rejected successfully");
      setSelectedLeave(null);
      setRejectionReason("");
      setShowRejectDialog(false);
      refetch();
      refetchOnLeave();
      refetchOnLeaveToday();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject leave");
    },
  });

  // Filter leaves based on tab and search
  const filteredLeaves = allLeaves.filter((leave) => {
    const matchesTab =
      activeTab === "pending"
        ? leave.status === "PENDING"
        : activeTab === "approved"
          ? leave.status === "APPROVED"
          : activeTab === "rejected"
            ? leave.status === "REJECTED"
            : false;

    const matchesSearch =
      !searchQuery ||
      leave.staffName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.staffCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.reason?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const filteredOnLeave = onLeaveLeaves.filter((leave) => {
    const matchesSearch =
      !searchQuery ||
      leave.staffName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.staffCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.reason?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "CANCELLED":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getLeaveTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      SICK: "bg-red-100 text-red-800",
      CASUAL: "bg-green-100 text-green-800",
      EMERGENCY: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getEmployeeName = (leave: LeaveResponse) =>
    leave.user?.name || leave.staffName || "N/A";

  const getEmployeeRole = (leave: LeaveResponse) =>
    leave.userRole || leave.staffCategory || "N/A";

  const getTotalDays = (leave: LeaveResponse) =>
    leave.totalDays ?? leave.numberOfDays ?? "N/A";

  const getPaidStatus = (leave: LeaveResponse) =>
    leave.status === "APPROVED"
      ? leave.approvedIsPaid
        ? "Paid"
        : "Unpaid"
      : "Pending Decision";

  const renderLeaveTable = (
    leaves: LeaveResponse[],
    actions: "pending" | "view-only",
    showStatus = true,
  ) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Leave Type</TableHead>
          <TableHead>From Date</TableHead>
          <TableHead>To Date</TableHead>
          <TableHead>Total Days</TableHead>
          <TableHead>Paid/Unpaid</TableHead>
          {showStatus && <TableHead>Status</TableHead>}
          <TableHead>Reason</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaves.map((leave) => (
          <TableRow key={leave._id}>
            <TableCell className="font-medium">{getEmployeeName(leave)}</TableCell>
            <TableCell>{getEmployeeRole(leave)}</TableCell>
            <TableCell>
              <Badge className={getLeaveTypeColor(leave.leaveType)}>
                {leave.leaveType.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell>{format(new Date(leave.fromDate), "dd MMM yyyy")}</TableCell>
            <TableCell>{format(new Date(leave.toDate), "dd MMM yyyy")}</TableCell>
            <TableCell>{getTotalDays(leave)}</TableCell>
            <TableCell>{getPaidStatus(leave)}</TableCell>
            {showStatus && <TableCell>{getStatusBadge(leave.status)}</TableCell>}
            <TableCell className="max-w-xs whitespace-normal">
              {leave.reason || "N/A"}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button
  size="sm"
  variant="outline"
  onClick={() => setViewLeave(leave)}
>
  <Eye className="h-4 w-4 mr-1" />
  View
</Button>
                {actions === "pending" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setApproveTargetLeave(leave);
                        setApprovalIsPaid(null);
                        setShowApproveDialog(true);
                      }}
                      disabled={approveLeave.isPending}
                    >
                      {approveLeave.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedLeave(leave);
                        setShowRejectDialog(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const stats = statsData || {
    totalLeaves: allLeaves.length,
    pendingLeaves: allLeaves.filter((l) => l.status === "PENDING").length,
    approvedToday: 0,
    onLeaveToday: 0,
    upcomingLeaves: 0,
    approvalRate: 0,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Leave Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage staff leave applications and approvals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsApplyModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Apply Leave
          </Button>

                      <Button
                      
  variant="outline"
  onClick={() => setShowPolicyModal(true)}
>
  Leave Policy
</Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              refetchStats();
              refetchOnLeave();
              refetchOnLeaveToday();
            }}
            disabled={isFetching || isOnLeaveFetching || isOnLeaveTodayFetching}
             className="hover:bg-gray-50"
          >

            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                isFetching || isOnLeaveFetching || isOnLeaveTodayFetching
                  ? "animate-spin"
                  : ""
              }`}
            />
             {isFetching || isOnLeaveFetching || isOnLeaveTodayFetching
              ? "Refreshing..."
              : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leaves</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeaves}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingLeaves}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {allLeaves.filter((l) => l.status === "APPROVED").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {allLeaves.filter((l) => l.status === "REJECTED").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.approvalRate.toFixed(0)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {onLeaveToday.length}
            </div>
          </CardContent>
        </Card>



      </div>
<div className="mt-12 space-y-4">
  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
    Leave Policies
  </h3>

  <div className="flex flex-wrap gap-3 mb-15">
    {leavePolicies?.data?.map((policy: any) => (
      <div
        key={policy._id}
        className="flex items-center gap-3 rounded-full border bg-white px-4 py-2 shadow-sm"
      >
        <span className="font-medium text-sm">
          {policy.role}
        </span>

        <Badge
          className={
            policy.policyType === "YEARLY"
              ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
              : "bg-green-100 text-green-700 hover:bg-green-100"
          }
        >
          {policy.policyType}
        </Badge>

        <span className="font-semibold text-base text-foreground">
          {policy.allowedLeaves}
        </span>

        <span className="text-sm text-muted-foreground">
          Leaves
        </span>
      </div>
    ))}
  </div>
</div>
      

      {/* Tabs Section */}
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(
            value as "pending" | "approved" | "rejected" | "on-leave",
          )
        }
      >
        <TabsList>
          <TabsTrigger value="pending">
            Pending{" "}
            <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
              {allLeaves.filter((l) => l.status === "PENDING").length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
              {allLeaves.filter((l) => l.status === "APPROVED").length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">
              {allLeaves.filter((l) => l.status === "REJECTED").length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="on-leave">
            On Leave
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
              {onLeaveToday.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Search Bar */}
        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by staff name, code, or reason..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Leave Applications</CardTitle>
              <CardDescription>
                Review and approve/reject pending leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin">
                    <Loader2 className="h-8 w-8" />
                  </div>
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No pending applications
                  </h3>
                  <p className="text-muted-foreground">
                    All leave applications have been processed
                  </p>
                </div>
              ) : (
                renderLeaveTable(filteredLeaves, "pending")
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Leaves</CardTitle>
              <CardDescription>
                View and manage approved leave applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No approved leaves
                  </h3>
                  <p className="text-muted-foreground">
                    No leaves have been approved yet
                  </p>
                </div>
              ) : (
                renderLeaveTable(filteredLeaves, "view-only")
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Leaves</CardTitle>
              <CardDescription>
                View rejected leave applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No rejected leaves
                  </h3>
                  <p className="text-muted-foreground">
                    No leaves have been rejected
                  </p>
                </div>
              ) : (
                renderLeaveTable(filteredLeaves, "view-only")
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* On Leave Tab */}
        <TabsContent value="on-leave" className="space-y-4 mt-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="space-y-2">
              <div className="text-sm font-medium">Role</div>
              <Select
                value={onLeaveRole}
                onValueChange={(value) =>
                  setOnLeaveRole(
                    value as
                      | "ALL"
                      | "DOCTOR"
                      | "STAFF"
                      | "RECEPTIONIST"
                    
                  )
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="DOCTOR">Doctor</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
  <div className="text-sm font-medium">Date</div>
  <Input
    type="date"
    value={onLeaveDate}
    onChange={(e) => setOnLeaveDate(e.target.value)}
    className="w-full md:w-[180px]"
  />
</div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>On Leave</CardTitle>
              <CardDescription>
                Employees currently on approved leave
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isOnLeaveLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredOnLeave.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No employees on leave
                  </h3>
                  <p className="text-muted-foreground">
                    No employees are on approved leave for the selected filters
                  </p>
                </div>
              ) : (
                renderLeaveTable(filteredOnLeave, "view-only", false)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leave Details Modal */}
      <ReusableModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSave={(data) => {
          const payload: LeaveFormData = {
            userId:
              typeof data.userId === "string" && data.userId.trim()
                ? data.userId.trim()
                : undefined,
            leaveType: data.leaveType as LeaveType,
            fromDate: data.fromDate as string,
            toDate: data.toDate as string,
            reason:
              typeof data.reason === "string" ? data.reason.trim() : "",
            emergencyContact:
              typeof data.emergencyContact === "string"
                ? data.emergencyContact.trim()
                : undefined,
                requestedIsPaid: Boolean(data.isPaid),
            isHalfDay: Boolean(data.isHalfDay),
            halfDayType:
              typeof data.halfDayType === "string"
                ? (data.halfDayType as HalfDayType)
                : undefined,
          };

          console.log("[DEBUG] LEAVE PAYLOAD", payload);
          createLeave.mutate(payload);
        }}
        title="Apply Leave on Behalf of Employee"
        saveButtonText="Submit Application"
        fields={[
          {
            name: "category",
            label: "Employee Category",
            type: "select",
              onChange: (value) => {
    if (
      value === "DOCTOR" ||
      value === "STAFF" ||
      value === "RECEPTIONIST"
    ) {
      setSelectedCategory(value);
    }
  },
            required: true,
            options: [
          
              { label: "Doctor", value: "DOCTOR" },
              
              { label: "Receptionist", value: "RECEPTIONIST" },
             
              { label: "Staff", value: "STAFF" },
            ],
            width: "half",
            defaultValue: "ALL",
          },
          {
            name: "userId",
            label: "Select Employee",
            type: "select",
            required: true,
            options: employees.map((emp) => ({
  label: emp.name,
  value: emp.id,
})),
            width: "half",
          },
          {
            name: "leaveType",
            label: "Leave Type",
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
          },
          {
            name: "reason",
            label: "Reason",
            type: "textarea",
            required: true,
            placeholder: "Please explain the reason for leave...",
            rows: 3,
          },
        ]}
      />

      <Dialog
        open={!!selectedLeave}
        onOpenChange={() => setSelectedLeave(null)}
      >
        <Dialog
  open={!!viewLeave}
  onOpenChange={() => setViewLeave(null)}
></Dialog>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Details</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4">
              {(() => {
                console.log("selectedLeave", selectedLeave);
                console.log("selectedLeave.user", selectedLeave?.user);
                return null;
              })()}
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Employee Name
                </div>
                <div className="text-sm font-semibold">
                  {selectedLeave.user?.name ?? "null"}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Employee ID
                </div>
                <div className="text-sm font-semibold">
                  {selectedLeave.user?._id ??
                    selectedLeave.user?.id ??
                    selectedLeave.user?.userId ??
                    "null"}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Employee Role
                </div>
                <div className="text-sm font-semibold">
                  {selectedLeave.userRole || selectedLeave.staffCategory || "N/A"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Leave Type
                  </div>
                  <Badge className={getLeaveTypeColor(selectedLeave.leaveType)}>
                    {selectedLeave.leaveType.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Status
                  </div>
                  {getStatusBadge(selectedLeave.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Start Date
                  </div>
                  <div className="text-sm font-semibold">
                    {format(new Date(selectedLeave.fromDate), "dd MMM yyyy")}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    End Date
                  </div>
                  <div className="text-sm font-semibold">
                    {format(new Date(selectedLeave.toDate), "dd MMM yyyy")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Number of Days
                  </div>
                  <div className="text-sm font-semibold">
                    {selectedLeave.totalDays ?? selectedLeave.numberOfDays ?? "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Half Day
                  </div>
                  <div className="text-sm font-semibold">
                    {selectedLeave.isHalfDay ? "Yes" : "No"}
                  </div>
                </div>
              </div>

              {selectedLeave.isHalfDay && selectedLeave.halfDay && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Half Day Type
                  </div>
                  <div className="text-sm font-semibold">
                    {selectedLeave.halfDay.replace("_", " ")}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Paid Status
                </div>
                <div className="text-sm font-semibold">
                  {selectedLeave.status === "APPROVED" ?
                    (selectedLeave.approvedIsPaid ? "Paid" : "Unpaid") :
                    "Pending Decision"
                  }
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Reason
                </div>
                <div className="text-sm">{selectedLeave.reason}</div>
              </div>

              {selectedLeave.emergencyContact && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Emergency Contact
                  </div>
                  <div className="text-sm">
                    {selectedLeave.emergencyContact}
                  </div>
                </div>
              )}

              {selectedLeave.rejectionReason && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm font-medium text-red-800">
                    Rejection Reason
                  </div>
                  <div className="text-sm text-red-700">
                    {selectedLeave.rejectionReason}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={(open) => {
        if (!open) {
          setShowApproveDialog(false);
          setApproveTargetLeave(null);
          setApprovalIsPaid(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Leave Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="font-medium">Select leave type</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Button
                  variant={approvalIsPaid === true ? "secondary" : "outline"}
                  onClick={() => setApprovalIsPaid(true)}
                >
                  Paid Leave
                </Button>
                <Button
                  variant={approvalIsPaid === false ? "secondary" : "outline"}
                  onClick={() => setApprovalIsPaid(false)}
                >
                  Unpaid Leave
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setApproveTargetLeave(null);
                setApprovalIsPaid(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (approveTargetLeave && approvalIsPaid !== null) {
                  approveLeave.mutate({
                    leaveId: approveTargetLeave._id,
                    approvedIsPaid: approvalIsPaid,
                  });
                }
              }}
              disabled={approveLeave.isPending || approvalIsPaid === null}
            >
              {approveLeave.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="font-medium">
                Provide rejection reason (optional):
              </div>
              <Textarea
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedLeave) {
                  rejectLeave.mutate({
                    leaveId: selectedLeave._id,
                    rejectionReason,
                  });
                }
              }}
              disabled={rejectLeave.isPending}
            >
              {rejectLeave.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reject Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* leave policy  */}

      <Dialog
  open={showPolicyModal}
  onOpenChange={setShowPolicyModal}
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        Leave Policy
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-4">

      <div>
        <label>Role</label>

        <Select
          value={policyRole}
          onValueChange={(v) =>
            setPolicyRole(
              v as
                | "DOCTOR"
                | "STAFF"
                | "RECEPTIONIST"
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
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

      <div>
        <label>
          Policy Type
        </label>

        <Select
          value={policyType}
          onValueChange={(v) =>
            setPolicyType(
              v as
                | "MONTHLY"
                | "YEARLY"
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="MONTHLY">
              Monthly
            </SelectItem>

            <SelectItem value="YEARLY">
              Yearly
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label>
          Allowed Leaves
        </label>

        <Input
          type="number"
          value={allowedLeaves}
          onChange={(e) =>
            setAllowedLeaves(
              e.target.value
            )
          }
        />
      </div>

    </div>

    <DialogFooter>
      <Button
        onClick={() =>
          savePolicy.mutate({
            role: policyRole,
            policyType,
            allowedLeaves:
              Number(
                allowedLeaves
              ),
          })
        }
      >
        Save Policy
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default LeaveManagement;
