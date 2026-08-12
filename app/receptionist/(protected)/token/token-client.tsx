"use client";

import React, { useState, useMemo } from "react";
import ReusableModal from "@/components/reusable/reusable-modal";
import {
  Ticket,
  Plus,
  Minus,
  RotateCcw,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { DoctorResponse } from "@/lib/validations/Admin/doctor";
import {
  useCurrentToken,
  useTokenAppointments,
  useIncrementToken,
    usePatientAvailability,
  useDecrementToken,
  useResetToken,
} from "@/services/admin/token";

import { useUpdateAppointmentStatus } from "@/services/admin/appointment";
import { useDoctors } from "@/services/admin/doctor";

interface TokenManagementClientProps {
  initialDoctors: DoctorResponse[];
}

export default function TokenManagementClient({
  initialDoctors,
}: TokenManagementClientProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const {
  data: doctorsResponse,
  isFetching,
  refetch: refetchDoctors,
} = useDoctors({
  status: "active",
  page: 1,
  limit: 1000,
});
  const today = useMemo(
  () =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date()),
  []
);

const [activeTab, setActiveTab] = useState<
  "today" | "skipped"
>("today");

  const [selectedDate, setSelectedDate] = useState(today);

  const [pendingAppointment, setPendingAppointment] =
  useState<any>(null);

const [showAvailabilityDialog, setShowAvailabilityDialog] =
  useState(false);

const doctors = doctorsResponse?.data || initialDoctors || [];

const filteredDoctorsList = useMemo(() => {
  const activeDoctors = doctors.filter(
    (doctor: any) => doctor.user?.isActive
  );

  if (!doctorSearch) return activeDoctors;

  return activeDoctors.filter((doctor: any) =>
    doctor.user?.name
      ?.toLowerCase()
      .includes(doctorSearch.toLowerCase())
  );
}, [doctors, doctorSearch]);

  // Queries
  const { data: currentTokenData } = useCurrentToken(
    selectedDoctorId,
    selectedDate
  );

  const { data: appointments } = useTokenAppointments(
    selectedDoctorId,
    selectedDate
  );

  // Mutations
const incrementMutation = useIncrementToken({
onSuccess: (data) => {
  console.log("Increment Success", data);
    if (data?.needsConfirmation) {
      setPendingAppointment(data.appointment);
      setShowAvailabilityDialog(true);
      return;
    }

    toast.success("Token incremented successfully");
  },

  onError: (error) => toast.error(error.message),
});

const patientAvailabilityMutation =
  usePatientAvailability({
    onSuccess: () => {
      setShowAvailabilityDialog(false);
      setPendingAppointment(null);

      toast.success("Appointment updated");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  const decrementMutation = useDecrementToken({
    onSuccess: () => toast.success("Token decremented successfully"),
    onError: (error) => toast.error(error.message),
  });

  const resetMutation = useResetToken({
    onSuccess: () => toast.success("Token queue reset successfully"),
    onError: (error) => toast.error(error.message),
  });
const updateAppointmentStatusMutation =
  useUpdateAppointmentStatus({
    onSuccess: () => {
      toast.success("Appointment updated");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handlePatientAvailability = (
  available: boolean
) => {
  if (!pendingAppointment) return;

  patientAvailabilityMutation.mutate(
    {
      appointmentId:
        pendingAppointment._id,
      available,
    },
    {
      onSuccess: () => {
        if (!available) {
          incrementMutation.mutate({
            doctorId: selectedDoctorId,
            date: selectedDate,
          });
        }
      },
    }
  );
};

  const handleAction = (action: "increment" | "decrement" | "reset") => {
    if (!selectedDoctorId) {
      toast.error("Please select a doctor first");
      return;
    }

    const payload = { doctorId: selectedDoctorId, date: selectedDate };

    if (action === "increment") incrementMutation.mutate(payload);
    if (action === "decrement") decrementMutation.mutate(payload);
    if (action === "reset") {
      if (confirm("Are you sure you want to reset the token count for today?")) {
        resetMutation.mutate(payload);
      }
    }
  };

const getStatusColorClass = (status: string) => {
  const statusMap: Record<string, string> = {
    WAITING: "bg-yellow-100 text-yellow-800 border-yellow-200",
     IN_PROGRESS: "bg-blue-600 text-white border-blue-600",
    SKIPPED: "bg-orange-100 text-orange-800 border-orange-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    statusMap[status] ||
    "bg-slate-100 text-slate-800 border-slate-200"
  );
};

const getStatusLabel = (status: string) => {
  if (status === "IN_PROGRESS") return "IN PROGRESS";
  return status;
};

const getStatusBadge = (status: string) => {
  return (
    <Badge
      variant="outline"
      className={getStatusColorClass(status)}
    >
      {getStatusLabel(status)}
    </Badge>
  );
};

  // Handle both direct array response and wrapped data property response
  const appointmentsList = (appointments as any)?.data 
    ? (appointments as any).data 
    : (Array.isArray(appointments) ? appointments : []);

    const skippedAppointments = appointmentsList.filter(
  (appointment: any) => appointment.status === "SKIPPED"
);

const currentToken =
  (currentTokenData as any)?.data?.currentToken ??
  currentTokenData?.currentToken ??
  0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Visit Token Management
          </h1>
          <p className="text-slate-500">Manage real-time doctor visit queues</p>
        </div>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-end gap-4">
            <div className="w-full md:w-1/3">
              <Label className="mb-1.5 block text-slate-700">
                Select Doctor
              </Label>
              <Select onValueChange={setSelectedDoctorId} value={selectedDoctorId}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Choose a doctor to manage queue" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <div className="p-2 border-b sticky top-0 bg-white z-10">
                    <Input
                      placeholder="Search doctor..."
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="h-8 text-sm"
                    />
                  </div>
                  {filteredDoctorsList.map((doctor: any) => (
                    <SelectItem 
                      key={doctor.id || doctor._id} 
                      value={doctor.id || doctor._id}
                    >
                      {doctor.user?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <Label className="mb-1.5 block text-slate-700">
                Select Date
              </Label>
       <Input
  type="date"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  onClick={(e) => {
    e.currentTarget.showPicker?.();
  }}
  className="bg-slate-50 border-slate-200 cursor-pointer"
/>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Token Card */}
        <Card className="lg:col-span-1 border-2 border-blue-50 shadow-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-blue-600 flex items-center justify-center gap-2">
              <Ticket className="h-5 w-5" />
              Current Token
            </CardTitle>
            <CardDescription>Queue status for selected doctor</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            <div className="text-7xl font-black text-slate-900 tracking-tighter mb-8">
              {selectedDoctorId
                ? String(currentToken).padStart(3, "0")
                : "000"}
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full border-slate-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={() => handleAction("decrement")}
                disabled={!selectedDoctorId || decrementMutation.isPending}
              >
                <Minus className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                onClick={() => handleAction("increment")}
                disabled={!selectedDoctorId || incrementMutation.isPending}
              >
                <Plus className="h-8 w-8" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full border-slate-200 hover:bg-slate-100 transition-colors"
                onClick={() => handleAction("reset")}
                disabled={!selectedDoctorId || resetMutation.isPending}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
{/* Appointments */}
<Card className="lg:col-span-2 border-slate-200 shadow-sm">
  <CardHeader className="pb-4">
    <CardTitle className="text-lg flex items-center gap-2">
      <Users className="h-5 w-5 text-slate-600" />
      Appointments
    </CardTitle>
  </CardHeader>

  <CardContent>
    <Tabs
      value={activeTab}
      onValueChange={(value) =>
        setActiveTab(value as "today" | "skipped")
      }
    >
      <TabsList className="mb-4">
        <TabsTrigger value="today">
          Today's Appointments
          <Badge
            variant="secondary"
            className="ml-2"
          >
            {appointmentsList.length}
          </Badge>
        </TabsTrigger>

        <TabsTrigger value="skipped">
          Skipped Appointments
          <Badge
            variant="secondary"
            className="ml-2 bg-orange-100 text-orange-700"
          >
            {skippedAppointments.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      {/* ================= TODAY ================= */}

      <TabsContent value="today">
        <div className="rounded-md border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead className="text-center">
                  Token Number
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!selectedDoctorId ||
              appointmentsList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-slate-400"
                  >
                    {selectedDoctorId
                      ? "No appointments for today"
                      : "Select a doctor to view queue"}
                  </TableCell>
                </TableRow>
              ) : (
                appointmentsList.map(
                  (row: any, index: number) => (
                    <TableRow
                      key={row.id || row._id || index}
                    >
                      <TableCell className="font-medium">
                        {row.patient?.name}
                      </TableCell>

                      <TableCell className="text-center font-mono">
                        <Badge
                          variant="secondary"
                          className="font-bold"
                        >
                          {row.tokenNumber}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {new Date(
                          row.date
                        ).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Clock className="h-3 w-3" />
                          {row.slot}
                        </div>
                      </TableCell>

                      <TableCell>
                        {row.doctor?.user?.name}
                      </TableCell>

                  <TableCell>
    <Select
      value={row.status}
      onValueChange={(value) => {
        updateAppointmentStatusMutation.mutate({
          appointmentId: row._id,
          status: value,
        });
      }}
      disabled={
        updateAppointmentStatusMutation.isPending ||
        row.status === "COMPLETED" ||
        row.status === "CANCELLED"
      }
    >
<SelectTrigger
  className={`w-[150px] ${getStatusColorClass(row.status)}`}
>
  <SelectValue />
</SelectTrigger>
  
<SelectContent>
  {row.status === "WAITING" && (
    <>
      <SelectItem value="WAITING">
        <div className="bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-md px-2 py-1">
          WAITING
        </div>
      </SelectItem>

      <SelectItem value="IN_PROGRESS">
      <div className="bg-blue-600 text-white border border-blue-600 rounded-md px-2 py-1">
          IN PROGRESS
        </div>
      </SelectItem>

      <SelectItem value="CANCELLED">
        <div className="bg-red-100 text-red-800 border border-red-200 rounded-md px-2 py-1">
          CANCELLED
        </div>
      </SelectItem>
    </>
  )}

  {row.status === "IN_PROGRESS" && (
    <>
      <SelectItem value="IN_PROGRESS">
       <div className="bg-blue-600 text-white border border-blue-600 rounded-md px-2 py-1">
          IN PROGRESS
        </div>
      </SelectItem>

      <SelectItem value="COMPLETED">
        <div className="bg-green-100 text-green-800 border border-green-200 rounded-md px-2 py-1">
          COMPLETED
        </div>
      </SelectItem>
    </>
  )}

{row.status === "SKIPPED" && (
  <>
    <SelectItem value="SKIPPED">
      <div className="bg-orange-100 text-orange-800 border border-orange-200 rounded-md px-2 py-1">
        SKIPPED
      </div>
    </SelectItem>

    <SelectItem value="IN_PROGRESS">
      <div className="bg-blue-600 text-white border border-blue-600 rounded-md px-2 py-1">
        IN PROGRESS
      </div>
    </SelectItem>
  </>
)}

  {row.status === "COMPLETED" && (
    <SelectItem value="COMPLETED">
      <div className="bg-green-100 text-green-800 border border-green-200 rounded-md px-2 py-1">
        COMPLETED
      </div>
    </SelectItem>
  )}

  {row.status === "CANCELLED" && (
    <SelectItem value="CANCELLED">
      <div className="bg-red-100 text-red-800 border border-red-200 rounded-md px-2 py-1">
        CANCELLED
      </div>
    </SelectItem>
  )}
</SelectContent>
    </Select>
  </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* ================= SKIPPED ================= */}

      <TabsContent value="skipped">
        <div className="rounded-md border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead className="text-center">
                  Token Number
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {skippedAppointments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-slate-400"
                  >
                    No skipped appointments
                  </TableCell>
                </TableRow>
              ) : (
                skippedAppointments.map(
                  (row: any, index: number) => (
                    <TableRow
                      key={row.id || row._id || index}
                    >
                      <TableCell className="font-medium">
                        {row.patient?.name}
                      </TableCell>

                      <TableCell className="text-center font-mono">
                        <Badge variant="secondary">
                          {row.tokenNumber}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {new Date(
                          row.date
                        ).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {row.slot}
                        </div>
                      </TableCell>

                      <TableCell>
                        {row.doctor?.user?.name}
                      </TableCell>

                      <TableCell>
<Select
  defaultValue={row.status}
  onValueChange={(value) => {
    if (value === "IN_PROGRESS") {
      updateAppointmentStatusMutation.mutate({
        appointmentId: row._id,
        status: "IN_PROGRESS",
      });
    }
  }}
>
  <SelectTrigger
    className={`w-[150px] ${getStatusColorClass(row.status)}`}
  >
    <SelectValue />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="SKIPPED">
      <div className="bg-orange-100 text-orange-800 border border-orange-200 rounded-md px-2 py-1">
        SKIPPED
      </div>
    </SelectItem>

    <SelectItem value="IN_PROGRESS">
      <div className="bg-blue-600 text-white border border-blue-600 rounded-md px-2 py-1">
        IN PROGRESS
      </div>
    </SelectItem>
  </SelectContent>
</Select>
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  </CardContent>
</Card>

      </div>

      <ReusableModal
  isOpen={showAvailabilityDialog}
  onClose={() => {
    setShowAvailabilityDialog(false);
    setPendingAppointment(null);
  }}
  mode="alert"
  title="Patient Availability"
  showSaveButton={false}
  message={
    <div className="space-y-3 text-center">
      <p className="text-lg font-semibold">
        Is patient available?
      </p>

      <div className="rounded-md border p-3 bg-slate-50">
        <p className="font-medium">
          {pendingAppointment?.patient?.name}
        </p>

        <p className="text-sm text-slate-500">
          Token #{pendingAppointment?.tokenNumber}
        </p>
      </div>

      <div className="flex justify-center gap-3 mt-4">
        <Button
          variant="destructive"
          onClick={() =>
            handlePatientAvailability(false)
          }
          disabled={patientAvailabilityMutation.isPending}
        >
          No
        </Button>

        <Button
          onClick={() =>
            handlePatientAvailability(true)
          }
          disabled={patientAvailabilityMutation.isPending}
        >
          Yes
        </Button>
      </div>
    </div>
  }
/>

    </div>
  );
}
