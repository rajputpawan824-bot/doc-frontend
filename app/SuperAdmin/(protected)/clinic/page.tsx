"use client";

import { useState, FormEvent, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/reusable/data-table";
import DeleteModal from "@/components/ui/delete-modal";
import ReusableModal, {
  FormSection,
  FieldConfig,
} from "@/components/reusable/reusable-modal";
import {
  Building,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Bed,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api";
import {
  ClinicFields,
  ClinicResponse,
  ClinicFormData,
  useAddClinic,
  useUpdateClinic,
  useDeleteClinic,
} from "@/lib/validations/SuperAdmin/clinic";

import { toast } from "sonner"; // or your preferred toast library

const hospitalColors = {
  primary: "#1a73e8",
  secondary: "#0ea5e9",
  accent: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  teal: "#0d9488",
};
export default function ClinicsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<ClinicFields | null>(
    null
  );
  const queryClient = useQueryClient();
  const columns: ColumnDef<ClinicFields>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(value) =>
            table.toggleAllPageRowsSelected(!!value.target.checked)
          }
          className="h-4 w-4 rounded border-gray-300"
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(value) => row.toggleSelected(!!value.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "clinicName",
      header: "Clinic Info",
      cell: ({ row }) => {
        const clinic = row.original;
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${hospitalColors.primary}15` }}
            >
              <Building
                className="w-5 h-5"
                style={{ color: hospitalColors.primary }}
              />
            </div>
            <div>
              <div className="font-semibold text-slate-800">
                {clinic.clinicName}
              </div>
              <div className="text-sm text-slate-500">{clinic.type}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "adminName",
      header: "Contact",
      cell: ({ row }) => {
        const clinic = row.original;
        return (
          <div>
            <div className="font-medium text-slate-800">{clinic.adminName}</div>
            <div className="text-sm text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3" /> {clinic.email}
            </div>
            <div className="text-sm text-slate-500 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {clinic.phone}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const clinic = row.original;
        return (
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4" />
            {clinic.location}
          </div>
        );
      },
    },
    {
      accessorKey: "subscription",
      header: "Subscription",
      cell: ({ row }) => {
        const clinic = row.original;
        const getSubscriptionColor = () => {
          switch (clinic.subscription) {
            case "Premium":
              return "bg-blue-100 text-blue-800";
            case "Enterprise":
              return "bg-green-100 text-green-800";
            case "Standard":
              return "bg-purple-100 text-purple-800";
            default:
              return "bg-slate-100 text-slate-800";
          }
        };

        return (
          <div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getSubscriptionColor()}`}
            >
              {clinic.subscription}
            </span>
            <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
              <Calendar className="w-3 h-3" />
              Expires:{" "}
              {new Date(clinic.subsValidity).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        );
      },
    },
    // {
    //   accessorKey: "status",
    //   header: "Status",
    //   cell: ({ row }) => {
    //     const clinic = row.original;
    //     const getStatusConfig = () => {
    //       switch (clinic.status) {
    //         case "active":
    //           return { color: "text-green-700", bg: "bg-green-500" };
    //         case "expiring":
    //           return { color: "text-yellow-700", bg: "bg-yellow-500" };
    //         case "expired":
    //           return { color: "text-red-700", bg: "bg-red-500" };
    //         default:
    //           return { color: "text-slate-700", bg: "bg-slate-500" };
    //       }
    //     };

    //     const config = getStatusConfig();

    //     return (
    //       <div className="flex items-center gap-2">
    //         <div className={`w-2 h-2 rounded-full ${config.bg}`} />
    //         <span className={`font-medium ${config.color}`}>
    //           {clinic.status.charAt(0).toUpperCase() + clinic.status.slice(1)}
    //         </span>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   accessorKey: "beds",
    //   header: "Capacity",
    //   cell: ({ row }) => {
    //     const clinic = row.original;
    //     return (
    //       <div>
    //         <div className="font-semibold text-slate-800 flex items-center gap-1">
    //           <Bed className="w-4 h-4" />
    //           {clinic.beds || 0} Beds
    //         </div>
    //         <div className="text-sm text-slate-500 flex items-center gap-1">
    //           <Users className="w-4 h-4" />
    //           {clinic.doctors || 0} Doctors
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const clinic = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-blue-50 hover:scale-105 transition-transform"
              onClick={() => handleEdit(clinic)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-green-50 hover:scale-105 transition-transform"
              style={{ borderColor: hospitalColors.accent }}
              onClick={() => handleEdit(clinic)}
            >
              <Edit
                className="w-4 h-4"
                style={{ color: hospitalColors.accent }}
              />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-red-50 hover:scale-105 transition-transform"
              style={{ borderColor: hospitalColors.danger }}
              onClick={() => handleDelete(clinic)}
            >
              <Trash2
                className="w-4 h-4"
                style={{ color: hospitalColors.danger }}
              />
            </Button>
          </div>
        );
      },
    },
  ];
  const clinicFormSections: FormSection[] = [
    {
      title: "Clinic Information",
      icon: <Building className="w-4 h-4" />,
      fields: [
        {
          name: "clinicName",
          label: "Clinic Name",
          type: "text",
          required: true,
          placeholder: "Enter clinic name",
          width: "full",
          validation: {
            minLength: 3,
            maxLength: 100,
          },
        },
        {
          name: "type",
          label: "Clinic Type",
          type: "select",
          width: "half",
          required: true,
          options: [
            { value: "General Hospital", label: "General Hospital" },
            { value: "Specialty Hospital", label: "Specialty Hospital" },
            { value: "Clinic", label: "Clinic" },
            { value: "Diagnostic Center", label: "Diagnostic Center" },
            { value: "Surgical Center", label: "Surgical Center" },
            { value: "Rehabilitation Center", label: "Rehabilitation Center" },
          ],
        },
        {
          name: "location",
          label: "Location",
          type: "text",
          required: true,
          placeholder: "City, State",
          width: "half",
          validation: {
            minLength: 2,
          },
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          placeholder: "Enter clinic description",
          rows: 3,
          width: "full",
        },
      ],
    },
    {
      title: "Admin Information",
      fields: [
        {
          name: "adminName",
          label: "Admin Name",
          type: "text",
          required: true,
          placeholder: "Full name",
          width: "half",
          validation: {
            minLength: 2,
          },
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          required: true,
          placeholder: "admin@clinic.com",
          width: "half",
          validation: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          },
        },
        {
          name: "phone",
          label: "Phone",
          type: "tel",
          required: true,
          placeholder: "+1 (555) 123-4567",
          width: "half",
          validation: {
            pattern: /^[\+]?[1-9][\d]{0,15}$/,
          },
        },
        {
          name: "website",
          label: "Website",
          type: "text",
          placeholder: "https://example.com",
          width: "half",
          validation: {
            pattern:
              /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
          },
        },
      ],
    },
    {
      title: "Subscription",
      fields: [
        {
          name: "subsValidity",
          label: "Subscription Validity",
          type: "date",
          required: true,
          width: "full",
          // min: new Date().toISOString().split("T")[0],
        },
        {
          name: "subscription",
          label: "Subscription Plan",
          type: "select",
          width: "full",
          options: [
            { value: "Basic", label: "Basic" },
            { value: "Standard", label: "Standard" },
            { value: "Premium", label: "Premium" },
            { value: "Enterprise", label: "Enterprise" },
          ],
        },
      ],
    },
  ];
  // Fetch clinics using React Query

  const {
    data: clinics = [],
    isLoading: isLoadingClinics,
    error: fetchError,
  } = useQuery({
    queryKey: ["clinics"],
    queryFn: async () => {
      try {
        const response = await clientApi.get<unknown>(
          "/admins/all-admins?status=active&page=1&limit=100"
        ) as Record<string, unknown>;
        const rawClinics = (response?.data as Record<string, unknown>)?.data || response?.data || [];
        return (rawClinics as Record<string, unknown>[]).map((c) => ({
          id: (c.id || c._id || Math.random().toString()) as string,
          clinicName: (c.clinic as Record<string, string>)?.clinicName || c.clinicName || "Unknown",
          type: (c.clinic as Record<string, string>)?.type || c.type || "Clinic",
          adminName: c.name || c.adminName || "Unknown",
          email: c.email || "",
          phone: c.phone || "N/A",
          location: (c.clinic as Record<string, string>)?.location || c.location || "Unknown",
          subscription: c.subscription || "Standard",
          subsValidity: (c.clinic as Record<string, string>)?.subsValidity || c.subsValidity || new Date().toISOString(),
          status: c.isActive ? "active" : "inactive",
          isActive: c.isActive as boolean,
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || new Date().toISOString(),
        })) as ClinicFields[];
      } catch (error) {
        console.error("Error fetching clinics:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Add clinic mutation
  const { mutate: addClinic, isPending: isAddingClinic } = useAddClinic({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      toast.success("Clinic added successfully");
      setIsClinicModalOpen(false);
      setSelectedClinic(null);
    },
    onError: (error) => {
      toast.error("Failed to add clinic");
      console.error("Add clinic error:", error);
    },
  });

  // Update clinic mutation
  const { mutate: updateClinic, isPending: isUpdatingClinic } = useUpdateClinic(
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["clinics"] });
        toast.success("Clinic updated successfully");
        setIsClinicModalOpen(false);
        setSelectedClinic(null);
      },
      onError: (error) => {
        toast.error("Failed to update clinic");
        console.error("Update clinic error:", error);
      },
    }
  );

  // Delete clinic mutation
  const { mutate: deleteClinic, isPending: isDeletingClinic } = useDeleteClinic(
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["clinics"] });
        toast.success("Clinic deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedClinic(null);
      },
      onError: (error) => {
        toast.error("Failed to delete clinic");
        console.error("Delete clinic error:", error);
      },
    }
  );

  const handleDelete = (clinic: ClinicFields) => {
    setSelectedClinic(clinic);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedClinic?.id) {
      deleteClinic(selectedClinic.id);
    }
  };

  const handleEdit = (clinic: ClinicFields) => {
    setSelectedClinic(clinic);
    setIsClinicModalOpen(true);
  };

  const handleAddClinic = () => {
    setSelectedClinic(null);
    setIsClinicModalOpen(true);
  };

  // Prepare initial data for modal when editing
  const getInitialData = () => {
    if (!selectedClinic) return {};

    return {
      clinicName: selectedClinic.clinicName,
      type: selectedClinic.type,
      location: selectedClinic.location,
      adminName: selectedClinic.adminName,
      email: selectedClinic.email,
      phone: selectedClinic.phone,
      subscription: selectedClinic.subscription,
      subsValidity: selectedClinic.subsValidity?.split("T")[0], // Format date for input
      description: selectedClinic.description || "",
      website: selectedClinic.website || "",
    };
  };

  // Handle form submission
  const handleFormSubmit = (formData: Record<string, unknown>) => {
    // Format the data properly
    const clinicData: ClinicFormData = {
      clinicName: String(formData.clinicName || ""),
      type: String(formData.type || ""),
      adminName: String(formData.adminName || ""),
      email: String(formData.email || ""),
      phone: String(formData.phone || ""),
      location: String(formData.location || ""),
      subscription: String(formData.subscription || ""),
      subsValidity: String(formData.subsValidity || ""),
      description: String(formData.description || ""),
      website: String(formData.website || ""),
    };

    if (selectedClinic) {
      // Update existing clinic
      updateClinic({
        id: selectedClinic.id,
        ...clinicData,
      });
    } else {
      // Add new clinic
      addClinic(clinicData);
    }
  };

  // ... (columns definition remains the same) ...

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Clinic Management
          </h1>
          <p className="text-slate-600">
            Manage healthcare facilities and their information
          </p>
        </div>
        <Button
          onClick={handleAddClinic}
          className="hover:scale-105 transition-transform"
          style={{
            background: `linear-gradient(135deg, ${hospitalColors.primary}, ${hospitalColors.secondary})`,
          }}
          disabled={isAddingClinic || isUpdatingClinic}
        >
          {isAddingClinic ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add New Clinic
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className="border-0 shadow-lg"
          style={{ borderLeft: `4px solid ${hospitalColors.primary}` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Clinics</p>
                <p className="text-2xl font-bold text-slate-800">
                  {clinics.length}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${hospitalColors.primary}15` }}
              >
                <Building
                  className="w-6 h-6"
                  style={{ color: hospitalColors.primary }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-lg"
          style={{ borderLeft: `4px solid ${hospitalColors.accent}` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-2xl font-bold text-slate-800">
                  {clinics.filter((c) => c.status === "active").length}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${hospitalColors.accent}15` }}
              >
                <div className="w-6 h-6 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-lg"
          style={{ borderLeft: `4px solid ${hospitalColors.warning}` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-slate-800">
                  {clinics.filter((c) => c.status === "expiring").length}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${hospitalColors.warning}15` }}
              >
                <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-lg"
          style={{ borderLeft: `4px solid ${hospitalColors.danger}` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Expired</p>
                <p className="text-2xl font-bold text-slate-800">
                  {clinics.filter((c) => c.status === "expired").length}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${hospitalColors.danger}15` }}
              >
                <div className="w-6 h-6 rounded-full bg-red-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinics Table */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">
            Healthcare Facilities
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clinics by name, location, or admin..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            Showing {filteredClinics.length} of {clinics.length} clinics
          </p>
        </CardHeader>
        <CardContent>
          <CardContent>
            {isLoadingClinics ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto" />
                  <p className="mt-3 text-gray-600">Loading clinics...</p>
                </div>
              </div>
            ) : fetchError ? (
              <div className="flex flex-col items-center justify-center py-20 text-red-600">
                <p className="font-medium">
                  Failed to load clinics. Please try again.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    queryClient.invalidateQueries({ queryKey: ["clinics"] })
                  }
                >
                  Retry
                </Button>
              </div>
            ) : filteredClinics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                <Building className="w-12 h-12 mb-3 opacity-50" />
                <p className="font-medium">No clinics found</p>
                <p className="text-sm mt-1">
                  Try adjusting your search or add a new clinic.
                </p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredClinics}
                searchColumn="clinicName"
                searchPlaceholder="Search clinics..."
              />
            )}
          </CardContent>
        </CardContent>
      </Card>

      {/* Modals */}
        <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Clinic"
        description="Are you sure you want to delete this clinic? This action cannot be undone."
        data={
          selectedClinic
            ? {
                Name: selectedClinic.clinicName,
                Type: selectedClinic.type,
                Location: selectedClinic.location,
                Admin: selectedClinic.adminName,
              }
            : {}
        }
        isLoading={isDeletingClinic}
      />

      {/* Reusable Modal for Clinic Form */}
      <ReusableModal
        isOpen={isClinicModalOpen}
        onClose={() => {
          setIsClinicModalOpen(false);
          setSelectedClinic(null);
        }}
        onSave={handleFormSubmit}
        title={selectedClinic ? "Edit Clinic" : "Add New Clinic"}
        initialData={getInitialData()}
        isEdit={!!selectedClinic}
        sections={clinicFormSections}
        size="lg"
        saveButtonText={
          selectedClinic
            ? isUpdatingClinic
              ? "Updating..."
              : "Update Clinic"
            : isAddingClinic
            ? "Creating..."
            : "Create Clinic"
        }
        cancelButtonText="Cancel"
        saveButtonColor={`linear-gradient(135deg, ${hospitalColors.primary}, ${hospitalColors.secondary})`}
        validationOnChange={true}
      />
    </div>
  );
}
