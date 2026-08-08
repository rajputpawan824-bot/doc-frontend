"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

import { 
  Ticket, 
  Plus, 
  Minus, 
  RotateCcw, 
  Clock, 
  Hash,
  Loader2,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDoctorById } from "@/services/admin/doctor";
import {
  useCurrentToken,
  useDecrementToken,
  useIncrementToken,
  useResetToken,
  useTokenAppointments,
} from "@/services/admin/token";
import { useUpdateAppointmentStatus } from "@/services/admin/appointment";

export default function DoctorTokenPage() {
const [selectedDate, setSelectedDate] = useState(
  format(new Date(), "yyyy-MM-dd")
);

const [activeTab, setActiveTab] = useState<
  "today" | "skipped"
>("today");

const [userId, setUserId] = useState<string>();

useEffect(() => {
  const token = localStorage.getItem("access_token");

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.id);
    } catch (error) {
      console.error("Failed to decode token", error);
    }
  }
}, []);
  const {
    data: doctor,
    isLoading: isDoctorLoading,
    isError: isDoctorError,
  } = useDoctorById(userId);

  const doctorId = doctor?.id;

  const {
    data: currentTokenData,
    isLoading: isTokenLoading,
    isError: isTokenError,
    error: tokenError,
  } = useCurrentToken(
  doctorId,
  selectedDate
);

  const {
    data: appointments,
    isLoading: appointmentsLoading,
    isError: isAppointmentsError,
    error: appointmentsError,
  } = useTokenAppointments(
  doctorId,
  selectedDate
);

  console.log("appointments", appointments);

  const incrementMutation = useIncrementToken({
    onSuccess: () => toast.success("Token incremented successfully"),
    onError: (error) => toast.error(error.message || "Failed to increment token"),
  });

  const decrementMutation = useDecrementToken({
    onSuccess: () => toast.success("Token decremented successfully"),
    onError: (error) => toast.error(error.message || "Failed to decrement token"),
  });

  const resetMutation = useResetToken({
    onSuccess: () => toast.success("Token queue reset successfully"),
    onError: (error) => toast.error(error.message || "Failed to reset token"),
  });

  const updateAppointmentStatusMutation =
  useUpdateAppointmentStatus({
    onSuccess: () => {
      toast.success("Appointment completed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update appointment");
    },
  });

  useEffect(() => {
    if (isTokenError) {
      toast.error(tokenError?.message || "Failed to load current token");
    }
  }, [isTokenError, tokenError]);

  useEffect(() => {
    if (isAppointmentsError) {
      toast.error(appointmentsError?.message || "Failed to load token appointments");
    }
  }, [isAppointmentsError, appointmentsError]);

  useEffect(() => {
    if (isDoctorError) {
      toast.error("Failed to load doctor profile");
    }
  }, [isDoctorError]);

    const getStatusBadge = (status: string) => {
      const statusMap: Record<string, string> = {
        WAITING: "bg-yellow-100 text-yellow-800 border-yellow-200",
        IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
          SKIPPED: "bg-orange-100 text-orange-800 border-orange-200",
        COMPLETED: "bg-green-100 text-green-800 border-green-200",
        CANCELLED: "bg-red-100 text-red-800 border-red-200",
      };
  
      return (
        <Badge variant="outline" className={statusMap[status] || ""}>
          {status}
        </Badge>
      );
    };
  

  const currentToken =
  (currentTokenData as any)?.data?.currentToken ??
  (currentTokenData as any)?.currentToken ??
  0;
const tokenAppointments = Array.isArray(
  (appointments as any)?.data
)
  ? (appointments as any).data
  : [];

  const appointmentsList = tokenAppointments;

