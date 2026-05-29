"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Ticket, 
  Clock, 
  User, 
  ArrowRight,
  Plus,
  FileText,
  Users,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PatientDashboardPage() {
  const currentToken = {
    number: "DR-J-015",
    expectedTime: "11:30 AM",
    waitingTime: "25 mins",
    doctor: "Dr. John Smith",
    status: "Active"
  };

  const nextAppointment = {
    date: "May 18, 2026",
    time: "10:00 AM",
    doctor: "Dr. Sarah Wilson",
    type: "Follow-up"
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Good Morning, John</h1>
          <p className="text-slate-500">Stay on top of your health and appointments.</p>
        </div>
        <Button className="w-full sm:w-auto bg-blue-600 gap-2 h-11 px-6 shadow-lg shadow-blue-100">
          <Plus className="h-5 w-5" /> Book Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Token Status Card */}
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-100">
              <Ticket className="h-5 w-5" /> Current Visit Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-xs text-blue-100 uppercase font-bold tracking-widest">My Token</p>
                <h2 className="text-5xl font-black">{currentToken.number}</h2>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-blue-100 uppercase font-bold">Waiting</p>
                <p className="text-2xl font-bold">{currentToken.waitingTime}</p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-200" />
                <span>{currentToken.doctor}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-200" />
                <span>{currentToken.expectedTime}</span>
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
                <p className="text-xl font-bold text-slate-900">{nextAppointment.date}</p>
                <p className="text-slate-500 font-medium">{nextAppointment.time}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Doctor</p>
                <p className="font-bold text-slate-700">{nextAppointment.doctor}</p>
              </div>
              <Badge variant="outline" className="bg-white border-slate-200">{nextAppointment.type}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}
