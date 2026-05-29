"use client";

import { useState, useEffect } from "react";
import { 
  LogIn, 
  LogOut, 
  Clock, 
  Calendar, 
  History, 
  MapPin, 
  CheckCircle2,
  AlertCircle,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/reusable/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  duration: string | null;
  status: "PRESENT" | "LATE" | "OVERTIME";
  location: string;
}

export default function DoctorAttendancePage() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timer, setTimer] = useState("00:00:00");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (isClockedIn && clockInTime) {
        const diff = new Date().getTime() - clockInTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimer(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime]);

  const handleClockToggle = () => {
    if (!isClockedIn) {
      setIsClockedIn(true);
      setClockInTime(new Date());
    } else {
      if (confirm("Are you sure you want to clock out?")) {
        setIsClockedIn(false);
        setClockInTime(null);
        setTimer("00:00:00");
      }
    }
  };

  // Mock History Data
  const history: AttendanceRecord[] = [
    {
      id: "1",
      date: "2026-05-15",
      clockIn: "09:00 AM",
      clockOut: "05:30 PM",
      duration: "8h 30m",
      status: "PRESENT",
      location: "Main Clinic",
    },
    {
      id: "2",
      date: "2026-05-14",
      clockIn: "09:15 AM",
      clockOut: "06:00 PM",
      duration: "8h 45m",
      status: "LATE",
      location: "Main Clinic",
    },
    {
      id: "3",
      date: "2026-05-13",
      clockIn: "08:50 AM",
      clockOut: "07:30 PM",
      duration: "10h 40m",
      status: "OVERTIME",
      location: "East Wing",
    },
  ];

  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>{row.getValue("date")}</span>
        </div>
      ),
    },
    {
      accessorKey: "clockIn",
      header: "Clock In",
    },
    {
      accessorKey: "clockOut",
      header: "Clock Out",
      cell: ({ row }) => row.getValue("clockOut") || "---",
    },
    {
      accessorKey: "duration",
      header: "Working Hours",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <span>{row.getValue("duration") || "In Progress"}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variants: Record<string, string> = {
          PRESENT: "bg-green-100 text-green-800",
          LATE: "bg-orange-100 text-orange-800",
          OVERTIME: "bg-blue-100 text-blue-800",
        };
        return (
          <Badge className={`${variants[status]} border-none shadow-none`}>
            {status}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance & Clocking</h1>
          <p className="text-slate-500">Track your shifts and working hours</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Clock className="h-5 w-5 text-blue-600" />
          <span className="font-mono text-lg font-bold">{format(currentTime, "hh:mm:ss a")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clock In/Out Control */}
        <Card className={`lg:col-span-1 shadow-lg border-2 transition-all ${isClockedIn ? "border-green-200" : "border-blue-100"}`}>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">System Clock</CardTitle>
            <CardDescription>Shift: 09:00 AM - 06:00 PM</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            <div className={`p-8 rounded-full mb-8 transition-all ${isClockedIn ? "bg-green-50 text-green-600 animate-pulse" : "bg-blue-50 text-blue-600"}`}>
              <Timer className="h-16 w-16" />
            </div>

            {isClockedIn && (
              <div className="text-center mb-8">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Time Since Clock-in</p>
                <h2 className="text-4xl font-black text-slate-900 font-mono tracking-tighter">{timer}</h2>
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Clocked in at {format(clockInTime!, "hh:mm a")}</span>
                </div>
              </div>
            )}

            <Button 
              size="lg"
              className={`w-full h-16 text-lg font-bold shadow-md hover:scale-[1.02] transition-all gap-3 ${
                isClockedIn 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              onClick={handleClockToggle}
            >
              {isClockedIn ? (
                <>
                  <LogOut className="h-6 w-6" />
                  Clock Out
                </>
              ) : (
                <>
                  <LogIn className="h-6 w-6" />
                  Clock In
                </>
              )}
            </Button>

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="h-3 w-3" />
              <span>Current Location: Main Clinic Entrance</span>
            </div>
          </CardContent>
        </Card>

        {/* Info and Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <History className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">This Month</p>
                    <h3 className="text-xl font-bold">156 Working Hours</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-xl text-green-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Days Present</p>
                    <h3 className="text-xl font-bold">18 / 22 Days</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent History</CardTitle>
              <CardDescription>Your last few attendance logs</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns} 
                data={history} 
                searchColumn="date"
                searchPlaceholder="Filter by date..."
              />
            </CardContent>
          </Card>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>
              Your attendance is automatically synced with the payroll system. Please ensure you clock in within 15 minutes of your shift start to avoid late markings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
