// components/salary/SalaryManagement.tsx
"use client";

import { ReactNode, useState } from "react";
import {
  IndianRupee,
  Users,
  Search,
  RefreshCw,
  Filter,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  History,
  Award,
  AlertCircle,
  Download,
  FileText,
  ChevronDown,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  DollarSign,
  Calculator,
  BarChart3,
  Wallet,
  ChevronLeft,
  ChevronRight,
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
import ReusableModal, {
  FormSection,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// ==================== API HOOKS ====================
import {
  useSalaryList,
  //useSalarySummary,
  useSalaryHistory,
  useSalaryDetails,
  useSalaryDashboardStats,
  useAddSalaryAdjustment,
  useUpdateSalary,
  useDownloadPayslip,
} from "@/services/admin/salary";

import type {
  EmployeeSalary,
  SalaryHistoryResponse,
  UserRole,
  SalaryType,
} from "@/lib/validations/Admin/salary";

import {
  formatCurrency,
  getMonthName,
  getMonthYearOptions,
} from "@/lib/validations/Admin/salary";

// ==================== TYPES ====================
interface MonthYear {
  month: number;
  year: number;
}

interface SalaryDataTableProps {
  columns: ColumnDef<EmployeeSalary>[];
  data: EmployeeSalary[];
  emptyMessage: ReactNode;
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function SalaryDataTable({
  columns,
  data,
  emptyMessage,
  currentPage,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
}: SalaryDataTableProps) {
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
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
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
            {[10, 20, 30].map((pageSize) => (
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
const SalaryManagement = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("manage");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("ALL");
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeSalary | null>(null);
  const [selectedEmployeeForHistory, setSelectedEmployeeForHistory] =
  
    useState<EmployeeSalary | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Get current month and year
  const currentDate = new Date();
  const [selectedMonthYear, setSelectedMonthYear] = useState<MonthYear>({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  });

  // ==================== API QUERIES ====================
  // Fetch salary list
  const {
    data: salaryListData,
    isLoading: isLoadingList,
    isFetching,
    refetch: refetchList,
  } = useSalaryList({
    userRole: selectedRole,
    page,
    limit,
    month: selectedMonthYear.month,
    year: selectedMonthYear.year,
    search: searchQuery,
  });

  // // Fetch salary summary
  // const {
  //   data: salarySummary,
  //   isLoading: isLoadingSummary,
  //   refetch: refetchSummary,
  // } = useSalarySummary({
  //   userRole: selectedRole,
  //   month: selectedMonthYear.month,
  //   year: selectedMonthYear.year,
  // });

  // Fetch salary history for selected employee
  const {
    data: salaryHistory,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useSalaryHistory(
    selectedEmployeeForHistory
      ? {
          userId: selectedEmployeeForHistory.userId,
          userRole: selectedEmployeeForHistory.role,
          month: selectedMonthYear.month,
          year: selectedMonthYear.year,
        }
      : null,
  );

  const selectedEmployeeForDetails =
    selectedEmployee ?? selectedEmployeeForHistory;

  const salaryDetailsParams = selectedEmployeeForDetails
    ? {
        userId: selectedEmployeeForDetails.userId,
        userRole: selectedEmployeeForDetails.role,
        month: selectedMonthYear.month,
        year: selectedMonthYear.year,
      }
    : null;

  console.log("SalaryManagement params passed to useSalaryDetails:", {
    userId: salaryDetailsParams?.userId,
    userRole: salaryDetailsParams?.userRole,
    month: salaryDetailsParams?.month,
    year: salaryDetailsParams?.year,
  });

  // Fetch salary details for selected employee
  const {
    data: salaryDetails,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
  } = useSalaryDetails(salaryDetailsParams);

  // Fetch salary dashboard stats
  const {
    data: salaryDashboardStats,
    isLoading: isLoadingDashboardStats,
    refetch: refetchDashboardStats,
  } = useSalaryDashboardStats({
    userRole: selectedRole,
    month: selectedMonthYear.month,
    year: selectedMonthYear.year,
  });

  // ==================== MUTATIONS ====================
  // Add salary adjustment mutation
const addAdjustmentMutation = useAddSalaryAdjustment({
  onSuccess: async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["salary-list"] }),
      queryClient.invalidateQueries({ queryKey: ["salary-history"] }),
      queryClient.invalidateQueries({
        queryKey: ["salary-dashboard-stats"],
      }),
    ]);

    await Promise.all([
      refetchList(),
      refetchDashboardStats(),
    ]);

    toast.success("Salary adjustment added successfully");

    setIsAdjustmentModalOpen(false);
    setSelectedEmployee(null);
  },

  onError: (error) => {
    toast.error(`Failed to add adjustment: ${error.message}`);
  },
});

  // Update salary mutation
  const updateSalaryMutation = useUpdateSalary({
    onError: (error) => {
      toast.error(`Failed to update salary: ${error.message}`);
    },
  });

  // Download payslip mutation
  const downloadPayslipMutation = useDownloadPayslip();

  // ==================== HELPER FUNCTIONS ====================
  function formatDate(date: Date | string) {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Filter employees based on search query
  const salaryEmployees = salaryListData?.data ?? [];
  const salaryPagination = salaryListData?.pagination;
  const totalPages = Math.max(
    salaryPagination?.totalPages ?? salaryListData?.totalPages ?? 1,
    1,
  );
  const currentPage = Math.min(
    Math.max(salaryPagination?.page ?? salaryListData?.currentPage ?? page, 1),
    totalPages,
  );
  const totalRecords =
    salaryPagination?.totalRecords ??
    salaryPagination?.total ??
    salaryListData?.count ??
    salaryEmployees.length;

  // ==================== HANDLERS ====================
  const handleSalaryUpdate = async (data: Record<string, unknown>) => {
    if (!selectedEmployee) return;

    const previousSalary = selectedEmployee.baseSalary;
    const newSalary = Number(data.newSalary);

    console.log("Salary value before update:", previousSalary);

    try {
      const response = await updateSalaryMutation.mutateAsync({
        userId: selectedEmployee.userId,
        userRole: selectedEmployee.role,
        newSalary,
        reason: String(data.reason || ""),
        month: selectedMonthYear.month,
        year: selectedMonthYear.year,
      });

      console.log("Salary update mutation response:", response);

      await queryClient.invalidateQueries({ queryKey: ["salary-list"] });
      await queryClient.invalidateQueries({
        queryKey: ["salary-dashboard-stats"],
      });

      const [salaryListResponse] = await Promise.all([
        refetchList(),
        refetchDashboardStats(),
      ]);

      console.log(
        "Salary list response after refetch:",
        salaryListResponse.data,
      );

      toast.success("Salary updated successfully");
      setIsSalaryModalOpen(false);
      setSelectedEmployee(null);
    } catch {
      // useUpdateSalary handles the visible toast through onError.
    }
  };

  const handleAdjustmentAdd = (data: Record<string, unknown>) => {
    if (!selectedEmployee) return;

    addAdjustmentMutation.mutate({
      userId: selectedEmployee.userId,
      userRole: selectedEmployee.role,
      type: data.type as SalaryType,
      amount: Number(data.amount),
      reason: String(data.reason || ""),
      month: selectedMonthYear.month,
      year: selectedMonthYear.year,
    });
  };

  const handleDownloadPayslip = (employee: EmployeeSalary) => {
    downloadPayslipMutation.mutate({
      userId: employee.userId,
      userRole: employee.role,
      month: selectedMonthYear.month,
      year: selectedMonthYear.year,
    });
  };

  const handleRefresh = () => {
    refetchList();
   // refetchSummary();
    if (selectedEmployeeForHistory) {
      refetchHistory();
    }
    if (selectedEmployee) {
      refetchDetails();
    }
    refetchDashboardStats();
    toast.success("Data refreshed");
  };

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  const handleLimitChange = (nextLimit: number) => {
    setPage(1);
    setLimit(nextLimit);
  };

  // ==================== FORM SECTIONS ====================
  const salaryFormSections: FormSection[] = [
    {
      title: "Salary Update",
      icon: <TrendingUp className="h-4 w-4" />,
      fields: [
        {
          name: "employeeName",
          label: "Employee Name",
          type: "text",
          required: true,
          width: "full",
          defaultValue: selectedEmployee?.name || "",
          disabled: true,
        },
        {
          name: "currentSalary",
          label: "Current Salary",
          type: "number",
          required: true,
          width: "half",
          defaultValue: selectedEmployee?.baseSalary || 0,
          disabled: true,
        },
        {
          name: "newSalary",
          label: "New Salary",
          type: "number",
          required: true,
          width: "half",
          placeholder: "Enter new salary amount",
          min: 0,
        },
        {
          name: "reason",
          label: "Reason for Update",
          type: "textarea",
          required: true,
          width: "full",
          placeholder: "Enter reason for salary update (minimum 5 characters)",
          rows: 4,
        },
      ],
    },
  ];

  const adjustmentFormSections: FormSection[] = [
    {
      title: "Salary Adjustment",
      icon: <Calculator className="h-4 w-4" />,
      fields: [
        {
          name: "employeeName",
          label: "Employee Name",
          type: "text",
          required: true,
          width: "full",
          defaultValue: selectedEmployee?.name || "",
          disabled: true,
        },
        {
          name: "type",
          label: "Adjustment Type",
          type: "select",
          required: true,
          width: "half",
          options: [
            {
              value: "BONUS",
              label: "Bonus",
              color: "bg-green-100 text-green-800",
            },
            {
              value: "PENALTY",
              label: "Penalty",
              color: "bg-red-100 text-red-800",
            },
            {
              value: "DEDUCTION",
              label: "Deduction",
              color: "bg-orange-100 text-orange-800",
            },
            {
              value: "INCREMENT",
              label: "Increment",
              color: "bg-blue-100 text-blue-800",
            },
          ],
        },
        {
          name: "amount",
          label: "Amount",
          type: "number",
          required: true,
          width: "half",
          placeholder: "Enter amount",
          min: 0,
        },
        {
          name: "reason",
          label: "Reason",
          type: "textarea",
          required: true,
          width: "full",
          placeholder: "Enter reason for adjustment (minimum 5 characters)",
          rows: 4,
        },
      ],
    },
  ];

  // ==================== TABLE COLUMNS ====================
  const employeeColumns: ColumnDef<EmployeeSalary>[] = [
    {
      accessorKey: "name",
      header: "Employee Information",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              {employee.name}
            </div>
            <div className="text-sm text-muted-foreground">
              {employee.role.replace("_", " ")}
            </div>
            {/* <div className="text-xs text-muted-foreground">
              ID: {employee.userId.slice(0, 8)}...
            </div> */}
            <Badge
              variant={employee.isActive ? "default" : "secondary"}
              className="mt-1 w-fit text-xs"
            >
              {employee.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "salaryDetails",
      header: "Salary Details",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Base:</span>
              <span className="font-medium">
                {formatCurrency(employee.baseSalary)}
              </span>
            </div>
            {employee.bonus > 0 && (
              <div className="flex items-center gap-2 text-green-600 text-xs">
                <span>Bonus:</span>
                <span>+{formatCurrency(employee.bonus)}</span>
              </div>
            )}
            {employee.penalty > 0 && (
              <div className="flex items-center gap-2 text-red-600 text-xs">
                <span>Penalty:</span>
                <span>-{formatCurrency(employee.penalty)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1 border-t">
              <span className="text-sm font-semibold text-blue-600">Net:</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(employee.netSalary)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "adjustments",
      header: "Adjustments",
      cell: ({ row }) => {
        const employee = row.original;
        const adjustments = employee.adjustments ?? [];
        return (
          <div className="space-y-1">
            {adjustments.length > 0 ? (
              <>
                <Badge variant="outline" className="text-xs">
                  {adjustments.length} adjustment(s)
                </Badge>
                <div className="text-xs text-muted-foreground">
                  Latest: {adjustments[0]?.type}
                </div>
              </>
            ) : (
              <span className="text-sm text-gray-500">No adjustments</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedEmployee(employee);
                  setIsSalaryModalOpen(true);
                }}
                title="Update salary"
                disabled={updateSalaryMutation.isPending}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedEmployee(employee);
                  setIsAdjustmentModalOpen(true);
                }}
                title="Add adjustment"
                disabled={addAdjustmentMutation.isPending}
              >
                <Calculator className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedEmployeeForHistory(employee);
                  setIsHistoryModalOpen(true);
                }}
                title="View history"
              >
                <History className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDownloadPayslip(employee)}
              className="text-xs"
              disabled={downloadPayslipMutation.isPending}
            >
              <Download className="h-3 w-3 mr-1" />
              Payslip
            </Button>
          </div>
        );
      },
    },
  ];

  // Loading state
  const isLoading = isLoadingList ;

  // ==================== RENDER ====================
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="h-8 w-8 text-purple-600" />
            Salary Management
          </h1>
          <p className="text-muted-foreground">
            Manage employee salaries, adjustments, bonuses, and penalties
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Monthly Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg lg:text-2xl font-bold truncate">
              {formatCurrency(salaryDashboardStats?.totalMonthlySalary || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
           <div className="text-lg lg:text-2xl font-bold truncate">
              {formatCurrency(salaryDashboardStats?.averageSalary || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bonuses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{formatCurrency(salaryDashboardStats?.totalBonuses || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Penalties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{formatCurrency(salaryDashboardStats?.totalPenalties || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Adjustments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              <div className="text-2xl font-bold text-yellow-600">
  {formatCurrency(salaryDashboardStats?.totalAdjustments || 0).replace("₹", "")}
</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1 max-w-md">
          <Select
            value={selectedRole}
            onValueChange={(value: UserRole) => {
              setPage(1);
              setSelectedRole(value);
            }}
          >
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="DOCTOR">Doctor</SelectItem>
              
              <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
              
           
              
              <SelectItem value="STAFF">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 max-w-md">
          <Select
            value={`${selectedMonthYear.month}-${selectedMonthYear.year}`}
            onValueChange={(value) => {
              const [month, year] = value.split("-");
              setPage(1);
              setSelectedMonthYear({
                month: Number(month),
                year: Number(year),
              });
            }}
          >
            <SelectTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {getMonthYearOptions().map((option) => (
                <SelectItem
                  key={`${option.value.month}-${option.value.year}`}
                  value={`${option.value.month}-${option.value.year}`}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search employees..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setPage(1);
              setSearchQuery(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Employee Salary List */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Employee Salary List ({totalRecords} employees)
          </CardTitle>
          <CardDescription>
            Manage salaries, add bonuses/penalties, and view history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <SalaryDataTable
              columns={employeeColumns}
              data={salaryEmployees}
              currentPage={currentPage}
              totalPages={totalPages}
              limit={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              emptyMessage={
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No employees found
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedRole !== "ALL"
                      ? `No ${selectedRole.toLowerCase()} employees found`
                      : "No employee records available"}
                  </p>
                </div>
              }
            />
          )}
        </CardContent>
      </Card>

      {/* ==================== MODALS ==================== */}

      {/* Update Salary Modal */}
      {selectedEmployee && (
        <ReusableModal
          isOpen={isSalaryModalOpen}
          onClose={() => {
            setIsSalaryModalOpen(false);
            setSelectedEmployee(null);
          }}
          onSave={handleSalaryUpdate}
          title={
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Update Salary
              <Badge variant="outline" className="ml-2">
                {selectedEmployee.name}
              </Badge>
            </div>
          }
          sections={salaryFormSections}
          initialData={{
            employeeName: selectedEmployee.name,
            currentSalary: selectedEmployee.baseSalary,
          }}
          isEdit={false}
          size="lg"
          saveButtonText="Update Salary"
          cancelButtonText="Cancel"
          saveButtonColor="linear-gradient(135deg, #8b5cf6, #7c3aed)"
          validationOnChange={true}
          // isLoading={updateSalaryMutation.isPending}
        />
      )}

      {/* Add Adjustment Modal */}
      {selectedEmployee && (
        <ReusableModal
          isOpen={isAdjustmentModalOpen}
          onClose={() => {
            setIsAdjustmentModalOpen(false);
            setSelectedEmployee(null);
          }}
          onSave={handleAdjustmentAdd}
          title={
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Add Salary Adjustment
              <Badge variant="outline" className="ml-2">
                {selectedEmployee.name}
              </Badge>
            </div>
          }
          sections={adjustmentFormSections}
          initialData={{
            employeeName: selectedEmployee.name,
          }}
          isEdit={false}
          size="lg"
          saveButtonText="Add Adjustment"
          cancelButtonText="Cancel"
          saveButtonColor="linear-gradient(135deg, #f59e0b, #d97706)"
          validationOnChange={true}
          // isLoading={addAdjustmentMutation.isPending}
        />
      )}

      {/* Salary History Modal */}
      {selectedEmployeeForHistory && (
        <ReusableModal
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setSelectedEmployeeForHistory(null);
          }}
          onSave={() => {}}
          title={
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Salary History
              <Badge variant="outline" className="ml-2">
                {selectedEmployeeForHistory.name}
              </Badge>
            </div>
          }
          sections={[]}
          initialData={{}}
          isEdit={false}
          size="xl"
          saveButtonText="Close"
          cancelButtonText="Close"
        >
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {isLoadingHistory ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            ) : salaryHistory && salaryHistory.data.length > 0 ? (
              salaryHistory.data.map((record: SalaryHistoryResponse) => (
                <Card key={record.id} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        className={
                          record.type === "BONUS" || record.type === "INCREMENT"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {record.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {getMonthName(record.month)} {record.year}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold">
                        {record.type === "BONUS" || record.type === "INCREMENT"
                          ? "+"
                          : "-"}
                        {formatCurrency(record.amount)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(record.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {record.reason}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <History className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-muted-foreground">
                  No salary history available
                </p>
              </div>
            )}
          </div>
        </ReusableModal>
      )}
    </div>
  );
};

export default SalaryManagement;
