"use client";

import { useMemo, useState } from "react";
import { Check, File, FileText, FolderOpen, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { usePatientAppointments, type PatientAppointment } from "@/services/admin/appointment";
import { type TemporaryDocument, usePrescription, useSavePrescription, useTemporaryDocuments } from "@/services/admin/prescription";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { useTemporaryDocumentSocket } from "./use-temporary-document-socket";

interface PrescriptionPatient { id: string; name: string; patientCode?: string; }

interface PrescriptionDialogProps {
  patient: PrescriptionPatient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AppointmentOption = PatientAppointment & {
  tokenNumber?: string | number;
  token?: { tokenNumber?: string | number; number?: string | number };
};

const getAppointmentId = (appointment: AppointmentOption) => appointment.id || appointment._id || appointment.appointmentId || "";
const getAppointmentDate = (appointment: AppointmentOption) => appointment.date || "";
const getAppointmentToken = (appointment: AppointmentOption) => appointment.tokenNumber || appointment.token?.tokenNumber || appointment.token?.number || "-";
const formatDate = (value: string | Date) => {
  if (!value) return "Date not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date not available" : date.toLocaleDateString();
};

export default function PrescriptionDialog({ patient, open, onOpenChange }: PrescriptionDialogProps) {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [prescriptionFiles, setPrescriptionFiles] = useState<File[]>([]);
  const [selectedTemporaryDocuments, setSelectedTemporaryDocuments] = useState<TemporaryDocument[]>([]);
  const [scannedFilesOpen, setScannedFilesOpen] = useState(false);
  const [pendingTemporaryDocuments, setPendingTemporaryDocuments] = useState<TemporaryDocument[]>([]);
  const [temporaryDocumentsRefreshing, setTemporaryDocumentsRefreshing] = useState(false);

  const { data: appointments = [], isLoading: appointmentsLoading } = usePatientAppointments(open ? patient?.id : undefined);
  const { data: prescriptionData } = usePrescription(selectedAppointmentId || undefined);
  const savePrescriptionMutation = useSavePrescription();
  const { data: temporaryDocuments = [], isLoading: temporaryDocumentsLoading, error: temporaryDocumentsError, refetch: refetchTemporaryDocuments } = useTemporaryDocuments(scannedFilesOpen);
  const visibleTemporaryDocuments = useTemporaryDocumentSocket(scannedFilesOpen, temporaryDocuments);

  const appointmentOptions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (appointments as AppointmentOption[]).filter((appointment) => {
      const date = new Date(getAppointmentDate(appointment));
      date.setHours(0, 0, 0, 0);
      return !Number.isNaN(date.getTime()) && date >= today;
    });
  }, [appointments]);
  const selectedAppointment = appointmentOptions.find((appointment) => getAppointmentId(appointment) === selectedAppointmentId);

  const save = () => {
    if (!patient?.id) return toast.error("Patient not found");
    if (!selectedAppointmentId) return toast.error("Please select an appointment");
    const data = new FormData();
    prescriptionFiles.forEach((file) => data.append("files", file));
    data.append("temporaryDocuments", JSON.stringify(selectedTemporaryDocuments.map((document) => ({ id: document.id }))));

    savePrescriptionMutation.mutate({ appointmentId: selectedAppointmentId, data, isExisting: !!prescriptionData, patientId: patient.id }, {
      onSuccess: () => { toast.success("Prescription saved"); onOpenChange(false); },
      onError: (error: Error) => toast.error(error.message || "Failed to save prescription"),
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader><DialogTitle>Create Prescription</DialogTitle></DialogHeader>
          <div className="space-y-5">
            <div className="space-y-3">
              <Label>Select Appointment</Label>
              {appointmentsLoading ? <p className="text-sm text-slate-500">Loading appointments...</p> : appointmentOptions.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {appointmentOptions.map((appointment) => {
                    const appointmentId = getAppointmentId(appointment);
                    const selected = appointmentId === selectedAppointmentId;
                    return <button key={appointmentId} type="button" onClick={() => setSelectedAppointmentId(appointmentId)} className={`rounded-lg border p-4 text-left ${selected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "hover:border-blue-200"}`}>
                      <p className="font-semibold">{patient?.name}</p>
                      <p className="text-sm text-slate-600">{formatDate(getAppointmentDate(appointment))}</p>
                      <p className="text-sm text-slate-600">Token #{getAppointmentToken(appointment)}</p>
                    </button>;
                  })}
                </div>
              ) : <p className="rounded-lg border border-dashed p-4 text-sm text-slate-500">No appointments available for this patient.</p>}
              {!selectedAppointmentId && <p className="text-sm font-medium text-amber-700">Please select an appointment</p>}
            </div>
            <div className="grid gap-4 rounded-lg border bg-slate-50 p-4 md:grid-cols-3">
              <div><Label>Patient</Label><p className="text-sm">{patient?.name}</p></div>
              <div><Label>Appointment Date</Label><p className="text-sm">{selectedAppointment ? formatDate(getAppointmentDate(selectedAppointment)) : "-"}</p></div>
              <div><Label>Token</Label><p className="text-sm">{selectedAppointment ? `#${getAppointmentToken(selectedAppointment)}` : "-"}</p></div>
            </div>
<div className="space-y-3">
  <h3 className="text-lg font-semibold text-slate-700">
    Upload Prescription
  </h3>

  <div className="grid gap-4 md:grid-cols-2">

    {/* Prescription Upload */}
    <div className="rounded-lg border border-slate-200 p-3">
      <Label className="mb-2 block">Prescription</Label>

      <div className="flex h-[280px] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
        <div className="flex min-w-0 w-full flex-col items-center justify-center px-6 py-8 text-center">

          <FolderOpen className="mb-5 h-14 w-14 text-blue-700" />

          <p className="mb-5 text-base font-medium leading-6 text-slate-700">
            Click the button below to
            <br />
            upload prescription files
          </p>

          <label
            htmlFor="prescription-files"
            className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-700 px-7 py-3 text-sm font-medium text-white transition hover:bg-indigo-600"
          >
            Choose File
          </label>

          <input
            id="prescription-files"
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              setPrescriptionFiles(
                Array.from(event.target.files || [])
              );
            }}
          />

          {prescriptionFiles.length > 0 && (
            <div className="mt-4 w-full space-y-1 text-left">
              {prescriptionFiles.map((file) => (
                <div
                  key={`${file.name}-${file.lastModified}`}
                  className="truncate text-sm text-slate-600"
                >
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Scanned Files */}
    <div className="rounded-lg border border-slate-200 p-3">
      <Label className="mb-2 block">Scanned Files</Label>

      <div className="flex h-[280px] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
        <div className="flex min-w-0 w-full flex-col items-center justify-center px-6 py-8 text-center">

          <FolderOpen className="mb-5 h-14 w-14 text-blue-700" />

          <p className="mb-5 text-base font-medium leading-6 text-slate-700">
            Click the button below to
            <br />
            upload scanned files
          </p>

          <Button
            type="button"
            className="rounded-lg bg-blue-700 px-7 py-3 text-sm font-medium text-white hover:bg-indigo-600"
            onClick={() => {
              setPendingTemporaryDocuments(
                selectedTemporaryDocuments
              );
              setScannedFilesOpen(true);
            }}
          >
            Scanned Files
          </Button>

          {selectedTemporaryDocuments.length > 0 && (
            <div className="mt-3 max-h-16 w-full min-w-0 space-y-1 overflow-y-auto text-left">
              {selectedTemporaryDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex min-w-0 w-full items-center gap-2 rounded-md bg-white/80 px-2 py-1 text-sm"
                >
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="min-w-0 flex-1 truncate">
                    {document.originalFileName}
                  </span>
                  <button
                    type="button"
                    className="shrink-0"
                    onClick={() =>
                      setSelectedTemporaryDocuments((current) =>
                        current.filter(
                          (item) => item.id !== document.id
                        )
                      )
                    }
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

  </div>
</div>
            <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button    className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={save} disabled={savePrescriptionMutation.isPending || !selectedAppointmentId}>{savePrescriptionMutation.isPending ? "Saving..." : "Save Prescription"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={scannedFilesOpen} onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setPendingTemporaryDocuments(selectedTemporaryDocuments);
          setScannedFilesOpen(false);
          return;
        }
        setScannedFilesOpen(true);
      }}>
        <DialogContent className="z-[60] flex !h-[80vh] !max-h-[850px] !w-[90vw] !max-w-[1200px] flex-col overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b p-6 pr-16">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle>Select Scanned Files</DialogTitle>
                <p className="mt-1 text-sm text-slate-500">
                  Select files from your temporary documents
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  setTemporaryDocumentsRefreshing(true);
                  try {
                    await refetchTemporaryDocuments();
                  } finally {
                    setTemporaryDocumentsRefreshing(false);
                  }
                }}
                disabled={temporaryDocumentsRefreshing}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${temporaryDocumentsRefreshing ? "animate-spin" : ""
                    }`}
                />
                {temporaryDocumentsRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {temporaryDocumentsLoading ? (
              <div className="py-16 text-center text-sm text-slate-500">
                Loading scanned files...
              </div>
            ) : temporaryDocumentsError ? (
              <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                Unable to load scanned files. You can close this window and continue with medical reports.
              </div>
            ) : visibleTemporaryDocuments.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleTemporaryDocuments.map((document) => {
                  const isSelected = pendingTemporaryDocuments.some(
                    (item) => item.id === document.id,
                  );
                  const isImage = document.mimeType?.startsWith("image/");

                  return (
                    <button
                      key={document.id}
                      type="button"
                      onClick={() => {
                        setPendingTemporaryDocuments((current) =>
                          current.some((item) => item.id === document.id)
                            ? current.filter((item) => item.id !== document.id)
                            : [...current, document],
                        );
                      }}
                      className={`relative overflow-hidden rounded-lg border text-left transition ${isSelected
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                        : "bg-white hover:border-blue-200 hover:bg-slate-50"
                        }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex aspect-[4/3] items-center justify-center bg-slate-100">
                        {isImage && document.url ? (
                          <img
                            src={document.url}
                            alt={document.originalFileName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <File className="h-12 w-12 text-slate-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 p-3">
                        <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                        <span className="truncate text-sm font-medium text-slate-700">
                          {document.originalFileName}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-sm text-slate-500">
                No scanned files available.
              </div>
            )}
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPendingTemporaryDocuments(selectedTemporaryDocuments);
                setScannedFilesOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setSelectedTemporaryDocuments(pendingTemporaryDocuments);
                setScannedFilesOpen(false);
              }}
              disabled={temporaryDocumentsLoading || !!temporaryDocumentsError}
            >
              Select Files
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}