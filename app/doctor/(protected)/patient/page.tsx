// app/patients/page.tsx
"use client";

import { useState, useEffect } from "react";

import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { usePatients, useUpdatePatient } from "@/services/admin/patient";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label"; // Add this import

import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Users,
  Download,
  Filter,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  AlertCircle,
  Briefcase,
  Stethoscope,
  Lock,
  Save,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  X,
  Upload,
  FileText,
  Sparkles,
} from "lucide-react";

// ==================== TYPES & SCHEMAS ====================
export interface Patient {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;

  gender?: "MALE" | "FEMALE" | "OTHER";
  age?: number;
  address?: string;

  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  adhar?: string;

  medicalHistory?: string;
  allergies?: string[];

  bloodGroup?:
    | "A+"
    | "A-"
    | "B+"
    | "B-"
    | "AB+"
    | "AB-"
    | "O+"
    | "O-";

  occupation?: string;

  adher?: "excellent" | "good" | "fair" | "poor";

  createdAt?: Date;
  updatedAt?: Date;

  updatedBy?: string;
  status?: "ACTIVE" | "INACTIVE";
patientCode?: string;
relation?: string;
otherRelation?: string;
diseases?: string[];
medicalReports?: any[];
dateOfBirth?: Date;
}

const patientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phoneNumber: z.string().min(10, "Please enter a valid phone number").max(15),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
gender: z.enum([
  "MALE",
  "FEMALE",
  "OTHER",
]),
  age: z.coerce
    .number()
    .min(0, "Age must be positive")
    .max(120, "Please enter a valid age"),
  address: z.string().min(5, "Please enter a complete address").max(500),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z
    .string()
    .min(10, "Please enter a valid phone number"),
  emergencyContactRelationship: z.string().min(1, "Relationship is required"),
  adhar: z.string().min(12, "Adhar must be 12 digits").max(12),
  adher: z.enum(["excellent", "good", "fair", "poor"]).optional(),
  medicalHistory: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  occupation: z.string().optional(),
  generatePassword: z.boolean().default(true),
  customPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

type PatientFormValues = z.input<typeof patientFormSchema>;

