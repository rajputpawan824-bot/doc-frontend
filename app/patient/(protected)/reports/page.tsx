"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Search,
  Filter,
  Activity,
  Microscope,
  CheckCircle2
} from "lucide-react";
import DataTable from "@/components/reusable/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface LabReport {
  id: string;
  name: string;
  date: string;
  lab: string;
  type: "Blood" | "Scan" | "Urine" | "Other";
  status: "Ready" | "Pending";
}

export default function PatientReportsPage() {
  const reports: LabReport[] = [
    {
      id: "R-100",
      name: "Complete Blood Count (CBC)",
      date: "2026-05-14",
      lab: "Main Clinic Lab",
      type: "Blood",
      status: "Ready"
    },
    {
      id: "R-101",
      name: "Chest X-Ray",
      date: "2026-05-15",
      lab: "Radiology Dept",
      type: "Scan",
      status: "Pending"
    },
    {
      id: "R-098",
      name: "Lipid Profile",
      date: "2026-05-10",
      lab: "Main Clinic Lab",
      type: "Blood",
      status: "Ready"
    }
  ];

  const columns: ColumnDef<LabReport>[] = [
    {
      accessorKey: "name",
      header: "Test Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            {row.original.type === "Blood" && <Activity className="h-4 w-4 text-red-500" />}
            {row.original.type === "Scan" && <Microscope className="h-4 w-4 text-blue-500" />}
            {row.original.type !== "Blood" && row.original.type !== "Scan" && <FileText className="h-4 w-4 text-slate-500" />}
          </div>
          <span className="font-bold text-slate-900">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Test Date",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={row.original.status === "Ready" ? "bg-green-100 text-green-700 border-none" : "bg-orange-100 text-orange-700 border-none"}>
          {row.original.status === "Ready" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-blue-600 gap-2 h-8"
          disabled={row.original.status === "Pending"}
        >
          <Download className="h-4 w-4" /> Download
        </Button>
      ),
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Reports</h1>
          <p className="text-slate-500">Access your lab results and diagnostic scans.</p>
        </div>
        <Button className="w-full sm:w-auto bg-blue-600 gap-2">
          <Filter className="h-4 w-4" /> Filter Reports
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs text-slate-400 font-bold uppercase">Total Reports</p>
            <h3 className="text-2xl font-bold text-slate-900">12</h3>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs text-slate-400 font-bold uppercase">Ready</p>
            <h3 className="text-2xl font-bold text-green-600">11</h3>
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs text-slate-400 font-bold uppercase">Pending</p>
            <h3 className="text-2xl font-bold text-orange-600">1</h3>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-none shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs text-blue-600 font-bold uppercase">New This Month</p>
            <h3 className="text-2xl font-bold text-blue-700">3</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0 sm:p-6">
          <DataTable 
            columns={columns} 
            data={reports} 
            searchColumn="name"
            searchPlaceholder="Search reports..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
