"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Ticket, 
  Clock, 
  User, 
  Plus,
  FileText,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePatientDashboard} from "@/services/admin/patient";
import { usePatientTokenStatus} from "@/services/admin/appointment";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { clientApi } from "@/lib/api/client";

import { toast } from "sonner";

import { useDoctors } from "@/services/admin/doctor";
import { usePatientPortalSelection } from "@/lib/hooks/usePatientPortalSelection";

type DoctorOption = {
  _id: string;
  user?: {
    name?: string;
  };
};

type AvailableSlotsResponse = {
  availableSlots?: string[];
  data?: {
    availableSlots?: string[];
  };
};

type CreateAppointmentPayload = {
  doctor: string;
  patient: string;
  admin?: string;
  date: string;
  slot: string;
  reason: string;
};

export default function PatientDashboardPage() {
  const searchParams =
  useSearchParams();
  const queryClient = useQueryClient();
  const {
    patientId: storedPatientId,
    adminId: storedAdminId,
    setSelection,
  } = usePatientPortalSelection();

const patientId =
  searchParams.get("patientId") || storedPatientId;

const adminId =
  searchParams.get("adminId") || storedAdminId;

useEffect(() => {
  const queryPatientId = searchParams.get("patientId");
  const queryAdminId = searchParams.get("adminId");

  if (queryPatientId || queryAdminId) {
    setSelection({
      patientId: queryPatientId || undefined,
      adminId: queryAdminId || undefined,
    });
  }
}, [searchParams, setSelection]);
  

  const [isBookAppointmentOpen, setIsBookAppointmentOpen] =
  useState(false);


const [appointmentForm, setAppointmentForm] =
  useState({
    doctorId: "",
    date: "",
    slot: "",
    reason: "",
  });

const { data: doctorsData } =
  useDoctors({
    limit: 1000,
  });

const doctors =
  doctorsData?.data || [];

  const { data: availableSlots = [] } = useQuery({
    queryKey: ["available-slots", appointmentForm.doctorId, appointmentForm.date],
    queryFn: async () => {
      const response = await clientApi.get<AvailableSlotsResponse>(
        `/appointment/available-slots?doctorId=${appointmentForm.doctorId}&date=${appointmentForm.date}`
      );
      
      if (response.success && response.data && Array.isArray(response.data.availableSlots)) {
        return response.data.availableSlots;
      }
      if (response.success && response.data?.data && Array.isArray(response.data.data.availableSlots)) {
        return response.data.data.availableSlots;
      }
      return [];
    },
    enabled: !!appointmentForm.doctorId && !!appointmentForm.date,
  });


  const createAppointmentMutation =
  useMutation({
    mutationFn: async (
      payload: CreateAppointmentPayload
    ) => {
      const response =
        await clientApi.post(
          "/appointment/create-appointment",
          payload
        );

      if (!response.success) {
        throw new Error(
          response.error
        );
      }

      return response.data;
    },

    onSuccess: () => {
      toast.success(
        "Appointment booked"
      );
      queryClient.invalidateQueries({
        queryKey: ["patient-dashboard", patientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["patient-appointments", patientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["patient-token-status", patientId],
      });

      setIsBookAppointmentOpen(
        false
      );

      setAppointmentForm({
        doctorId: "",
        date: "",
        slot: "",
        reason: "",
      });
    },

    onError: (error: Error) => {
      toast.error(
        error.message
      );
    },
  });
  
const {
  data: dashboardData,
  isLoading,
} = usePatientDashboard(patientId || "");




const {
  data: tokenData,
} = usePatientTokenStatus(patientId || "");


const profile = dashboardData?.profile;
const nextAppointment = dashboardData?.nextAppointment;
const stats = dashboardData?.stats;

const tokenNumber =
  tokenData?.tokenNumber;

const patientsAhead =
  tokenData?.patientsAhead;

const currentServingToken =
  tokenData?.currentServingToken;

const doctorName =
  tokenData?.doctor?.doctorName;

  const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
};

if (isLoading) {
  return (
    <Card>
      <CardContent className="py-10 text-center">
        Loading dashboard...
      </CardContent>
    </Card>
  );
}

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
  {getGreeting()}, {profile?.name || "Patient"}
</h1>
          <p className="text-slate-500">Stay on top of your health and appointments.</p>
        </div>
<Button
  className="w-full sm:w-auto bg-blue-600 gap-2 h-11 px-6 shadow-lg shadow-blue-100"
  onClick={() => setIsBookAppointmentOpen(true)}
>
  <Plus className="h-5 w-5" />
  Book Appointment
</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Token Status Card */}
       <Card className="border-none shadow-lg bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white overflow-hidden relative">
          <CardHeader className="pb-2">
           <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Ticket className="h-5 w-5" /> Current Visit Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-xs text-white-100 uppercase font-bold tracking-widest">My Token</p>
                <h2 className="text-5xl font-black">{tokenNumber || "--"}</h2>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-white-100 uppercase font-bold">Patient Ahead</p>
                <p className="text-2xl font-bold">{patientsAhead ?? 0} Ahead</p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-8 text-white-200 font-bold" />
                <span>{doctorName || "No Active Visit"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-200" />
                <span>Serving Token:
{currentServingToken || 0}</span>
              </div>
            </div>
          </CardContent>
          <Ticket className="absolute -right-10 -bottom-10 h-40 w-40 text-white/5 rotate-12" />
        </Card>

        {/* Next Appointment Card */}
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <Calendar className="h-5 w-5 text-blue-600" /> Next Appointment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{nextAppointment
  ? new Date(
      nextAppointment.date
    ).toLocaleDateString()
  : "No Appointment"}</p>
                <p className="text-slate-500 font-medium">{nextAppointment?.slot || "--"}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Doctor</p>
                <p className="font-bold text-slate-700">{nextAppointment?.doctorName || "--"}</p>
              </div>
 <Badge
  className="bg-blue-600 text-white font-bold text-base px-5 py-2 rounded-md"
>
  {tokenNumber || "N/A"}
</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

<Card>
  <CardContent className="p-6">
    <p className="text-slate-500">
      Past Visits
    </p>
    <h3 className="text-3xl font-bold">
      {stats?.pastVisits || 0}
    </h3>
  </CardContent>
</Card>

<Card>
  <CardContent className="p-6">
    <p className="text-slate-500">
      Family Profiles
    </p>
    <h3 className="text-3xl font-bold">
      {stats?.familyProfiles || 0}
    </h3>
  </CardContent>
</Card>


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/patient/history" className="group">
          <Card className="hover:border-blue-200 transition-all cursor-pointer">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="p-3 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors">
                <Clock className="h-6 w-6 text-slate-400 group-hover:text-blue-600" />
              </div>
              <h4 className="mt-4 font-bold text-slate-700">Past Visits</h4>
            </CardContent>
          </Card>
        </Link>
        <Link href="/patient/reports" className="group">
          <Card className="hover:border-blue-200 transition-all cursor-pointer">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="p-3 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors">
                <FileText className="h-6 w-6 text-slate-400 group-hover:text-blue-600" />
              </div>
              <h4 className="mt-4 font-bold text-slate-700">Lab Reports</h4>
            </CardContent>
          </Card>
        </Link>
        <Link href="/patient/profiles" className="group">
          <Card className="hover:border-blue-200 transition-all cursor-pointer">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="p-3 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors">
                <Users className="h-6 w-6 text-slate-400 group-hover:text-blue-600" />
              </div>
              <h4 className="mt-4 font-bold text-slate-700">Family Profiles</h4>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Dialog
  open={isBookAppointmentOpen}
  onOpenChange={
    setIsBookAppointmentOpen
  }
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        Book Appointment
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-4">

      <div>
        <Label>Doctor</Label>

        <Select
          value={
            appointmentForm.doctorId
          }
          onValueChange={(val) =>
            setAppointmentForm({
              ...appointmentForm,
              doctorId: val,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Doctor" />
          </SelectTrigger>

          <SelectContent>
           {doctors.map((doctor: any) => (
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

      <div>
        <Label>Date</Label>

        <Input
          type="date"
          value={
            appointmentForm.date
          }
          onChange={(e) =>
            setAppointmentForm({
              ...appointmentForm,
              date:
                e.target.value,
            })
          }
        />
      </div>

      <div>
        <Label>Slot</Label>

        <Input
          type="time"
          list="patient-available-slots-list"
          value={
            appointmentForm.slot
          }
          onChange={(e) =>
            setAppointmentForm({
              ...appointmentForm,
              slot:
                e.target.value,
            })
          }
        />
        <datalist id="patient-available-slots-list">
          {availableSlots.map((slot) => (
            <option key={slot} value={slot} />
          ))}
        </datalist>
      </div>

      <div>
        <Label>Reason</Label>

        <Textarea
          value={
            appointmentForm.reason
          }
          onChange={(e) =>
            setAppointmentForm({
              ...appointmentForm,
              reason:
                e.target.value,
            })
          }
        />
      </div>

    </div>

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() =>
          setIsBookAppointmentOpen(
            false
          )
        }
      >
        Cancel
      </Button>

      <Button
        onClick={() => {
          const [
            hours,
            minutes,
          ] =
            appointmentForm.slot.split(
              ":"
            );

          let hour =
            parseInt(
              hours,
              10
            );

          const ampm =
            hour >= 12
              ? "PM"
              : "AM";

          hour =
            hour % 12;

          if (hour === 0)
            hour = 12;

          const formattedSlot =
            `${String(hour).padStart(2,"0")}:${minutes} ${ampm}`;

          createAppointmentMutation.mutate(
            {
              doctor:
                appointmentForm.doctorId,

              patient:
                patientId, // IMPORTANT
              admin:
                adminId,

              date:
                appointmentForm.date,

              slot:
                formattedSlot,

              reason:
                appointmentForm.reason,
            }
          );
        }}
      >
        Book Appointment
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}
