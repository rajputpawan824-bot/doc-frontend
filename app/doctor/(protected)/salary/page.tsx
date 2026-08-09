"use client";

import { useState } from "react";
import { 
  Banknote, 
  TrendingUp, 
  TrendingDown, 
Download,
FileText,
  History,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/reusable/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { SalaryHistoryResponse, formatCurrency, getMonthName } from "@/lib/validations/Admin/salary";
import {
  useDownloadPayslip,
  useSalaryDetails,
  useSalaryHistory,
    useViewPayslip,
} from "@/services/admin/salary";

export default function DoctorSalaryPage() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const salaryParams = {
    month: selectedMonth,
    year: selectedYear,
  };

  const {
    data: salaryDetails,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
  } = useSalaryDetails(salaryParams);
  const {
    data: salaryHistory,
    isLoading: isLoadingHistory,
    isError: isHistoryError,
  } = useSalaryHistory(salaryParams);
  const downloadPayslipMutation = useDownloadPayslip();

  const viewPayslipMutation = useViewPayslip();

  const summary = {
    baseSalary: salaryDetails?.baseSalary ?? 0,
    bonus: salaryDetails?.bonus ?? 0,
    penalty: salaryDetails?.penalty ?? 0,
    netSalary: salaryDetails?.netSalary ?? 0,
  };
  const history = salaryHistory?.data ?? [];
  const years = Array.from({ length: 7 }, (_, index) => currentYear + 1 - index);
  const handleDownloadPayslip = () => {
    downloadPayslipMutation.mutate(salaryParams);
  };

  const handleViewPayslip = () => {
  viewPayslipMutation.mutate(salaryParams);
};

  const columns: ColumnDef<SalaryHistoryResponse>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{`${getMonthName(item.month)} ${item.year}`}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
          BONUS: "default",
          PENALTY: "destructive",
          INCREMENT: "outline",
          DEDUCTION: "destructive",
        };
        return (
          <Badge variant={variants[type] || "outline"} className="font-medium">
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number;
        const type = row.original.type;
        const isNegative = type === "PENALTY" || type === "DEDUCTION";
        return (
          <span className={`font-bold ${isNegative ? "text-red-600" : "text-green-600"}`}>
            {isNegative ? "-" : "+"}{formatCurrency(amount)}
          </span>
        );
      },
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <span className="text-slate-600 line-clamp-1 max-w-[300px]" title={row.getValue("reason")}>
          {row.getValue("reason")}
        </span>
      ),
    },
    // {
    //   id: "actions",
    //   header: "Actions",
    //   cell: () => (
    //     <Button
    //       variant="ghost"
    //       size="sm"
    //       className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
    //       onClick={handleDownloadPayslip}
    //       disabled={downloadPayslipMutation.isPending}
    //     >
    //       <Download className="h-4 w-4" />
    //       Payslip
    //     </Button>
    //   ),
    // },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Salary Section</h1>
          <p className="text-slate-500">View your earnings, bonuses, and penalties</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={String(selectedMonth)}
            onValueChange={(value) => setSelectedMonth(Number(value))}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <SelectItem key={month} value={String(month)}>
                  {getMonthName(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(selectedYear)}
            onValueChange={(value) => setSelectedYear(Number(value))}
          >
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
     <div className="flex gap-2">
  <Button
    className="gap-2"
    variant="outline"
    onClick={handleViewPayslip}
    disabled={viewPayslipMutation.isPending}
  >
    <FileText className="h-4 w-4" />
    View Payslip
  </Button>

  <Button
    className="gap-2 bg-blue-600 hover:bg-blue-700"
    onClick={handleDownloadPayslip}
    disabled={downloadPayslipMutation.isPending}
  >
    <Download className="h-4 w-4" />
    Download Payslip
  </Button>
</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Base Salary</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {isLoadingDetails ? "..." : formatCurrency(summary.baseSalary)}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Banknote className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Bonuses</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {isLoadingDetails ? "..." : formatCurrency(summary.bonus)}
                </h3>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Penalties</p>
                <h3 className="text-2xl font-bold text-red-600">
                  {isLoadingDetails ? "..." : formatCurrency(summary.penalty)}
                </h3>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Net Payable</p>
                <h3 className="text-2xl font-bold">
                  {isLoadingDetails ? "..." : formatCurrency(summary.netSalary)}
                </h3>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Banknote className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary History */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              Salary History
            </CardTitle>
            <CardDescription>
              A detailed list of salary adjustments for {getMonthName(selectedMonth)} {selectedYear}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={history} 
            searchColumn="reason"
            searchPlaceholder="Search by reason..."
            emptyMessage={
              isLoadingHistory
                ? "Loading salary history..."
                : isHistoryError
                  ? "Unable to load salary history."
                  : "No salary history available."
            }
          />
        </CardContent>
      </Card>

      {isDetailsError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4 flex gap-3 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            Unable to load salary details for the selected month.
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Note on Salary Calculation</p>
            <p>Your net salary is calculated after adding bonuses and increments, then deducting penalties and deductions for the current month. Payslips are usually available for download after the 1st of every month.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
