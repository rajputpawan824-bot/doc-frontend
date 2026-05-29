"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  History, 
  Calendar, 
  Download, 
  Search,
  Stethoscope,
  Pill,
  FileText
} from "lucide-react";
import DataTable from "@/components/reusable/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface VisitHistory {
  id: string;
  date: string;
  doctor: string;
  department: string;
  reason: string;
  status: "Completed" | "Cancelled";
  hasPrescription: boolean;
}

export default function PatientHistoryPage() {
  const mockHistory: VisitHistory[] = [
    {
      id: "V-9921",
      date: "2026-05-10",
      doctor: "Dr. John Smith",
      department: "Cardiology",
      reason: "Regular Checkup",
      status: "Completed",
      hasPrescription: true
    },
    {
      id: "V-9801",
      date: "2026-04-15",
      doctor: "Dr. Sarah Wilson",
      department: "General OPD",
      reason: "Viral Fever",
      status: "Completed",
      hasPrescription: true
    },
    {
      id: "V-9750",
      date: "2026-03-20",
      doctor: "Dr. John Smith",
      department: "Cardiology",
      reason: "ECG Review",
      status: "Completed",
      hasPrescription: false
    }
  ];

  const columns: ColumnDef<VisitHistory>[] = [
    {
      accessorKey: "date",
      header: "Visit Date",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="font-bold">{row.original.date}</span>
        </div>
      ),
    },
    {
      accessorKey: "doctor",
      header: "Doctor",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.doctor}</span>
          <span className="text-xs text-slate-500">{row.original.department}</span>
        </div>
      ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
    },
    {
      id: "prescription",
      header: "Prescription",
      cell: ({ row }) => row.original.hasPrescription ? (
        <Button variant="ghost" size="sm" className="text-blue-600 h-8 gap-2 px-2 hover:bg-blue-50">
          <Download className="h-4 w-4" /> Download
        </Button>
      ) : (
        <span className="text-xs text-slate-400 italic pl-2">N/A</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className={row.original.status === "Completed" ? "text-green-600 bg-green-50 border-none" : "text-slate-500"}>
          {row.original.status}
        </Badge>
      ),
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visit History</h1>
          <p className="text-slate-500">View your past clinic visits and download prescriptions.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:w-auto gap-2">
            <Search className="h-4 w-4" /> Search
          </Button>
          <Button className="flex-1 sm:w-auto bg-blue-600 gap-2">
            <Download className="h-4 w-4" /> Export All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" /> Past Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <DataTable 
                columns={columns} 
                data={mockHistory} 
                searchColumn="doctor"
                searchPlaceholder="Search by doctor..."
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-blue-600 text-white">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="p-4 bg-white/10 rounded-2xl inline-block">
                <Pill className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Active Medications</h3>
                <p className="text-blue-100 text-sm">2 current prescriptions</p>
              </div>
              <Button variant="secondary" className="w-full font-bold">
                View Details
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Medical Documents</CardTitle>
              <CardDescription>Recently added files</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">Scan_Report_{i}.pdf</p>
                      <p className="text-[10px] text-slate-400">Added May {12-i}, 2026</p>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-blue-600 cursor-pointer" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
