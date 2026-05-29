"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReceptionistDetails {
  id: string;
  name: string;
  image?: string;
  location: string;
  mobileNumber: string;
  password: string;
  email: string;
  shift: string;
  deskNumber: string;
  lastUpdated: Date;
  updatedBy: string;
}

export default function ReceptionistProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<ReceptionistDetails>({
    id: "R001",
    name: "Sarah Parker",
    image: "",
    location: "Main Entrance Desk",
    mobileNumber: "+1 (555) 987-6543",
    password: "********",
    email: "sarah.parker@clinic.com",
    shift: "Morning (08:00 AM - 04:00 PM)",
    deskNumber: "D-12",
    lastUpdated: new Date(),
    updatedBy: "Admin",
  });

  const handleInputChange = (field: keyof ReceptionistDetails, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("Saving receptionist data:", data);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
          <UserCircle className="h-6 w-6 text-blue-600" />
          Receptionist Profile
        </CardTitle>
        <div className="flex gap-2">
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Image */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32 border-2 border-slate-100 shadow-sm">
              <AvatarImage src={data.image} alt={data.name} />
              <AvatarFallback className="bg-blue-50 text-blue-600">
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button variant="outline" size="sm" className="text-xs">
                Upload Photo
              </Button>
            )}
          </div>

          {/* Right Column: Info */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-500">Full Name</Label>
                {isEditing ? (
                  <Input value={data.name} onChange={(e) => handleInputChange("name", e.target.value)} />
                ) : (
                  <p className="text-lg font-semibold text-slate-900">{data.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-slate-500">Location / Desk</Label>
                {isEditing ? (
                  <Input value={data.location} onChange={(e) => handleInputChange("location", e.target.value)} />
                ) : (
                  <p className="flex items-center gap-2 text-slate-700">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {data.location}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-500">Mobile Number</Label>
                {isEditing ? (
                  <Input value={data.mobileNumber} onChange={(e) => handleInputChange("mobileNumber", e.target.value)} />
                ) : (
                  <p className="flex items-center gap-2 text-slate-700">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {data.mobileNumber}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-slate-500">Email Address</Label>
                {isEditing ? (
                  <Input value={data.email} onChange={(e) => handleInputChange("email", e.target.value)} />
                ) : (
                  <p className="flex items-center gap-2 text-slate-700">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {data.email}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label className="text-slate-500">Password</Label>
                <Input type="password" placeholder="Change password" onChange={(e) => handleInputChange("password", e.target.value)} />
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-slate-100" />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Operational Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-500 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Assigned Shift
              </Label>
              {isEditing ? (
                <Input value={data.shift} onChange={(e) => handleInputChange("shift", e.target.value)} />
              ) : (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-3 py-1">
                  {data.shift}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-slate-500 flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Desk Number
              </Label>
              {isEditing ? (
                <Input value={data.deskNumber} onChange={(e) => handleInputChange("deskNumber", e.target.value)} />
              ) : (
                <p className="text-lg font-medium text-slate-900">{data.deskNumber}</p>
              )}
            </div>
          </div>
        </div>

        <Separator className="bg-slate-100" />

        <div className="text-xs text-slate-400 flex justify-between">
          <p>Last updated: {data.lastUpdated.toLocaleString()}</p>
          <p>Updated by: {data.updatedBy}</p>
        </div>
      </CardContent>
    </Card>
  );
}
