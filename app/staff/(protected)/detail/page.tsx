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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StaffDetails {
  id: string;
  name: string;
  image?: string;
  location: string;
  mobileNumber: string;
  password: string;
  email: string;
  shift: string;
  lastUpdated: Date;
  updatedBy: string;
}

export default function StaffProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<StaffDetails>({
    id: "S001",
    name: "Robert Wilson",
    image: "",
    location: "Clinic Support Desk",
    mobileNumber: "+1 (555) 777-8888",
    password: "********",
    email: "robert.wilson@clinic.com",
    shift: "Evening (02:00 PM - 10:00 PM)",
    lastUpdated: new Date(),
    updatedBy: "Admin",
  });

  const handleInputChange = (field: keyof StaffDetails, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto gap-2 bg-blue-600">
              <Edit className="h-4 w-4" /> Edit
            </Button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={() => setIsEditing(false)} className="flex-1 sm:w-auto gap-2 bg-green-600">
                <Save className="h-4 w-4" /> Save
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1 sm:w-auto gap-2">
                <X className="h-4 w-4" /> Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <Card className="shadow-sm border-none">
        <CardContent className="pt-8 space-y-8">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <Avatar className="h-24 w-24 lg:h-32 lg:w-32 border-4 border-white shadow-md">
              <AvatarImage src={data.image} alt={data.name} />
              <AvatarFallback className="bg-slate-100 text-slate-400">
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase tracking-wider">Full Name</Label>
                  {isEditing ? (
                    <Input value={data.name} onChange={(e) => handleInputChange("name", e.target.value)} />
                  ) : (
                    <p className="text-lg font-bold text-slate-900">{data.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase tracking-wider">Location</Label>
                  {isEditing ? (
                    <Input value={data.location} onChange={(e) => handleInputChange("location", e.target.value)} />
                  ) : (
                    <p className="text-slate-700 flex items-center justify-center md:justify-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" /> {data.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase tracking-wider">Mobile</Label>
                  {isEditing ? (
                    <Input value={data.mobileNumber} onChange={(e) => handleInputChange("mobileNumber", e.target.value)} />
                  ) : (
                    <p className="text-slate-700 flex items-center justify-center md:justify-start gap-2">
                      <Phone className="h-4 w-4 text-slate-400" /> {data.mobileNumber}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 uppercase tracking-wider">Email</Label>
                  {isEditing ? (
                    <Input value={data.email} onChange={(e) => handleInputChange("email", e.target.value)} />
                  ) : (
                    <p className="text-slate-700 flex items-center justify-center md:justify-start gap-2">
                      <Mail className="h-4 w-4 text-slate-400" /> {data.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Employment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Shift
                </Label>
                {isEditing ? (
                  <Input value={data.shift} onChange={(e) => handleInputChange("shift", e.target.value)} />
                ) : (
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none px-3 py-1">
                    {data.shift}
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500 uppercase tracking-wider">Staff ID</Label>
                <p className="text-lg font-mono font-bold text-slate-900">{data.id}</p>
              </div>
            </div>
          </div>

          <div className="pt-6 text-[10px] text-slate-400 border-t flex flex-col sm:flex-row justify-between gap-2">
            <p>Last updated: {data.lastUpdated.toLocaleString()}</p>
            <p>Updated by: {data.updatedBy}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
