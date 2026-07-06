'use client';

import { ReactNode, useMemo, useState } from 'react';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Eye,
  Heart,
  Phone,
  RefreshCw,
  Search,
  Shield,
  Stethoscope,
  Trash2,
  User,
  UserCog,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReusableModal, { FormSection, ReusableFormData } from '@/components/reusable/reusable-modal';
import {
  useAddPatient,
  useNextPatientCode,
  usePatientById,
  usePatients,
  useUpdatePatient,
  useUpdatePatientStatus,
} from '@/services/admin/patient';

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

export interface MedicalReport {
  id: string;
  patientCode?: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: Date;
  downloadUrl?: string;
}

export interface Patient {
  id: string;
  patientCode: string;
  name: string;
  phoneNumber: string;
  email?: string;
  age?: number;
  gender: Gender;
  bloodGroup?: BloodGroup;
  adhar: string;
  address: string;
  relation?: 'SELF' | 'FATHER' | 'MOTHER' | 'CHILD' | 'SPOUSE' | 'OTHER' | string;
  familyHead?: {
  _id: string;
  name: string;
  patientCode: string;
};

emergencyContact?: {
  name?: string;
  phone?: string;
  relation?: string;
};
  otherRelation?: string;
  diseases?: string[] | string;
  allergies?: string[] | string;
  medicalHistory?: string;
  medicalReports: MedicalReport[];
  status: PatientStatus;
  user?: {
    isActive: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
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
            <strong>{currentPage} of {totalPages}</strong>
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

const relationOptions = [
  { value: 'SELF', label: 'Self' },
  { value: 'FATHER', label: 'Father' },
  { value: 'MOTHER', label: 'Mother' },
  { value: 'CHILD', label: 'Child' },
  { value: 'SPOUSE', label: 'Spouse' },
  { value: 'OTHER', label: 'Other' },
];

const bloodGroupOptions = Object.values(BloodGroup).map((group) => ({
  value: group,
  label: group,
}));

const formatList = (value?: string[] | string) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  return value || '';
};

const formatDate = (value?: Date) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
};

const getIsActive = (patient: Patient) =>
  patient.user?.isActive ?? patient.status !== PatientStatus.INACTIVE;

const getInitialData = (patient: Patient): ReusableFormData => ({
  patientCode: patient.patientCode,
  name: patient.name,
  phoneNumber: patient.phoneNumber,
  email: patient.email ?? '',
  age: patient.age ?? '',
  gender: patient.gender,
  bloodGroup: patient.bloodGroup ?? '',
  adhar: patient.adhar ?? '',
  address: patient.address ?? '',
  relation: patient.relation ?? 'SELF',
  otherRelation: patient.otherRelation ?? '',
  diseases: formatList(patient.diseases),
 

emergencyContactName:
  patient.emergencyContact?.name ?? '',

emergencyContactPhone:
  patient.emergencyContact?.phone ?? '',

emergencyContactRelation:
  patient.emergencyContact?.relation ?? '',
  allergies: formatList(patient.allergies),
  medicalHistory: patient.medicalHistory ?? '',
});

const DetailItem = ({ label, value }: { label: string; value?: ReactNode }) => {
  if (value === undefined || value === null || value === '') return null;

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <div className="text-sm font-medium text-slate-900 break-words">{value}</div>
    </div>
  );
};

