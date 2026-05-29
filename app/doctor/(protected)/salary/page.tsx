"use client";

import { useState } from "react";
import { 
  Banknote, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Filter, 
  History,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/reusable/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { SalaryHistoryResponse, formatCurrency, getMonthName } from "@/lib/validations/Admin/salary";

export default function DoctorSalaryPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Mock Summary Data
  const summary = {
    baseSalary: 120000,
    bonus: 15000,
    penalty: 2000,
    netSalary: 133000,
  };

  // Mock History Data
  const history: SalaryHistoryResponse[] = [
    {
      id: "1",
      userId: "D001",
      userRole: "DOCTOR",
      type: "BONUS",
      amount: 10000,
      reason: "Excellent patient feedback",
      month: 5,
      year: 2026,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      userId: "D001",
      userRole: "DOCTOR",
      type: "PENALTY",
      amount: 2000,
      reason: "Late for shift (3 times)",
      month: 5,
      year: 2026,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      userId: "D001",
      userRole: "DOCTOR",
      type: "INCREMENT",
      amount: 5000,
      reason: "Annual performance review",
      month: 4,
      year: 2026,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "4",
      userId: "D001",
      userRole: "DOCTOR",
      type: "BONUS",
      amount: 5000,
      reason: "Overtime hours",
      month: 4,
      year: 2026,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

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
          REVISION: "secondary",
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
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <Button variant="ghost" size="sm" className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
          <Download className="h-4 w-4" />
          Payslip
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Salary Section</h1>
          <p className="text-slate-500">View your earnings, bonuses, and penalties</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Download Summary
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Base Salary</p>
                <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(summary.baseSalary)}</h3>
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
                <h3 className="text-2xl font-bold text-green-600">{formatCurrency(summary.bonus)}</h3>
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
                <h3 className="text-2xl font-bold text-red-600">{formatCurrency(summary.penalty)}</h3>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Net Payable</p>
                <h3 className="text-2xl font-bold">{formatCurrency(summary.netSalary)}</h3>
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
              Salary History / Revisions
            </CardTitle>
            <CardDescription>A detailed list of all salary adjustments and revisions</CardDescription>
          </div>
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

      {/* Info Alert */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Note on Salary Calculation</p>
            <p>Your net salary is calculated after adding all bonuses and deducting penalties for the current month. Payslips are usually available for download after the 1st of every month.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
