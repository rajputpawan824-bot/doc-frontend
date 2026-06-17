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

export default function ReceptionistSalaryPage() {
  // Mock Summary Data
  const summary = {
    baseSalary: 45000,
    bonus: 5000,
    penalty: 500,
    netSalary: 49500,
  };

  // Mock History Data
  const history: SalaryHistoryResponse[] = [
    {
      id: "1",
      userId: "R001",
      userRole: "RECEPTIONIST",
      type: "BONUS",
      amount: 3000,
      reason: "Efficiency in queue management",
      month: 5,
      year: 2026,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      userId: "R001",
      userRole: "RECEPTIONIST",
      type: "PENALTY",
      amount: 500,
      reason: "Unannounced late arrival",
      month: 5,
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
        <Button variant="ghost" size="sm" className="gap-2 text-blue-600 hover:text-blue-700">
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
          <p className="text-slate-500">View your earnings and payslips</p>
        </div>
        <Button className="gap-2 bg-blue-600">
          <Download className="h-4 w-4" />
          Download Summary
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Base Salary</p>
            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(summary.baseSalary)}</h3>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Total Bonuses</p>
            <h3 className="text-2xl font-bold text-green-600">{formatCurrency(summary.bonus)}</h3>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500">Total Penalties</p>
            <h3 className="text-2xl font-bold text-red-600">{formatCurrency(summary.penalty)}</h3>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-blue-100">Net Payable</p>
            <h3 className="text-2xl font-bold">{formatCurrency(summary.netSalary)}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Salary History
          </CardTitle>
          <CardDescription>Records of your salary payments and adjustments</CardDescription>
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
  );
}
