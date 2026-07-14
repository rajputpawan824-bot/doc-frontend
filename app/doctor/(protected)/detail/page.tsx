"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  IndianRupee,
  Stethoscope,
  Eye,
  Edit,
  Save,
  X,
  Loader2,
  FileText,
  BriefcaseMedical,
  Key,
} from "lucide-react";

import { useDoctorById, useUpdateDoctor,  useUpdateDoctorPassword, } from "@/services/admin/doctor";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReusableModal, {
  FormSection,
  ReusableFormData,
} from "@/components/reusable/reusable-modal";

interface DoctorDetails {
  id: string;
  name: string;
  image?: string;
  registrationNo: string;
  qualification: string;
  location: string;
  mobileNumber: string;
  email: string;
  department: string;
  experience: number;
  workingHours: { start: string; end: string };
  consultationDays: string[];
  consultationFee?: number;
  lastUpdated: string;
  updatedBy: string;
  profileImageUrl?: string;
}

interface DoctorDetailsSectionProps {
  initialData?: DoctorDetails;
}

export default function DoctorDetailsSection({
  initialData,
}: DoctorDetailsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
const [passwordModalKey, setPasswordModalKey] = useState(0);
const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
const [selectedProfileImage, setSelectedProfileImage] =
  useState<File | null>(null);

  
const [userId, setUserId] = useState<string>();

useEffect(() => {
  const token = localStorage.getItem("access_token");

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.id);
    } catch (error) {
      console.error("Failed to decode token", error);
    }
  }
}, []);

const {
  data: doctor,
  isLoading,
  error,
  refetch,
} = useDoctorById(userId);

console.log("Doctor Response:", doctor);
console.log(
  "Doctor Profile Image:",
  doctor?.user?.profileImage
);

  const updateDoctorMutation = useUpdateDoctor({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      setSelectedDocuments([]);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

const updateDoctorPasswordMutation =
  useUpdateDoctorPassword();
  
  const [doctorData, setDoctorData] = useState<DoctorDetails | null>(null);

  useEffect(() => {
    if (doctor) {
      setDoctorData({
        id: doctor.id,
        name: doctor.user?.name || "",
        registrationNo: doctor.registrationNo || "",
        qualification: doctor.qualification || "",
        location: doctor.address || "",
        mobileNumber: doctor.user?.phone || "",
        email: doctor.user?.email || "",
        department: doctor.department || "",
        experience: doctor.experience || 0,
        workingHours: {
          start: doctor.workingHours?.start || "-",
          end: doctor.workingHours?.end || "-",
        },
        consultationDays: doctor.availabilityDays || [],
        consultationFee: doctor.consultationFee || 0,
        lastUpdated: doctor.updatedAt,
        updatedBy: "System",
        profileImageUrl:  doctor?.profileImageUrl,
      });
    }
  }, [doctor]);
  console.log("Doctor Data State:", doctorData);
  console.log('doctor', doctor)

  const handleInputChange = (
    field: keyof DoctorDetails,
    value: string | number | string[]
  ) => {
    if (!doctorData) return;
    
    setDoctorData((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };
  
const handleSave = () => {
  if (!doctorData || !doctor) return;

  updateDoctorMutation.mutate({
    id: doctor.id,
    data: {
      phone: doctorData.mobileNumber,
      email: doctorData.email,
      registrationNo: doctorData.registrationNo,
      qualification: doctorData.qualification,
        profileImage: selectedProfileImage,
      experience: doctorData.experience,
      documents: selectedDocuments,
    },
  });
};

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedDocuments([]);
    refetch();
  };
const passwordFormSections: FormSection[] = [
  {
    title: "Change Password",
    icon: <Key className="h-4 w-4" />,
    fields: [
      {
        name: "newPassword",
        label: "New Password",
        type: "password",
        required: true,
        width: "full",
      },
      {
        name: "confirmPassword",
        label: "Confirm Password",
        type: "password",
        required: true,
        width: "full",
        validation: {
          custom: (value, formData) =>
            value === formData.newPassword
              ? null
              : "Passwords must match",
        },
      },
    ],
  },
];

const handleUpdatePassword = (
  data: ReusableFormData,
) => {
  if (!doctor?.id) return;

  updateDoctorPasswordMutation.mutate(
    {
      id: doctor.id,
      data: {
        newPassword: String(data.newPassword),
      },
    },
    {
      onSuccess: () => {
        toast.success("Password updated successfully");
        setIsPasswordModalOpen(false);
        setPasswordModalKey((prev) => prev + 1);
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to update password"
        );
      },
    }
  );
};


  if (isLoading || !doctorData) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto w-full max-w-4xl border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-red-600">Failed to load doctor profile. Please try again later.</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Stethoscope className="h-6 w-6" />
          Doctor Details / Profile
        </CardTitle>
        <div className="flex gap-2">

  <Button
    variant="outline"
    onClick={() => setIsPasswordModalOpen(true)}
  >
    <Key className="h-4 w-4 mr-2" />
    Change Password
  </Button>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="gap-2 bg-green-600 hover:bg-green-700"
                disabled={updateDoctorMutation.isPending}
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>


<CardContent className="space-y-6">

<Card className="overflow-hidden border-0 shadow-lg">
<CardContent className="p-0">

<div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 p-8">

<div className="flex flex-col md:flex-row items-center gap-6">

<div className="relative">



{/* <p className="text-red-500 break-all">
  {doctor?.user?.profileImage
    ? `https://clinic-managemnet-backend.onrender.com${doctor.user.profileImage}`
    : "NO IMAGE"}
</p> */}
<img
  key={doctor?.user?.profileImage}
  src={
    selectedProfileImage
      ? URL.createObjectURL(selectedProfileImage)
      : doctor?.profileImageUrl
      ? doctor.profileImageUrl
      : "/default-avatar.png"
  }
  alt="doctor"
  className="h-28 w-28 rounded-full object-cover border-4 border-white/30"
  onLoad={() => console.log("IMAGE LOADED")}
  onError={(e) => {
    console.log("IMAGE FAILED", e);
  }}
/>


  {isEditing && (
    <label
      htmlFor="profile-upload"
      className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700"
    >
      +

      <input
        id="profile-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          setSelectedProfileImage(
            e.target.files?.[0] || null
          )
        }
      />
    </label>
  )}
