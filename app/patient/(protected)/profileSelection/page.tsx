"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Users } from "lucide-react";
import { useClinicProfiles, type ClinicProfile } from "@/services/admin/patient";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { savePatientPortalSelection } from "@/lib/hooks/usePatientPortalSelection";

export default function ProfileSelectionPage() {
  const router = useRouter();
const searchParams =
  useSearchParams();

const adminId =
  searchParams.get("adminId") || "";

  const {
    data,
    isLoading,
    error,
  } = useClinicProfiles(adminId);

const profiles = data?.profiles || [];
const clinic = data?.clinic;

  const handleSelectProfile = (
    patientId: string
  ) => {
    savePatientPortalSelection({
      patientId,
      adminId,
    });

router.push(
  "/patient/dashboard"
);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          Loading profiles...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-red-500">
          Failed to load profiles
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Select Profile
        </h1>

        <p className="text-slate-500">
          {clinic?.clinicName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map((profile: ClinicProfile) => (
          <Card
            key={profile._id}
            className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group"
          >
            <CardContent className="p-0">
              <div className="flex">
                <div className="w-2 bg-blue-600 group-hover:w-3 transition-all" />

                <div className="flex-1 p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {profile.name}
                          </h3>

                          <p className="text-sm text-slate-500">
                            {profile.relation}
                          </p>

                          <p className="text-xs text-slate-400">
                            {profile.patientCode}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="bg-blue-600"
                      onClick={() =>
                        handleSelectProfile(
                          profile._id
                        )
                      }
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading &&
        profiles.length === 0 && (
          <Card className="border-none shadow-sm">
            <CardContent className="py-20 text-center">
              <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />

              <h3 className="font-semibold text-slate-900">
                No Profiles Found
              </h3>

              <p className="text-slate-500 mt-1">
                No patient profiles are available
                for this clinic.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
