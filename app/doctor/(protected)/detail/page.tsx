"use client";

import { useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Stethoscope,
  Eye,
  Edit,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DoctorDetails {
  id: string;
  name: string;
  image?: string;
  location: string;
  mobileNumber: string;
  password: string;
  email: string;
  specialization: string;
  consultationDuration: number;
  consultationDays: string[];
  consultationFee?: number;
  lastUpdated: Date;
  updatedBy: string;
}

interface DoctorDetailsSectionProps {
  initialData?: DoctorDetails;
}

export default function DoctorDetailsSection({
  initialData,
}: DoctorDetailsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [doctorData, setDoctorData] = useState<DoctorDetails>(
    initialData || {
      id: "1",
      name: "Dr. John Smith",
      image: "",
      location: "New York, NY",
      mobileNumber: "+1 (555) 123-4567",
      password: "********",
      email: "john.smith@example.com",
      specialization: "Cardiology",
      consultationDuration: 30,
      consultationDays: ["Monday", "Wednesday", "Friday"],
      consultationFee: 150,
      lastUpdated: new Date(),
      updatedBy: "Admin User",
    }
  );

  const handleInputChange = (
    field: keyof DoctorDetails,
    value: string | number | string[]
  ) => {
    setDoctorData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Add save logic here (API call, etc.)
    console.log("Saving data:", doctorData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Optionally reset to initial data
  };

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
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="gap-2 bg-green-600 hover:bg-green-700"
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

              {/* Password - Only show in edit mode */}
              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={doctorData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Enter new password"
                  />
                </div>
              )}
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
                Consultation Duration
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={doctorData.consultationDuration}
                  onChange={(e) =>
                    handleInputChange(
                      "consultationDuration",
                      parseInt(e.target.value)
                    )
                  }
                  // suffix="mins"
                />
              ) : (
                <p className="text-lg">
                  {doctorData.consultationDuration} mins
                </p>
              )}
            </div>

            {/* Consultation Fee */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Consultation Fee
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={doctorData.consultationFee}
                  onChange={(e) =>
                    handleInputChange(
                      "consultationFee",
                      parseInt(e.target.value)
                    )
                  }
                  prefix="$"
                />
              ) : (
                <p className="text-lg">${doctorData.consultationFee}</p>
              )}
            </div>

            {/* Consultation Days */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Consultation Days
              </Label>
              {isEditing ? (
                <Input
                  value={doctorData.consultationDays.join(", ")}
                  onChange={(e) =>
                    handleInputChange(
                      "consultationDays",
                      e.target.value.split(",").map((d) => d.trim())
                    )
                  }
                  placeholder="Monday, Wednesday, Friday"
                />
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
            Last updated: {doctorData.lastUpdated.toLocaleDateString()}
          </p>
          <p>Updated by: {doctorData.updatedBy}</p>
        </div>
      </CardContent>
    </Card>
  );
}
