"use client";

import { useEffect, useState  } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Edit,
  Save,
  X,
  UserCircle,
  Monitor,
  Key ,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useReceptionistById ,  useUpdateReceptionist, useUpdateReceptionistPassword,} from "@/services/admin/reception";
import { format } from "util";
import ReusableModal, {
  FormSection,
  ReusableFormData,
} from "@/components/reusable/reusable-modal";



export default function ReceptionistProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
const [passwordModalKey, setPasswordModalKey] = useState(0);
const {
  data: receptionist,
  isLoading,
  isError,
   refetch,
} = useReceptionistById("profile");

const [formData, setFormData] = useState({
  registrationNo:"",
  phone: "",
  email: "",

  experience: "",
});

useEffect(() => {
  if (receptionist) {
    setFormData({
    
      phone: receptionist.phoneNumber || "",
      email: receptionist.email || "",
      registrationNo: receptionist.registrationNo || "",
      experience: receptionist.experience || "",
    });
  }
}, [receptionist]);

const updateReceptionist = useUpdateReceptionist({
  onSuccess: () => {
    refetch();
    setIsEditing(false);
  },
});

const updateReceptionistPassword =
  useUpdateReceptionistPassword({
    onSuccess: () => {
      setIsPasswordModalOpen(false);
      setPasswordModalKey((prev) => prev + 1);
    },
  });

if (isLoading) {
  return <div>Loading...</div>;
}

if (isError || !receptionist) {
  return <div>Failed to load receptionist profile</div>;
}





const handleInputChange = (
  field: keyof typeof formData,
  value: string,
) => {
  setFormData((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const handleSave = () => {
  if (!receptionist?.id) return;

  updateReceptionist.mutate({
    id: receptionist.id,
    data: {
     
      phone: formData.phone,
      email:formData.email,
    
     registrationNo: formData.registrationNo,
      experience: formData.experience,
    },
  });
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
        validation: {
          minLength: 6,
        },
      },
      {
        name: "confirmPassword",
        label: "Confirm Password",
        type: "password",
        required: true,
        width: "full",
        validation: {
          minLength: 6,
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
  if (!receptionist?.id) return;

  updateReceptionistPassword.mutate({
    id: receptionist.id,
    newPassword: String(data.newPassword),
  });
};

  return (
   <div className="max-w-5xl mx-auto space-y-6">

      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
          <UserCircle className="h-6 w-6 text-blue-600" />
          Receptionist Profile
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
            <Button onClick={() => setIsEditing(true)} className="gap-2 bg-blue-600">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gap-2 bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" className="gap-2">
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

<Avatar className="h-28 w-28 border-4 border-white/30">
  <AvatarImage src="" />
  <AvatarFallback className="bg-white/20 text-white">
    <User className="h-12 w-12" />
  </AvatarFallback>
</Avatar>

<div className="text-white">
  <h2 className="text-3xl font-bold">
    {receptionist.name}
  </h2>

  <p className="text-white-100 text-lg font-bold">
    Receptionist
  </p>

  <div className="flex flex-wrap gap-3 mt-4">

    <Badge className="bg-white text-blue-700">
      {receptionist.receptionistCode}
    </Badge>

    <Badge
      className={
        receptionist.isActive
          ? "bg-green-500 text-white"
          : "bg-red-500 text-white"
      }
    >
      {receptionist.isActive
        ? "Active"
        : "Inactive"}
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
{receptionist.experience} Years
</p>
</CardContent>
</Card>

<Card>
<CardContent className="p-4">
<p className="text-xs text-slate-500">
Shift
</p>
<p className="text-xl font-bold text-orange-600">
{receptionist.shift}
</p>
</CardContent>
</Card>

<Card>
<CardContent className="p-4">
<p className="text-xs text-slate-500">
Desk Number
</p>
<p className="text-xl font-bold text-blue-600">
{receptionist.deskNumber}
</p>
</CardContent>
</Card>

<Card>
<CardContent className="p-4">
<p className="text-xs text-slate-500">
Working Hours
</p>

<p className="text-xl font-bold text-green-600">
{receptionist.workingHours?.start}
-
{receptionist.workingHours?.end}
</p>

</CardContent>
</Card>

</div>

<div className="p-6 space-y-6">

  {/* Personal Information */}
  <Card>
    <CardHeader>
      <CardTitle>Personal Information</CardTitle>
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
          <p className="font-medium">
            {receptionist.phoneNumber}
          </p>
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
          <p className="font-medium">
            {receptionist.email}
          </p>
        )}
      </div>

      <div>
        <Label>Name</Label>
        <p className="font-medium">
          {receptionist.name}
        </p>
      </div>

      <div>
        <Label>Gender</Label>
        <p className="font-medium">
          {receptionist.gender}
        </p>
      </div>

      <div className="md:col-span-2">
        <Label>Address</Label>
        <p className="font-medium">
          {receptionist.address}
        </p>
      </div>

    </CardContent>
  </Card>

  {/* Employment Information */}
  <Card>
    <CardHeader>
      <CardTitle>
        Employment Information
      </CardTitle>
    </CardHeader>

    <CardContent className="grid md:grid-cols-2 gap-4">

      <div>
        <Label>Receptionist Code</Label>
        <p>{receptionist.receptionistCode}</p>
      </div>

      <div>
        <Label>Desk Number</Label>
        <p>{receptionist.deskNumber}</p>
      </div>

      <div>
        <Label>Shift</Label>
        <p>{receptionist.shift}</p>
      </div>

      <div>
        <Label>Joining Date</Label>
        <p>
          {receptionist.joiningDate
            ? new Date(
                receptionist.joiningDate
              ).toLocaleDateString()
            : "-"}
        </p>
      </div>

    </CardContent>
  </Card>

  {/* Professional Information */}
  <Card>
    <CardHeader>
      <CardTitle>
        Professional Information
      </CardTitle>
    </CardHeader>

    <CardContent className="grid md:grid-cols-2 gap-4">

      <div>
        <Label>Experience</Label>

        {isEditing ? (
          <Input
            value={formData.experience}
            onChange={(e) =>
              handleInputChange(
                "experience",
                e.target.value
              )
            }
          />
        ) : (
          <p>
            {receptionist.experience} Years
          </p>
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
          <p>
            {receptionist.registrationNo || "-"}
          </p>
        )}
      </div>

      <div>
        <Label>Salary</Label>
        <p>
          ₹
          {receptionist.salary?.toLocaleString()}
        </p>
      </div>

      <div>
        <Label>Aadhaar</Label>
        <p>{receptionist.aadhaar}</p>
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
    updateReceptionistPassword.isPending
      ? "Updating..."
      : "Update Password"
  }
  validationOnChange
/>
    </Card>
  </CardContent>
    </div>);}
