"use client";

import { useState,useEffect } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Edit,
  Save,
  X,
  Key,
  Briefcase,
  Calendar,
  BadgeCheck,
  Building2,
  Award,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useStaffById ,useUpdateStaff ,useUpdateStaffPassword,} from "@/services/admin/staff";
import ReusableModal, {
  FormSection,
  ReusableFormData,
} from "@/components/reusable/reusable-modal";

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
}) => (
  <div className="flex items-start gap-3 p-4 rounded-xl border bg-slate-50">
    <div className="text-blue-600 mt-1">
      {icon}
    </div>

    <div>
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="font-semibold text-slate-900">
        {value || "-"}
      </p>
    </div>
  </div>
);

export default function StaffProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
const [passwordModalKey, setPasswordModalKey] = useState(0);
const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
const [selectedProfileImage, setSelectedProfileImage] =
  useState<File | null>(null);

    const [staffId, setstaffId] = useState<string>();

  useEffect(() => {
  const token = localStorage.getItem("access_token");

  if (token) {
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      setstaffId(payload.id);
    } catch (error) {
      console.error("Token parse failed", error);
    }
  }
}, []);

const {
  data: staff,
  isLoading,
  refetch,
} = useStaffById(staffId);


const updateStaffMutation = useUpdateStaff({
  onSuccess: () => {
    toast.success("Profile updated");
    setIsEditing(false);
    setSelectedDocuments([]);
    refetch();
  },
});
const updateStaffPasswordMutation =
  useUpdateStaffPassword({
    onSuccess: () => {
      toast.success("Password updated successfully");
      setIsPasswordModalOpen(false);
      setPasswordModalKey((prev) => prev + 1);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

const [formData, setFormData] = useState({
  email: "",
  skill: "",
  registrationNo: "",
  experience: 0,
  phone:"",
});

useEffect(() => {
  if (staff) {
    setFormData({
      email: staff.email || "",
      skill: staff.skill || "",
      registrationNo: staff.registrationNo || "",
      experience: Number(staff.experience || ""),
      phone: staff.phone || "",
    });
  }
}, [staff]);



const handleInputChange = (
  field: keyof typeof formData,
  value: string | number
) => {
  setFormData((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const handleSave = () => {
  if (!staff?.id) return;

  updateStaffMutation.mutate({
    id: staff.id,
    data: {
      email: formData.email,
      skill: formData.skill,
      registrationNo: formData.registrationNo,
      experience: String(formData.experience),
      phone: formData.phone,
      profileImage: selectedProfileImage,
      documents: selectedDocuments,
    },
  });
};

const resetForm = () => {
  if (!staff) return;

  setFormData({
    email: staff.email || "",
    skill: staff.skill || "",
    registrationNo: staff.registrationNo || "",
    experience: Number(staff.experience || ""),
    phone: staff.phone || "",
  });
  setSelectedDocuments([]);
  setSelectedProfileImage(null);
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
  if (!staff?.id) return;

  updateStaffPasswordMutation.mutate({
    id: staff.id,
    newPassword: String(data.newPassword),
  });
};

if (isLoading) {
  return <div>Loading...</div>;
}

if (!staff) {
  return <div>No profile found</div>;
}
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <div className="flex gap-2 w-full sm:w-auto">
   

  <Button
    variant="outline"
    onClick={() => setIsPasswordModalOpen(true)}
  >
    <Key className="h-4 w-4 mr-2" />
    Change Password
  </Button>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto gap-2 bg-blue-600">
              <Edit className="h-4 w-4" /> Edit
            </Button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={handleSave} className="flex-1 sm:w-auto gap-2 bg-green-600">
                <Save className="h-4 w-4" /> Save
              </Button>
             <Button   onClick={() => {
    setIsEditing(false);
    resetForm();
  }}

 variant="outline" className="flex-1 sm:w-auto gap-2">
                <X className="h-4 w-4" /> Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-0">

<div className="bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 p-8">
<div className="flex flex-col md:flex-row items-center gap-6">
  <div className="relative">
    <img
      key={staff.profileImageUrl}
      src={
        selectedProfileImage
          ? URL.createObjectURL(selectedProfileImage)
          : staff.profileImageUrl || "/default-avatar.png"
      }
      alt="staff"
      className="h-28 w-28 rounded-full object-cover border-4 border-white/30"
    />
    {isEditing && (
      <label
        htmlFor="staff-profile-upload"
        className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700"
      >
        +
        <input
          id="staff-profile-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setSelectedProfileImage(e.target.files?.[0] || null)}
        />
      </label>
    )}
  </div>

  <div className="text-white">
    <h2 className="text-3xl font-bold">
      {staff?.name}
    </h2>

<p className="text-slate-800 mt-1 text-lg font-bold">
  {staff?.category || "Staff Member"}
</p>

    <div className="flex flex-wrap gap-3 mt-4">
      <Badge className="bg-white text-blue-700">
        {staff?.staffCode}
      </Badge>

      <Badge
        className={
          staff?.isActive
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }
      >
        {staff?.isActive ? "Active" : "Inactive"}
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
        {staff?.experience || 0} Years
      </p>
    </CardContent>
  </Card>

  <Card>
    <CardContent className="p-4">
      <p className="text-xs text-slate-500">
        Shift
      </p>
      <p className="text-xl font-bold text-orange-600">
        {staff?.shift || "-"}
      </p>
    </CardContent>
  </Card>

  <Card>
    <CardContent className="p-4">
      <p className="text-xs text-slate-500">
        Department
      </p>
      <p className="text-xl font-bold text-blue-600">
        {staff?.department || "-"}
      </p>
    </CardContent>
  </Card>

  <Card>
    <CardContent className="p-4">
      <p className="text-xs text-slate-500">
        Working Hours
      </p>
<div className="flex items-center gap-2">
  <Clock className="h-5 w-5 text-green-600" />
  <p className="text-xl font-bold text-green-600">
    {staff?.workingHours?.start || "--:--"} -{" "}
    {staff?.workingHours?.end || "--:--"}
  </p>
</div>
    </CardContent>
  </Card>

</div>
          <Separator className="bg-slate-100" />

        <div className="p-6 space-y-6">

<Card>
  <CardHeader>
    <CardTitle>
      Personal Information
    </CardTitle>
  </CardHeader>

<CardContent className="grid md:grid-cols-2 gap-4">

  <div>
    <Label>Phone</Label>
    {isEditing ? (
      <Input
        value={formData.phone}
        onChange={(e) =>
          handleInputChange("phone", e.target.value)
        }
      />
    ) : (
      <p className="font-medium">{staff?.phone}</p>
    )}
  </div>

  <div>
    <Label>Email</Label>
    {isEditing ? (
      <Input
        value={formData.email}
        onChange={(e) =>
          handleInputChange("email", e.target.value)
        }
      />
    ) : (
      <p className="font-medium">{staff?.email}</p>
    )}
  </div>

  <div className="md:col-span-2">
    <Label>Address</Label>
    {isEditing ? (
      <Input
        value={staff?.address || ""}
        disabled
      />
    ) : (
      <p className="font-medium">{staff?.address}</p>
    )}
  </div>

  <div>
    <Label>Gender</Label>
    <p className="font-medium">
      {staff?.gender || "-"}
    </p>
  </div>

</CardContent>
</Card>

<Card>
  <CardHeader>
    <CardTitle>
      Employment Information
    </CardTitle>
  </CardHeader>

  <CardContent className="grid md:grid-cols-2 gap-4">

    <InfoItem
      icon={<Hash size={18} />}
      label="Staff Code"
      value={staff?.staffCode}
    />

    <InfoItem
      icon={<Briefcase size={18} />}
      label="Category"
      value={staff?.category}
    />

    <InfoItem
      icon={<Building2 size={18} />}
      label="Department"
      value={staff?.department}
    />

    <InfoItem
      icon={<Calendar size={18} />}
      label="Joining Date"
      value={
        staff?.joiningDate
          ? new Date(
              staff.joiningDate
            ).toLocaleDateString()
          : "-"
      }
    />

  </CardContent>
</Card>

<Card>
  <CardHeader>
    <CardTitle>
      Professional Information
    </CardTitle>
  </CardHeader>

  <CardContent className="grid md:grid-cols-2 gap-4">

<div>
  <Label>Skill</Label>
  {isEditing ? (
    <Input
      value={formData.skill}
      onChange={(e) =>
        handleInputChange("skill", e.target.value)
      }
    />
  ) : (
    <p>{staff?.skill || "-"}</p>
  )}
</div>

<div>
  <Label>Experience</Label>
  {isEditing ? (
    <Input
      type="number"
      value={formData.experience}
      onChange={(e) =>
        handleInputChange(
          "experience",
          Number(e.target.value)
        )
      }
    />
  ) : (
    <p>{staff?.experience || 0} Years</p>
  )}
</div>

<div>
  <Label>Registration Number</Label>
  {isEditing ? (
    <Input
      value={formData.registrationNo}
      onChange={(e) =>
        handleInputChange(
          "registrationNo",
          e.target.value
        )
      }
    />
  ) : (
    <p>{staff?.registrationNo || "-"}</p>
  )}
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
    {staff?.documents?.length ? (
      staff.documents.map((doc, index) => (
        <a
          key={doc._id || doc.filePath || index}
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

  </CardContent>
</Card>

</div>
       
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
    updateStaffPasswordMutation.isPending
      ? "Updating..."
      : "Update Password"
  }
  validationOnChange
/>
      </Card>
    </div>
  );
}
