"use client";

import { useState } from "react";
import { 
  LogIn, 
  LogOut, 
  Timer,
  Clock,
  History,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/reusable/data-table";
import { ColumnDef } from "@tanstack/react-table";

export default function StaffAttendancePage() {
  const [isClockedIn, setIsClockedIn] = useState(false);

  const handleToggle = () => setIsClockedIn(!isClockedIn);

  const history = [
    { date: "2026-05-15", in: "09:00 AM", out: "05:30 PM", status: "PRESENT" },
    { date: "2026-05-14", in: "09:15 AM", out: "05:00 PM", status: "LATE" },
  ];

  const columns: ColumnDef<any>[] = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "in", header: "In" },
    { accessorKey: "out", header: "Out" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => (
      <Badge variant="outline" className={row.original.status === "PRESENT" ? "text-green-600 bg-green-50 border-none" : "text-orange-600 bg-orange-50 border-none"}>
        {row.original.status}
      </Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-full sm:w-auto">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="font-mono font-bold text-lg">10:45 AM</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className={`shadow-lg border-none overflow-hidden transition-all duration-500 ${isClockedIn ? "ring-2 ring-green-400" : "ring-2 ring-blue-100"}`}>
          <CardHeader className="text-center bg-slate-50/50">
            <CardTitle className="text-lg">Shift Controller</CardTitle>
            <CardDescription>Shift: 09:00 AM - 05:00 PM</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-10 px-6">
            <div className={`p-8 rounded-full mb-10 transition-all duration-500 shadow-inner ${isClockedIn ? "bg-green-100 text-green-600 animate-pulse" : "bg-blue-100 text-blue-600"}`}>
              <Timer className="h-16 w-16" />
            </div>
            
            {isClockedIn && (
              <div className="text-center mb-10">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Session Time</p>
                <h2 className="text-5xl font-black font-mono tracking-tighter text-slate-900">01:45:12</h2>
                <p className="text-sm text-green-600 mt-2 flex items-center justify-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Clocked in at 09:00 AM
                </p>
              </div>
            )}

            <Button 
              size="lg" 
              className={`w-full h-20 text-xl font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all ${isClockedIn ? "bg-red-500 hover:bg-red-600 shadow-red-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"}`}
              onClick={handleToggle}
            >
              {isClockedIn ? <><LogOut className="mr-3 h-6 w-6" /> Clock Out</> : <><LogIn className="mr-3 h-6 w-6" /> Clock In</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm border-none bg-white">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" /> Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <DataTable columns={columns} data={history} searchColumn="date" searchPlaceholder="Filter..." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
