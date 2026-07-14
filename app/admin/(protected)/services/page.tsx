// app/features/facility-management/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Ambulance,
  Pill,
  Microscope,
  Radio,
  Clock,
  Bed,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  MapPin,
  Users,
  Settings
} from "lucide-react";
import DataTable from "@/components/reusable/data-table";
import ReusableModal, {
  FormSection,
  FieldConfig,
} from "@/components/reusable/reusable-modal";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
interface ServiceFacility {
  id: string;
  type:
    | "AMBULANCE"
    | "PHARMACY"
    | "PATHOLOGY"
    | "RADIOLOGY"
    | "WORKING_HOURS"
    | "BED_CAPACITY";
  name: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  capacity?: number;
  available?: number;
  workingHours?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    location?: string;
  };
  features?: string[];
  lastUpdated: string;
  createdBy: string;
}

// Mock data
const mockServices: ServiceFacility[] = [
  // Ambulance Services
  {
    id: "1",
    type: "AMBULANCE",
    name: "Emergency Ambulance Unit 1",
    description: "24/7 emergency response unit with advanced life support",
    status: "ACTIVE",
    capacity: 2,
    available: 1,
    contact: {
      phone: "+1234567890",
      location: "Emergency Bay, Ground Floor",
    },
    features: ["ALS Support", "Oxygen", "Defibrillator", "Stretcher"],
    lastUpdated: "2024-01-15",
    createdBy: "Admin User",
  },
  {
    id: "2",
    type: "AMBULANCE",
    name: "Patient Transport Ambulance",
    description: "Non-emergency patient transportation",
    status: "ACTIVE",
    capacity: 3,
    available: 3,
    contact: {
      phone: "+1234567891",
      location: "Transport Bay",
    },
    features: ["Wheelchair Access", "Basic First Aid"],
    lastUpdated: "2024-01-14",
    createdBy: "Admin User",
  },
  // Pharmacy
  {
    id: "3",
    type: "PHARMACY",
    name: "Main Pharmacy",
    description: "24-hour pharmacy with wide range of medicines",
    status: "ACTIVE",
    workingHours: {
      monday: "24 Hours",
      tuesday: "24 Hours",
      wednesday: "24 Hours",
      thursday: "24 Hours",
      friday: "24 Hours",
      saturday: "24 Hours",
      sunday: "24 Hours",
    },
    contact: {
      phone: "+1234567892",
      location: "Ground Floor, Building A",
    },
    lastUpdated: "2024-01-15",
    createdBy: "Admin User",
  },
  // Pathology
  {
    id: "4",
    type: "PATHOLOGY",
    name: "Clinical Laboratory",
    description: "Complete diagnostic laboratory services",
    status: "ACTIVE",
    workingHours: {
      monday: "7:00 AM - 9:00 PM",
      tuesday: "7:00 AM - 9:00 PM",
      wednesday: "7:00 AM - 9:00 PM",
      thursday: "7:00 AM - 9:00 PM",
      friday: "7:00 AM - 9:00 PM",
      saturday: "7:00 AM - 4:00 PM",
      sunday: "Emergency Only",
    },
    contact: {
      phone: "+1234567893",
      email: "lab@hospital.com",
    },
    features: ["Blood Tests", "Urine Analysis", "Microbiology", "Biochemistry"],
    lastUpdated: "2024-01-14",
    createdBy: "Lab Manager",
  },
  // Radiology
  {
    id: "5",
    type: "RADIOLOGY",
    name: "Imaging Center",
    description: "Advanced radiology and imaging services",
    status: "MAINTENANCE",
    workingHours: {
      monday: "8:00 AM - 8:00 PM",
      tuesday: "8:00 AM - 8:00 PM",
      wednesday: "8:00 AM - 8:00 PM",
      thursday: "8:00 AM - 8:00 PM",
      friday: "8:00 AM - 8:00 PM",
      saturday: "9:00 AM - 5:00 PM",
      sunday: "Closed",
    },
    contact: {
      phone: "+1234567894",
      location: "First Floor, Building B",
    },
    features: ["X-Ray", "MRI", "CT Scan", "Ultrasound"],
    lastUpdated: "2024-01-13",
    createdBy: "Radiology Head",
  },
  // Working Hours
  {
    id: "6",
    type: "WORKING_HOURS",
    name: "General OPD Hours",
    description: "Outpatient department working hours",
    status: "ACTIVE",
    workingHours: {
      monday: "8:00 AM - 8:00 PM",
      tuesday: "8:00 AM - 8:00 PM",
      wednesday: "8:00 AM - 8:00 PM",
      thursday: "8:00 AM - 8:00 PM",
      friday: "8:00 AM - 8:00 PM",
      saturday: "8:00 AM - 2:00 PM",
      sunday: "Closed",
    },
    lastUpdated: "2024-01-15",
    createdBy: "Admin User",
  },
  // Bed Capacity
  {
    id: "7",
    type: "BED_CAPACITY",
    name: "ICU Beds",
    description: "Intensive Care Unit bed capacity",
    status: "ACTIVE",
    capacity: 20,
    available: 5,
    lastUpdated: "2024-01-15 14:30:00",
    createdBy: "Nursing Head",
  },
  {
    id: "8",
    type: "BED_CAPACITY",
    name: "General Ward Beds",
    description: "General ward bed capacity",
    status: "ACTIVE",
    capacity: 100,
    available: 35,
    lastUpdated: "2024-01-15 10:15:00",
    createdBy: "Nursing Head",
  },
];

