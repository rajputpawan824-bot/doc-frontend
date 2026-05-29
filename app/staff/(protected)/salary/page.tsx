"use client";

import { 
  Banknote, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/reusable/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { SalaryHistoryResponse, formatCurrency, getMonthName } from "@/lib/validations/Admin/salary";

export default function StaffSalaryPage() {
  const summary = {
    baseSalary: 28000,
    bonus: 2000,
    penalty: 0,
    netSalary: 30000,
  };

  const history: SalaryHistoryResponse[] = [
    {
      id: "1",
      userId: "S001",
      userRole: "STAFF",
      type: "BONUS",
      amount: 2000,
      reason: "Holiday bonus",
      month: 5,
      year: 2026,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const columns: ColumnDef<SalaryHistoryResponse>[] = [
    {
      accessorKey: "date",
      header: "Month",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>{`${getMonthName(row.original.month)} ${row.original.year}`}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-medium text-[10px] uppercase">
          {row.getValue("type") as string}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-bold text-green-600">
          +{formatCurrency(row.getValue("amount") as number)}
        </span>
      ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <span className="text-slate-600 text-sm">{row.getValue("reason")}</span>
      ),
    },
    {
      id: "actions",
      header: "Slip",
      cell: () => (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Download className="h-4 w-4 text-blue-600" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Salary & Earnings</h1>
        <Button className="w-full sm:w-auto gap-2 bg-blue-600 h-10">
          <Download className="h-4 w-4" /> Summary
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-none bg-white">
          <CardContent className="pt-6">
            <p className="text-xs text-slate-500 uppercase font-semibold">Base</p>
            <h3 className="text-xl font-bold text-slate-900">{formatCurrency(summary.baseSalary)}</h3>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-white">
          <CardContent className="pt-6">
            <p className="text-xs text-slate-500 uppercase font-semibold">Bonus</p>
            <h3 className="text-xl font-bold text-green-600">+{formatCurrency(summary.bonus)}</h3>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-white">
          <CardContent className="pt-6">
            <p className="text-xs text-slate-500 uppercase font-semibold">Penalty</p>
            <h3 className="text-xl font-bold text-red-600">-{formatCurrency(summary.penalty)}</h3>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white shadow-sm border-none">
          <CardContent className="pt-6">
            <p className="text-xs text-slate-400 uppercase font-semibold">Net Pay</p>
            <h3 className="text-xl font-bold">{formatCurrency(summary.netSalary)}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-none bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" /> Payment History
          </CardTitle>
          <CardDescription>View your monthly salary details</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <DataTable 
              columns={columns} 
              data={history} 
              searchColumn="reason"
              searchPlaceholder="Filter..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
