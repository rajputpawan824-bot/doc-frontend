import { Metadata } from "next";
import TokenManagementClient from "./token-client";
import { serverApi } from "@/lib/api/server";
import { DoctorResponse } from "@/lib/validations/Admin/doctor";

export const metadata: Metadata = {
  title: "Visit Token Management | Clinic Admin",
  description: "Manage doctor visit tokens and patient queue",
};

export default async function TokenPage() {
  const response = await serverApi.get<{
    data: DoctorResponse[];
  }>("/doctors/all-doctors");

  const initialDoctors = response.success
    ? response.data?.data || []
    : [];

  return (
    <TokenManagementClient
      initialDoctors={initialDoctors}
    />
  );
}