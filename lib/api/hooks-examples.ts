/**
 * Reference examples for the API hooks.
 *
 * This file intentionally avoids executable JSX so ESLint can parse it as
 * TypeScript. Copy the snippets into `.tsx` files before using them.
 */

export const apiHookExamples = {
  serverComponent: `
import { serverApi } from "@/lib/api/server";
import { notFound } from "next/navigation";

type DashboardStats = { patients: number; appointments: number; revenue: number };

export default async function DashboardPage() {
  const res = await serverApi.get<DashboardStats>("/dashboard/stats");
  if (!res.success) notFound();
  return <pre>{JSON.stringify(res.data, null, 2)}</pre>;
}
`,
  clientQuery: `
"use client";

import { useApiQuery } from "@/lib/api";

type Patient = { id: string; name: string; dob: string };

export function PatientList({ clinicId }: { clinicId: string }) {
  const { data, isLoading, error } = useApiQuery<Patient[]>(
    \`/clinics/\${clinicId}/patients\`,
    ["patients", clinicId],
  );

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data?.map((p) => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
`,
  mutation: `
"use client";

import { useApiMutation } from "@/lib/api";

type CreateAppointmentDto = { patientId: string; date: string; doctorId: string };
type Appointment = { id: string } & CreateAppointmentDto;

export function BookAppointment() {
  const { mutate, isPending } = useApiMutation<Appointment, CreateAppointmentDto>(
    "/appointments",
    "POST",
  );

  return (
    <button
      disabled={isPending}
      onClick={() => mutate({ patientId: "123", date: "2026-04-10", doctorId: "doc1" })}
    >
      {isPending ? "Booking..." : "Book"}
    </button>
  );
}
`,
};