</div>

<div className="text-white">
  <h2 className="text-3xl font-bold">
    {doctorData.name}
  </h2>

  <p className="text-lg font-semibold">
    Doctor
  </p>

  <div className="flex flex-wrap gap-3 mt-4">

    <Badge className="bg-white text-blue-700">
      {doctor?.doctorCode}
    </Badge>

    <Badge
      className={
        doctor?.status === "active"
          ? "bg-green-500 text-white"
          : "bg-red-500 text-white"
      }
    >
      {doctor?.status}
    </Badge>

    <Badge className="bg-white/20 text-white">
      {doctorData.qualification}
    </Badge>

  </div>
</div>

</div>
</div>

<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-50">

<Card>
<CardContent className="p-4">
<p className="text-xs text-slate-500">
Experience
</p>
<p className="text-xl font-bold text-purple-600">
{doctorData.experience} Years
</p>
</CardContent>
</Card>

<Card>
<CardContent className="p-4">
<p className="text-xs text-slate-500">
Shift
</p>
<p className="text-xl font-bold text-orange-600">
{doctor?.shift}
</p>
</CardContent>
</Card>

<Card>
<CardContent className="p-4">
<p className="text-xs text-slate-500">
Department
</p>
<p className="text-xl font-bold text-blue-600">
{doctor?.department}
</p>
</CardContent>
</Card>

<Card>
<CardContent className="p-4">
<p className="text-xs text-slate-500">
Working Hours
</p>
<p className="text-xl font-bold text-green-600">
{doctor?.workingHours?.start} - {doctor?.workingHours?.end}
</p>
</CardContent>
</Card>

</div>

<div className="p-6 space-y-6">

<Card>
<CardHeader>
<CardTitle>Personal Information</CardTitle>
</CardHeader>