// Service type configurations
const serviceConfigs = {
  AMBULANCE: {
    title: "Ambulance Services",
    icon: Ambulance,
    color: "bg-red-100 text-red-800",
    description: "Emergency and transport ambulance services",
  },
  PHARMACY: {
    title: "Pharmacy",
    icon: Pill,
    color: "bg-green-100 text-green-800",
    description: "Medication dispensing and pharmacy services",
  },
  PATHOLOGY: {
    title: "Pathology Lab",
    icon: Microscope,
    color: "bg-blue-100 text-blue-800",
    description: "Diagnostic laboratory and testing services",
  },
  RADIOLOGY: {
    title: "Radiology",
    icon: Radio,
    color: "bg-purple-100 text-purple-800",
    description: "Medical imaging and radiology services",
  },
  WORKING_HOURS: {
    title: "Working Hours",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800",
    description: "Department working hours and schedules",
  },
  BED_CAPACITY: {
    title: "Bed Capacity",
    icon: Bed,
    color: "bg-indigo-100 text-indigo-800",
    description: "Hospital bed availability and capacity",
  },
};

export default function FacilityManagementPage() {
  const [services, setServices] = useState<ServiceFacility[]>(mockServices);
  const [selectedService, setSelectedService] =
    useState<ServiceFacility | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter services by active tab
  const filteredServices =
    activeTab === "ALL"
      ? services
      : services.filter((service) => service.type === activeTab);

  // Get service stats
  const serviceStats = {
    total: services.length,
    active: services.filter((s) => s.status === "ACTIVE").length,
    inactive: services.filter((s) => s.status === "INACTIVE").length,
    maintenance: services.filter((s) => s.status === "MAINTENANCE").length,
    byType: Object.keys(serviceConfigs).reduce((acc, type) => {
      acc[type] = services.filter((s) => s.type === type).length;
      return acc;
    }, {} as Record<string, number>),
  };

  // Common columns for all service types
  const getServiceColumns = (): ColumnDef<ServiceFacility>[] => [
    {
      accessorKey: "name",
      header: "Service Name",
      cell: ({ row }) => {
        const config =
          serviceConfigs[row.original.type as keyof typeof serviceConfigs];
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.color.split(" ")[0]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-medium">{row.original.name}</div>
              <div className="text-xs text-slate-500">
                {row.original.description?.substring(0, 50)}...
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const config =
          serviceConfigs[row.original.type as keyof typeof serviceConfigs];
        return <Badge className={config.color}>{config.title}</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const statusConfig = {
          ACTIVE: { color: "bg-green-100 text-green-800", icon: CheckCircle },
          INACTIVE: { color: "bg-red-100 text-red-800", icon: XCircle },
          MAINTENANCE: {
            color: "bg-yellow-100 text-yellow-800",
            icon: AlertCircle,
          },
        };
        const config = statusConfig[row.original.status];
        const Icon = config.icon;
        return (
          <Badge className={`${config.color} flex items-center gap-1`}>
            <Icon className="w-3 h-3" />
            {row.original.status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }) => {
        if (row.original.capacity !== undefined) {
          const percentage =
            row.original.available !== undefined
              ? Math.round(
                  (row.original.available / row.original.capacity) * 100
                )
              : 0;

          return (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  {row.original.available || 0}
                </span>
                <span className="text-slate-500">
                  / {row.original.capacity}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-full rounded-full ${
                    percentage > 70
                      ? "bg-green-500"
                      : percentage > 30
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        }
        return <span className="text-slate-400">-</span>;
      },
    },
    {
      accessorKey: "contact",
      header: "Contact/Location",
      cell: ({ row }) => {
        const contact = row.original.contact;
        if (!contact) return <span className="text-slate-400">-</span>;

        return (
          <div className="space-y-1">
            {contact.phone && (
              <div className="flex items-center gap-1 text-sm">
                <Phone className="w-3 h-3" />
                {contact.phone}
              </div>
            )}
            {contact.location && (
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[150px]">
                  {contact.location}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditService(row.original)}
            title="Edit Service"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteConfirm(row.original.id)}
            title="Delete Service"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            // onClick={() => handleToggleStatus(row.original.id)}
            title={row.original.status === "ACTIVE" ? "Deactivate" : "Activate"}
          >
            {row.original.status === "ACTIVE" ? (
              <XCircle className="w-4 h-4 text-orange-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  // Form configurations for each service type
  const getFormSections = (type?: string): FormSection[] => {
    const baseFields: FieldConfig[] = [
      {
        name: "type",
        label: "Service Type",
        type: "select",
        required: true,
        options: Object.entries(serviceConfigs).map(([key, config]) => ({
          value: key,
          label: config.title,
        })),
        disabled: isEditMode,
        width: "half",
      },
      {
        name: "name",
        label: "Service Name",
        type: "text",
        required: true,
        placeholder: "Enter service name",
        width: "half",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter service description",
        width: "full",
        rows: 3,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "ACTIVE", label: "Active" },
          { value: "INACTIVE", label: "Inactive" },
          { value: "MAINTENANCE", label: "Maintenance" },
        ],
        width: "half",
      },
    ];

    // Type-specific fields
    const typeSpecificFields: FieldConfig[] = [];

    if (type === "AMBULANCE" || !type) {
      typeSpecificFields.push(
        {
          name: "capacity",
          label: "Patient Capacity",
          type: "number",
          placeholder: "Number of patients",
          width: "half",
          min: 1,
        },
        {
          name: "available",
          label: "Currently Available",
          type: "number",
          placeholder: "Available units",
          width: "half",
          min: 0,
        }
      );
    }

    if (type === "BED_CAPACITY") {
      typeSpecificFields.push(
        {
          name: "capacity",
          label: "Total Beds",
          type: "number",
          required: true,
          placeholder: "Total number of beds",
          width: "half",
          min: 1,
        },
        {
          name: "available",
          label: "Available Beds",
          type: "number",
          required: true,
          placeholder: "Available beds",
          width: "half",
          min: 0,
        }
      );
    }

    // Contact fields for most services
    if (type !== "WORKING_HOURS" && type !== "BED_CAPACITY") {
      typeSpecificFields.push(
        {
          name: "contact.phone",
          label: "Phone Number",
          type: "tel",
          placeholder: "+1234567890",
          width: "half",
        },
        {
          name: "contact.location",
          label: "Location",
          type: "text",
          placeholder: "Building, Floor, Room",
          width: "half",
        }
      );
    }

    // Working hours fields
    if (
      type === "WORKING_HOURS" ||
      type === "PHARMACY" ||
      type === "PATHOLOGY" ||
      type === "RADIOLOGY"
    ) {
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      days.forEach((day) => {
        const dayLower = day.toLowerCase();
        typeSpecificFields.push({
          name: `workingHours.${dayLower}`,
          label: `${day} Hours`,
          type: "text",
          placeholder: "e.g., 8:00 AM - 8:00 PM",
          width: "half",
          defaultValue: dayLower === "sunday" ? "Closed" : "8:00 AM - 8:00 PM",
        });
      });
    }

    // Features field for some services
    if (type === "AMBULANCE" || type === "PATHOLOGY" || type === "RADIOLOGY") {
      typeSpecificFields.push({
        name: "features",
        label: "Features/Services",
        type: "textarea",
        placeholder: "Enter features separated by commas",
        width: "full",
        rows: 2,
      });
    }

    return [
      {
        title: "Basic Information",
        icon: <Building className="w-4 h-4" />,
        fields: baseFields,
      },
      ...(typeSpecificFields.length > 0
        ? [
            {
              title:
                type === "AMBULANCE"
                  ? "Ambulance Details"
                  : type === "BED_CAPACITY"
                  ? "Bed Details"
                  : type === "WORKING_HOURS"
                  ? "Working Hours"
                  : "Additional Details",
              icon:
                type === "AMBULANCE" ? (
                  <Ambulance className="w-4 h-4" />
                ) : type === "BED_CAPACITY" ? (
                  <Bed className="w-4 h-4" />
                ) : type === "WORKING_HOURS" ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Settings className="w-4 h-4" />
                ),
              fields: typeSpecificFields,
            },
          ]
        : []),
    ];
  };

  // Handler functions
  const handleCreateService = () => {
    setIsEditMode(false);
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service: ServiceFacility) => {
    setSelectedService(service);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSaveService = (data: Partial<ServiceFacility>) => {
    if (isEditMode && selectedService) {
      // Update existing service
      setServices((prev) =>
        prev.map((service) => {
          if (service.id === selectedService.id) {
            const updatedService = {
              ...service,
              ...data,
              lastUpdated: new Date().toISOString().split("T")[0],
            };

            toast.success("Service updated successfully");
            return updatedService;
          }
          return service;
        })
      );
    } else {
      // Create new service
      // const newService: ServiceFacility = {
      //   id: Date.now().toString(),
      //   ...data,
      //   lastUpdated: new Date().toISOString().split("T")[0],
      //   createdBy: "Admin User",
      // };

    //   setServices((prev) => [newService, ...prev]);
    //   toast.success("Service created successfully");
    // }

    setIsModalOpen(false);
  };

  const handleDeleteService = (serviceId: string) => {
    setServices((prev) => prev.filter((service) => service.id !== serviceId));
    setDeleteConfirm(null);
    toast.success("Service deleted successfully");
  };

  const handleToggleStatus = (serviceId: string) => {
    setServices((prev) =>
      prev.map((service) => {
        if (service.id === serviceId) {
          const newStatus = service.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
          toast.success(`Service ${newStatus.toLowerCase()}d`);
          return {
            ...service,
            status: newStatus,
            lastUpdated: new Date().toISOString().split("T")[0],
          };
        }
        return service;
      })
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Services & Facility Management
          </h1>
          <p className="text-slate-600 mt-1">
            Manage hospital services, facilities, working hours, and capacities
          </p>
        </div>
        <Button
          onClick={handleCreateService}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Total Services</p>
                <p className="text-2xl font-bold">{serviceStats.total}</p>
              </div>
              <Building className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Active Services</p>
                <p className="text-2xl font-bold text-green-600">
                  {serviceStats.active}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">In Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {serviceStats.maintenance}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Total Bed Capacity</p>
                <p className="text-2xl font-bold">
                  {services
                    .filter((s) => s.type === "BED_CAPACITY")
                    .reduce((sum, bed) => sum + (bed.capacity || 0), 0)}
                </p>
              </div>
              <Bed className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Service Types Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(serviceConfigs).map(([type, config]) => {
              const Icon = config.icon;
              const count = serviceStats.byType[type] || 0;
              return (
                <div
                  key={type}
                  className="text-center p-4 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => setActiveTab(type)}
                >
                  <div
                    className={`inline-flex p-3 rounded-full ${
                      config.color.split(" ")[0]
                    } mb-3`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{config.title}</h3>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-slate-500 mt-1">services</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Service Types */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-7 w-full">
          <TabsTrigger value="ALL">All Services</TabsTrigger>
          {Object.entries(serviceConfigs).map(([type, config]) => {
            const Icon = config.icon;
            const count = serviceStats.byType[type] || 0;
            return (
              <TabsTrigger
                key={type}
                value={type}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {config.title}
                <Badge variant="secondary" className="ml-1">
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {activeTab === "ALL"
                  ? "All Services"
                  : serviceConfigs[activeTab as keyof typeof serviceConfigs]
                      ?.title}
              </CardTitle>
              <div className="text-sm text-slate-500">
                {filteredServices.length} services found
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={getServiceColumns()}
                data={filteredServices}
                searchColumn="name"
                searchPlaceholder={`Search ${
                  activeTab === "ALL"
                    ? "services"
                    : serviceConfigs[
                        activeTab as keyof typeof serviceConfigs
                      ]?.title.toLowerCase()
                }...`}
                emptyMessage="No services found."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Service Modal
      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveService}
        title={isEditMode ? "Edit Service" : "Add New Service"}
        sections={getFormSections(selectedService?.type)}
        initialData={selectedService || {}}
        isEdit={isEditMode}
        size="xl"
        saveButtonText={isEditMode ? "Update Service" : "Create Service"}
        cancelButtonText="Cancel"
        validationOnChange={true}
      /> */}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Confirm Deletion
              </h3>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-4">
                Are you sure you want to delete this service? This action cannot
                be undone.
              </p>
              <div className="bg-slate-50 p-4 rounded-md mb-4">
                <p className="font-medium">
                  {services.find((s) => s.id === deleteConfirm)?.name}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {services.find((s) => s.id === deleteConfirm)?.type}
                </p>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteService(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Service
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}}
