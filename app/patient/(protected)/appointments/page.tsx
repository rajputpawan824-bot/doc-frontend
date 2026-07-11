"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Plus, 
  History,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCancelAppointment,
  usePatientAppointments,
  type PatientAppointment,
} from "@/services/admin/appointment";
import { usePatientPortalSelection } from "@/lib/hooks/usePatientPortalSelection";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const { patientId } = usePatientPortalSelection();
  const {
    data: appointmentData = [],
    isLoading,
  } = usePatientAppointments(patientId);

  const cancelAppointment =
    useCancelAppointment();

  const appointments = appointmentData.map((appointment: PatientAppointment) => {
    const id = appointment._id || appointment.id || appointment.appointmentId || "";
    const parsedDate = appointment.date ? new Date(appointment.date) : null;

    return {
      id,
      doctor:
        appointment.doctorName ||
        appointment.doctor?.doctorName ||
        appointment.doctor?.user?.name ||
        "--",
      specialty:
        appointment.department ||
        appointment.doctor?.department ||
        "General OPD",
      date:
        parsedDate && !Number.isNaN(parsedDate?.getTime())
          ? parsedDate.toLocaleDateString()
          : appointment.date || "--",
      rawDate: parsedDate,
      time: appointment.slot || appointment.time || "--",
      status: appointment.status || "--",
      type: appointment.type || "In-Person",
    };
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter((appointment) => {
    const status = appointment.status.toUpperCase();
    return (
      status !== "COMPLETED" &&
      status !== "CANCELLED" &&
      (!appointment.rawDate || appointment.rawDate >= today)
    );
  });

  const pastAppointments = appointments.filter((appointment) => {
    const status = appointment.status.toUpperCase();
    return (
      status === "COMPLETED" ||
      status === "CANCELLED" ||
      (appointment.rawDate ? appointment.rawDate < today : false)
    );
  });

  const handleCancel = (appointmentId: string) => {
    cancelAppointment.mutate(appointmentId, {
      onSuccess: () => toast.success("Appointment cancelled"),
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-500">Manage your upcoming visits and booking history.</p>
        </div>
        <Button
          className="w-full sm:w-auto bg-blue-600 gap-2 h-11 px-6 shadow-lg shadow-blue-100"
          onClick={() => router.push("/patient/dashboard")}
        >
          <Plus className="h-5 w-5" /> New Appointment
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="bg-white p-1 border border-slate-100 rounded-xl h-12">
          <TabsTrigger value="upcoming" className="rounded-lg px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Upcoming</TabsTrigger>
          <TabsTrigger value="past" className="rounded-lg px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingAppointments.map((apt) => (
              <Card key={apt.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-2 bg-blue-600 group-hover:w-3 transition-all" />
                    <div className="flex-1 p-5 lg:p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{apt.specialty}</p>
                          <h3 className="text-xl font-bold text-slate-900">{apt.doctor}</h3>
                        </div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none">{apt.status}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-600">{apt.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-600">{apt.time}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">

                        <Button
                          variant="ghost"
                          className="text-red-500 hover:bg-red-50 h-10"
                          onClick={() => handleCancel(apt.id)}
                          disabled={cancelAppointment.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {upcomingAppointments.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No Upcoming Appointments</h3>
              <p className="text-slate-500 mt-1 mb-6">{isLoading ? "Loading appointments..." : "You don't have any appointments scheduled."}</p>
              <Button
                className="bg-blue-600"
                onClick={() => router.push("/patient/dashboard")}
              >
                Book Now
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastAppointments.map((apt) => (
                <Card key={apt.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-2 bg-slate-300 group-hover:w-3 transition-all" />
                      <div className="flex-1 p-5 lg:p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{apt.specialty}</p>
                            <h3 className="text-xl font-bold text-slate-900">{apt.doctor}</h3>
                          </div>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">{apt.status}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-600">{apt.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-600">{apt.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-sm">
              <CardContent className="py-20 text-center text-slate-400">
                <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>{isLoading ? "Loading appointments..." : "No past appointments recorded."}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
