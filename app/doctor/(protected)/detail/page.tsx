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
} from "lucide-react";

import { useDoctorById, useUpdateDoctor } from "@/services/admin/doctor";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DoctorDetails {
  id: string;
  name: string;
  image?: string;
  registrationNo: string;
  qualification: string;
  location: string;
  mobileNumber: string;
  email: string;
  specialization: string;
  experience: number;
  workingHours: { start: string; end: string };
  consultationDays: string[];
  consultationFee?: number;
  lastUpdated: string;
  updatedBy: string;
}

interface DoctorDetailsSectionProps {
  initialData?: DoctorDetails;
}

export default function DoctorDetailsSection({
  initialData,
}: DoctorDetailsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  
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

  const updateDoctorMutation = useUpdateDoctor({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  
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
        specialization: doctor.department || "",
        experience: doctor.experience || 0,
        workingHours: {
          start: doctor.workingHours?.start || "-",
          end: doctor.workingHours?.end || "-",
        },
        consultationDays: doctor.availabilityDays || [],
        consultationFee: doctor.consultationFee || 0,
        lastUpdated: doctor.updatedAt,
        updatedBy: "System",
      });
    }
  }, [doctor]);

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
  
  const handleSave = async () => {
    if (!doctorData || !doctor) return;

    updateDoctorMutation.mutate({
      id: doctor.id,
      data: {
        name: doctorData.name,
        phone: doctorData.mobileNumber,
        address: doctorData.location,
        experience: doctorData.experience,
      },
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    refetch();
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
        {/* Personal Information Section */}
        <div className="space-y-4">
          <div className="flex items-start gap-6">
            {/* Doctor Image */}
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-32 w-32">
                <AvatarImage src={doctorData.image} alt={doctorData.name} />
                <AvatarFallback className="text-2xl">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="outline" size="sm">
                  Change Image
                </Button>
              )}
            </div>
            </div>
            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name of Doctor
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={doctorData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                ) : (
                  <p className="text-xl font-semibold">{doctorData.name}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                {isEditing ? (
                  <Input
                    value={doctorData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                  />
                ) : (
                  <p>{doctorData.location}</p>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Mobile Number
                  </Label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={doctorData.mobileNumber}
                      onChange={(e) =>
                        handleInputChange("mobileNumber", e.target.value)
                      }
                    />
                  ) : (
                    <p>{doctorData.mobileNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={doctorData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  ) : (
                    <p>{doctorData.email}</p>
                  )}
                </div>
              </div>

              {/* Professional IDs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Registration Number
                  </Label>
                  <p className="font-medium text-muted-foreground">{doctorData.registrationNo}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Shift
                  </Label>
                  <Badge variant="outline" className="capitalize">
                    {doctor?.shift?.toLowerCase()}
                  </Badge>
                </div>
              </div>
              
              {/* Qualification */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Qualification</Label>
                <div className="flex items-center gap-2 text-muted-foreground">
                   {doctorData.qualification}
                </div>
              
            </div>
          </div>
        </div>

        <Separator />

        {/* Professional Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Professional Information</h3>

          {/* Specialization */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Specialization</Label>
            {isEditing ? (
              <Input
                value={doctorData.specialization}
                onChange={(e) =>
                  handleInputChange("specialization", e.target.value)
                }
              />
            ) : (
              <Badge variant="secondary" className="text-base px-3 py-1">
                {doctorData.specialization}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Consultation Duration */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Working Hours
              </Label>
             <p className="text-lg">
  {format(
    new Date(`1970-01-01T${doctorData.workingHours.start}`),
    "hh:mm a"
  )}
  {" - "}
  {format(
    new Date(`1970-01-01T${doctorData.workingHours.end}`),
    "hh:mm a"
  )}
</p>
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <BriefcaseMedical className="h-4 w-4" />
                Experience (Years)
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={doctorData.experience}
                  onChange={(e) =>
                    handleInputChange("experience", parseInt(e.target.value))
                  }
                />
              ) : (
                <p className="text-lg">{doctorData.experience} years</p>
              )}
            </div>

            {/* Consultation Fee */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Consultation Fee
              </Label>
              <p className="text-lg">₹{doctorData.consultationFee}</p>
            </div>

            {/* Consultation Days */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Consultation Days
              </Label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cons-${day}`}
                        checked={doctorData.consultationDays.includes(day)}
                        onCheckedChange={(checked) => {
                          const current = doctorData.consultationDays;
                          const updated = checked
                            ? [...current, day]
                            : current.filter((d) => d !== day);
                          handleInputChange("consultationDays", updated);
                        }}
                      />
                      <Label
                        htmlFor={`cons-${day}`}
                        className="text-sm font-normal capitalize"
                      >
                        {day.toLowerCase()}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {doctorData.consultationDays.map((day, index) => (
                    <Badge key={index} variant="outline">
                      {day}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Audit Information */}
        <div className="text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            Last updated: {new Date(doctorData.lastUpdated).toLocaleDateString()}
          </p>
          <p>Updated by: {doctorData.updatedBy}</p>
        </div>
      </CardContent>
    </Card>
  );
}
