"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Clock,
  Download,
  AlertCircle,
} from "lucide-react";
import { DoctorForm } from "./doctorForm";
import { Label } from "@/components/ui/label";

interface Doctor {
  id: string;
  name: string;
  qualification: string;
  registrationNumber: string;
  phoneNumber: string;
  email: string;
  unit: "morning" | "evening" | "rotational";
  salary: string;
  isActive: boolean;
  government: boolean;
  adjunct: boolean;
  lastUpdated: string;
}

const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    qualification: "MD, Cardiology",
    registrationNumber: "REG-123456",
    phoneNumber: "+1 (555) 123-4567",
    email: "sarah.johnson@clinic.com",
    unit: "morning",
    salary: "$120,000",
    isActive: true,
    government: false,
    adjunct: true,
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    qualification: "MBBS, Orthopedics",
    registrationNumber: "REG-789012",
    phoneNumber: "+1 (555) 987-6543",
    email: "michael.chen@clinic.com",
    unit: "evening",
    salary: "$95,000",
    isActive: true,
    government: true,
    adjunct: false,
    lastUpdated: "2024-01-10",
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    qualification: "MD, Pediatrics",
    registrationNumber: "REG-345678",
    phoneNumber: "+1 (555) 456-7890",
    email: "emily.rodriguez@clinic.com",
    unit: "rotational",
    salary: "$110,000",
    isActive: false,
    government: false,
    adjunct: false,
    lastUpdated: "2024-01-05",
  },
  {
    id: "4",
    name: "Dr. Robert Wilson",
    qualification: "MD, Neurology",
    registrationNumber: "REG-901234",
    phoneNumber: "+1 (555) 234-5678",
    email: "robert.wilson@clinic.com",
    unit: "morning",
    salary: "$130,000",
    isActive: true,
    government: false,
    adjunct: true,
    lastUpdated: "2024-01-12",
  },
  {
    id: "5",
    name: "Dr. Lisa Wang",
    qualification: "MBBS, Dermatology",
    registrationNumber: "REG-567890",
    phoneNumber: "+1 (555) 345-6789",
    email: "lisa.wang@clinic.com",
    unit: "evening",
    salary: "$105,000",
    isActive: true,
    government: false,
    adjunct: false,
    lastUpdated: "2024-01-08",
  },
];

interface DoctorTableProps {
  showDeactivated?: boolean;
}

