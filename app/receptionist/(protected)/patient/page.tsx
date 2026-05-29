"use client";

import { useState } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  AlertCircle,
  Stethoscope,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/reusable/data-table";
import { ColumnDef } from "@tanstack/react-table";
import ReusableModal, { FieldConfig } from "@/components/reusable/reusable-modal";

interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gender: string;
  adhar: string;
  address: string;
  age: number;
  emergencyContact: string;
  issue: string;
  notes?: string;
  registeredOn: string;
}

export default function ReceptionistPatientPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockPatients: Patient[] = [
    {
      id: "P001",
      name: "John Doe",
      phone: "9876543210",
      email: "john@example.com",
      gender: "Male",
      adhar: "1234 5678 9012",
      address: "123 Street, City",
      age: 35,
      emergencyContact: "Jane Doe (Wife): 9988776655",
      issue: "Common Flu, Fever",
      registeredOn: "2026-05-15",
    },
    {
      id: "P002",
      name: "Alice Smith",
      phone: "8877665544",
      gender: "Female",
      adhar: "5678 9012 3456",
      address: "456 Avenue, Town",
      age: 28,
      emergencyContact: "Bob Smith (Father): 7766554433",
      issue: "Knee Pain",
      registeredOn: "2026-05-16",
    },
  ];

  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: "name",
      header: "Patient Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{row.original.name}</span>
          <span className="text-xs text-slate-500">ID: {row.original.id}</span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col text-sm">
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {row.original.phone}</span>
          {row.original.email && <span className="flex items-center gap-1 text-slate-500"><Mail className="h-3 w-3" /> {row.original.email}</span>}
        </div>
      ),
    },
    {
      accessorKey: "adhar",
      header: "Adhar",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.adhar}</span>,
    },
    {
      accessorKey: "issue",
      header: "Current Issue",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
          {row.original.issue}
        </Badge>
      ),
    },
    {
      accessorKey: "registeredOn",
      header: "Registered",
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <Button variant="ghost" size="sm" className="text-blue-600">
          View History
        </Button>
      ),
    },
  ];

  const patientFields: FieldConfig[] = [
    {
      name: "name",
      label: "Name of Patient",
      type: "text",
      required: true,
      placeholder: "Full Name",
      width: "half",
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      required: true,
      placeholder: "10-digit mobile number",
      width: "half",
    },
    {
      name: "email",
      label: "Email (Optional)",
      type: "email",
      placeholder: "email@example.com",
      width: "half",
    },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      required: true,
      options: [
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
      ],
      width: "half",
    },
    {
      name: "adhar",
      label: "Adhar Number",
      type: "text",
      required: true,
      placeholder: "1234 5678 9012",
      width: "half",
    },
    {
      name: "age",
      label: "Age",
      type: "number",
      required: true,
      placeholder: "Years",
      width: "half",
    },
    {
      name: "address",
      label: "Full Address",
      type: "textarea",
      required: true,
      placeholder: "Street, House No, City, Zip",
    },
    {
      name: "emergencyContact",
      label: "Emergency Contact Info",
      type: "text",
      required: true,
      placeholder: "Name (Relationship): Phone",
    },
    {
      name: "issue",
      label: "Issue (Disease) and Symptoms",
      type: "textarea",
      required: true,
      placeholder: "Describe the primary complaint...",
    },
    {
      name: "notes",
      label: "Additional Notes",
      type: "textarea",
      placeholder: "Any other observations...",
    },
  ];

  const handleAddPatient = (data: any) => {
    console.log("Adding patient:", data);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Management</h1>
          <p className="text-slate-500">Register and manage clinic patients</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50/50 border-blue-100 shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">TOTAL PATIENTS</p>
                <p className="text-xl font-bold text-slate-900">1,248</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-100 shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">VISITED TODAY</p>
                <p className="text-xl font-bold text-slate-900">42</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50/50 border-orange-100 shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">PENDING VISITS</p>
                <p className="text-xl font-bold text-slate-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50/50 border-indigo-100 shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">NEW REGISTERED</p>
                <p className="text-xl font-bold text-slate-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Patient Records</CardTitle>
          <CardDescription>Search and manage existing patient data</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={mockPatients} 
            searchColumn="name"
            searchPlaceholder="Search by name..."
          />
        </CardContent>
      </Card>

      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddPatient}
        title="Register New Patient"
        fields={patientFields}
        saveButtonText="Register Patient"
        size="lg"
      />
    </div>
  );
}
