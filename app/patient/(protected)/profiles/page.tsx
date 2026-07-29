"use client";

import { ReactNode, useMemo, useState } from 'react';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Eye,
  Heart,
    FileText,
  Phone,
  RefreshCw,
  Search,
  Shield,
  Stethoscope,
  Trash2,

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

import Modal from '@/components/ui/modal';

import ReusableModal, { FormSection, ReusableFormData } from '@/components/reusable/reusable-modal';


import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAddPatientProfile,
  useClinicProfiles,
  usePatientById,
  useUpdatePatient,
  type ClinicProfile,
  
} from "@/services/admin/patient";
import { useRouter } from "next/navigation";
import { 
  User, 
  ArrowRight, 
  Plus,
} from "lucide-react";

import { usePatientPortalSelection } from "@/lib/hooks/usePatientPortalSelection";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";


const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  )
    return null;

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="text-sm font-medium text-slate-900 break-words">
        {value}
      </div>
    </div>
  );
};

const formatList = (value?: string[] | string) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value || "";
};

const formatDate = (value?: Date) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
};

interface MedicalReport {
  _id?: string;
  id?: string;
  fileName: string;
  originalName?: string;
  filePath?: string;
  mimeType?: string;
  fileSize?: number;
  uploadedAt?: string | Date;
  downloadUrl?: string;
}

const renderMedicalReports = (reports?: MedicalReport[]) => {
  if (!reports?.length) {
    return <p className="text-sm text-slate-500">No documents uploaded</p>;
  }

  return (
    <div className="space-y-2">
      {reports.map((report, index) => (
        <a
          key={report._id || report.id || report.filePath || index}
          href={
            report.filePath
              ? `${process.env.NEXT_PUBLIC_API_URL}${report.filePath}`
              : report.downloadUrl
          }
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-blue-600 underline"
        >
          {report.originalName || report.fileName}
        </a>
      ))}
    </div>
  );
};



const getIsActive = (patient: any) =>
  patient?.user?.isActive ?? patient?.status !== "INACTIVE";

export default function FamilyProfilesPage() {
const router = useRouter();

const {
  patientId,
  adminId,
  setSelection,
} = usePatientPortalSelection();

const [isAddMemberOpen, setIsAddMemberOpen] =
  useState(false);
const [selectedPatientId, setSelectedPatientId] =
  useState("");

const [isDetailsOpen, setIsDetailsOpen] =
  useState(false);
  const [isEditOpen, setIsEditOpen] =
  useState(false);
const [memberForm, setMemberForm] =
  useState({
    name: "",
    age: "",
    gender: "",
    relation: "",
    otherRelation: "",
    bloodGroup: "",
    adhar: "",
    address: "",
    diseases: "",
    allergies: "",
    medicalHistory: "",
  });

  const [editForm, setEditForm] = useState({
  name: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  bloodGroup: "",
  address: "",
});
const relationOptions = [
  { value: "SELF", label: "Self" },
  { value: "FATHER", label: "Father" },
  { value: "MOTHER", label: "Mother" },
  { value: "CHILD", label: "Child" },
  { value: "SPOUSE", label: "Spouse" },
  { value: "OTHER", label: "Other" },
];

const enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

const bloodGroupOptions = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];
const {
  data,
  isLoading,
} = useClinicProfiles(adminId);

