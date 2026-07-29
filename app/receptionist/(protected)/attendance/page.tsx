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
  XCircle,
  CalendarDays,
  Clock3,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/reusable/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import {
  useTodayAttendance,
  useMyAttendanceStats,
  useMyAttendanceHistory,
  useClockIn,
  useClockOut,
 
} from "@/services/admin/attendance";
import { useReceptionistById  } from "@/services/admin/reception";


interface AttendanceRecord {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  duration: string | null;
    status:
    | "PRESENT"
    | "LATE"
    | "ABSENT"
    | "LEAVE"
    | "HALF_DAY";

  location: string;
}

export default function ReceptionistAttendancePage() {
  //const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timer, setTimer] = useState("00:00:00");

  useEffect(() => {
  console.log("clockInTime:", clockInTime);
}, [clockInTime]);


const [userId, setUserId] =
  useState<string>();

useEffect(() => {
  const token =
    localStorage.getItem(
      "access_token"
    );

  if (token) {
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      setUserId(payload.id);
    } catch (error) {
      console.error(error);
    }
  }
}, []);

const { data: doctor } =
  useReceptionistById (userId);


  const { data: todayAttendance } =
  useTodayAttendance();

const { data: attendanceStats } =
  useMyAttendanceStats();

const { data: attendanceHistory } =
  useMyAttendanceHistory();
  
const clockInMutation =
  useClockIn();

const clockOutMutation =
  useClockOut();


      const isClockedIn =
  todayAttendance?.clockedIn &&
  !todayAttendance?.clockedOut;


   useEffect(() => {
  if (
    todayAttendance?.clockInTime &&
    !todayAttendance?.clockedOut
  ) {
    setClockInTime(
      new Date(todayAttendance.clockInTime)
    );
  }
}, [todayAttendance]);

  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (isClockedIn && clockInTime) {
        const diff = new Date()?.getTime() - clockInTime?.getTime();
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






const handleClockToggle = async () => {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const payload = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      console.log("Sending payload:", payload);

      if (!isClockedIn) {
        const response = await clockInMutation.mutateAsync(payload);

        if (response.clockInTime) {
          setClockInTime(new Date(response.clockInTime));
        }
      } else {
        if (confirm("Are you sure you want to clock out?")) {
          await clockOutMutation.mutateAsync(payload);

          setClockInTime(null);
          setTimer("00:00:00");
        }
      }
    },
    (error) => {
      console.error(error);
      alert("Unable to fetch your location.");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};





const history: AttendanceRecord[] =
  attendanceHistory?.map((item) => ({
    id: item._id,

    date: format(
      new Date(item.attendanceDate),
      "yyyy-MM-dd"
    ),

    clockIn: item.clockInTime
      ? format(
          new Date(item.clockInTime),
          "hh:mm a"
        )
      : "---",

    clockOut: item.clockOutTime
      ? format(
          new Date(item.clockOutTime),
          "hh:mm a"
        )
      : null,

    duration: `${Math.floor(
      item.totalWorkingMinutes / 60
    )}h ${
      item.totalWorkingMinutes % 60
    }m`,

    status: item.status,

    location: "Clinic",
  })) || [];

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
            ABSENT: "bg-red-100 text-red-800",
  LEAVE: "bg-yellow-100 text-yellow-800",
  HALF_DAY: "bg-blue-100 text-blue-800",
         
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
            <CardDescription>    Shift: {
    doctor?.workingHours?.start
      ? format(
          new Date(
            `1970-01-01T${doctor.workingHours.start}`
          ),
          "hh:mm a"
        )
      : "--"
  }
  {" - "}
  {
    doctor?.workingHours?.end
      ? format(
          new Date(
            `1970-01-01T${doctor.workingHours.end}`
          ),
          "hh:mm a"
        )
      : "--"
  }</CardDescription>
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
                  <span>
  Clocked in at{" "}
  {todayAttendance?.clockInTime
    ? format(
        new Date(todayAttendance.clockInTime),
        "hh:mm a"
      )
    : "--"}
</span>
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
          </CardContent>
        </Card>

        {/* Info and Stats */}
        <div className="lg:col-span-2 space-y-6">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <History className="h-6 w-6" />
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-500">This Month</p>
                    <h3 className="text-xl font-bold">{attendanceStats?.workingMinutes
  ? `${Math.floor(
      attendanceStats.workingMinutes / 60
    )}h ${
      attendanceStats.workingMinutes % 60
    }m`
  : "0h 0m"}</h3>
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
                    <h3 className="text-xl font-bold">{attendanceStats?.presentDays || 0} Days</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
             <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
<div className="p-3 bg-red-50 rounded-xl text-red-600">
  <XCircle className="h-6 w-6" />
                  </div>
                  <div>
                  <p className="text-sm text-slate-500">
  Absent Days
</p>

<h3 className="text-xl font-bold">
  {attendanceStats?.absentDays || 0}
</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-xl text-green-600">
                    <History className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">
  Working Hours
</p>

<h3 className="text-xl font-bold">
  {attendanceStats?.workingMinutes
    ? `${Math.floor(
        attendanceStats.workingMinutes / 60
      )}h ${
        attendanceStats.workingMinutes % 60
      }m`
    : "0h 0m"}
</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
<div className="p-3 bg-yellow-50 rounded-xl text-yellow-600">
  <CalendarDays className="h-6 w-6" />
                  </div>
                  <div>
                   <p className="text-sm text-slate-500">
  Leave Days
</p>

<h3 className="text-xl font-bold">
  {attendanceStats?.leaveDays || 0}
</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
<div className="p-3 bg-orange-50 rounded-xl text-orange-600">
  <Clock3 className="h-6 w-6" />
                  </div>
                  <div>
                 <p className="text-sm text-slate-500">
  Late Days
</p>

<h3 className="text-xl font-bold">
  {attendanceStats?.lateDays || 0}
</h3>
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
