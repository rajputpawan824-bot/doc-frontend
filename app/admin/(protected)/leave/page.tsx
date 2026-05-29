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
  Trash2,
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
import { format } from "date-fns";
import {
  useAllLeaves,
  useApproveLeave,
  useRejectLeave,
  useCancelLeave,
  useLeaveStats,
} from "@/services/admin/leave";
import type { LeaveResponse, LeaveStatus } from "@/lib/validations/Admin/leave";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "rejected"
  >("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeave, setSelectedLeave] = useState<LeaveResponse | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // API Hooks
  const {
    data: allLeaves = [],
    isLoading,
    refetch,
  } = useAllLeaves({
    onError: (error) => {
       toast.error(error.message || "Failed to fetch leave applications"  );
     
    },
  });

  const { data: statsData } = useLeaveStats({
    onError: (error) => {
      toast.error(error.message || "Failed to fetch leave stats");
    },
  });

  const approveLeave = useApproveLeave({
    onSuccess: () => {
      toast.success("Leave approved successfully");
      setSelectedLeave(null);
      refetch();
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
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject leave");
    },
  });

  const cancelLeave = useCancelLeave({
    onSuccess: () => {
      toast.success("Leave cancelled successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel leave");
    },
  });

  // Filter leaves based on tab and search
  const filteredLeaves = allLeaves.filter((leave) => {
    const matchesTab =
      activeTab === "pending"
        ? leave.status === "PENDING"
        : activeTab === "approved"
          ? leave.status === "APPROVED"
          : leave.status === "REJECTED";

    const matchesSearch =
      !searchQuery ||
      leave.staffName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.staffCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.reason?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
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
      PAID_LEAVE: "bg-blue-100 text-blue-800",
      SICK_LEAVE: "bg-red-100 text-red-800",
      CASUAL_LEAVE: "bg-green-100 text-green-800",
      EARNED_LEAVE: "bg-purple-100 text-purple-800",
      MATERNITY_LEAVE: "bg-pink-100 text-pink-800",
      PATERNITY_LEAVE: "bg-cyan-100 text-cyan-800",
      EMERGENCY_LEAVE: "bg-orange-100 text-orange-800",
      HALF_DAY: "bg-yellow-100 text-yellow-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const stats = statsData || {
    totalLeaves: allLeaves.length,
    pendingApprovals: allLeaves.filter((l) => l.status === "PENDING").length,
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
              {stats.pendingApprovals}
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
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab)}>
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
                <div className="space-y-4">
                  {filteredLeaves.map((leave) => (
                    <div
                      key={leave._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold">{leave.staffName}</div>
                          <Badge className={getLeaveTypeColor(leave.leaveType)}>
                            {leave.leaveType.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {leave.staffCode} •{" "}
                          {format(new Date(leave.fromDate), "dd MMM yyyy")} to{" "}
                          {format(new Date(leave.toDate), "dd MMM yyyy")}
                        </div>
                        <div className="text-sm mt-2">{leave.reason}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedLeave(leave)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            approveLeave.mutate({ leaveId: leave._id })
                          }
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
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {filteredLeaves.map((leave) => (
                    <div
                      key={leave._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold">{leave.staffName}</div>
                          <Badge className={getLeaveTypeColor(leave.leaveType)}>
                            {leave.leaveType.replace("_", " ")}
                          </Badge>
                          {getStatusBadge(leave.status)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {leave.staffCode} •{" "}
                          {format(new Date(leave.fromDate), "dd MMM yyyy")} to{" "}
                          {format(new Date(leave.toDate), "dd MMM yyyy")}
                        </div>
                        <div className="text-sm mt-2">{leave.reason}</div>
                        {leave.approvedOn && (
                          <div className="text-xs text-green-600 mt-2">
                            Approved on{" "}
                            {format(new Date(leave.approvedOn), "dd MMM yyyy")}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedLeave(leave)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to cancel this leave?",
                              )
                            ) {
                              cancelLeave.mutate(leave._id);
                            }
                          }}
                          disabled={cancelLeave.isPending}
                        >
                          {cancelLeave.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {filteredLeaves.map((leave) => (
                    <div
                      key={leave._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold">{leave.staffName}</div>
                          <Badge className={getLeaveTypeColor(leave.leaveType)}>
                            {leave.leaveType.replace("_", " ")}
                          </Badge>
                          {getStatusBadge(leave.status)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {leave.staffCode} •{" "}
                          {format(new Date(leave.fromDate), "dd MMM yyyy")} to{" "}
                          {format(new Date(leave.toDate), "dd MMM yyyy")}
                        </div>
                        <div className="text-sm mt-2">{leave.reason}</div>
                        {leave.rejectionReason && (
                          <div className="text-sm text-red-600 mt-2">
                            Reason: {leave.rejectionReason}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedLeave(leave)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leave Details Modal */}
      <Dialog
        open={!!selectedLeave}
        onOpenChange={() => setSelectedLeave(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Details</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Staff Member
                </div>
                <div className="text-lg font-semibold">
                  {selectedLeave.staffName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedLeave.staffCode}
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
                    {format(new Date(selectedLeave.startDate), "dd MMM yyyy")}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    End Date
                  </div>
                  <div className="text-sm font-semibold">
                    {format(new Date(selectedLeave.endDate), "dd MMM yyyy")}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Number of Days
                </div>
                <div className="text-sm font-semibold">
                  {selectedLeave.numberOfDays}
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
    </div>
  );
};

export default LeaveManagement;