<CardContent className="grid md:grid-cols-2 gap-4">

<div>
<Label>Phone</Label>
{isEditing ? (
<Input
value={doctorData.mobileNumber}
onChange={(e) =>
handleInputChange("mobileNumber", e.target.value)
}
/>
) : (
<p>{doctorData.mobileNumber}</p>
)}
</div>

<div>
<Label>Email</Label>
{isEditing ? (
<Input
value={doctorData.email}
onChange={(e) =>
handleInputChange("email", e.target.value)
}
/>
) : (
<p>{doctorData.email}</p>
)}
</div>

<div>
<Label>Name</Label>
<p>{doctorData.name}</p>
</div>

<div>
<Label>Address</Label>
<p>{doctorData.location}</p>
</div>

</CardContent>
</Card>

<Card>
<CardHeader>
<CardTitle>Employment Information</CardTitle>
</CardHeader>

<CardContent className="grid md:grid-cols-2 gap-4">

<div>
<Label>Doctor Code</Label>
<p>{doctor?.doctorCode}</p>
</div>

<div>
<Label>Department</Label>
<p>{doctor?.department}</p>
</div>

<div>
<Label>Shift</Label>
<p>{doctor?.shift}</p>
</div>

<div>
<Label>Status</Label>
<p className="capitalize">
{doctor?.status}
</p>
</div>

</CardContent>
</Card>

<Card>
<CardHeader>
<CardTitle>Professional Information</CardTitle>
</CardHeader>

<CardContent className="grid md:grid-cols-2 gap-4">

<div>
<Label>Qualification</Label>
{isEditing ? (
<Input
value={doctorData.qualification}
onChange={(e) =>
handleInputChange("qualification", e.target.value)
}
/>
) : (
<p>{doctorData.qualification}</p>
)}
</div>

<div>
<Label>Registration Number</Label>
{isEditing ? (
<Input
value={doctorData.registrationNo}
onChange={(e) =>
handleInputChange("registrationNo", e.target.value)
}
/>
) : (
<p>{doctorData.registrationNo}</p>
)}
</div>

<div>
<Label>Experience</Label>
{isEditing ? (
<Input
type="number"
value={doctorData.experience}
onChange={(e) =>
handleInputChange(
"experience",
Number(e.target.value)
)
}
/>
) : (
<p>{doctorData.experience} Years</p>
)}
</div>

<div>
<Label>Consultation Fee</Label>
<p>₹{doctorData.consultationFee}</p>
</div>

<div className="md:col-span-2">
<Label>Documents</Label>
{isEditing && (
<Input
name="documents"
type="file"
multiple
className="mt-2"
onChange={(e) =>
setSelectedDocuments(Array.from(e.target.files || []))
}
/>
)}

<div className="mt-2 space-y-2">
{doctor?.documents?.length ? (
doctor.documents.map((doc, index) => (
<a
key={doc._id || index}
href={`https://clinic-managemnet-backend.onrender.com${doc.filePath}`}
target="_blank"
rel="noopener noreferrer"
className="block text-sm text-blue-600 underline"
>
{doc.originalName}
</a>
))
) : (
<p className="text-sm text-slate-500">No documents uploaded</p>
)}
</div>
</div>

<div className="md:col-span-2">
<Label>Availability Days</Label>

<div className="flex flex-wrap gap-2 mt-2">
{doctorData.consultationDays.map((day, index) => (
<Badge key={index} variant="outline">
{day}
</Badge>
))}
</div>

</div>

</CardContent>
</Card>

</div>

</CardContent>

</Card>
</CardContent>

      <ReusableModal
  key={passwordModalKey}
  isOpen={isPasswordModalOpen}
  onClose={() => {
    setIsPasswordModalOpen(false);
    setPasswordModalKey((prev) => prev + 1);
  }}
  onSave={handleUpdatePassword}
  title="Change Password"
  sections={passwordFormSections}
  size="md"
  saveButtonText={
    updateDoctorPasswordMutation.isPending
      ? "Updating..."
      : "Update Password"
  }
  validationOnChange
/>
    </Card>
  );
}
