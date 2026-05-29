"use client";

import { useState, useEffect } from "react";
import { 
  LogIn, 
  LogOut, 
  Timer,
  Clock,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/reusable/data-table";
import { ColumnDef } from "@tanstack/react-table";

export default function ReceptionistAttendancePage() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [timer, setTimer] = useState("00:00:00");

  const handleToggle = () => setIsClockedIn(!isClockedIn);

  const history = [
    { date: "2026-05-15", in: "08:00 AM", out: "04:00 PM", status: "PRESENT" },
    { date: "2026-05-14", in: "08:10 AM", out: "04:05 PM", status: "LATE" },
  ];

  const columns: ColumnDef<any>[] = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "in", header: "Clock In" },
    { accessorKey: "out", header: "Clock Out" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => (
      <Badge variant="outline" className={row.original.status === "PRESENT" ? "text-green-600 bg-green-50 border-green-100" : "text-orange-600 bg-orange-50 border-orange-100"}>
        {row.original.status}
      </Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="font-mono font-bold">10:45 AM</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className={`shadow-lg border-2 ${isClockedIn ? "border-green-200" : "border-blue-100"}`}>
          <CardHeader className="text-center">
            <CardTitle>Shift Clock</CardTitle>
            <CardDescription>Morning Shift (08:00 - 16:00)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            <div className={`p-8 rounded-full mb-8 ${isClockedIn ? "bg-green-50 text-green-600 animate-pulse" : "bg-blue-50 text-blue-600"}`}>
              <Timer className="h-12 w-12" />
            </div>
            {isClockedIn && (
              <div className="text-center mb-6">
                <p className="text-sm text-slate-500">Active Duration</p>
                <h2 className="text-4xl font-black font-mono">02:45:12</h2>
              </div>
            )}
            <Button 
              size="lg" 
              className={`w-full h-14 text-lg font-bold ${isClockedIn ? "bg-red-500 hover:bg-red-600" : "bg-blue-600"}`}
              onClick={handleToggle}
            >
              {isClockedIn ? <><LogOut className="mr-2 h-5 w-5" /> Clock Out</> : <><LogIn className="mr-2 h-5 w-5" /> Clock In</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={history} searchColumn="date" searchPlaceholder="Filter by date..." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