const { data: activePatient } =
  usePatientById(patientId);


  const { data: patientDetails } =
  usePatientById(selectedPatientId);


  const updatePatientMutation =
  useUpdatePatient({
    onSuccess: () => {
      toast.success(
        "Patient updated successfully"
      );

      setIsEditOpen(false);
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });


  const handleEditPatient = async (
  data: ReusableFormData
) => {


  const payload = {
    ...data,
    medicalReports: Array.isArray(data.medicalReports)
      ? data.medicalReports.filter(
          (document): document is { documentName: string; file: File } =>
            Boolean(
              document &&
                typeof document === "object" &&
                "documentName" in document &&
                "file" in document &&
                typeof document.documentName === "string" &&
                document.documentName.trim() &&
                document.file instanceof File,
            ),
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

if (!patientDetails?.id) return;

await updatePatientMutation.mutateAsync({
  id: patientDetails.id,
  data: payload,
});
};

const addPatientProfile =
  useAddPatientProfile({
    onSuccess: () => {
      toast.success("Member added");
      setIsAddMemberOpen(false);
      setMemberForm({
        name: "",
        age: "",
        gender: "",
        relation: "",
        otherRelation: "",
        bloodGroup: "",
        adhar: "",
        address: "",
        diseases: "",
        allergies: "",
        medicalHistory: "",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

const familyMembers =
  data?.profiles || [];


  const getInitialData = (patient: any) => ({
  name: patient.name || "",
  phoneNumber: patient.phoneNumber || "",
  email: patient.email || "",
  age: patient.age || "",
  gender: patient.gender || "",
  bloodGroup: patient.bloodGroup || "",
  adhar: patient.adhar || "",
  address: patient.address || "",
  relation: patient.relation || "SELF",
  otherRelation: patient.otherRelation || "",
  diseases: formatList(patient.diseases),
  allergies: formatList(patient.allergies),
  medicalHistory: patient.medicalHistory || "",

  emergencyContactName:
    patient.emergencyContact?.name || "",

  emergencyContactPhone:
    patient.emergencyContact?.phone || "",

  emergencyContactRelation:
    patient.emergencyContact?.relation || "",
});



  const formSections: FormSection[] = useMemo(() => [
    {
      title: 'Patient Information',
      icon: <User className="h-4 w-4" />,
      fields: [

      
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
   
  ],[] );



  const handleSwitchProfile = (
  patientId: string
) => {
  setSelection({
    patientId,
    adminId,
  });

router.push(
  "/patient/dashboard"
);
};

const editFormSections = useMemo(
  () =>
    formSections.map((section) => ({
      ...section,
      fields: section.fields.filter(
        (field) => field.name !== "patientCode"
      ),
    })),
  [formSections]
);

if (isLoading) {
  return (
    <Card>
      <CardContent className="py-10 text-center">
        Loading profiles...
      </CardContent>
    </Card>
  );
}
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Family Profiles</h1>
          <p className="text-slate-500">Manage all profiles associated with <span className="font-bold text-slate-700">{activePatient?.phoneNumber || "your account"}</span></p>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-4">
        {familyMembers.map((profile: ClinicProfile) => (
          <Card key={profile._id} className="hover:border-blue-200 transition-all shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
                {/* <Avatar className="h-16 w-16 lg:h-20 lg:w-20 border-2 border-slate-100">
                  <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                    {profile.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar> */}
                
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">{profile.name}</h3>
                    <Badge variant="secondary" className="w-fit mx-auto sm:mx-0 bg-slate-100 text-slate-600 border-none">
                      {profile.relation === "OTHER"
  ? profile.otherRelation
  : profile.relation}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-3">

                    <span className="h-1 w-1 bg-slate-600 rounded-full" />
                    <span className="font-mono text-s">    ID:  {profile?.patientCode || ""}</span>
                  </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">

<Button
  variant="outline"
  onClick={() => {
    setSelectedPatientId(profile._id);
    setIsDetailsOpen(true);
  }}
>
  View Details
</Button>

                  <Button
                    variant="outline"
                    className="flex-1 sm:w-auto gap-2"
                    onClick={() => {
                      setSelection({
                        patientId: profile.patientCode,
                        adminId,
                      });
                      router.push("/patient/history");
                    }}
                  >
                    View History
                  </Button>
<Button
  className="flex-1 sm:w-auto gap-2 bg-blue-600"
  onClick={() =>
    handleSwitchProfile(profile._id)
  }
>
  Switch Profile
  <ArrowRight className="h-4 w-4" />
</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3 text-yellow-800 text-sm">
        <User className="h-5 w-5 flex-shrink-0" />
        <p>
          <strong>Note:</strong> All medical reports and appointment history are specific to each profile. You can switch profiles to book appointments or view reports for family members.
        </p>
      </div>

      <Dialog
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={memberForm.name}
                onChange={(e) =>
                  setMemberForm({
                    ...memberForm,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Age</Label>
                <Input
                  type="number"
                  value={memberForm.age}
                  onChange={(e) =>
                    setMemberForm({
                      ...memberForm,
                      age: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Gender</Label>
                <Select
                  value={memberForm.gender}
                  onValueChange={(value) =>
                    setMemberForm({
                      ...memberForm,
                      gender: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Relation</Label>
              <Select
                value={memberForm.relation}
                onValueChange={(value) =>
                  setMemberForm({
                    ...memberForm,
                    relation: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELF">Self</SelectItem>
                  <SelectItem value="FATHER">Father</SelectItem>
                  <SelectItem value="MOTHER">Mother</SelectItem>
                  <SelectItem value="SPOUSE">Spouse</SelectItem>
                  <SelectItem value="CHILD">Child</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {memberForm.relation === "OTHER" && (
              <div>
                <Label>Other Relation</Label>
                <Input
                  value={memberForm.otherRelation}
                  onChange={(e) =>
                    setMemberForm({
                      ...memberForm,
                      otherRelation: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Blood Group</Label>
                <Input
                  value={memberForm.bloodGroup}
                  onChange={(e) =>
                    setMemberForm({
                      ...memberForm,
                      bloodGroup: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Aadhaar</Label>
                <Input
                  value={memberForm.adhar}
                  onChange={(e) =>
                    setMemberForm({
                      ...memberForm,
                      adhar: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Textarea
                value={memberForm.address}
                onChange={(e) =>
                  setMemberForm({
                    ...memberForm,
                    address: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddMemberOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600"
              disabled={
                addPatientProfile.isPending ||
                !memberForm.name ||
                !activePatient?.phoneNumber
              }
              onClick={() =>
                addPatientProfile.mutate({
                  name: memberForm.name,
                  phoneNumber: activePatient?.phoneNumber,
                  age: memberForm.age ? Number(memberForm.age) : undefined,
                  gender: memberForm.gender
                    ? (memberForm.gender as "MALE" | "FEMALE" | "OTHER")
                    : undefined,
                  relation: memberForm.relation || "OTHER",
                  otherRelation: memberForm.otherRelation,
                  bloodGroup: memberForm.bloodGroup,
                  adhar: memberForm.adhar,
                  address: memberForm.address,
                  diseases: memberForm.diseases,
                  allergies: memberForm.allergies,
                  medicalHistory: memberForm.medicalHistory,
                })
              }
            >
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
<Modal
  isOpen={isDetailsOpen}
  onClose={() => setIsDetailsOpen(false)}
  title="Patient Details"
  size="xl"
  footer={
    patientDetails ? (
      <Button
        variant="outline"
        onClick={() => {
          setIsDetailsOpen(false);
          setIsEditOpen(true);
        }}
      >
        <UserCog className="mr-2 h-4 w-4" />
        Edit Details
      </Button>
    ) : undefined
  }
>
  {patientDetails ? (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Patient Code
          </p>

          <p className="text-lg font-semibold text-blue-700">
            {patientDetails.patientCode}
          </p>
        </div>

        <Badge
          className={
            getIsActive(patientDetails)
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }
        >
          {getIsActive(patientDetails)
            ? "ACTIVE"
            : "INACTIVE"}
        </Badge>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <User className="h-4 w-4" />
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-lg border bg-white p-4">
          <DetailItem label="Name" value={patientDetails.name} />
          <DetailItem label="Phone" value={patientDetails.phoneNumber} />
          <DetailItem label="Email" value={patientDetails.email} />
          <DetailItem
            label="Age"
            value={
              patientDetails.age
                ? `${patientDetails.age} years`
                : ""
            }
          />
          <DetailItem label="Gender" value={patientDetails.gender} />
          <DetailItem
            label="Blood Group"
            value={patientDetails.bloodGroup}
          />
          <DetailItem
            label="Aadhaar"
            value={patientDetails.adhar}
          />
          <DetailItem
            label="Address"
            value={patientDetails.address}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Relation & Medical Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-lg border bg-white p-4">
          <DetailItem
            label="Relation"
            value={patientDetails.relation}
          />

          <DetailItem
            label="Other Relation"
            value={patientDetails.otherRelation}
          />

          {patientDetails.relation !== "SELF" && (
            <>
              <DetailItem
                label="Family Head"
                value={patientDetails.familyHead?.name}
              />

              <DetailItem
                label="Family Head Code"
                value={
                  patientDetails.familyHead?.patientCode
                }
              />
            </>
          )}

          <DetailItem
            label="Emergency Contact Name"
            value={
              patientDetails.emergencyContact?.name
            }
          />

          <DetailItem
            label="Emergency Contact Phone"
            value={
              patientDetails.emergencyContact?.phone
            }
          />

          <DetailItem
            label="Emergency Contact Relation"
            value={
              patientDetails.emergencyContact?.relation
            }
          />

          <DetailItem
            label="Symtoms"
            value={formatList(patientDetails.diseases)}
          />

          <DetailItem
            label="Allergies"
            value={formatList(patientDetails.allergies)}
          />

          <DetailItem
            label="Medical History"
            value={patientDetails.medicalHistory}
          />
<DetailItem
  label="Documents"
  value={renderMedicalReports(
    patientDetails?.medicalReports
  )}
/>

          <DetailItem
            label="Status"
            value={
              getIsActive(patientDetails)
                ? "ACTIVE"
                : "INACTIVE"
            }
          />

          <DetailItem
            label="Created Date"
            value={formatDate(patientDetails.createdAt)}
          />

          {!getIsActive(patientDetails) && (
            <DetailItem
              label="Inactive Since"
              value={formatDate(patientDetails.updatedAt)}
            />
          )}
        </div>
      </div>
    </div>
  ) : (
    <p className="text-sm text-slate-500">
      Patient details could not be loaded.
    </p>
  )}
</Modal>

<ReusableModal
  isOpen={isEditOpen}
  onClose={() => setIsEditOpen(false)}
  onSave={handleEditPatient}
  title={`Edit Patient - ${patientDetails?.patientCode}`}
  sections={editFormSections}
  initialData={
    patientDetails
      ? getInitialData(patientDetails)
      : {}
  }
  isEdit
  size="xl"
  saveButtonText="Update Patient"
/>






    </div>
  );
}