const PatientManagement = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editPatientId, setEditPatientId] = useState<string>('');
  const [detailPatientId, setDetailPatientId] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: patientsResponse,
    isLoading,
    isFetching ,
    refetch,
  } = usePatients({ page, limit, search: searchQuery });

  const {
    data: nextPatientCode,
    refetch: refetchNextPatientCode,
  } = useNextPatientCode();

  const {
    data: detailPatient,
    isFetching: isDetailFetching,
    refetch: refetchDetailPatient,
  } = usePatientById(detailPatientId);

  const {
    data: editPatient,
    isFetching: isEditFetching,
  } = usePatientById(editPatientId);

  const addPatientMutation = useAddPatient({
    onSuccess: () => {
      setIsAddModalOpen(false);
      void refetch();
      void refetchNextPatientCode();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const updatePatientMutation = useUpdatePatient({
    onSuccess: (patient) => {
      setIsEditModalOpen(false);
      setSelectedPatient(null);
      setEditPatientId('');
      void refetch();
      if (detailPatientId === patient.id) {
        void refetchDetailPatient();
      }
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const updateStatusMutation = useUpdatePatientStatus({
    onSuccess: () => {
      void refetch();
      if (detailPatientId) {
        void refetchDetailPatient();
      }
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const patients = patientsResponse?.data ?? [];
  const patientPagination = patientsResponse?.pagination;
  const totalPages = Math.max(patientPagination?.totalPages ?? 1, 1);
  const currentPage = Math.min(
    Math.max(patientPagination?.page ?? patientPagination?.currentPage ?? page, 1),
    totalPages,
  );

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

  const formSections: FormSection[] = useMemo(() => [
    {
      title: 'Patient Information',
      icon: <User className="h-4 w-4" />,
      fields: [
        {
  name: 'patientCode',
  label: 'Patient Code',
  type: 'text',
  width: 'half',
  disabled: true,
},
      
        {
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          disabled:true,
          placeholder: 'Enter patient full name',
          width: 'half',
          validation: { minLength: 2 },
        },
        {
          name: 'phoneNumber',
          label: 'Phone Number',
          type: 'tel',
          required: true,
          disabled:true,
          placeholder: '9876543210',
          width: 'half',
          validation: { pattern: /^[0-9]{10}$/ },
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'patient@email.com',
          width: 'half',
        },
        {
          name: 'age',
          label: 'Age',
          type: 'number',
          placeholder: 'Enter age',
          width: 'half',
          min: 0,
          max: 150,
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
            { value: Gender.OTHER, label: 'Other' },
          ],
        },
        {
          name: 'bloodGroup',
          label: 'Blood Group',
          type: 'select',
          width: 'half',
          options: bloodGroupOptions,
        },
        {
          name: 'adhar',
          label: 'Aadhaar',
          type: 'text',
          placeholder: '123456789012',
          width: 'half',
          validation: { pattern: /^[0-9]{12}$/ },
        },
        {
          name: 'address',
          label: 'Address',
          type: 'textarea',
          placeholder: 'Enter complete residential address',
          width: 'full',
          rows: 3,
        },
      ],
    },
    {
  title: 'Emergency Contact',
  icon: <Phone className="h-4 w-4" />,
  fields: [
    {
      name: 'emergencyContactName',
      label: 'Contact Name',
      placeholder: 'Enter Contact name',
      type: 'text',
      width: 'half',
    },
    {
      name: 'emergencyContactPhone',
      label: 'Contact Phone',
       placeholder: '9876543210',
      type: 'tel',
      width: 'half',
    },
    {
      name: 'emergencyContactRelation',
      label: 'Relation',
       placeholder: 'Specify relation',
      type: 'text',
      width: 'full',
    },
  ],
},
    {
      title: 'Relation & Medical Details',
      icon: <Heart className="h-4 w-4" />,
      fields: [
     {
          name: 'relation',
          label: 'Relation',
          type: 'select',
          required: true,
          width: 'half',
          defaultValue: 'SELF',
          options: relationOptions,
        },
        {
          name: 'otherRelation',
          label: 'Other Relation',
          type: 'text',
          placeholder: 'Specify relation',
          width: 'half',
        },

        {
          name: 'diseases',
          label: 'Diseases',
          type: 'textarea',
          placeholder: 'Diabetes, BP, Asthma, etc.',
          width: 'full',
          rows: 3,
        },
        {
          name: 'allergies',
          label: 'Allergies',
          type: 'textarea',
          placeholder: 'Medicine or food allergies',
          width: 'full',
          rows: 3,
        },
        {
          name: 'medicalHistory',
          label: 'Medical History',
          type: 'textarea',
          placeholder: 'Relevant medical history',
          width: 'full',
          rows: 4,
        },
      ],
    },
  ], [nextPatientCode]);


  const editFormSections: FormSection[] = useMemo(
  () =>
    formSections.map((section) => ({
      ...section,
      fields: section.fields.filter(
        (field) => field.name !== 'patientCode'
      ),
    })),
  [formSections]
);

  const handleOpenAddPatient = () => {
    setIsAddModalOpen(true);
    void refetchNextPatientCode();
  };

const handleAddPatient = async (data: ReusableFormData) => {
  const payload = {
    ...data,

    emergencyContact: {
      name: data.emergencyContactName,
      phone: data.emergencyContactPhone,
      relation: data.emergencyContactRelation,
    },
  };

  await addPatientMutation.mutateAsync(
    payload as Partial<Patient>
  );
};

  const handleOpenEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditPatientId(patient.id);
    setIsEditModalOpen(true);
  };

const handleEditPatient = async (data: ReusableFormData) => {
  const patient = editPatient ?? selectedPatient;

  if (!patient) return;

  const payload = {
    ...data,

    emergencyContact: {
      name: data.emergencyContactName,
      phone: data.emergencyContactPhone,
      relation: data.emergencyContactRelation,
    },
  };

  await updatePatientMutation.mutateAsync({
    id: patient.id,
    data: payload as Partial<Patient>,
  });
};

  const handleOpenDetails = (patient: Patient) => {
    setDetailPatientId(patient.id);
    setIsDetailsModalOpen(true);
  };

  const handleToggleStatus = async (patient: Patient) => {
    const isActive = getIsActive(patient);
    const action = isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this patient?`)) return;

    updateStatusMutation.mutate({ id: patient.id, isActive: !isActive });
  };

  const patientColumns: ColumnDef<Patient>[] = [
   {
  id: "index",
  header: "S.No.",
  cell: ({ row }) => (
    <span className="font-medium">
      {row.index + 1}
    </span>
  ),
},
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          <User className="h-4 w-4" />
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-3 w-3" />
          {row.original.phoneNumber}
        </div>
      ),
    },
    
    {
      accessorKey: 'gender',
      header: 'Gender',
    },
    {
      accessorKey: 'bloodGroup',
      header: 'Blood Group',
      cell: ({ row }) => row.original.bloodGroup ? (
        <Badge variant="outline" className="gap-1">
          <Droplets className="h-3 w-3 text-red-500" />
          {row.original.bloodGroup}
        </Badge>
      ) : '',
    },
    
    
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = getIsActive(row.original);
        return (
          <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const patient = row.original;
        const isActive = getIsActive(patient);

        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenDetails(patient)}
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
           {isActive && (
  <Button
    size="sm"
    variant="outline"
    onClick={() => handleOpenEditPatient(patient)}
    title="Edit patient"
  >
    <UserCog className="h-4 w-4" />
  </Button>
)}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleToggleStatus(patient)}
              title={isActive ? 'Deactivate patient' : 'Activate patient'}
              className={isActive
                ? 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200'
                : 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200'}
            >
              {isActive ? <Trash2 className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            </Button>
          </div>
        );
      },
    },
  ];

  const filteredPatients = patients.filter((patient) => {
    const isPatientActive = getIsActive(patient);
    return activeTab === 'active' ? isPatientActive : !isPatientActive;
  });
  const activeCount = patients.filter(getIsActive).length;
  const inactiveCount = patients.filter((patient) => !getIsActive(patient)).length;
  const patientForDetails = detailPatient;
  const patientForEdit = editPatient ?? selectedPatient;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            Patient Management
          </h1>
          <p className="text-muted-foreground">
            Manage patient records and medical information
          </p>
        </div>
        <div className="flex gap-2">
           <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
             
            }}
            disabled={isFetching}
             className="hover:bg-gray-50"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
             {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            onClick={handleOpenAddPatient}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
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

        <TabsContent value={activeTab} className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {activeTab === 'active' ? 'Active' : 'Deactivated'} Patient Records ({filteredPatients.length})
              </CardTitle>
              <CardDescription>
                View and manage {activeTab === 'active' ? 'active' : 'deactivated'} patient information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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

      <ReusableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddPatient}
        title="Add New Patient"
        sections={formSections}
        initialData={{ patientCode: nextPatientCode || 'Loading...', relation: 'SELF' }}
        size="xl"
        saveButtonText={addPatientMutation.isPending ? 'Adding...' : 'Add Patient'}
        cancelButtonText="Cancel"
        saveButtonColor="linear-gradient(135deg, #3b82f6, #0ea5e9)"
        validationOnChange={true}
      />

      {patientForEdit && (
        <ReusableModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPatient(null);
            setEditPatientId('');
          }}
          onSave={handleEditPatient}
          title={`Edit Patient - ${patientForEdit.patientCode}`}
          sections={editFormSections}
          initialData={getInitialData(patientForEdit)}
          isEdit={true}
          size="xl"
          saveButtonText={isEditFetching || updatePatientMutation.isPending ? 'Updating...' : 'Update Patient'}
          cancelButtonText="Cancel"
          saveButtonColor="linear-gradient(135deg, #10b981, #059669)"
          validationOnChange={true}
        />
      )}

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setDetailPatientId('');
        }}
        title="Patient Details"
        size="xl"
        footer={patientForDetails ? (
          <>
            {getIsActive(patientForDetails) && (
      <Button
        variant="outline"
        onClick={() => {
          handleOpenEditPatient(patientForDetails);
          setIsDetailsModalOpen(false);
        }}
      >
        <UserCog className="mr-2 h-4 w-4" />
        Edit Details
      </Button>
    )}
            <Button
              variant="outline"
              onClick={() => handleToggleStatus(patientForDetails)}
              className={getIsActive(patientForDetails)
                ? 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200'
                : 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200'}
            >
              {getIsActive(patientForDetails) ? (
                <Trash2 className="mr-2 h-4 w-4" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {getIsActive(patientForDetails) ? 'Deactivate' : 'Activate'}
            </Button>
          </>
        ) : undefined}
      >
        {isDetailFetching ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : patientForDetails ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Patient Code</p>
                <p className="text-lg font-semibold text-blue-700">{patientForDetails.patientCode}</p>
              </div>
              <Badge className={getIsActive(patientForDetails) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {getIsActive(patientForDetails) ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-lg border bg-white p-4">
                <DetailItem label="Name" value={patientForDetails.name} />
                <DetailItem label="Phone" value={patientForDetails.phoneNumber} />
                <DetailItem label="Email" value={patientForDetails.email} />
                <DetailItem label="Age" value={patientForDetails.age ? `${patientForDetails.age} years` : ''} />
                <DetailItem label="Gender" value={patientForDetails.gender} />
                <DetailItem label="Blood Group" value={patientForDetails.bloodGroup} />
                <DetailItem label="Aadhaar" value={patientForDetails.adhar} />
                <DetailItem label="Address" value={patientForDetails.address} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Relation & Medical Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-lg border bg-white p-4">
                <DetailItem label="Relation" value={patientForDetails.relation} />
                <DetailItem label="Other Relation" value={patientForDetails.otherRelation} />
{patientForDetails.relation !== "SELF" && (
  <>
    <DetailItem
      label="Family Head"
      value={patientForDetails.familyHead?.name}
    />

    <DetailItem
      label="Family Head Code"
      value={patientForDetails.familyHead?.patientCode}
    />
  </>
)}

  <DetailItem
    label="Emergency Contact Name"
    value={patientForDetails.emergencyContact?.name}
  />

  <DetailItem
    label="Emergency Contact Phone"
    value={patientForDetails.emergencyContact?.phone}
  />

  <DetailItem
    label="Emergency Contact Relation"
    value={patientForDetails.emergencyContact?.relation}
  />


                <DetailItem label="Diseases" value={formatList(patientForDetails.diseases)} />
                <DetailItem label="Allergies" value={formatList(patientForDetails.allergies)} />
                <DetailItem label="Medical History" value={patientForDetails.medicalHistory} />
                <DetailItem label="Status" value={getIsActive(patientForDetails) ? 'ACTIVE' : 'INACTIVE'} />
                <DetailItem label="Created Date" value={formatDate(patientForDetails.createdAt)} />
                {!getIsActive(patientForDetails) && (
  <DetailItem
    label="Inactive Since"
    value={formatDate(patientForDetails.updatedAt)}
  />
)}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Patient details could not be loaded.</p>
        )}
      </Modal>
    </div>
  );
};

export default PatientManagement;
