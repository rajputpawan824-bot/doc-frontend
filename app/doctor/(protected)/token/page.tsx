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

export default function DoctorTokenPage() {
const [selectedDate, setSelectedDate] = useState(
  format(new Date(), "yyyy-MM-dd")
);

  const {
    data: doctor,
    isLoading: isDoctorLoading,
    isError: isDoctorError,
  } = useDoctorById("me");

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

  const currentToken = currentTokenData?.currentToken ?? 0;
const tokenAppointments = Array.isArray(
  (appointments as any)?.data
)
  ? (appointments as any).data
  : [];
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
                <span className="text-slate-500">Average Wait Time</span>
                <span className="font-bold">N/A</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Last Reset</span>
                <span className="font-bold">{selectedDate}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-none">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Hash className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">NEXT UP</p>
                  <p className="text-lg font-bold">
                    {isDoctorLoading || isTokenLoading
                      ? "Loading..."
                      : (currentToken + 1).toString().padStart(3, "0")}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Next patient should be ready at the clinic entrance.
              </p>
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
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b">
          <th className="text-left p-2">
            Patient
          </th>

          <th className="text-left p-2">
            Token
          </th>

          <th className="text-left p-2">
            Date
          </th>

          <th className="text-left p-2">
            Time
          </th>

          <th className="text-left p-2">
            Status
          </th>
        </tr>
      </thead>

      <tbody>
        {tokenAppointments.length === 0 ? (
          <tr>
            <td
              colSpan={5}
              className="text-center py-6"
            >
              No appointments found
            </td>
          </tr>
        ) : (
          tokenAppointments.map(
            (appointment: any) => (
              <tr
                key={appointment._id}
                className="border-b"
              >
                <td className="p-2">
                  {appointment.patient?.name}
                </td>

                <td className="p-2">
                  {appointment.tokenNumber}
                </td>

                <td className="p-2">
                  {format(
                    new Date(
                      appointment.date
                    ),
                    "dd/MM/yyyy"
                  )}
                </td>

                <td className="p-2">
                  {appointment.slot}
                </td>

                <td className="p-2">
                  {appointment.status}
                </td>
              </tr>
            )
          )
        )}
      </tbody>
    </table>
  </CardContent>
</Card>
    </div>
  );
}
