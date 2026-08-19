"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReactNode, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  History,
  Calendar,
  Download,
  Search,
  Pill,
  FileText,
  Droplets
} from "lucide-react";
import DataTable from "@/components/reusable/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { usePatientAppointments, type PatientAppointment } from "@/services/admin/appointment";
import { usePatientPortalSelection } from "@/lib/hooks/usePatientPortalSelection";
import { usePrescriptionHistory,downloadPrescriptionPdf} from "@/services/admin/prescription";

interface VisitHistory {
  id: string;
  date: string;
  doctor: string;
  department: string;
  reason: string;
  slot: string;
  status: string;
  hasPrescription: boolean;
}

type PrescriptionAttachment = {
  _id?: string;
  originalName?: string;
  fileName?: string;
  filePath?: string;
  url?: string;
  date?: string | Date;
};

const getAttachmentUrl = (attachment: PrescriptionAttachment) =>
  attachment.url || "";
const openAttachment = (attachment: PrescriptionAttachment) => {
  const attachmentUrl = getAttachmentUrl(attachment);

  if (!attachmentUrl) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Prescription attachment is missing a browser-accessible URL", attachment);
    }
    return;
  }

  window.open(attachmentUrl, "_blank", "noopener,noreferrer");
};

type PrescriptionHistoryItem = {
  _id?: string;
  tokenNumber?: string | number;
  prescription?: string | string[];
  medicalNotes?: string | string[];
  followUpDate?: string | Date | null;
  createdAt?: string | Date;
  attachments?: PrescriptionAttachment[];

  appointment?: {
    date?: string | Date;
    tokenNumber?: string | number;
    doctorName?: string;
  };

  doctor?: {
    department?: string;
    qualification?: string;
    user?: {
      name?: string;
    };
  };

  doctorName?: string;
};

function getDoctorName(appointment: PatientAppointment) {
  return (
    appointment.doctorName ||
    appointment.doctor?.doctorName ||
    appointment.doctor?.user?.name ||
    "--"
  );
}

function getDepartment(appointment: PatientAppointment) {
  return appointment.department || appointment.doctor?.department || "General OPD";
}

function formatDate(date?: string) {
  if (!date) return "--";
  const parsed = new Date(date);
  return Number.isNaN(parsed?.getTime()) ? date : parsed.toLocaleDateString();
}


const formatHistoryDate = (value?: string | Date | null) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date?.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const splitNumberedText = (value?: string | string[]) => {
  if (Array.isArray(value)) return value.filter(Boolean);

  if (!value) return [];

  return value
    .split(/\n|,(?=\s*\D)/)
    .map((item) => item.replace(/^\s*\d+[\).]\s*/, "").trim())
    .filter(Boolean);
};

const NumberedList = ({
  items,
  emptyText,
}: {
  items: string[];
  emptyText: string;
}) => {
  if (!items.length) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ol>
  );
};


export default function PatientHistoryPage() {

    const [historyOpen, setHistoryOpen] = useState(false);
  const { patientId } = usePatientPortalSelection();
  const {
    data: appointments = [],
    isLoading,
  } = usePatientAppointments(patientId);

  const {
  data: prescriptionHistory,
  isLoading: historyLoading,
} = usePrescriptionHistory(patientId);

const getHistoryItems = (value: unknown): PrescriptionHistoryItem[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value as PrescriptionHistoryItem[];
  }

  if (typeof value === "object") {
    const historyValue = value as {
      history?: PrescriptionHistoryItem[];
      data?: unknown;
    };

    if (Array.isArray(historyValue.history)) {
      return historyValue.history;
    }

    if (historyValue.data) {
      return getHistoryItems(historyValue.data);
    }
  }


  return [];
};

const historyItems =
  getHistoryItems(prescriptionHistory);

const getAttachments = (item: PrescriptionHistoryItem): PrescriptionAttachment[] =>
  Array.isArray(item?.attachments) ? item.attachments : [];

const allAttachments = historyItems.flatMap((item) =>
  getAttachments(item).map((attachment) => ({
    ...attachment,
    date: item.appointment?.date || item.createdAt,
  })),
);


  console.log(
  "prescriptionHistory",
  prescriptionHistory
);

console.log(
  "historyItems",
  historyItems
);



