"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Edit, Phone, Mail, MapPin, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface ClinicViewProps {
  clinicData: {
    clinic: {
      name: string;
      image?: string;
      location: string;
      mobileNumber: string;
      subscription: "basic" | "premium" | "enterprise";
      isActive: boolean;
      workingHours?: {
        [key: string]: { open: string; close: string };
      };
    };
    admin: {
      name: string;
      image?: string;
      email: string;
      adminMobileNumber: string;
      lastUpdated?: Date;
    };
  };
  onEdit: () => void;
}

export function ClinicView({ clinicData, onEdit }: ClinicViewProps) {
  const { clinic, admin } = clinicData;

  const subscriptionColors = {
    basic: "outline",
    premium: "secondary",
    enterprise: "default",
  } as const;

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{clinic.name}</h1>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={clinic.isActive ? "default" : "destructive"}>
              {clinic.isActive ? "Active" : "Deactivated"}
            </Badge>
            <Badge variant={subscriptionColors[clinic.subscription]}>
              {clinic.subscription.charAt(0).toUpperCase() + clinic.subscription.slice(1)}
            </Badge>
          </div>
        </div>
        <Button onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Clinic
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clinic Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Clinic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Clinic Info */}
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={clinic.image} />
                <AvatarFallback className="text-lg">
                  {clinic.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{clinic.name}</h3>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{clinic.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{clinic.mobileNumber}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Working Hours */}
            <div>
              <h4 className="font-medium mb-3">Working Hours</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {days.map((day) => {
                  const hours = clinic.workingHours?.[day];
                  return (
                    <div
                      key={day}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="capitalize font-medium">{day}</span>
                      {hours?.open && hours?.close ? (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            {hours.open} - {hours.close}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline">Closed</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Admin Info */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={admin.image} />
                <AvatarFallback className="text-xl">
                  {admin.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{admin.name}</h3>
                <p className="text-gray-600">Clinic Administrator</p>
              </div>
            </div>

            <Separator />

            {/* Admin Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{admin.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Mobile Number</p>
                  <p className="font-medium">{admin.adminMobileNumber}</p>
                </div>
              </div>
              {admin.lastUpdated && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {format(admin.lastUpdated, "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}