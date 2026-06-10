"use client";

import React, { useState, useMemo } from "react";
import {
  Ticket,
  Plus,
  Minus,
  RotateCcw,
  Clock,
  Calendar,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { usePatients } from "@/services/admin/patient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api/client";
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
  useDecrementToken,
  useResetToken,
} from "@/services/admin/token";

interface TokenManagementClientProps {
  initialDoctors: DoctorResponse[];
}

export default function TokenManagementClient({
  initialDoctors,
}: TokenManagementClientProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [modalDoctorSearch, setModalDoctorSearch] = useState("");
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState(today);

  const filteredDoctorsList = useMemo(() => {
    const list = initialDoctors || [];
    if (!doctorSearch) return list;
    return list.filter((doctor) =>
      doctor.user?.name?.toLowerCase().includes(doctorSearch.toLowerCase())
    );
  }, [initialDoctors, doctorSearch]);

  const filteredModalDoctors = useMemo(() => {
    const list = initialDoctors || [];
    if (!modalDoctorSearch) return list;
    return list.filter((doctor) =>
      doctor.user?.name?.toLowerCase().includes(modalDoctorSearch.toLowerCase())
    );
  }, [initialDoctors, modalDoctorSearch]);

  // Appointment Creation State
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    slot: "",
    reason: "",
  });

  // Fetch data for Appointment Creation
  const { data: patientsData } = usePatients({ limit: 1000 });
  const patients = (patientsData as any)?.data 
    ? (patientsData as any).data 
    : (Array.isArray(patientsData) ? patientsData : []);

  const { data: availableSlots = [] } = useQuery({
    queryKey: ["available-slots", appointmentForm.doctorId, appointmentForm.date],
    queryFn: async () => {
      const response = await clientApi.get<any>(
        `/appointment/available-slots?doctorId=${appointmentForm.doctorId}&date=${appointmentForm.date}`
      );
      
      if (response.success && response.data && Array.isArray(response.data.availableSlots)) {
        return response.data.availableSlots;
      }
      return [];
    },
    enabled: !!appointmentForm.doctorId && !!appointmentForm.date,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await clientApi.post("/appointment/create-appointment", payload);
      if (!response.success) throw new Error(response.error || "Failed to create appointment");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Appointment created successfully");
      queryClient.invalidateQueries({ queryKey: ["current-token"] });
      queryClient.invalidateQueries({ queryKey: ["token-appointments"] });
      setIsModalOpen(false);
      setAppointmentForm({ patientId: "", doctorId: "", date: "", slot: "", reason: "" });
      setModalDoctorSearch("");
    },
    onError: (error: any) => toast.error(error.message),
  });

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
    onSuccess: () => toast.success("Token incremented successfully"),
    onError: (error) => toast.error(error.message),
  });

  const decrementMutation = useDecrementToken({
    onSuccess: () => toast.success("Token decremented successfully"),
    onError: (error) => toast.error(error.message),
  });

  const resetMutation = useResetToken({
    onSuccess: () => toast.success("Token queue reset successfully"),
    onError: (error) => toast.error(error.message),
  });

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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      WAITING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
      COMPLETED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <Badge variant="outline" className={statusMap[status] || ""}>
        {status}
      </Badge>
    );
  };

  // Handle both direct array response and wrapped data property response
  const appointmentsList = (appointments as any)?.data 
    ? (appointments as any).data 
    : (Array.isArray(appointments) ? appointments : []);

  const currentToken = (currentTokenData as any)?.data?.currentToken 
    ? (currentTokenData as any).data.currentToken 
    : (currentTokenData?.currentToken || 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Visit Token Management
          </h1>
          <p className="text-slate-500">Manage real-time doctor visit queues</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Create Appointment</Button>
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
                className="bg-slate-50 border-slate-200"
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

        {/* History Table */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-600" />
              Today&apos;s Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead className="text-center">Token Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!selectedDoctorId || appointmentsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                        {selectedDoctorId ? "No appointments for today" : "Select a doctor to view queue"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointmentsList.map((row: any, index: number) => (
                      <TableRow key={row.id || row._id || index}>
                        <TableCell className="font-medium">{row.patient?.name}</TableCell>
                        <TableCell className="text-center font-mono">
                          <Badge variant="secondary" className="font-bold">
                            {row.tokenNumber}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock className="h-3 w-3" />
                            {row.slot}
                          </div>
                        </TableCell>
                        <TableCell>{row.doctor?.user?.name}</TableCell>
                        <TableCell>{getStatusBadge(row.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Appointment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Appointment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select
                value={appointmentForm.patientId}
                onValueChange={(val) => setAppointmentForm({ ...appointmentForm, patientId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} - {p.phoneNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select
                value={appointmentForm.doctorId}
                onValueChange={(val) => setAppointmentForm({ ...appointmentForm, doctorId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Doctor" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <div className="p-2 border-b sticky top-0 bg-white z-10">
                    <Input
                      placeholder="Search doctor..."
                      value={modalDoctorSearch}
                      onChange={(e) => setModalDoctorSearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="h-8 text-sm"
                    />
                  </div>
                  {filteredModalDoctors.map((d: any) => (
                    <SelectItem 
                      key={d.id || d._id} 
                      value={d.id || d._id}
                    >
                      {d.user?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={appointmentForm.date}
                min={today}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Slot</Label>
              <div className="relative">
                <Input
                  placeholder={!appointmentForm.doctorId || !appointmentForm.date ? "Select doctor and date first" : "Enter time (e.g., 10:30 AM)"}
                  value={appointmentForm.slot}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, slot: e.target.value })}
                  disabled={!appointmentForm.doctorId || !appointmentForm.date}
                  list="available-slots-list"
                />
                <datalist id="available-slots-list">
                  {availableSlots.map((s: string) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              {availableSlots.length > 0 && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Available suggestions: {availableSlots.slice(0, 8).join(", ")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Textarea
                value={appointmentForm.reason}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
                placeholder="Reason for visit"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => createAppointmentMutation.mutate({
                doctor: appointmentForm.doctorId,
                patient: appointmentForm.patientId,
                date: appointmentForm.date,
                slot: appointmentForm.slot,
                reason: appointmentForm.reason,
              })}
              disabled={createAppointmentMutation.isPending || !appointmentForm.patientId || !appointmentForm.doctorId || !appointmentForm.date || !appointmentForm.slot}
            >
              {createAppointmentMutation.isPending ? "Creating..." : "Create Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}