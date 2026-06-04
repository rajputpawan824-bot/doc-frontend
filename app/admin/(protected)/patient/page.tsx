'use client';

import { useState, useEffect, ReactNode } from 'react';
import { 
  Users, 
  UserPlus, 
  UserCog, 
  FileText,
  File,
  FileUp,
  Search,
  RefreshCw,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Droplets,
  Stethoscope,
  Shield,
  User,
  Heart,
  AlertCircle,
  Download,
  Eye,
  Trash2,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ReusableModal, { FormSection, FieldConfig, ReusableFormData } from '@/components/reusable/reusable-modal';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  useAddPatient, 
  usePatients, 
  useUpdatePatientStatus 
} from '@/services/admin/patient';

// ==================== TYPES AND ENUMS ====================
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-'
}

export enum PatientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FOLLOW_UP = 'FOLLOW_UP',
  DISCHARGED = 'DISCHARGED'
}

export interface Patient {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  password?: string;
  gender: Gender;
  adhar: string;
  address: string;
  emergencyContact?: string;
  dateOfBirth?: Date;
  age?: number;
  bloodGroup?: BloodGroup;
  status: PatientStatus;
  medicalNotes: MedicalNote[];
  medicalReports: MedicalReport[];
  relation?: "SELF" | "FATHER" | "MOTHER" | "CHILD" | "SPOUSE" | "OTHER";
diseases?: string[] | string;
  user?: {
    isActive: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  lastPasswordUpdate?: Date;
  patientId: string; // Unique patient ID
}

export interface MedicalNote {
  id: string;
  patientId: string;
  doctorName: string;
  notes: string;
  date: Date;
  createdAt: Date;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string;
  uploadedBy: string;
  uploadedAt: Date;
  downloadUrl?: string;
}

export interface PatientFormData {
  name: string;
  phoneNumber: string;
  email?: string;
  gender: Gender;
  adhar: string;
  address: string;
  emergencyContact?: string;
  dateOfBirth?: string;
  age?: number;
  bloodGroup?: BloodGroup;
}

interface PaginatedPatientTableProps {
  columns: ColumnDef<Patient>[];
  data: Patient[];
  emptyMessage: ReactNode;
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function PaginatedPatientTable({
  columns,
  data,
  emptyMessage,
  currentPage,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
}: PaginatedPatientTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <span>Page</span>
            <strong>
              {currentPage} of {totalPages}
            </strong>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>

          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
          >
            {[10, 20, 30, 50, 100].map((pageSize) => (
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

// ==================== MAIN COMPONENT ====================
const PatientManagement = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientForNotes, setSelectedPatientForNotes] = useState<Patient | null>(null);
  const [selectedPatientForReports, setSelectedPatientForReports] = useState<Patient | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const {
    data: patientsResponse,
    isLoading,
    refetch,
  } = usePatients({ page, limit, search: searchQuery });
  const addPatientMutation = useAddPatient({
    onSuccess: () => {
      setIsAddModalOpen(false);
      void refetch();
    },
    onError: (error) => {
      alert(error.message);
    },
  });
  const updateStatusMutation = useUpdatePatientStatus({
  onSuccess: () => {
    void refetch();
  },
  onError: (error) => {
    console.error("Failed to update patient status:", error);
    alert(error.message);
  },
});
  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Medical notes state
  const [medicalNote, setMedicalNote] = useState({
    doctorName: '',
    notes: ''
  });

  // ==================== DATA MANAGEMENT ====================
  useEffect(() => {
    setPatients(patientsResponse?.data ?? []);
  }, [patientsResponse]);

  const patientPagination = patientsResponse?.pagination;
  const totalPages = Math.max(patientPagination?.totalPages ?? 1, 1);
  const currentPage = Math.min(
    Math.max(patientPagination?.page ?? patientPagination?.currentPage ?? page, 1),
    totalPages,
  );
  const totalRecords =
    patientPagination?.totalRecords ??
    patientPagination?.total ??
    patients.length;

  const handlePageChange = (nextPage: number) => {
    if (nextPage < currentPage) {
      setPage((p) => Math.max(1, p - 1));
      return;
    }
    setPage((p) => Math.min(totalPages, p + 1));
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  // ==================== FORM SECTIONS ====================
  const addFormSections: FormSection[] = [
    {
      title: "Personal Information",
      icon: <User className="h-4 w-4" />,
      fields: [
        {
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          placeholder: 'Enter patient full name',
          width: 'full',
          validation: {
            minLength: 2
          }
        },
        {
          name: 'patientId',
          label: 'Patient ID',
          type: 'text',
          required: true,
          placeholder: 'PAT-YYYY-001',
          width: 'half',
          defaultValue: generatePatientId(),
          disabled: true
        },
        {
          name: 'phoneNumber',
          label: 'Phone Number',
          type: 'tel',
          required: true,
          placeholder: '9876543210',
          width: 'half',
          validation: {
            pattern: /^[0-9]{10}$/,
            custom: (value) => {
              if (!/^[0-9]{10}$/.test(String(value))) {
                return 'Phone number must be 10 digits';
              }
              return null;
            }
          }
        },
        {
          name: 'email',
          label: 'Email (Optional)',
          type: 'email',
          placeholder: 'patient@email.com',
          width: 'half'
        },
        {
          name: 'gender',
          label: 'Gender',
          type: 'select',
          required: true,
          width: 'half',
          options: [
            { value: Gender.MALE, label: 'Male' },
            { value: Gender.FEMALE, label: 'Female' },
            { value: Gender.OTHER, label: 'Other' }
          ]
        },
        {
          name: 'adhar',
          label: 'Aadhaar Number',
          type: 'text',
          required: true,
          placeholder: '1234 5678 9012',
          width: 'half',
          validation: {
            pattern: /^[0-9]{12}$/,
            custom: (value) => {
              if (!/^[0-9]{12}$/.test(String(value))) {
                return 'Aadhaar number must be 12 digits';
              }
              return null;
            }
          }
        }
      ]
    },
    {
      title: "Medical & Contact Details",
      icon: <Heart className="h-4 w-4" />,
      fields: [
        {
          name: 'dateOfBirth',
          label: 'Date of Birth (Optional)',
          type: 'date',
          placeholder: 'Select date of birth',
          width: 'half'
        },
        {
          name: 'age',
          label: 'Age (Optional)',
          type: 'number',
          placeholder: 'Enter age',
          width: 'half',
          min: 0,
          max: 150
        },
        {
          name: 'bloodGroup',
          label: 'Blood Group (Optional)',
          type: 'select',
          width: 'half',
          options: Object.values(BloodGroup).map(group => ({
            value: group,
            label: group
          }))
        },

        {
  name: 'relation',
  label: 'Relation',
  type: 'select',
  required: true,
  width: 'half',
  defaultValue: 'SELF',
  options: [
    { value: 'SELF', label: 'Self' },
    { value: 'FATHER', label: 'Father' },
    { value: 'MOTHER', label: 'Mother' },
    { value: 'CHILD', label: 'Child' },
    { value: 'SPOUSE', label: 'Spouse' },
    { value: 'OTHER', label: 'Other' }
  ]
},
{
  name: 'diseases',
  label: 'Diseases',
  type: 'textarea',
  placeholder: 'Diabetes, BP, Asthma, etc.',
  width: 'full',
  rows: 3
},
        {
          name: 'emergencyContact',
          label: 'Emergency Contact (Optional)',
          type: 'tel',
          placeholder: 'Emergency phone number',
          width: 'half',
          validation: {
            pattern: /^[0-9]{10}$/,
            custom: (value) => {
              if (value && !/^[0-9]{10}$/.test(String(value))) {
                return 'Emergency contact must be 10 digits';
              }
              return null;
            }
          }
        },
        {
          name: 'address',
          label: 'Complete Address',
          type: 'textarea',
          required: true,
          placeholder: 'Enter complete residential address with city and pincode',
          width: 'full',
          rows: 3
        }
      ]
    }
  ];

  const editFormSections: FormSection[] = [
    {
      title: "Edit Patient Details",
      icon: <UserCog className="h-4 w-4" />,
      fields: [
        {
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          width: 'full'
        },
        {
          name: 'phoneNumber',
          label: 'Phone Number',
          type: 'tel',
          required: true,
          width: 'half',
          validation: {
            pattern: /^[0-9]{10}$/
          }
        },
        {
          name: 'email',
          label: 'Email (Optional)',
          type: 'email',
          width: 'half'
        },
        {
          name: 'password',
          label: 'Update Password',
          type: 'password',
          placeholder: 'Leave empty to keep current password',
          width: 'half',
          validation: {
            minLength: 8,
            custom: (value) => {
              if (value && String(value).length < 8) {
                return 'Password must be at least 8 characters';
              }
              return null;
            }
          }
        },
        {
          name: 'address',
          label: 'Address',
          type: 'textarea',
          required: true,
          width: 'full',
          rows: 3
        },
        {
          name: 'emergencyContact',
          label: 'Emergency Contact',
          type: 'tel',
          width: 'half',
          validation: {
            pattern: /^[0-9]{10}$/
          }
        },
        {
          name: 'bloodGroup',
          label: 'Blood Group',
          type: 'select',
          width: 'half',
          options: [
            { value: '', label: 'Select blood group' },
            ...Object.values(BloodGroup).map(group => ({
              value: group,
              label: group
            }))
          ]
        }
      ]
    }
  ];

  // ==================== HELPER FUNCTIONS ====================
  function generatePatientId() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `PAT-${year}-${randomNum}`;
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ==================== FILE UPLOAD HANDLING ====================
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setUploadError('File size exceeds 5MB limit');
      setSelectedFile(null);
      return;
    }

    // Check file type (allow images and PDFs)
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedPatientForReports) return;

    setUploadingFile(true);
    setUploadProgress(0);
    setUploadError(null);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // In real app, upload to server
      const newReport: MedicalReport = {
        id: Date.now().toString(),
        patientId: selectedPatientForReports.id,
        title: selectedFile.name.split('.')[0],
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        uploadedBy: 'Admin', // In real app, get from auth
        uploadedAt: new Date()
      };

      // Update patient with new report
      setPatients(prev =>
        prev.map(p =>
          p.id === selectedPatientForReports.id
            ? {
                ...p,
                medicalReports: [...p.medicalReports, newReport],
                updatedAt: new Date()
              }
            : p
        )
      );

      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setUploadingFile(false);
        setSelectedFile(null);
        
        // Refresh data
        setTimeout(() => {
          void refetch();
          setUploadProgress(0);
        }, 500);
      }, 2000);
    } catch (error) {
      clearInterval(interval);
      setUploadError('Failed to upload file. Please try again.');
      setUploadingFile(false);
    }
  };

  // ==================== HANDLERS ====================
  const handleAddPatient = async (data: Partial<Patient>) => {
   await addPatientMutation.mutateAsync({
  ...data,
  diseases: data.diseases
    ? String(data.diseases)
        .split(",")
        .map(item => item.trim())
        .filter(Boolean)
    : [],
});
  };

  const handleEditPatient = (data: Partial<Patient>) => {
    if (!selectedPatient) return;

    const updatedPatient = {
      ...selectedPatient,
      ...data,
      updatedAt: new Date()
    };

    setPatients(prev =>
      prev.map(p => p.id === selectedPatient.id ? updatedPatient : p)
    );
    
    setIsEditModalOpen(false);
    setSelectedPatient(null);
    void refetch();
  };

  const handleAddMedicalNote = () => {
    if (!selectedPatientForNotes || !medicalNote.doctorName.trim() || !medicalNote.notes.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newNote: MedicalNote = {
      id: Date.now().toString(),
      patientId: selectedPatientForNotes.id,
      doctorName: medicalNote.doctorName,
      notes: medicalNote.notes,
      date: new Date(),
      createdAt: new Date()
    };

    setPatients(prev =>
      prev.map(p =>
        p.id === selectedPatientForNotes.id
          ? {
              ...p,
              medicalNotes: [...p.medicalNotes, newNote],
              updatedAt: new Date()
            }
          : p
      )
    );

    // Reset form
    setMedicalNote({ doctorName: '', notes: '' });
    setIsNotesModalOpen(false);
    setSelectedPatientForNotes(null);
    void refetch();
  };

  const handleToggleStatus = async (patientId: string, currentIsActive: boolean) => {
    const action = currentIsActive ? 'deactivate' : 'reactivate';
    if (!confirm(`Are you sure you want to ${action} this patient?`)) return;

    updateStatusMutation.mutate({ id: patientId, isActive: !currentIsActive });
  };

  const handleDeleteReport = (reportId: string, patientId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    setPatients(prev =>
      prev.map(p =>
        p.id === patientId
          ? {
              ...p,
              medicalReports: p.medicalReports.filter(r => r.id !== reportId),
              updatedAt: new Date()
            }
          : p
      )
    );
    
    void refetch();
  };

  // ==================== TABLE COLUMNS ====================
  const patientColumns: ColumnDef<Patient>[] = [
    {
      accessorKey: 'patientInfo',
      header: 'Patient Information',
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              {patient.name}
            
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Phone className="h-3 w-3" />
              {patient.phoneNumber}
              {patient.email && (
                <>
                  <span className="mx-1">•</span>
                  <Mail className="h-3 w-3" />
                  {patient.email}
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[200px]">{patient.address}</span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'medicalDetails',
      header: 'Medical Details',
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span className="text-sm">
                {patient.age ? `${patient.age} years` : 'Age not specified'}
              </span>
            </div>
            {patient.bloodGroup && (
              <div className="flex items-center gap-2">
                <Droplets className="h-3 w-3 text-red-500" />
                <Badge variant="outline" className="text-xs">
                  {patient.bloodGroup}
                </Badge>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Aadhaar: {patient.adhar}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'medicalRecords',
      header: 'Medical Records',
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-blue-500" />
              <span className="text-sm">
                {patient.medicalNotes.length} note(s)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <File className="h-3 w-3 text-green-500" />
              <span className="text-sm">
                {patient.medicalReports.length} report(s)
              </span>
            </div>
            {patient.emergencyContact && (
              <div className="text-xs text-muted-foreground">
                Emergency: {patient.emergencyContact}
              </div>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const patient = row.original;
        const statusColors = {
          [PatientStatus.ACTIVE]: 'bg-green-100 text-green-800',
          [PatientStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
          [PatientStatus.FOLLOW_UP]: 'bg-blue-100 text-blue-800',
          [PatientStatus.DISCHARGED]: 'bg-purple-100 text-purple-800'
        };
        
        return (
          <Badge className={`${statusColors[patient.status]} hover:opacity-90`}>
            {patient.status.replace('_', ' ')}
          </Badge>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const patient = row.original;
        const isActive = patient.user?.isActive !== false;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedPatient(patient);
                setIsEditModalOpen(true);
              }}
              title="Edit patient"
            >
              <UserCog className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedPatientForNotes(patient);
                setIsNotesModalOpen(true);
              }}
              title="Add medical note"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedPatientForReports(patient);
                setIsReportsModalOpen(true);
              }}
              title="Manage reports"
            >
              <File className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleToggleStatus(patient.id, isActive)}
              title={isActive ? "Deactivate patient" : "Reactivate patient"}
              className={isActive 
                ? "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" 
                : "text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"}
            >
              {isActive ? <Trash2 className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            </Button>
          </div>
        );
      }
    }
  ];

  // ==================== FILTERED DATA ====================
  const filteredPatients = patients.filter((patient) => {
    const isPatientActive = patient.user?.isActive !== false;
    return activeTab === 'active' ? isPatientActive : !isPatientActive;
  });
  const activeCount = patients.filter(p => p.user?.isActive !== false).length;
  const inactiveCount = patients.filter(p => p.user?.isActive === false).length;

  // ==================== RENDER ====================
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            Patient Management
          </h1>
          <p className="text-muted-foreground">
            Manage patient records, medical notes, and reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="hover:bg-gray-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search patients..."
          className="pl-10"
          value={searchQuery}
          onChange={(event) => {
            setPage(1);
            setSearchQuery(event.target.value);
          }}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Active Patients ({activeCount})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Deactivated Patients ({inactiveCount})
          </TabsTrigger>
        </TabsList>       

        {/* Patient Records Tab */}
        <TabsContent value={activeTab} className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {activeTab === 'active' ? 'Active' : 'Deactivated'} Patient Records ({filteredPatients.length})
              </CardTitle>
              <CardDescription>
                View and manage {activeTab === 'active' ? 'active' : 'deactivated'} patient information, medical notes, and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <PaginatedPatientTable
                  columns={patientColumns}
                  data={filteredPatients}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  limit={limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  emptyMessage={
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-semibold">No {activeTab} patients found</h3>
                      <p className="text-muted-foreground">
                        Add your first patient to get started
                      </p>
                    </div>
                  }
                />
              )}
            </CardContent>
          </Card>        
        </TabsContent>
      </Tabs>

      {/* ==================== MODALS ==================== */}

      {/* Add Patient Modal */}
      <ReusableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddPatient}
        title="Add New Patient"
        sections={addFormSections}
        size="xl"
        saveButtonText="Add Patient"
        cancelButtonText="Cancel"
        saveButtonColor="linear-gradient(135deg, #3b82f6, #0ea5e9)"
        validationOnChange={true}
      />

      {/* Edit Patient Modal */}
      {selectedPatient && (
        <ReusableModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPatient(null);
          }}
          onSave={handleEditPatient}
          title={
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Edit Patient
              <Badge variant="outline" className="ml-2">
                {selectedPatient.patientId}
              </Badge>
            </div>
          }
          sections={editFormSections}
          initialData={selectedPatient as unknown as ReusableFormData}
          isEdit={true}
          size="lg"
          saveButtonText="Update Patient"
          cancelButtonText="Cancel"
          saveButtonColor="linear-gradient(135deg, #10b981, #059669)"
          validationOnChange={true}
        />
      )}

      {/* Medical Notes Modal */}
      {selectedPatientForNotes && (
        <ReusableModal
          isOpen={isNotesModalOpen}
          onClose={() => {
            setIsNotesModalOpen(false);
            setSelectedPatientForNotes(null);
            setMedicalNote({ doctorName: '', notes: '' });
          }}
          onSave={handleAddMedicalNote}
          title={
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Add Medical Note
              <Badge variant="outline" className="ml-2">
                {selectedPatientForNotes.name}
              </Badge>
            </div>
          }
          sections={[
            {
              title: "Medical Note Details",
              icon: <Stethoscope className="h-4 w-4" />,
              fields: [
                {
                  name: 'doctorName',
                  label: 'Doctor Name',
                  type: 'text',
                  required: true,
                  placeholder: 'Enter doctor name',
                  width: 'full'
                },
                {
                  name: 'notes',
                  label: 'Medical Notes',
                  type: 'textarea',
                  required: true,
                  placeholder: 'Enter medical notes, observations, prescriptions, etc.',
                  width: 'full',
                  rows: 6
                }
              ]
            }
          ]}
          initialData={medicalNote}
          isEdit={false}
          size="lg"
          saveButtonText="Add Medical Note"
          cancelButtonText="Cancel"
          saveButtonColor="linear-gradient(135deg, #8b5cf6, #7c3aed)"
          validationOnChange={true}
        />
      )}

      {/* Medical Reports Modal */}
      {selectedPatientForReports && (
          <ReusableModal
    isOpen={isReportsModalOpen}
    onClose={() => {
      setIsReportsModalOpen(false);
      setSelectedPatientForReports(null);
      setSelectedFile(null);
      setUploadError(null);
      setUploadProgress(0);
    }}
    onSave={() => {}} // No save action, handled separately
    title={
      <div className="flex items-center gap-2">
        <File className="h-5 w-5" />
        Medical Reports
        <Badge variant="outline" className="ml-2">
          {selectedPatientForReports.name}
        </Badge>
      </div>
    }
    sections={[]}
    initialData={{}}
    isEdit={false}
    size="xl"
    saveButtonText=""
    cancelButtonText="Close"
  >
          {/* Custom content for reports modal */}
          <div className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Medical Report
                </CardTitle>
                <CardDescription>
                  Upload medical reports, test results, or images (Max: 5MB per file)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, GIF, WebP, or PDF (Max 5MB)
                    </p>
                  </label>
                </div>

                {selectedFile && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {selectedFile.type.startsWith('image/') ? (
                          <File className="h-8 w-8 text-blue-500" />
                        ) : (
                          <FileText className="h-8 w-8 text-blue-500" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(selectedFile.size)} • {selectedFile.type}
                          </p>
                        </div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>

                    {uploadingFile && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-center text-gray-500">
                          Uploading... {uploadProgress}%
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleFileUpload}
                      disabled={uploadingFile}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {uploadingFile ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Report
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-700">{uploadError}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Existing Reports Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <File className="h-5 w-5" />
                  Existing Reports ({selectedPatientForReports.medicalReports.length})
                </CardTitle>
                <CardDescription>
                  View and manage uploaded medical reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPatientForReports.medicalReports.length === 0 ? (
                  <div className="text-center py-8">
                    <File className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-4 text-sm text-gray-500">No reports uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedPatientForReports.medicalReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          {report.fileType.startsWith('image/') ? (
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <File className="h-5 w-5 text-blue-600" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{report.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{formatFileSize(report.fileSize)}</span>
                              <span>•</span>
                              <span>{report.fileType}</span>
                              <span>•</span>
                              <span>Uploaded: {new Date(report.uploadedAt).toLocaleDateString()}</span>
                            </div>
                            {report.description && (
                              <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            title="View report"
                            onClick={() => {
                              // In real app, open/download the file
                              alert(`Opening: ${report.fileName}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            title="Download report"
                            onClick={() => {
                              // In real app, download the file
                              alert(`Downloading: ${report.fileName}`);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            title="Delete report"
                            onClick={() => handleDeleteReport(report.id, selectedPatientForReports.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical Notes Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Medical Notes ({selectedPatientForReports.medicalNotes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPatientForReports.medicalNotes.length === 0 ? (
                  <p className="text-sm text-gray-500">No medical notes yet</p>
                ) : (
                  <div className="space-y-4">
                    {selectedPatientForReports.medicalNotes.slice(0, 3).map((note) => (
                      <div key={note.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{note.doctorName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(note.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{note.notes}</p>
                      </div>
                    ))}
                    {selectedPatientForReports.medicalNotes.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        + {selectedPatientForReports.medicalNotes.length - 3} more notes
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ReusableModal>
      )}
    </div>
  );
};

export default PatientManagement;
