'use client';

import { ReactNode, useMemo, useState , useEffect} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Eye,
  FileText,
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
import { Textarea } from '@/components/ui/textarea';
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
import PrescriptionDialog from '@/components/reusable/prescription-dialog';
import {
  useAddPatient,
  useNextPatientCode,
   useCheckPatientPhone,
  usePatientById,
  usePatients,
  useUpdatePatient,
  useUpdatePatientStatus,
  type FamilyProfile,
  type PatientCreateData,
} from '@/services/admin/patient';
import { useDoctors } from '@/services/admin/doctor';
import { useReceptionistById } from "@/services/admin/reception";
import { clientApi } from '@/lib/api/client';
import { toast } from 'sonner';


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
  _id?: string;
  id?: string;
  url?: string;
  documentName: string;

  fileName: string;

  originalName?: string;

  filePath?: string;

  mimeType?: string;

  fileSize: number;

  uploadedAt: Date;
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
  otherRelation?: string;
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
   onRowClick?: (patient: Patient) => void;
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
  onRowClick,
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
               <TableRow
  key={row.id}
  onClick={() => onRowClick?.(row.original)}
  className="cursor-pointer hover:bg-muted/50 transition-colors"
>
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

interface AvailableSlotsResponse {
  doctorAvailable: boolean;
  workingHours?: { start?: string; end?: string };
  slotDuration?: number;
  bookedSlots?: string[];
  availableSlots: string[];
}

const emergencyRelationOptions = [
  { value: "FATHER", label: "Father" },
  { value: "MOTHER", label: "Mother" },
  { value: "BROTHER", label: "Brother" },
  { value: "SISTER", label: "Sister" },
  { value: "GUARDIAN", label: "Guardian" },
  { value: "COUSIN", label: "Cousin" },
  { value: "SPOUSE", label: "Spouse" },
  { value: "FRIEND", label: "Friend" },
  { value: "OTHER", label: "Other" },
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

const renderMedicalReports = (reports?: MedicalReport[]) => {
  if (!reports?.length) {
    return <p className="text-sm text-slate-500">No documents uploaded</p>;
  }

  return (
    <div className="space-y-2">
{reports.map((report, index) => {
  const count =
    reports
      .slice(0, index + 1)
      .filter(r => r.documentName === report.documentName)
      .length;

  return (
    <a
      key={report._id || report.id || report.filePath || index}
      href={report.url}
      target="_blank"
      rel="noreferrer"
      className="block text-sm text-blue-600 underline"
    >
      {report.documentName}
      {count > 1 ? ` (${count})` : ""}
    </a>
  );
})}
    </div>
  );
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

  emergencyContactOtherRelation:
  patient.emergencyContact?.otherRelation ?? '',


  allergies: formatList(patient.allergies),
  medicalHistory: patient.medicalHistory ?? '',
  medicalReports: patient.medicalReports ?? [],
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

const [userId, setUserId] = useState<string>();

useEffect(() => {
  const token = localStorage.getItem("access_token");

  if (!token) return;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    setUserId(payload.id);
  } catch (err) {
    console.error("Failed to decode token", err);
  }
}, []);

const { data: receptionist } =
  useReceptionistById(userId);

const canEditPatient =
  receptionist?.canEditPatient ?? false;

  console.log("Receptionist:", receptionist);
console.log("canEditPatient:", receptionist?.canEditPatient);

  
  const today = useMemo(
    () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()),
    [],
  );
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [isPhoneModalOpen, setIsPhoneModalOpen] =
    useState(false);

const [patientPhone, setPatientPhone] =
    useState("");

const [selfExists, setSelfExists] =
    useState(false);
  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfile[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentPatientName, setAppointmentPatientName] = useState('');
  const [appointmentForm, setAppointmentForm] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    slot: '',
    reason: '',
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editPatientId, setEditPatientId] = useState<string>('');
  const [detailPatientId, setDetailPatientId] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [reportsPatient, setReportsPatient] = useState<Patient | null>(null);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isMedicalReportsModalOpen, setIsMedicalReportsModalOpen] = useState(false);
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false);
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

  const queryClient = useQueryClient();
  const { data: doctorsResponse } = useDoctors({ limit: 1000 });
  const doctors = (doctorsResponse?.data ?? []).filter(
    (doctor) => doctor.user?.isActive !== false,
  );

  const { data: availableSlotsResponse, isFetching: isSlotsLoading } = useQuery({
    queryKey: ['available-slots', appointmentForm.doctorId, appointmentForm.date],
    queryFn: async (): Promise<AvailableSlotsResponse> => {
      const response = await clientApi.get<AvailableSlotsResponse>(
        `/appointment/available-slots?doctorId=${appointmentForm.doctorId}&date=${appointmentForm.date}`,
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to load available slots');
      }

      if (!response.data) {
        throw new Error('Failed to load available slots');
      }

      return (response.data as any).data;
    },
    enabled: !!appointmentForm.doctorId && !!appointmentForm.date,
  });

