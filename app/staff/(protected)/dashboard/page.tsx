import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, CheckCircle2 } from "lucide-react";

export default function StaffDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Staff Dashboard</h1>
        <p className="text-slate-500 text-sm lg:text-base">Welcome to your portal. Manage your profile, salary, and attendance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm border-none bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Today's Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-900">09:00 AM - 05:00 PM</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Attendance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-900">Clocked In</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Leave Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-slate-900">12 Days Remaining</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