const skippedAppointments = appointmentsList.filter(
  (appointment: any) => appointment.status === "SKIPPED"
);

  const isMutating =
    incrementMutation.isPending ||
    decrementMutation.isPending ||
    resetMutation.isPending;
  const isActionDisabled = !doctorId || isTokenLoading || isMutating;

  const handleIncrement = () => {
    if (!doctorId) {
      toast.error("Doctor profile is still loading");
      return;
    }

    incrementMutation.mutate({
      doctorId,
     date: selectedDate
    });
  };

  const handleDecrement = () => {
    if (!doctorId) {
      toast.error("Doctor profile is still loading");
      return;
    }

    decrementMutation.mutate({
      doctorId,
      date: selectedDate
    });
  };

  const handleReset = () => {
    if (!doctorId) {
      toast.error("Doctor profile is still loading");
      return;
    }

    if (confirm("Are you sure you want to reset the token count for today?")) {
      resetMutation.mutate({
        doctorId,
       date: selectedDate
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visit Token Management</h1>
          <p className="text-slate-500">Manage the queue and issuance of patient visit tokens</p>
          <div className="mt-4">
  <input
    type="date"
    value={selectedDate}
    onChange={(e) =>
      setSelectedDate(e.target.value)
    }
    className="border rounded px-3 py-2"
  />
</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Counter */}
        <Card className="md:col-span-2 shadow-lg border-2 border-blue-100 overflow-hidden">
          <CardHeader className="bg-blue-50/50 pb-8 text-center border-b">
            <CardTitle className="text-blue-600 flex items-center justify-center gap-2">
              <Ticket className="h-6 w-6" />
              Current Token Number
            </CardTitle>
            <CardDescription>Click + to issue the next token in the queue</CardDescription>
          </CardHeader>
          <CardContent className="pt-12 pb-12 flex flex-col items-center">
            <div className="relative">
              <div className="text-8xl md:text-9xl font-black text-slate-900 tracking-tighter flex items-center">
                {isDoctorLoading || isTokenLoading ? (
                  <div className="flex items-center gap-3 text-2xl font-semibold tracking-normal text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    Loading token...
                  </div>
                ) : (
                  currentToken.toString().padStart(3, "0")
                )}
              </div>
              <Badge className="absolute -top-4 -right-4 bg-green-500 hover:bg-green-600 px-3 py-1">
                ACTIVE
              </Badge>
            </div>

            <div className="flex items-center gap-6 mt-16">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-full border-2 border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                onClick={handleDecrement}
                disabled={isActionDisabled}
              >
                <Minus className="h-8 w-8" />
              </Button>
              
              <Button 
                className="h-24 w-24 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 hover:scale-105 transition-all"
                onClick={handleIncrement}
                disabled={isActionDisabled}
              >
                {incrementMutation.isPending ? (
                  <Loader2 className="h-10 w-10 animate-spin" />
                ) : (
                  <Plus className="h-12 w-12" />
                )}
              </Button>

              <Button 
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-full border-2 border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                onClick={handleReset}
                disabled={isActionDisabled}
              >
                <RotateCcw className="h-7 w-7" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Queue Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Tokens Issued Today</span>
                <span className="font-bold">
                  {appointmentsLoading ? "..." : tokenAppointments.length}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Last Reset</span>
                <span className="font-bold">{selectedDate}</span>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>

     <Card>
  <CardHeader>
    <CardTitle>
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

      {/* ================= TODAY'S APPOINTMENTS ================= */}

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

                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {appointmentsList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-slate-400"
                  >
                    No appointments found
                  </TableCell>
                </TableRow>
              ) : (
                appointmentsList.map(
                  (appointment: any, index: number) => (
                    <TableRow
                      key={
                        appointment._id ||
                        appointment.id ||
                        index
                      }
                    >
                      <TableCell className="font-medium">
                        {appointment.patient?.name || "-"}
                      </TableCell>

                      <TableCell className="text-center font-mono">
                        <Badge
                          variant="secondary"
                          className="font-bold"
                        >
                          {appointment.tokenNumber}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {format(
                          new Date(appointment.date),
                          "dd/MM/yyyy"
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Clock className="h-3 w-3" />
                          {appointment.slot}
                        </div>
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(
                          appointment.status
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* ================= SKIPPED APPOINTMENTS ================= */}

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

                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {skippedAppointments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-slate-400"
                  >
                    No skipped appointments
                  </TableCell>
                </TableRow>
              ) : (
                skippedAppointments.map(
                  (appointment: any, index: number) => (
                    <TableRow
                      key={
                        appointment._id ||
                        appointment.id ||
                        index
                      }
                    >
                      <TableCell className="font-medium">
                        {appointment.patient?.name || "-"}
                      </TableCell>

                      <TableCell className="text-center font-mono">
                        <Badge variant="secondary">
                          {appointment.tokenNumber}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {format(
                          new Date(appointment.date),
                          "dd/MM/yyyy"
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Clock className="h-3 w-3" />
                          {appointment.slot}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Select
                          defaultValue={appointment.status}
                          onValueChange={(value) => {
                            if (value === "COMPLETED") {
                              updateAppointmentStatusMutation.mutate({
                                appointmentId:
                                  appointment._id,
                                status: "COMPLETED",
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="SKIPPED">
                              SKIPPED
                            </SelectItem>

                            <SelectItem value="COMPLETED">
                              COMPLETED
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
  );
}
