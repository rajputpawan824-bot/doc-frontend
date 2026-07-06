"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMyClinics } from "@/services/admin/patient";
import { savePatientPortalSelection } from "@/lib/hooks/usePatientPortalSelection";

export default function ClinicSelectionPage() {
const router = useRouter();


const {
  data,
  isLoading,
} = useMyClinics();

const clinics = data?.data || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Select Clinic
        </h1>
        <p className="text-slate-500">
          Choose a clinic to continue
        </p>
      </div>
      {isLoading && (
  <Card>
    <CardContent className="p-8 text-center text-slate-500">
      Loading clinics...
    </CardContent>
  </Card>
)}

{!isLoading && clinics.length === 0 ? (
  <Card className="border-none shadow-sm">
    <CardContent className="py-20 text-center">
      <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
      <h3 className="font-semibold text-slate-900">
        No Clinics Found
      </h3>
      <p className="text-slate-500 mt-1">
        No clinic is associated with this phone number.
      </p>
    </CardContent>
  </Card>
) : (

      <div className="grid gap-4">

        {clinics.map((clinic)  => (
          <Card
            key={clinic.adminId}
            className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group"
          >
            <CardContent className="p-0">
              <div className="flex">
                <div className="w-2 bg-blue-600 group-hover:w-3 transition-all" />

                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <h3 className="text-xl font-bold text-slate-900">
                          {clinic.clinicName}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="h-4 w-4" />
                        <span>{clinic.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <Users className="h-4 w-4" />
                        <span>
                          {clinic.profileCount} Profile
                          {clinic.profileCount > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
<Button
  className="bg-blue-600"
  onClick={() => {
    savePatientPortalSelection({
      adminId: clinic.adminId,
    });

    router.push(
      `/patient/profileSelection?adminId=${clinic.adminId}`
    );
  }}
>
  Select
</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>)}
    </div>
  );
}
