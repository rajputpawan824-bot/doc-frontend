"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search,
  User,
  MapPin,
  MoreVertical,
  XCircle,
  History,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PatientAppointmentsPage() {
  const appointments = [
    {
      id: "A-552",
      doctor: "Dr. Sarah Wilson",
      specialty: "Dermatology",
      date: "May 20, 2026",
      time: "02:30 PM",
      status: "Confirmed",
      type: "In-Person"
    },
    {
      id: "A-560",
      doctor: "Dr. John Smith",
      specialty: "Cardiology",
      date: "May 18, 2026",
      time: "10:00 AM",
      status: "Confirmed",
      type: "Tele-Consult"
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-500">Manage your upcoming visits and booking history.</p>
        </div>
        <Button className="w-full sm:w-auto bg-blue-600 gap-2 h-11 px-6 shadow-lg shadow-blue-100">
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
            {appointments.map((apt) => (
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
                        <Button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border-none h-10">
                          Reschedule
                        </Button>
                        <Button variant="ghost" className="text-red-500 hover:bg-red-50 h-10">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {appointments.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No Upcoming Appointments</h3>
              <p className="text-slate-500 mt-1 mb-6">You don't have any appointments scheduled.</p>
              <Button className="bg-blue-600">Book Now</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          <Card className="border-none shadow-sm">
            <CardContent className="py-20 text-center text-slate-400">
              <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No past appointments recorded.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
