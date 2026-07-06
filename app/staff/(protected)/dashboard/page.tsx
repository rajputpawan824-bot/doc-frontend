"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, Briefcase } from "lucide-react";
import { useStaffById } from "@/services/admin/staff";

// import your attendance hook here
// import { useTodayAttendance } from "@/services/staff/attendance";

export default function StaffDashboardPage() {
  const [staffId, setStaffId] = useState<string>();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      try {
        const payload = JSON.parse(
          atob(token.split(".")[1])
        );

        setStaffId(payload.id);
      } catch (error) {
        console.error("Token parse failed", error);
      }
    }
  }, []);

  const { data: staff } = useStaffById(staffId);

  // Replace with your attendance hook
  // const { data: attendance } = useTodayAttendance();



  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Staff Dashboard
        </h1>

        <p className="text-slate-500 text-sm lg:text-base">
          Welcome to your portal. Manage your profile, salary, and attendance.
        </p>
      </div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Shift & Working Hours */}
  <Card className="shadow-sm border-none bg-blue-50/50">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Shift & Working Hours
      </CardTitle>
    </CardHeader>

    <CardContent>
      <p className="text-xl font-bold text-slate-900">
        {staff?.shift || "Not Assigned"}
      </p>

      <p className="text-sm text-slate-600 mt-2">
        {staff?.workingHours?.start && staff?.workingHours?.end
          ? `${staff.workingHours.start} - ${staff.workingHours.end}`
          : "Working Hours Not Assigned"}
      </p>
    </CardContent>
  </Card>

  {/* Category & Department */}
  <Card className="shadow-sm border-none bg-green-50/50">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
        <Briefcase className="h-4 w-4" />
        Category & Department
      </CardTitle>
    </CardHeader>

    <CardContent>
      <p className="text-xl font-bold text-slate-900">
        {staff?.category || "Not Assigned"}
      </p>

      <p className="text-sm text-slate-600 mt-2">
        {staff?.department || "Department Not Assigned"}
      </p>
    </CardContent>
  </Card>

  {/* Employment Status */}
  <Card className="shadow-sm border-none bg-orange-50/50">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-orange-600 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4" />
        Employment Status
      </CardTitle>
    </CardHeader>

    <CardContent>
      <p className="text-xl font-bold text-slate-900">
        {staff?.isActive ? "Active" : "Inactive"}
      </p>

    <p className="text-sm text-slate-600 mt-2">
      Staff Code: {staff?.staffCode || "Not Assigned"}
    </p>
    </CardContent>
  </Card>
</div>
    </div>
  );
}