export function DoctorTable({ showDeactivated = false }: DoctorTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isQuickEditDialogOpen, setIsQuickEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterUnit, setFilterUnit] = useState<string>("all");

  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterUnit === "all" || doctor.unit === filterUnit;
    
    if (showDeactivated) {
      return !doctor.isActive && matchesSearch && matchesFilter;
    }
    
    return doctor.isActive && matchesSearch && matchesFilter;
  });

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsEditDialogOpen(true);
  };

  const handleQuickEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsQuickEditDialogOpen(true);
  };

  const handleDelete = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsViewDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedDoctor(null);
    setIsAddDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    console.log("Deleting doctor:", selectedDoctor?.name);
    setIsDeleteDialogOpen(false);
    // Add your delete logic here
  };

  const handleExport = () => {
    // Export logic here
    console.log("Exporting doctors data");
  };

  const handleFormSubmit = (data: unknown) => {
    console.log("Form submitted:", data);
    if (isAddDialogOpen) {
      console.log("Adding new doctor");
      setIsAddDialogOpen(false);
    } else if (isEditDialogOpen) {
      console.log("Updating doctor:", selectedDoctor?.name);
      setIsEditDialogOpen(false);
    } else if (isQuickEditDialogOpen) {
      console.log("Quick updating doctor:", selectedDoctor?.name);
      setIsQuickEditDialogOpen(false);
    }
  };

  const unitColors = {
    morning: "bg-blue-100 text-blue-800",
    evening: "bg-purple-100 text-purple-800",
    rotational: "bg-amber-100 text-amber-800",
  };

  const renderDoctorViewDetails = () => {
    if (!selectedDoctor) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl font-bold">
              {selectedDoctor.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{selectedDoctor.name}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant={selectedDoctor.isActive ? "default" : "destructive"}>
                {selectedDoctor.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline" className={unitColors[selectedDoctor.unit]}>
                {selectedDoctor.unit.charAt(0).toUpperCase() + selectedDoctor.unit.slice(1)}
              </Badge>
              {selectedDoctor.government && (
                <Badge variant="secondary">Government</Badge>
              )}
              {selectedDoctor.adjunct && (
                <Badge variant="outline">Adjunct</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Professional Details</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-500">Qualification</Label>
                  <p className="font-medium">{selectedDoctor.qualification}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Registration Number</Label>
                  <p className="font-medium">{selectedDoctor.registrationNumber}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Salary</Label>
                  <p className="font-medium">{selectedDoctor.salary}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <p className="font-medium">{selectedDoctor.phoneNumber}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <p className="font-medium">{selectedDoctor.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <p className="font-medium">
                    Last Updated: {selectedDoctor.lastUpdated}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {showDeactivated ? "Deactivated Doctors" : "Active Doctors"}
          </h2>
          <p className="text-gray-500">
            {filteredDoctors.length} doctors found
          </p>
        </div>
        
        {!showDeactivated && (
          <Button onClick={handleAdd}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Doctor
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search doctors by name, registration, or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter by Unit
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterUnit("all")}>
                All Units
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterUnit("morning")}>
                Morning
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterUnit("evening")}>
                Evening
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterUnit("rotational")}>
                Rotational
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center space-y-2">
                    <AlertCircle className="h-8 w-8" />
                    <p>No doctors found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{doctor.name}</span>
                      <span className="text-sm text-gray-500">{doctor.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{doctor.registrationNumber}</span>
                      <span className="text-sm text-gray-500">{doctor.qualification}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={unitColors[doctor.unit]}>
                      {doctor.unit.charAt(0).toUpperCase() + doctor.unit.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{doctor.salary}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {doctor.isActive ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          <span>Inactive</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{doctor.lastUpdated}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleView(doctor)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {!showDeactivated && (
                          <>
                            <DropdownMenuItem onClick={() => handleEdit(doctor)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Full Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickEdit(doctor)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Quick Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(doctor)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Doctor
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Doctor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>
              Fill in all required fields to add a new doctor to the system.
            </DialogDescription>
          </DialogHeader>
          <DoctorForm
            onSubmit={handleFormSubmit}
            mode="add"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Doctor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} >
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Doctor - {selectedDoctor?.name}</DialogTitle>
            <DialogDescription>
              Update doctor information. All fields are editable.
            </DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <DoctorForm
              initialData={{
                name: selectedDoctor.name,
                qualification: selectedDoctor.qualification,
                registrationNumber: selectedDoctor.registrationNumber,
                phoneNumber: selectedDoctor.phoneNumber,
                experience:0,
                salary: selectedDoctor.salary,
                unit: selectedDoctor.unit,
                email: selectedDoctor.email,
                password: "",
                joiningDate:"",
                gender: "male",
                government: selectedDoctor.government,
                adjunct: selectedDoctor.adjunct,
                address: "",
                consultationFee: "",
                availabilityDays: [],
                documents: [],
                workingHours: {
                start: "",
                end: "",
},
                isActive: selectedDoctor.isActive,
              }}
              onSubmit={handleFormSubmit}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Edit Dialog */}
      <Dialog open={isQuickEditDialogOpen} onOpenChange={setIsQuickEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quick Edit - {selectedDoctor?.name}</DialogTitle>
            <DialogDescription>
              Update frequently changed fields. Password updates will trigger an email notification.
            </DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <DoctorForm
              initialData={{
                name: selectedDoctor.name,
                qualification: selectedDoctor.qualification,
                registrationNumber: selectedDoctor.registrationNumber,
                phoneNumber: selectedDoctor.phoneNumber,
                experience: 0,
                salary: selectedDoctor.salary,
                unit: selectedDoctor.unit,
                email: selectedDoctor.email,
                password: "",
                gender: "male",
                joiningDate:"",
                government: selectedDoctor.government,
                adjunct: selectedDoctor.adjunct,
                address: "",
                consultationFee: "",
                availabilityDays: [],
                documents: [],
                workingHours: {
  start: "",
  end: "",
},
                isActive: selectedDoctor.isActive,
              }}
              onSubmit={handleFormSubmit}
              mode="edit"
              isQuickEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Doctor Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Doctor Details</DialogTitle>
            <DialogDescription>
              View complete doctor information
            </DialogDescription>
          </DialogHeader>
          {renderDoctorViewDetails()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedDoctor) handleEdit(selectedDoctor);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Doctor</DialogTitle>
            <DialogDescription className="space-y-2">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Warning: This action cannot be undone</span>
              </div>
              <p>
                Are you sure you want to remove{" "}
                <span className="font-semibold">{selectedDoctor?.name}</span>?
              </p>
              <p className="text-sm">
                The doctor will be marked as &quot;Researched&quot; and moved to deactivated doctors list.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Remove Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
