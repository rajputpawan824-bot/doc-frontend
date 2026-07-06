"use client";

import {
  Clock,
  Stethoscope,
  BriefcaseMedical,
  BadgeCheck,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useDoctorById } from "@/services/admin/doctor";

import { useEffect, useState } from "react";

export default function DoctorDashboardPage() {
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      try {
        const payload = JSON.parse(
          atob(token.split(".")[1])
        );
        setUserId(payload.id);
      } catch (error) {
        console.error("Failed to decode token", error);
      }
    }
  }, []);

  const {
    data: doctor,
    isLoading,
    isError,
  } = useDoctorById(userId);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (isError || !doctor) {
    return (
      <div className="p-8">
        Failed to load doctor dashboard
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Doctor Dashboard
        </h1>

        <p className="text-slate-600 mt-2">
          Welcome to your portal. Manage patients,
          appointments, consultations and daily activities.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Shift Card */}
        <Card className="border-blue-300 bg-blue-300/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-blue-700 mb-6">
              <Clock className="h-5 w-5" />
              <span className="font-medium">
                Shift & Working Hours
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              {doctor.shift}
            </h2>

            <p className="mt-3 text-slate-600">
              {doctor.workingHours?.start || "--:--"}
              {" - "}
              {doctor.workingHours?.end || "--:--"}
            </p>
          </CardContent>
        </Card>

        {/* Department Card */}
        <Card className="border-green-300 bg-green-200/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-green-700 mb-6">
              <Stethoscope className="h-5 w-5" />
              <span className="font-medium">
                Department
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              {doctor.department || "Not Assigned"}
            </h2>

            <p className="mt-3 text-slate-600">
              Specialization Department
            </p>
          </CardContent>
        </Card>

 

        {/* Status Card */}
        <Card className="border-orange-300 bg-orange-200/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-orange-600 mb-6">
              <BadgeCheck className="h-5 w-5" />
              <span className="font-medium">
                Employment Status
              </span>
            </div>

    <h2 className="text-2xl font-bold text-slate-900">
      {doctor.status === "active"
        ? "Active"
        : "Inactive"}
    </h2>

            <p className="mt-3 text-slate-600">
              Doctor Code:{" "}
              {doctor.doctorCode || "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}