import { Metadata } from "next";
import DoctorsPageClient from "./doctor-client";
import { serverApi } from "@/lib/api/server";
import { DoctorResponse } from "@/lib/validations/Admin/doctor";

export const metadata: Metadata = {
  title: "Doctor Management | Clinic Admin",
  description: "Manage doctors, their schedules, consultation fees, and availability",
};

export default async function DoctorsPage() {
  const response = await serverApi.get<{ data: DoctorResponse[] }>("/doctors/all-doctors");
  
  const initialDoctors = response.success ? response.data?.data : [];

  return <DoctorsPageClient initialDoctors={initialDoctors} />;
}
