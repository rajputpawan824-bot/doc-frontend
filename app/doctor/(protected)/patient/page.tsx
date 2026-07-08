"use client";

import { KeyboardEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Eye,
  FileText,
  HeartPulse,
  Mail,
  MoreVertical,
  Phone,
  Search,
  Settings2,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Patient } from "@/app/admin/(protected)/patient/page";
import { usePatientById, usePatients } from "@/services/admin/patient";
import {
  usePatientAppointments,
  type PatientAppointment,
} from "@/services/admin/appointment";
import {
  type PrescriptionPayload,
  useCreatePrescription,
  usePrescriptionHistory,
} from "@/services/admin/prescription";

type DoctorPatient = Patient & {
  appointmentId?: string;
  appointment?: {
    _id?: string;
    id?: string;
    appointmentId?: string;
    date?: string;
    doctorName?: string;
    doctor?: {
      doctorName?: string;
      user?: {
        name?: string;
      };
    };
  };
};

type PrescriptionHistoryItem = {
  _id?: string;
  id?: string;
  appointmentId?: string;
  tokenNumber?: string | number;
  prescription?: string | string[];
  medicalNotes?: string | string[];
  followUpDate?: string | Date | null;
  attachments?: {
    _id?: string;
    originalName: string;
    filePath: string;
  }[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  appointment?: {
    _id?: string;
    id?: string;
    appointmentId?: string;
    date?: string | Date;
    tokenNumber?: string | number;
    doctorName?: string;
    doctor?: {
      doctorName?: string;
      user?: {
        name?: string;
      };
    };
  };
  doctorName?: string;
  doctor?: {
    doctorName?: string;
    user?: {
      name?: string;
    };
  };
};

type AppointmentOption = PatientAppointment & {
  tokenNumber?: string | number;
  token?: {
    tokenNumber?: string | number;
  };
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumn?: string;
  searchPlaceholder?: string;
  emptyMessage?: ReactNode;
}

function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn = "name",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const searchColumnObj = searchColumn
    ? table.getColumn(searchColumn)
    : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-1 items-center gap-4">
          {searchColumnObj && (
            <div className="relative w-full max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={
                  (searchColumnObj.getFilterValue() as string) || globalFilter
                }
                onChange={(event) => {
                  searchColumnObj.setFilterValue(event.target.value);
                  setGlobalFilter(event.target.value);
                }}
                className="pl-10"
              />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Settings2 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-end gap-4 sm:flex-row">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <span>Page</span>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>

          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={table.getState().pagination.pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
          >
            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
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

const formatList = (value?: string[] | string | null) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value || "";
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getTimeValue = (value?: string | Date | null) => {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const getIsActive = (patient?: Patient | null) =>
  patient?.user?.isActive ?? patient?.status !== "INACTIVE";

const getEmergencyContact = (patient?: Patient | null) => {
  const contact = patient?.emergencyContact;
  if (contact && typeof contact === "object") {
    return {
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation,
    };
  }

  return {
    name: undefined,
    phone: undefined,
    relation: typeof contact === "string" ? contact : undefined,
  };
};

const getAppointmentId = (appointment?: AppointmentOption | null) =>
  appointment?._id || appointment?.id || appointment?.appointmentId || "";

const getAppointmentDate = (appointment?: AppointmentOption | null) =>
  appointment?.date || "";

const getAppointmentToken = (
  appointment?: AppointmentOption | PrescriptionHistoryItem | null,
) => {
  if (!appointment) return "";
  if ("token" in appointment && appointment.token?.tokenNumber) {
    return String(appointment.token.tokenNumber);
  }
  if (appointment.tokenNumber) return String(appointment.tokenNumber);
  if ("appointment" in appointment && appointment.appointment?.tokenNumber) {
    return String(appointment.appointment.tokenNumber);
  }
  return "";
};

const getAppointmentStatus = (appointment?: AppointmentOption | null) =>
  String(appointment?.status || "").toUpperCase();

const isCancelledAppointment = (appointment: AppointmentOption) =>
  getAppointmentStatus(appointment) === "CANCELLED";

const isPastAppointment = (appointment: AppointmentOption) => {
  const dateValue = getAppointmentDate(appointment);
  if (!dateValue) return false;
  const appointmentDate = new Date(dateValue);
  if (Number.isNaN(appointmentDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  appointmentDate.setHours(0, 0, 0, 0);
  return appointmentDate < today;
};

const isUpcomingAppointment = (appointment: AppointmentOption) =>
  !isCancelledAppointment(appointment) && !isPastAppointment(appointment);

const getPatientAppointmentStats = (appointments: AppointmentOption[]) => ({
  total: appointments.length,
  upcoming: appointments.filter(isUpcomingAppointment).length,
  past: appointments.filter(
    (appointment) =>
      !isCancelledAppointment(appointment) && isPastAppointment(appointment),
  ).length,
  cancelled: appointments.filter(isCancelledAppointment).length,
});

const getHistoryItems = (value: unknown): PrescriptionHistoryItem[] => {
  if (Array.isArray(value)) return value as PrescriptionHistoryItem[];
  if (value && typeof value === "object") {
    const body = value as {
      data?: unknown;
      history?: PrescriptionHistoryItem[];
      prescriptions?: PrescriptionHistoryItem[];
      result?: PrescriptionHistoryItem[];
    };

    if (Array.isArray(body.history)) return body.history;
    if (Array.isArray(body.prescriptions)) return body.prescriptions;
    if (Array.isArray(body.result)) return body.result;
    return getHistoryItems(body.data);
  }

  return [];
};

const getHistoryDate = (item: PrescriptionHistoryItem) =>
  item.appointment?.date || item.createdAt || item.updatedAt || null;

const getHistoryDoctorName = (item: PrescriptionHistoryItem) =>
  item.doctorName ||
  item.doctor?.doctorName ||
  item.doctor?.user?.name ||
  item.appointment?.doctorName ||
  item.appointment?.doctor?.doctorName ||
  item.appointment?.doctor?.user?.name ||
  "";

const getHistoryToken = (item: PrescriptionHistoryItem) =>
  getAppointmentToken(item);

const splitNumberedText = (value?: string | string[]) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];

  return value
    .split(/\n|,(?=\s*\D)/)
    .map((item) => item.replace(/^\s*\d+[\).]\s*/, "").trim())
    .filter(Boolean);
};

const DetailItem = ({ label, value }: { label: string; value?: ReactNode }) => {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="break-words text-sm font-medium text-slate-900">
        {value}
      </div>
    </div>
  );
};

const DetailSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="space-y-3">
    <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
    <div className="grid grid-cols-1 gap-5 rounded-lg border bg-white p-4 md:grid-cols-2">
      {children}
    </div>
  </section>
);

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

export default function PatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState<DoctorPatient | null>(
    null,
  );
  const [viewPatientOpen, setViewPatientOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [page] = useState(1);
  const [limit] = useState(10);
  const [search] = useState("");

  const [prescription, setPrescription] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [prescriptionFiles, setPrescriptionFiles] = useState<File[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");

  const queryClient = useQueryClient();
  const { data, isLoading, error } = usePatients({ page, limit, search });
  const patients: DoctorPatient[] = (data?.data ?? []) as DoctorPatient[];

  const {
    data: patientDetails,
    isLoading: patientDetailsLoading,
  } = usePatientById(viewPatientOpen ? selectedPatient?.id : undefined);

  const {
    data: prescriptionHistory,
    isLoading: historyLoading,
  } = usePrescriptionHistory(historyOpen ? selectedPatient?.id : undefined);

  const {
    data: patientAppointments = [],
    isLoading: appointmentsLoading,
  } = usePatientAppointments(
    selectedPatient?.id && (prescriptionDialogOpen || viewPatientOpen)
      ? selectedPatient.id
      : undefined,
  );

  const createPrescriptionMutation = useCreatePrescription();

  useEffect(() => {
    if (error) toast.error("Failed to load patients");
  }, [error]);

  const sortedHistory = useMemo(
    () =>
      [...getHistoryItems(prescriptionHistory)].sort(
        (a, b) => getTimeValue(getHistoryDate(b)) - getTimeValue(getHistoryDate(a)),
      ),
    [prescriptionHistory],
  );

  const appointmentOptions = patientAppointments as AppointmentOption[];
  const selectedAppointment = appointmentOptions.find(
    (appointment) => getAppointmentId(appointment) === selectedAppointmentId,
  );
  const appointmentStats = getPatientAppointmentStats(appointmentOptions);

  const openPrescriptionDialog = (patient: DoctorPatient) => {
    setSelectedPatient(patient);

    setPrescription("");
    setMedicalNotes("");
    setFollowUpDate("");
    setFollowUpRequired(false);
    setPrescriptionFiles([]);
    setSelectedAppointmentId("");
    setPrescriptionDialogOpen(true);
  };

  const ensureNumberedText = (value: string) => {
    if (!value) return "";
    if (/^\d+\.\s/.test(value)) return value;
    return `1. ${value}`;
  };

  const handleNumberedFocus = (
    value: string,
    setter: (value: string) => void,
  ) => {
    if (!value) setter("1. ");
  };

  const handleNumberedChange = (
    value: string,
    setter: (value: string) => void,
  ) => {
    setter(ensureNumberedText(value));
  };

  const handleNumberedKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
    value: string,
    setter: (value: string) => void,
  ) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    const nextNumber = value.split("\n").length + 1;
    setter(`${value}\n${nextNumber}. `);
  };

  const handleSavePrescription = () => {
    if (!selectedPatient?.id) {
      toast.error("Patient not found");
      return;
    }

    if (!selectedAppointmentId) {
      toast.error("Please select an appointment");
      return;
    }

    if (!prescription.trim() && !medicalNotes.trim()) {
      toast.error("Add prescription or medical notes before saving");
      return;
    }

    const payload = new FormData();
    payload.append("prescription", prescription.trim());
    payload.append("medicalNotes", medicalNotes.trim());
    payload.append("followUpDate", followUpDate || "");
    payload.append("isFollowUpRequired", String(followUpRequired));

    prescriptionFiles.forEach((file) => {
      payload.append("files", file);
    });

    createPrescriptionMutation.mutate(
      {
        appointmentId: selectedAppointmentId,
       
        data: payload as unknown as PrescriptionPayload,
      },
      {
        onSuccess: () => {
          toast.success("Prescription saved");
          setPrescriptionDialogOpen(false);
          setPrescription("");
          setMedicalNotes("");
          setFollowUpDate("");
          setFollowUpRequired(false);
          setPrescriptionFiles([]);
          setSelectedAppointmentId("");
          void queryClient.invalidateQueries({
            queryKey: ["prescription-history", selectedPatient.id],
          });
        },
        onError: (mutationError: Error) => {
          toast.error(mutationError.message || "Failed to save prescription");
        },
      },
    );
  };

  const columns: ColumnDef<DoctorPatient>[] = [
    {
      accessorKey: "name",
      header: "Patient Name",
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">{patient.name}</p>
              <p className="text-sm text-gray-500">
                Code: {patient.patientCode || patient.id}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "contact",
      header: "Contact Information",
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-gray-500" />
              <span className="text-sm">{patient.phoneNumber}</span>
            </div>
            {patient.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-gray-500" />
                <span className="text-sm text-gray-600">{patient.email}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "age",
      header: "Age / Gender",
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="space-y-1">
            <span className="font-medium">
              {patient.age !== undefined ? `${patient.age} years` : "-"}
            </span>
            <Badge variant="outline" className="capitalize">
              {patient.gender}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "emergencyContact",
      header: "Emergency Contact",
      cell: ({ row }) => {
        const contact = getEmergencyContact(row.original);
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">{contact.name || "-"}</p>
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-gray-500" />
                <span className="text-sm">{contact.phone}</span>
              </div>
            )}
            {contact.relation && (
              <Badge variant="secondary" className="text-xs capitalize">
                {contact.relation}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "medicalInfo",
      header: "Medical Information",
      cell: ({ row }) => {
        const patient = row.original;
        const allergies = Array.isArray(patient.allergies)
          ? patient.allergies
          : splitNumberedText(patient.allergies);

        return (
          <div className="space-y-1">
            {patient.bloodGroup && (
              <Badge variant="destructive" className="text-xs">
                Blood: {patient.bloodGroup}
              </Badge>
            )}
            {allergies.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {allergies.slice(0, 2).map((allergy, index) => (
                  <Badge key={`${allergy}-${index}`} variant="outline" className="text-xs">
                    {allergy}
                  </Badge>
                ))}
                {allergies.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{allergies.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "adhar",
      header: "Adhar Number",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.adhar}</span>
      ),
    },
    {
      accessorKey: "lastUpdated",
      header: "Last Updated",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-gray-500" />
            <span className="text-sm">{formatDate(row.original.updatedAt) || "-"}</span>
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: "",
      cell: ({ row }) => {
        const patient = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Patient Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  setSelectedPatient(patient);
                  setViewPatientOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Patient
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setSelectedPatient(patient);
                  setHistoryOpen(true);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Prescription History
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => openPrescriptionDialog(patient)}>
                <Stethoscope className="mr-2 h-4 w-4" />
                Create Prescription
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filteredPatients = patients;
  const patientForDetails = patientDetails;

  return (
    <>
      <Toaster />
      <div className="container mx-auto space-y-6 p-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Patient Management</h1>
              <p className="text-gray-600">
                Manage {patients.length} patient records
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Patients</p>
                  <p className="text-2xl font-bold">{patients.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">New This Month</p>
                  <p className="text-2xl font-bold">
                    {
                      patients.filter((patient) => {
                        const now = new Date();
                        const firstDayOfMonth = new Date(
                          now.getFullYear(),
                          now.getMonth(),
                          1,
                        );
                        return (
                          patient.createdAt &&
                          new Date(patient.createdAt) >= firstDayOfMonth
                        );
                      }).length
                    }
                  </p>
                </div>
                <HeartPulse className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg. Age</p>
                  <p className="text-2xl font-bold">
                    {patients.length > 0
                      ? Math.round(
                          patients.reduce(
                            (total, patient) => total + (patient.age ?? 0),
                            0,
                          ) / patients.length,
                        )
                      : 0}{" "}
                    yrs
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-violet-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList>
                <TabsTrigger value="all">All Patients</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {isLoading ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
                    <p className="mt-4 text-gray-600">Loading patients...</p>
                  </div>
                ) : (
                  <DataTable<DoctorPatient, unknown>
                    columns={columns}
                    data={filteredPatients}
                    searchColumn="name"
                    searchPlaceholder="Search patients by name, phone, or ID..."
                    emptyMessage={
                      <div className="py-8 text-center">
                        <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <h3 className="mb-2 text-lg font-semibold">
                          No patients found
                        </h3>
                        <p className="text-gray-500">
                          No patients match the current filter
                        </p>
                      </div>
                    }
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Dialog open={viewPatientOpen} onOpenChange={setViewPatientOpen}>
          <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
            </DialogHeader>

            {patientDetailsLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
              </div>
            ) : patientForDetails ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Patient Code</p>
                    <p className="text-lg font-semibold text-blue-700">
                      {patientForDetails.patientCode || patientForDetails.id}
                    </p>
                  </div>
                  <Badge
                    className={
                      getIsActive(patientForDetails)
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {getIsActive(patientForDetails) ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>

                <DetailSection title="Patient Information">
                  <DetailItem
                    label="Patient Code"
                    value={patientForDetails.patientCode || patientForDetails.id}
                  />
                  <DetailItem label="Name" value={patientForDetails.name} />
                  <DetailItem
                    label="Age"
                    value={
                      patientForDetails.age !== undefined
                        ? `${patientForDetails.age} years`
                        : ""
                    }
                  />
                  <DetailItem label="Gender" value={patientForDetails.gender} />
                  <DetailItem label="Blood Group" value={patientForDetails.bloodGroup} />
                </DetailSection>

                <DetailSection title="Contact Information">
                  <DetailItem label="Phone" value={patientForDetails.phoneNumber} />
                  <DetailItem label="Email" value={patientForDetails.email} />
                  <DetailItem label="Address" value={patientForDetails.address} />
                </DetailSection>

                <DetailSection title="Medical Information">
                  <DetailItem
                    label="Diseases"
                    value={formatList(patientForDetails.diseases)}
                  />
                  <DetailItem
                    label="Allergies"
                    value={formatList(patientForDetails.allergies)}
                  />
                  <DetailItem
                    label="Medical History"
                    value={patientForDetails.medicalHistory}
                  />
                </DetailSection>

                <DetailSection title="Appointment Summary">
                  {appointmentsLoading ? (
                    <DetailItem label="Appointments" value="Loading..." />
                  ) : (
                    <>
                      <DetailItem label="Total Appointments" value={appointmentStats.total} />
                      <DetailItem label="Upcoming" value={appointmentStats.upcoming} />
                      <DetailItem label="Past" value={appointmentStats.past} />
                      <DetailItem label="Cancelled" value={appointmentStats.cancelled} />
                    </>
                  )}
                </DetailSection>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Patient details could not be loaded.
              </p>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
          <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Prescription History</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {selectedPatient?.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedPatient?.patientCode || selectedPatient?.id}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient?.bloodGroup && (
                      <Badge variant="destructive" className="gap-1">
                        <Droplets className="h-3 w-3" />
                        {selectedPatient.bloodGroup}
                      </Badge>
                    )}
                    {selectedPatient?.gender && (
                      <Badge variant="outline">{selectedPatient.gender}</Badge>
                    )}
                    {selectedPatient?.age !== undefined && (
                      <Badge variant="secondary">{selectedPatient.age} yrs</Badge>
                    )}
                  </div>
                </div>
              </div>

              {historyLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
                </div>
              ) : sortedHistory.length ? (
                <div className="relative space-y-5 before:absolute before:left-4 before:top-2 before:h-full before:w-px before:bg-slate-200">
                  {sortedHistory.map((item, index) => {
                    const prescriptionItems = splitNumberedText(item.prescription);
                    const notesItems = splitNumberedText(item.medicalNotes);

                    return (
                      <div
                        key={item._id || item.id || index}
                        className="relative pl-10"
                      >
                        <div className="absolute left-2 top-6 h-4 w-4 rounded-full border-2 border-blue-600 bg-white" />
                        <Card className="border shadow-sm">
                          <CardContent className="space-y-5 p-5">
                            <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                  {formatDate(getHistoryDate(item)) || "Date not available"}
                                </h3>
                                <p className="text-sm font-medium text-slate-700">
                                  Token #{getHistoryToken(item) || "-"}
                                </p>
                              </div>
                              <p className="text-sm font-medium text-slate-700">
                                Doctor: {getHistoryDoctorName(item) || "-"}
                              </p>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Prescription</Label>
                                <NumberedList
                                  items={prescriptionItems}
                                  emptyText="No prescription recorded"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Medical Notes</Label>
                                <NumberedList
                                  items={notesItems}
                                  emptyText="No medical notes recorded"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Medical Reports</Label>
                              {item.attachments?.length ? (
                                <div className="space-y-2">
                                  {item.attachments.map((attachment, attachmentIndex) => (
                                    <a
                                      key={attachment._id || attachmentIndex}
                                      href={`${process.env.NEXT_PUBLIC_API_URL}${attachment.filePath}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block text-sm text-blue-600 underline"
                                    >
                                      {attachment.originalName}
                                    </a>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-500">
                                  No medical reports uploaded
                                </p>
                              )}
                            </div>

                            <div className="rounded-md bg-slate-50 p-3">
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Follow Up Date
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                {formatDate(item.followUpDate) || "-"}
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
                  <h3 className="text-lg font-semibold text-slate-900">
                    No Prescription History Available
                  </h3>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={prescriptionDialogOpen}
          onOpenChange={setPrescriptionDialogOpen}
        >
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Prescription</DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div className="space-y-3">
                <Label>Select Appointment</Label>
                {appointmentsLoading ? (
                  <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-500">
                    Loading appointments...
                  </div>
                ) : appointmentOptions.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {appointmentOptions.map((appointment) => {
                      const appointmentId = getAppointmentId(appointment);
                      const isSelected = selectedAppointmentId === appointmentId;
                      const tokenNumber = getAppointmentToken(appointment);

                      return (
                        <button
                          key={appointmentId}
                          type="button"
                          onClick={() => setSelectedAppointmentId(appointmentId)}
                          className={`rounded-lg border p-4 text-left transition ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                              : "bg-white hover:border-blue-200 hover:bg-slate-50"
                          }`}
                        >
                          <p className="font-semibold text-slate-900">
                            {selectedPatient?.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {formatDate(getAppointmentDate(appointment)) || "Date not available"}
                          </p>
                          <p className="text-sm font-medium text-slate-700">
                            Token #{tokenNumber || "-"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-slate-500">
                    No appointments available for this patient.
                  </div>
                )}
                {!selectedAppointmentId && (
                  <p className="text-sm font-medium text-amber-700">
                    Please select an appointment
                  </p>
                )}
              </div>

              <div className="grid gap-4 rounded-lg border bg-slate-50 p-4 md:grid-cols-4">
                <DetailItem label="Patient Name" value={selectedPatient?.name} />
                <DetailItem
                  label="Patient Code"
                  value={selectedPatient?.patientCode || selectedPatient?.id}
                />
                <DetailItem
                  label="Appointment Date"
                  value={
                    selectedAppointment
                      ? formatDate(getAppointmentDate(selectedAppointment))
                      : "-"
                  }
                />
                <DetailItem
                  label="Token Number"
                  value={
                    selectedAppointment
                      ? `Token #${getAppointmentToken(selectedAppointment) || "-"}`
                      : "-"
                  }
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Prescription</Label>
                  <Textarea
                    rows={12}
                    value={prescription}
                    onFocus={() => handleNumberedFocus(prescription, setPrescription)}
                    onKeyDown={(event) =>
                      handleNumberedKeyDown(event, prescription, setPrescription)
                    }
                    onChange={(event) =>
                      handleNumberedChange(event.target.value, setPrescription)
                    }
                    placeholder={"1. Medicine Name - Morning - 5 Days\n2. Medicine Name - Afternoon - 3 Days"}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Medical Notes</Label>
                  <Textarea
                    rows={12}
                    value={medicalNotes}
                    onFocus={() => handleNumberedFocus(medicalNotes, setMedicalNotes)}
                    onKeyDown={(event) =>
                      handleNumberedKeyDown(event, medicalNotes, setMedicalNotes)
                    }
                    onChange={(event) =>
                      handleNumberedChange(event.target.value, setMedicalNotes)
                    }
                    placeholder={"1. Drink more water\n2. Avoid spicy food\n3. Take proper rest"}
                  />
                </div>
              </div>

              <div className="grid gap-4 rounded-lg border bg-white p-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Follow Up Date</Label>
                  <Input
                    type="date"
                    value={followUpDate}
                    onChange={(event) => setFollowUpDate(event.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border px-4 py-3">
                  <Label>Follow Up Required</Label>
                  <Switch
                    checked={followUpRequired}
                    onCheckedChange={setFollowUpRequired}
                  />
                </div>
              </div>

              <div className="space-y-2 rounded-lg border bg-white p-4">
                <Label>Medical Reports</Label>
                <Input
                  name="files"
                  type="file"
                  multiple
                  onChange={(event) =>
                    setPrescriptionFiles(Array.from(event.target.files || []))
                  }
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPrescriptionDialogOpen(false)}
                  disabled={createPrescriptionMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePrescription}
                  disabled={
                    createPrescriptionMutation.isPending ||
                    !selectedAppointmentId
                  }
                >
                  {createPrescriptionMutation.isPending
                    ? "Saving..."
                    : "Save Prescription"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
