"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePatientById } from "@/services/admin/patient";
import { usePatientPortalSelection } from "@/lib/hooks/usePatientPortalSelection";

import { 
  FileText, 
  Download, 
  Search,
  Filter,
  Activity,
  Microscope,
  CheckCircle2,
  Eye,
} from "lucide-react";
import DataTable from "@/components/reusable/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface MedicalReport {
  _id?: string;
  fileName: string;
  originalName?: string;
  filePath?: string;
   uploadedAt?: string | Date;
}
export default function PatientReportsPage() {


  const { patientId } = usePatientPortalSelection();

const { data: patient, isLoading } =
  usePatientById(patientId);

const reports: MedicalReport[] =
  patient?.medicalReports || [];

const columns: ColumnDef<MedicalReport>[] = [
  {
    accessorKey: "originalName",
    header: "Report Name",

    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-blue-600" />

        <span>
          {row.original.originalName ||
            row.original.fileName}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "uploadedAt",
    header: "Uploaded Date",

    cell: ({ row }) =>
      row.original.uploadedAt
        ? new Date(
            row.original.uploadedAt
          ).toLocaleDateString()
        : "-",
  },


  {
    id: "view",

    header: "View",

    cell: ({ row }) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          window.open(
            `${process.env.NEXT_PUBLIC_API_URL}${row.original.filePath}`,
            "_blank"
          )
        }
      >
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
    ),
  },
];
if (isLoading) {
  return (
    <Card>
      <CardContent className="py-10 text-center">
        Loading reports...
      </CardContent>
    </Card>
  );
}

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Reports</h1>
          <p className="text-slate-500">Access your lab results and diagnostic scans.</p>
        </div>

      </div>

 
      <Card className="border-none shadow-sm overflow-hidden">
<CardContent className="p-0 sm:p-6">
  {reports.length === 0 ? (
    <div className="py-10 text-center text-slate-500">
      No medical reports uploaded yet
    </div>
  ) : (
    <DataTable
      columns={columns}
      data={reports}
      searchColumn="originalName"
      searchPlaceholder="Search medical reports..."
    />
  )}
</CardContent>
      </Card>
    </div>
  );
}