const visitHistory: VisitHistory[] = appointments.map((appointment) => ({
  id: appointment._id || appointment.id || appointment.appointmentId || "",
  date: formatDate(appointment.date),
  doctor: getDoctorName(appointment),
  department: getDepartment(appointment),
  reason: appointment.reason || "--",
  slot: appointment.slot || appointment.time || "--",
  status: appointment.status || "--",
hasPrescription:
  Boolean(
    appointment.hasPrescription ||
    appointment.prescription
  ),
}));
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
      accessorKey: "slot",
      header: "Slot",
    },
    {
      id: "prescription",
      header: "Prescription",
      cell: ({ row }) => row.original.hasPrescription ? (
<Button
  variant="ghost"
  size="sm"
  className="text-blue-600 h-8 gap-2 px-2 hover:bg-blue-50"
  onClick={() =>
    downloadPrescriptionPdf(row.original.id)
  }
>
  <Download className="h-4 w-4" />
  Download
</Button>
      ) : (
        <span className="text-xs text-slate-400 italic pl-2">N/A</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className={row.original.status.toUpperCase() === "COMPLETED" ? "text-green-600 bg-green-50 border-none" : "text-slate-500"}>
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
                data={visitHistory} 
                searchColumn="doctor"
                searchPlaceholder="Search by doctor..."
                emptyMessage={isLoading ? "Loading appointments..." : "No history found."}
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
  <p className="text-white-100 text-sm">
    {historyItems.length} current prescriptions
  </p>
</div>
<Button
  variant="secondary"
  className="w-full font-bold"
  onClick={() => setHistoryOpen(true)}
>
  Prescription History
</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Medical Documents</CardTitle>
              <CardDescription>Recently added files</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {allAttachments.slice(0, 2).map((attachment, index) => (
                <button
                  key={attachment._id || attachment.filePath || index}
                  type="button"
                  onClick={() => openAttachment(attachment)}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {attachment.originalName || attachment.fileName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Added {formatHistoryDate(attachment.date) || "-"}
                      </p>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-blue-600 cursor-pointer" />
                </button>
              ))}
              {allAttachments.length === 0 && (
                <p className="text-sm text-slate-400">No documents found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
  open={historyOpen}
  onOpenChange={setHistoryOpen}
>
<DialogContent className="w-[98vw] max-w-[1500px] max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        Prescription History
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-6">

      <div className="rounded-lg border bg-slate-50 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              Current Patient
            </p>
            <p className="text-sm text-slate-500">
              Complete Prescription Timeline
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {historyItems.length} Visits
            </Badge>
          </div>
        </div>
      </div>

      {historyLoading ? (
        <div className="flex h-40 items-center justify-center">
          Loading...
        </div>
      ) : historyItems.length > 0 ? (

        <div className="relative space-y-5 before:absolute before:left-4 before:top-2 before:h-full before:w-px before:bg-slate-200">

          {historyItems.map((item, index: number) => {

            const prescriptionItems =
              splitNumberedText(item.prescription);

            const notesItems =
              splitNumberedText(item.medicalNotes);
            const attachments = getAttachments(item);

            return (
              <div
                key={item._id || index}
                className="relative pl-10"
              >
                <div className="absolute left-2 top-6 h-4 w-4 rounded-full border-2 border-blue-600 bg-white" />

                <Card>
                  <CardContent className="space-y-5 p-5">

                    <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        <h3 className="text-lg font-semibold">
                          {formatHistoryDate(
                            item.appointment?.date ||
                            item.createdAt
                          )}
                        </h3>

                        <p className="text-sm font-medium">
                          Token #
                          {item.tokenNumber ||
                            item.appointment?.tokenNumber ||
                            "-"}
                        </p>
                      </div>

<p className="text-sm font-medium">
  Doctor:
  {" "}
  {item.doctor?.user?.name ||
    item.doctorName ||
    item.appointment?.doctorName ||
    "-"}
</p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">

                      <div>
                        <Label>
                          Prescription
                        </Label>

                        <NumberedList
                          items={prescriptionItems}
                          emptyText="No prescription recorded"
                        />
                      </div>

                      <div>
                        <Label>
                          Medical Notes
                        </Label>

                        <NumberedList
                          items={notesItems}
                          emptyText="No medical notes recorded"
                        />
                      </div>

                    </div>

                    <div className="space-y-2">
                      <Label>
                        Attachments
                      </Label>

                      {attachments.length > 0 ? (
                        <div className="space-y-2">
                          {attachments.map((attachment, attachmentIndex) => (
                            <button
                              key={attachment._id || attachment.filePath || attachmentIndex}
                              type="button"
                              onClick={() => openAttachment(attachment)}
                              className="block text-sm text-blue-600 underline"
                            >
                              {attachment.originalName || attachment.fileName}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          No attachments uploaded
                        </p>
                      )}
                    </div>

                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Follow Up Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatHistoryDate(
                          item.followUpDate
                        ) || "-"}
                      </p>
                    </div>

                  </CardContent>
                </Card>

              </div>
            );
          })}
        </div>

      ) : (

        <div className="rounded-lg border border-dashed py-14 text-center">
          <FileText className="mx-auto mb-4 h-10 w-10 text-slate-300" />
          <h3 className="text-lg font-semibold">
            No Prescription History Available
          </h3>
        </div>

      )}
    </div>
  </DialogContent>
</Dialog>


    </div>
  );
}
