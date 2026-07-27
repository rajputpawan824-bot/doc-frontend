"use client";
import {useState, useEffect} from "react";

import {
  Clock,
  Monitor,
  BadgeCheck,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useReceptionistById } from "@/services/admin/reception";

export default function ReceptionistDashboardPage() {
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
    data: receptionist,
    isLoading,
    isError,
  } = useReceptionistById(userId);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (isError || !receptionist) {
    return (
      <div className="p-8">
        Failed to load receptionist dashboard
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Receptionist Dashboard
        </h1>

        <p className="text-slate-600 mt-2">
          Welcome to your portal. Manage patients,
          appointments, and daily operations.
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
              {receptionist.shift}
            </h2>

            <p className="mt-3 text-slate-600">
              {receptionist.workingHours?.start || "--:--"}
              {" - "}
              {receptionist.workingHours?.end || "--:--"}
            </p>
          </CardContent>
        </Card>

        {/* Desk Card */}
        <Card className="border-green-300 bg-green-200/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-green-700 mb-6">
              <Monitor className="h-5 w-5" />
              <span className="font-medium">
                Reception Desk
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              {receptionist.deskNumber || "Not Assigned"}
            </h2>

            <p className="mt-3 text-slate-600">
              Experience: {receptionist.experience} Years
            </p>
          </CardContent>
        </Card>


{/* Patient Edit Permission Card */}
<Card
  className={
    receptionist.canEditPatient
      ? "border-yellow-400 bg-yellow-100/40"
      : "border-red-100 bg-red-50/40"
  }
>
  <CardContent className="p-6">
    <div
      className={`flex items-center gap-2 mb-6 ${
        receptionist.canEditPatient
          ? "text-yellow-700"
          : "text-red-700"
      }`}
    >
      <Monitor className="h-5 w-5" />
      <span className="font-medium">
        Patient Edit Permission
      </span>
    </div>

    <h2 className="text-2xl font-bold text-black-500">
      {receptionist.canEditPatient
        ? "Allowed"
        : "Restricted"}
    </h2>

    <p className="mt-3 text-slate-600">
      {receptionist.canEditPatient
        ? "You can edit and manage patient records."
        : "You can view patients but cannot edit records."}
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
              {receptionist.isActive
                ? "Active"
                : "Inactive"}
            </h2>

            <p className="mt-3 text-slate-600">
              Receptionist Code:{" "}
              {receptionist.receptionistCode}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}