// ==================== TABLE COLUMNS ====================
const columns: ColumnDef<Patient>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Patient Name",
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">{patient.name}</p>
            <p className="text-sm text-gray-500">ID: {patient.id}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "contact",
    header: "Contact Information",
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-gray-500" />
            <span className="text-sm">{patient.phoneNumber}</span>
          </div>
          {patient.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 text-gray-500" />
              <span className="text-sm text-gray-600">{patient.email}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "age",
    header: "Age / Gender",
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{patient.age ?? "-"} years</span>
          </div>
          <Badge variant="outline" className="capitalize">
            {patient.gender}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "emergencyContact",
    header: "Emergency Contact",
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="space-y-1">
          <p className="text-sm font-medium">{patient.emergencyContactName}</p>
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-gray-500" />
            <span className="text-sm">{patient.emergencyContactPhone}</span>
          </div>
          <Badge variant="secondary" className="text-xs capitalize">
            {patient.emergencyContactRelationship}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "medicalInfo",
    header: "Medical Information",
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="space-y-1">
          {patient.bloodGroup && (
            <Badge variant="destructive" className="text-xs">
              Blood: {patient.bloodGroup}
            </Badge>
          )}
          {((patient.allergies  ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {(patient.allergies ?? []).map((allergy, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {allergy}
                </Badge>
              ))}
              {(patient.allergies ?? []).length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{(patient.allergies ?? []).length - 2} more
                </Badge>
              )}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "adhar",
    header: "Adhar Number",
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.adhar}</span>,
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-gray-500" />
            <span className="text-sm">
              {patient.updatedAt?.toLocaleDateString() ?? "-"}
            </span>
          </div>
          <p className="text-xs text-gray-500">By: {patient.updatedBy}</p>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Eye className="h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Edit className="h-4 w-4" />
              Edit Patient
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Stethoscope className="h-4 w-4" />
              Medical Notes
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <FileText className="h-4 w-4" />
              Add Prescription
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 flex items-center gap-2 cursor-pointer">
              <Trash2 className="h-4 w-4" />
              Delete Patient
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

// ==================== REUSABLE DATA TABLE ====================
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumn?: string;
  searchPlaceholder?: string;
  emptyMessage?: React.ReactNode;
  onAddNew?: () => void;
  addButtonText?: string;
}

function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn = "name",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  onAddNew,
  addButtonText = "Add New",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const searchColumnObj = searchColumn
    ? table.getColumn(searchColumn)
    : undefined;

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 flex-1 w-full">
          {searchColumnObj && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={
                  (searchColumnObj.getFilterValue() as string) || globalFilter
                }
                onChange={(event) => {
                  searchColumnObj.setFilterValue(event.target.value);
                  setGlobalFilter(event.target.value);
                }}
                className="pl-10"
              />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Settings2 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {onAddNew && (
            <Button onClick={onAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              {addButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination and Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <span>Page</span>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>

          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ==================== PATIENT FORM ====================
interface PatientFormProps {
  patient?: Patient;
  onSave: (data: PatientFormValues) => Promise<void>;
  onCancel: () => void;
  mode: "add" | "edit";
}

function PatientForm({ patient, onSave, onCancel, mode }: PatientFormProps) {
  const [allergies, setAllergies] = useState<string[]>(
    patient?.allergies || []
  );
  const [newAllergy, setNewAllergy] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

// Replace the useForm line with this:
const form = useForm<PatientFormValues>({
  resolver: zodResolver(patientFormSchema) as any,
  defaultValues: patient
    ? {
        name: patient.name,
        phoneNumber: patient.phoneNumber,
        email: patient.email || "",
        gender: patient.gender,
        age: patient.age,
        address: patient.address,
        emergencyContactName: patient.emergencyContactName,
        emergencyContactPhone: patient.emergencyContactPhone,
        emergencyContactRelationship: patient.emergencyContactRelationship,
        adhar: patient.adhar || "",
        // adher: patient.adher,
        medicalHistory: patient.medicalHistory || "",
        allergies: patient.allergies || [],
        bloodGroup: patient.bloodGroup,
        occupation: patient.occupation || "",
        generatePassword: false,
        customPassword: "",
      }
    : {
        name: "",
        phoneNumber: "",
        email: "",
        gender: "MALE",
        age: 0,
        address: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelationship: "",
        adhar: "",
        adher: "good",
        medicalHistory: "",
        allergies: [],
        bloodGroup: undefined,
        occupation: "",
        generatePassword: true,
        customPassword: "",
      },
});

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    return Array.from({ length: 12 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      const updatedAllergies = [...allergies, newAllergy.trim()];
      setAllergies(updatedAllergies);
      form.setValue("allergies", updatedAllergies);
      setNewAllergy("");
    }
  };

  const removeAllergy = (allergyToRemove: string) => {
    const updatedAllergies = allergies.filter(
      (allergy) => allergy !== allergyToRemove
    );
    setAllergies(updatedAllergies);
    form.setValue("allergies", updatedAllergies);
  };

  const onSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true);
    try {
      // Generate password if needed
      const finalData = {
        ...data,
        password: data.generatePassword
          ? generatePassword()
          : data.customPassword || "",
      };
      await onSave(finalData);
    } catch (error) {
      console.error("Failed to save patient:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePasswordField = form.watch("generatePassword");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Patient Name *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Age *
                      </FormLabel>
                      <FormControl>
                       <Input
  type="number"
  placeholder="30"
 value={typeof field.value === "number" ? field.value : ""}
  onChange={(e) => field.onChange(Number(e.target.value))}
/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
<SelectItem value="FEMALE">Female</SelectItem>
<SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Occupation
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Software Engineer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="adhar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Adhar Number *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="1234 5678 9012" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john@example.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Full address including street, city, state, and zip code"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Section 3: Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Emergency Contact
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContactRelationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 987-6543" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 4: Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Medical Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Blood Group
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adherence / Compliance</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select adherence level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Allergies */}
              <div className="space-y-2">
                <Label>Allergies</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add allergy (e.g., Penicillin)"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addAllergy())
                    }
                  />
                  <Button type="button" variant="outline" onClick={addAllergy}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allergies.map((allergy) => (
                    <Badge key={allergy} variant="secondary" className="gap-1">
                      {allergy}
                      <button
                        type="button"
                        onClick={() => removeAllergy(allergy)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="medicalHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical History</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any previous medical conditions, surgeries, or relevant history"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Section 5: Patient Portal Access (Only for new patients) */}
            {mode === "add" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Patient Portal Access
                </h3>

                <FormField
                  control={form.control}
                  name="generatePassword"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Auto-generate Password
                        </FormLabel>
                        <FormDescription>
                          A secure password will be generated and sent to the
                          patient&apos;s email
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!generatePasswordField && (
                  <FormField
                    control={form.control}
                    name="customPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Set Custom Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter custom password"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum 8 characters with letters and numbers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting
              ? "Saving..."
              : mode === "add"
              ? "Add Patient"
              : "Update Patient"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ==================== MAIN PAGE COMPONENT ====================

export default function PatientsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = usePatients({ page, limit, search });
const patients: any[] = data?.data ?? [];
  const pagination = data?.pagination;

  const updatePatientMutation = useUpdatePatient();

  useEffect(() => {
    if (!error) return;
    toast.error("Failed to load patients");
  }, [error]);

  // Doctor cannot create patients (permission)
  const handleAddPatient = async (_formData: PatientFormValues) => {
    toast.error("You are not allowed to add patients");
  };

  const handleEditPatient = async (formData: PatientFormValues) => {
    if (!selectedPatient) return;

    updatePatientMutation.mutate(
      {
        id: selectedPatient.id,
       data: {
    ...formData,
    age: Number(formData.age),
  },
      },
      {
        onSuccess: () => {
          toast.success("Patient updated successfully!");
          setIsEditDialogOpen(false);
          setSelectedPatient(null);
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to update patient");
        },
      }
    );
  };

  const handleDeletePatient = async (_patientId: string) => {
    toast.error("Deleting patients is not supported");
  };

  const filteredPatients = patients.filter((patient) => {
    if (activeTab === "all") return true;
    if (activeTab === "recent") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return patient.updatedAt >= oneMonthAgo;
    }
    if (activeTab === "highRisk") {
      return (
        // patient.adher === "poor" ||
        (patient.allergies ?? []).length > 3 ||
     (patient.age ?? 0) > 60   
      );
    }
    return true;
  });

  return (
    <>
      <Toaster />
      <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Patient Management</h1>
            <p className="text-gray-600">
              Manage {patients.length} patient records
            </p>
          </div>
        </div>

       
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Patients</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">New This Month</p>
                <p className="text-2xl font-bold">
                  {
                    patients.filter((p) => {
                      const now = new Date();
                      const lastMonth = new Date(
                        now.getFullYear(),
                        now.getMonth() - 1,
                        1
                      );
                      return p.createdAt >= lastMonth;
                    }).length
                  }
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Sparkles className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {/* <div>
                <p className="text-sm text-gray-500">High Risk</p>
                <p className="text-2xl font-bold">
                  {patients.filter((p) => p.adher === "poor").length}
                </p>
              </div> */}
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Age</p>
                <p className="text-2xl font-bold">
                  {patients.length > 0
                    ? Math.round(
                        patients.reduce((acc, p) => acc + (p.age ?? 0), 0) /
                          patients.length
                      )
                    : 0}{" "}
                  yrs
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Table */}
      <Card>
        <CardContent className="pt-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">All Patients</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="highRisk">High Risk</TabsTrigger>
              </TabsList>


            </div>

            <TabsContent value={activeTab} className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading patients...</p>
                </div>
              ) : (
                <DataTable<Patient, unknown>
                  columns={columns}
                  data={filteredPatients}
                  searchColumn="name"
                  searchPlaceholder="Search patients by name, phone, or ID..."
                  onAddNew={undefined}
                  addButtonText="Add Patient"

                  emptyMessage={
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No patients found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {activeTab === "all"
                          ? "Get started by adding your first patient"
                          : "No patients match the current filter"}
                      </p>

                    </div>
                  }
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <PatientForm
              patient={selectedPatient}
              mode="edit"
              onSave={handleEditPatient}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedPatient(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}