useEffect(() => {
  const availableSlots = availableSlotsResponse?.availableSlots ?? [];

  if (isSlotsLoading) {
    return;
  }

  if (availableSlots.length === 0) {
    setAppointmentForm((current) => ({
      ...current,
      slot: '',
    }));
    return;
  }

  setAppointmentForm((current) => {
    // Keep user's manually selected slot if it is still available.
    if (
      current.slot &&
      availableSlots.includes(current.slot)
    ) {
      return current;
    }

    // Otherwise automatically select the first available slot.
    return {
      ...current,
      slot: availableSlots[0],
    };
  });
}, [
  availableSlotsResponse?.availableSlots,
  isSlotsLoading,
]);

console.log("availableSlotsResponse", availableSlotsResponse);
  const createAppointmentMutation = useMutation({
    mutationFn: async () => {
      const response = await clientApi.post('/appointment/create-appointment', {
        patient: appointmentForm.patientId,
        doctor: appointmentForm.doctorId,
        date: appointmentForm.date,
        slot: appointmentForm.slot,
        reason: appointmentForm.reason,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create appointment');
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success('Appointment booked successfully');
      setIsAppointmentModalOpen(false);
      setAppointmentPatientName('');
      setAppointmentForm({ patientId: '', doctorId: '', date: '', slot: '', reason: '' });
      void refetch();
      void queryClient.invalidateQueries({ queryKey: ['patients'] });
      void queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      void queryClient.invalidateQueries({ queryKey: ['patient-dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      void queryClient.invalidateQueries({ queryKey: ['available-slots'] });
        void queryClient.invalidateQueries({
    queryKey: ['token-appointments'],
  });
    },
    onError: (error: Error) => toast.error(error.message),
  });

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
    onSuccess: (patient) => {
      setIsAddModalOpen(false);
      void refetch();
      void refetchNextPatientCode();
      setAppointmentPatientName(patient.name);
      setAppointmentForm({
        patientId: patient.id,
        doctorId: '',
        date: '',
        slot: '',
        reason: '',
      });
      setIsAppointmentModalOpen(true);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const checkPhoneMutation = useCheckPatientPhone();

  const updatePatientMutation = useUpdatePatient({
    onSuccess: (patient) => {
      setIsEditModalOpen(false);
      setIsMedicalReportsModalOpen(false);
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
const handleContinue = async () => {
    const result =
        await checkPhoneMutation.mutateAsync(phoneInput);
        console.log("check-phone result", result);

    setPatientPhone(phoneInput);
    setSelfExists(result.selfExists);
    setFamilyProfiles(result.profiles);
    setIsPhoneModalOpen(false);
    refetchNextPatientCode();

    if (result.profiles.length === 0) {
      setIsAddModalOpen(true);
      return;
    }

    setIsProfileModalOpen(true);
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
         
          placeholder: 'Enter patient full name',
          width: 'half',
          validation: { minLength: 2 },
        },
        {
          name: 'phoneNumber',
          label: 'Phone Number',
          type: 'tel',
          disabled:true,
          required: true,
         
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
          name: 'relation',
          label: 'Relation',
          type: 'select',
          required: true,
          width: 'half',
          defaultValue: 'SELF',
         options:
familyProfiles.length > 0
    ? relationOptions.filter((option) => option.value !== 'SELF')
    : [{ value: 'SELF', label: 'Self' }]
        },
{
  name: 'otherRelation',
  label: 'Other Relation',
  type: 'text',
  placeholder: 'Specify relation',
  width: 'half',
  required: (data) => data.relation === "OTHER",
  hidden: (data) => data.relation !== "OTHER",
},

        {
          name: 'diseases',
          label: 'Symtoms',
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
  name: "emergencyContactRelation",
  label: "Relation",
  type: "select",
  width: "half",

  options: emergencyRelationOptions,
},
{
  name: "emergencyContactOtherRelation",
  label: "Other Relation",
  type: "text",
  placeholder: "Specify relation",
  width: "half",
  required: (data) => data.emergencyContactRelation === "OTHER",
  hidden: (data) => data.emergencyContactRelation !== "OTHER",
},
  ],
},

    {
      title: 'Documents',
      icon: <FileText className="h-4 w-4" />,
      fields: [
        {
          name: 'medicalReports',
          label: 'Documents',
          type: 'patient-document-manager',
          required: false,
          width: 'full',
        },
      ],
    },
], [nextPatientCode, familyProfiles]);

const patientForDetails = detailPatient;
const patientForEdit = editPatient ?? selectedPatient;


const editFormSections: FormSection[] = useMemo(
  () =>
    formSections.map((section) => ({
      ...section,
      fields: section.fields
        .filter((field) => field.name !== "patientCode")
        .map((field) => {
          if (field.name === "relation") {
            return {
              ...field,
              disabled: true,
              options: patientForEdit?.relation
                ? [
                    {
                      value: patientForEdit.relation,
                      label:
                        relationOptions.find(
                          (r) => r.value === patientForEdit.relation
                        )?.label || patientForEdit.relation,
                    },
                  ]
                : [{ value: "SELF", label: "Self" }],
            };
          }

          return field;
        }),
    })),
  [formSections, patientForEdit]
);

const handleOpenAddPatient = () => {
    setPhoneInput("");
    setFamilyProfiles([]);
    setIsPhoneModalOpen(true);
};

const handleAddFamilyMember = () => {
  setIsProfileModalOpen(false);
  setIsAddModalOpen(true);
  void refetchNextPatientCode();
};

const handleCreateAppointment = (profile: FamilyProfile) => {
  setIsProfileModalOpen(false);
  setAppointmentPatientName(profile.name);
  setAppointmentForm({
    patientId: profile._id,
    doctorId: '',
    date: '',
    slot: '',
    reason: '',
  });
  setIsAppointmentModalOpen(true);
};

const handleBookAppointment = (patient: Patient) => {
  setAppointmentPatientName(patient.name);
  setAppointmentForm({
    patientId: patient.id,
    doctorId: '',
    date: '',
    slot: '',
    reason: '',
  });
  setIsAppointmentModalOpen(true);
};

const handleAddPatient = async (data: ReusableFormData) => {
  console.log("[Patient create] complete form data", data);

  const hasName = !!String(data.emergencyContactName ?? "").trim();
const hasPhone = !!String(data.emergencyContactPhone ?? "").trim();
  const hasRelation = !!data.emergencyContactRelation;

  const filledCount =
    Number(hasName) +
    Number(hasPhone) +
    Number(hasRelation);

  if (filledCount > 0 && filledCount < 3) {
    toast.error(
      "Please fill Contact Name, Contact Phone and Relation together, or leave all three empty."
    );
    return;
  }

  if (
    data.emergencyContactRelation === "OTHER" &&
    !String(data.emergencyContactOtherRelation ?? "").trim()
  ) {
    toast.error("Please specify the other relation.");
    return;
  }


  const payload = {
    ...data,
medicalReports:
Array.isArray(data.medicalReports)
  ? data.medicalReports.filter(
      (doc) =>
        doc.file &&
        doc.documentName.trim()
    )
  : [],
deletedDocumentIds: Array.isArray(data.medicalReportsDeletedIds)
  ? data.medicalReportsDeletedIds.filter(
      (id): id is string => typeof id === "string"
    )
  : [],

emergencyContact: {
  name: data.emergencyContactName,
  phone: data.emergencyContactPhone,
  relation: data.emergencyContactRelation,
  otherRelation:
    data.emergencyContactRelation === "OTHER"
      ? data.emergencyContactOtherRelation
      : null,
},
  };

  console.log("[Patient create] emergencyContact", payload.emergencyContact);
  console.log("[Patient create] final payload", payload);

  await addPatientMutation.mutateAsync(
    payload as PatientCreateData
  );
};

  const handleOpenEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditPatientId(patient.id);
    setIsEditModalOpen(true);
  };

  const handleOpenReports = (patient: Patient) => {
    setReportsPatient(patient);
    setIsReportsModalOpen(true);
  };

  const handleSaveMedicalReports = async (data: ReusableFormData) => {
    if (!reportsPatient) return;

    const medicalReports = Array.isArray(data.medicalReports)
      ? data.medicalReports.filter(
          (document): document is { documentName: string; file: File } =>
            !!document &&
            typeof document === 'object' &&
            'file' in document &&
            document.file instanceof File &&
            typeof document.documentName === 'string' &&
            document.documentName.trim().length > 0,
        )
      : [];
    const deletedDocumentIds = Array.isArray(data.medicalReportsDeletedIds)
      ? data.medicalReportsDeletedIds.filter(
          (id): id is string => typeof id === 'string',
        )
      : [];
    const temporaryDocumentIds = Array.isArray(data.temporaryDocumentIds)
      ? data.temporaryDocumentIds.filter(
          (id): id is string => typeof id === 'string',
        )
      : [];

    const payload: PatientCreateData = {
      name: reportsPatient.name,
      phoneNumber: reportsPatient.phoneNumber,
      email: reportsPatient.email,
      age: reportsPatient.age,
      gender: reportsPatient.gender,
      bloodGroup: reportsPatient.bloodGroup,
      adhar: reportsPatient.adhar,
      address: reportsPatient.address,
      relation: reportsPatient.relation ?? 'SELF',
      otherRelation: reportsPatient.otherRelation ?? '',
      diseases: Array.isArray(reportsPatient.diseases)
        ? reportsPatient.diseases
        : typeof reportsPatient.diseases === 'string' && reportsPatient.diseases.trim()
          ? [reportsPatient.diseases]
          : [],
      allergies: Array.isArray(reportsPatient.allergies)
        ? reportsPatient.allergies
        : typeof reportsPatient.allergies === 'string' && reportsPatient.allergies.trim()
          ? [reportsPatient.allergies]
          : [],
      medicalHistory: reportsPatient.medicalHistory ?? '',
      emergencyContact: reportsPatient.emergencyContact ?? {
        name: '',
        phone: '',
        relation: '',
        otherRelation: '',
      },
      medicalReports,
      deletedDocumentIds,
      temporaryDocumentIds,
    };

    await updatePatientMutation.mutateAsync({
      id: reportsPatient.id,
      data: payload,
    });
  };

const handleEditPatient = async (data: ReusableFormData) => {
  const patient = editPatient ?? selectedPatient;

  if (!patient) return;

  const hasName = !!String(data.emergencyContactName ?? "").trim();
const hasPhone = !!String(data.emergencyContactPhone ?? "").trim();
  const hasRelation = !!data.emergencyContactRelation;

  const filledCount =
    Number(hasName) +
    Number(hasPhone) +
    Number(hasRelation);

  if (filledCount > 0 && filledCount < 3) {
    toast.error(
      "Please fill Contact Name, Contact Phone and Relation together, or leave all three empty."
    );
    return;
  }

  if (
    data.emergencyContactRelation === "OTHER" &&
    !String(data.emergencyContactOtherRelation ?? "").trim()
  ) {
    toast.error("Please specify the other relation.");
    return;
  }


  const payload = {
    ...data,
medicalReports:
Array.isArray(data.medicalReports)
  ? data.medicalReports.filter(
      (doc) =>
        doc.file &&
        doc.documentName.trim()
    )
  : [],
deletedDocumentIds: Array.isArray(data.medicalReportsDeletedIds)
  ? data.medicalReportsDeletedIds.filter(
      (id): id is string => typeof id === "string"
    )
  : [],
  
emergencyContact: {
  name: data.emergencyContactName,
  phone: data.emergencyContactPhone,
  relation: data.emergencyContactRelation,
  otherRelation:
    data.emergencyContactRelation === "OTHER"
      ? data.emergencyContactOtherRelation
      : null,
},
  };

  await updatePatientMutation.mutateAsync({
    id: patient.id,
    data: payload as PatientCreateData,
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
    
    
    // {
    //   accessorKey: 'status',
    //   header: 'Status',
    //   cell: ({ row }) => {
    //     const isActive = getIsActive(row.original);
    //     return (
    //       <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
    //         {isActive ? 'ACTIVE' : 'INACTIVE'}
    //       </Badge>
    //     );
    //   },
    // },
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
             onClick={(e) => {
  e.stopPropagation();
  handleOpenDetails(patient);
}}
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
{isActive && canEditPatient && (
  <Button
    size="sm"
    variant="outline"
   onClick={(e) => {
  e.stopPropagation();
  handleOpenEditPatient(patient);
}}
  >
    <UserCog className="h-4 w-4" />
  </Button>
)}
            {isActive && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
  e.stopPropagation();
  handleBookAppointment(patient);
}}
                title="Book appointment"
              >
                Book Appointment
              </Button>
            )}
            {isActive && canEditPatient && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenReports(patient);
                }}
                title="Upload reports"
              >
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </Button>
            )}
            {/* <Button
              size="sm"
              variant="outline"
              onClick={() => handleToggleStatus(patient)}
              title={isActive ? 'Deactivate patient' : 'Activate patient'}
              className={isActive
                ? 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200'
                : 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200'}
            >
              {isActive ? <Trash2 className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            </Button> */}
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
 {canEditPatient && (
  <Button
    onClick={handleOpenAddPatient}
    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
  >
    <UserPlus className="mr-2 h-4 w-4" />
    Add Patient
  </Button>
)}
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
        <TabsList className="grid grid-cols-1 w-full max-w-md">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            All Patients ({activeCount})
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
                View and manage patient information
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
                  onRowClick={handleOpenDetails}
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
<Modal
  isOpen={isPhoneModalOpen}
  onClose={() => setIsPhoneModalOpen(false)}
  title="Enter Patient Phone"
  footer={
    <Button
      onClick={handleContinue}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      Continue
    </Button>
  }
>
  <Input
    value={phoneInput}
    onChange={(e) => setPhoneInput(e.target.value)}
    placeholder="Enter 10-digit phone number"
    maxLength={10}
  />
</Modal>
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Select Patient Profile"
        size="lg"
        footer={
          <Button onClick={handleAddFamilyMember}
          className="bg-blue-600 hover:bg-blue-700 text-white">
            Add Family Member
          </Button>
        }
      >
        <div className="space-y-4">
          {familyProfiles.map((profile) => (
            <Card key={profile._id} className="border-slate-200 shadow-sm">
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{profile.name}</p>
                  <p className="text-sm text-slate-600">Patient Code: {profile.patientCode}</p>
                  <p className="text-sm text-slate-600">Relation: {profile.relation}</p>
                  {profile.relation === 'OTHER' && profile.otherRelation && (
                    <p className="text-sm text-slate-600">
                      Other Relation: {profile.otherRelation}
                    </p>
                  )}
                </div>
                <Button onClick={() => handleCreateAppointment(profile)}
                  className="bg-blue-600 hover:bg-blue-700 text-white">
                  Create Appointment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Modal>
      <Modal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        title="Book Appointment"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAppointmentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createAppointmentMutation.mutate()}
              disabled={
                !appointmentForm.patientId ||
                !appointmentForm.doctorId ||
                !appointmentForm.date ||
                !appointmentForm.slot ||
                availableSlotsResponse?.doctorAvailable === false ||
                createAppointmentMutation.isPending
              }
            >
              {createAppointmentMutation.isPending ? 'Booking...' : 'Create Appointment'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
            Patient: <span className="font-medium">{appointmentPatientName}</span>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Doctor</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={appointmentForm.doctorId}
              onChange={(event) => setAppointmentForm((current) => ({
                ...current,
                doctorId: event.target.value,
                slot: '',
              }))}
            >
              <option value="">Select doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.user?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
      <Input
  type="date"
  min={today}
  value={appointmentForm.date}
  disabled={!appointmentForm.doctorId}
  onClick={(event) => {
    event.currentTarget.showPicker?.();
  }}
  onChange={(event) =>
    setAppointmentForm((current) => ({
      ...current,
      date: event.target.value,
      slot: '',
    }))
  }
  className="cursor-pointer"
/>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Available Slots</label>
            {!appointmentForm.doctorId || !appointmentForm.date ? (
              <p className="text-sm text-slate-500">Choose a doctor and date to load available slots.</p>
            ) : isSlotsLoading ? (
              <p className="text-sm text-slate-500">Loading available slots...</p>
            ) : availableSlotsResponse?.doctorAvailable === false ? (
              <p className="text-sm text-red-600">Doctor unavailable on selected day.</p>
            ) : (availableSlotsResponse?.availableSlots ?? []).length ? (
              <div className="flex flex-wrap gap-2">
                {(availableSlotsResponse?.availableSlots ?? []).map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    variant={appointmentForm.slot === slot ? 'default' : 'outline'}
                    onClick={() => setAppointmentForm((current) => ({ ...current, slot }))}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No slots available for this date.</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason (optional)</label>
            <Textarea
              value={appointmentForm.reason}
              onChange={(event) => setAppointmentForm((current) => ({
                ...current,
                reason: event.target.value,
              }))}
              placeholder="Reason for visit"
            />
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isReportsModalOpen}
        onClose={() => {
          setIsReportsModalOpen(false);
          setReportsPatient(null);
        }}
        title="What do you want to upload?"
      >
     <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              setIsReportsModalOpen(false);
              setIsPrescriptionDialogOpen(true);
            }}
          >
            Prescription
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsReportsModalOpen(false);
              setIsMedicalReportsModalOpen(true);
            }}
          >
            Medical Reports
          </Button>
        </div>
      </Modal>
      <PrescriptionDialog
        key={`${reportsPatient?.id ?? 'none'}-${isPrescriptionDialogOpen ? 'open' : 'closed'}`}
        patient={reportsPatient}
        open={isPrescriptionDialogOpen}
        onOpenChange={(open) => {
          setIsPrescriptionDialogOpen(open);
          if (!open) setReportsPatient(null);
        }}
      />
      {reportsPatient && (
        <ReusableModal
          isOpen={isMedicalReportsModalOpen}
          onClose={() => {
            setIsMedicalReportsModalOpen(false);
            setReportsPatient(null);
          }}
          onSave={handleSaveMedicalReports}
          title={`Medical Reports - ${reportsPatient.patientCode}`}
          sections={[
            {
              title: 'Patient Information',
              icon: <User className="h-4 w-4" />,
              fields: [
                {
                  name: 'name',
                  label: 'Name',
                  type: 'text',
                  required: true,
                  width: 'half',
                  disabled: true,
                  placeholder: 'Patient name',
                },
                {
                  name: 'phoneNumber',
                  label: 'Phone',
                  type: 'tel',
                  required: true,
                  width: 'half',
                  disabled: true,
                  placeholder: 'Phone number',
                },
                {
                  name: 'patientCode',
                  label: 'Patient Code',
                  type: 'text',
                  width: 'half',
                  disabled: true,
                  placeholder: 'Patient code',
                },
              ],
            },
            {
              title: 'Documents',
              icon: <FileText className="h-4 w-4" />,
              fields: [
                {
                  name: 'medicalReports',
                  label: 'Documents',
                  type: 'patient-document-manager',
                  required: false,
                  width: 'full',
                },
              ],
            },
          ]}
          initialData={{
            name: reportsPatient.name,
            phoneNumber: reportsPatient.phoneNumber,
            patientCode: reportsPatient.patientCode,
            medicalReports: reportsPatient.medicalReports ?? [],
          }}
          isEdit={true}
          size="lg"
          saveButtonText={updatePatientMutation.isPending ? 'Uploading...' : 'Upload Reports'}
          cancelButtonText="Cancel"
          validationOnChange={true}
        />
      )}
      <ReusableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddPatient}
        title="Add New Patient"
        sections={formSections}
        initialData={{
          patientCode: nextPatientCode || 'Loading...',
          phoneNumber: patientPhone,
          relation: familyProfiles.length > 0 ? 'FATHER' : 'SELF',
        }}
        size="xl"
        saveButtonText={addPatientMutation.isPending ? 'Adding...' : 'Add Patient'}
        cancelButtonText="Cancel"
        saveButtonColor="linear-gradient(135deg, #3b82f6, #0ea5e9)"
        validationOnChange={true}
           showScannedFiles={false}
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
          showScannedFiles={false}
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
          {getIsActive(patientForDetails) && canEditPatient && (
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
            {/* <Button
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
            </Button> */}
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
              {/* <Badge className={getIsActive(patientForDetails) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {getIsActive(patientForDetails) ? 'ACTIVE' : 'INACTIVE'}
              </Badge> */}
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

  <DetailItem
  label="Emergency Contact Other Relation"
  value={patientForDetails.emergencyContact?.otherRelation}
/>


                <DetailItem label="Symtoms" value={formatList(patientForDetails.diseases)} />
                <DetailItem label="Allergies" value={formatList(patientForDetails.allergies)} />
                <DetailItem label="Medical History" value={patientForDetails.medicalHistory} />
                <DetailItem
                  label="Documents"
                  value={renderMedicalReports(patientForDetails.medicalReports)}
                />
                {/* <DetailItem label="Status" value={getIsActive(patientForDetails) ? 'ACTIVE' : 'INACTIVE'} /> */}
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
