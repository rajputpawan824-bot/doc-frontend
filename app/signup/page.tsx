// app/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { State, City } from "country-state-city";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  User,
  Building,
  MapPin,
  Calendar,
  Clock,
  Users,
  Stethoscope,
  Ambulance,
  Pill,
  Microscope,
  UserCheck,
  Upload,
  FileText,
  ArrowLeft,
  Heart,
} from "lucide-react";
import Image from "next/image";
import Logo from "@/public/images/logo-landscape.png";
type SignupType = "clinic" | "patient" | null;

export default function SignUpPage() {
  const [signupType, setSignupType] = useState<SignupType>(null);
const [currentStep, setCurrentStep] = useState(() => {
  if (typeof window !== "undefined") {
    return Number(
      sessionStorage.getItem("clinicSignupCurrentStep") || 1
    );
  }

  return 1;
});
useEffect(() => {
  sessionStorage.setItem(
    "clinicSignupCurrentStep",
    currentStep.toString()
  );
}, [currentStep]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  // Form state
  const [formData, setFormData] = useState(() => {

      if (typeof window !== "undefined") {
    const savedData = sessionStorage.getItem("clinicSignupForm");

    if (savedData) {
      return JSON.parse(savedData);
    }
  }
  return{
    // Clinic Information
    clinicName: "",
    clinicType: "",
    clinicEmail: "",
    establishmentYear: "",
    city: "",
    state: "",
    address: "",
    phone: "",
    zipCode: "",
 

    // Admin Account
    adminName: "",
    adminRole: "",
    adminPhone: "",
    adminEmail: "",
    password: "",
    confirmPassword: "",

    // Additional Details
      workingDays: [] as string[],
  openingTime: "",
  closingTime: "",
    specialities: "",
    numberOfDoctors: "",
    numberOfStaff: "",

    // Key Functional Setup
    adminIsDoctor: false,
    hasReceptionist: false,
    hasAmbulance: false,
    hasPharmacy: false,
    hasLaboratory: false,
    hasNursingStaff: false,

    // Verification
    agreeToTerms: false,
  };
  });

  const clinicTypes = [
    "General Clinic",
    "Multi-speciality Hospital",
    "Single-speciality Clinic",
    "Dental Clinic",
    "Eye Care Center",
    "Physiotherapy Center",
    "Diagnostic Center",
    "Other",
  ];

useEffect(() => {
  sessionStorage.setItem(
    "clinicSignupForm",
    JSON.stringify(formData)
  );
}, [formData]);
  const handleInputChange = (field: string, value: any) => {
setFormData((prev: any) => ({
  ...prev,
  [field]: value,
}));
};
const handleWorkingDayChange = (day: string) => {
  const updatedDays = formData.workingDays.includes(day)
    ? formData.workingDays.filter((d: string) => d !== day)
    : [...formData.workingDays, day];

  handleInputChange("workingDays", updatedDays);
};
  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log("Clinic signup:", formData);
  };
  const states = State.getStatesOfCountry("IN");
  
  const selectedState = states.find(
  (state) => state.name === formData.state
);

const cities = selectedState
  ? City.getCitiesOfState("IN", selectedState.isoCode)
  : [];
  // Initial selection screen
  if (!signupType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-3 justify-center mb-4"
            >
              <Image
                src={Logo}
                alt="Clinic Management Logo"
                width={100}
                height={100}
                className="mr-2"
              />
            </Link>

            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose your account type to get started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Clinic Signup Card */}
            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-blue-500"
              onClick={() => setSignupType("clinic")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl font-bold mb-4">
                  Clinic / Hospital
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  For healthcare providers, clinics, and hospitals looking to
                  streamline their operations with our AI-powered management
                  system.
                </p>
                <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Patient management & EMR
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Appointment scheduling
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Billing & inventory management
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Multi-location support
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Sign Up as Clinic
                </Button>
              </CardContent>
            </Card>

            {/* Patient Signup Card */}
            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-green-500"
              onClick={() => setSignupType("patient")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl font-bold mb-4">
                  Patient
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  For patients looking to manage their health records, book
                  appointments, and communicate with healthcare providers.
                </p>
                <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Digital health records
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Easy appointment booking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Prescription management
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Secure messaging
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Sign Up as Patient
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Patient signup (simplified)
  if (signupType === "patient") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-green-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardHeader className="space-y-1 text-center">
              <Button
                variant="ghost"
                onClick={() => setSignupType(null)}
                className="w-fit absolute left-4 top-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Link
                href="/"
                className="inline-flex items-center gap-3 justify-center mb-4"
              >
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  MedFlow
                </span>
              </Link>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Patient Sign Up
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Create your patient account
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Patient signup form would go here */}
              <div className="text-center py-8">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  Patient registration form would be implemented here.
                </p>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setSignupType(null)}
              >
                Back to Selection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Clinic signup multi-step form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-2xl border-0">
          {/* Progress Bar */}
          <div className="px-8 pt-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${
                      currentStep >= step
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    }
                  `}
                  >
                    {step}
                  </div>
                  {step < 5 && (
                    <div
                      className={`
                      w-16 h-1 mx-2
                      ${
                        currentStep > step
                          ? "bg-blue-600"
                          : "bg-gray-200 dark:bg-gray-700"
                      }
                    `}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 px-2">
              <span>Clinic Info</span>
              <span>Admin Account</span>
              <span>Details</span>
              <span>Features</span>
              <span>Verification</span>
            </div>
          </div>

          <CardHeader className="text-center">
            <Button
              variant="ghost"
              onClick={() => setSignupType(null)}
              className="w-fit absolute left-6 top-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentStep === 1 && "Basic Clinic Information"}
              {currentStep === 2 && "Admin Account Setup"}
              {currentStep === 3 && "Additional Details"}
              {currentStep === 4 && "Key Functional Setup"}
              {currentStep === 5 && "Verification"}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Clinic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="clinicName">Clinic / Hospital Name</Label>
                      <Input
                        id="clinicName"
                        value={formData.clinicName}
                        placeholder="Enter clinic or hospital name"
                        onChange={(e) =>
                          handleInputChange("clinicName", e.target.value)
                        }
                        className="py-3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clinicType">Clinic Type</Label>
                      <Select
                        value={formData.clinicType}
                        onValueChange={(value) =>
                          handleInputChange("clinicType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select clinic type" />
                        </SelectTrigger>
                        <SelectContent>
                          {clinicTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clinicEmail">Clinic Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="clinicEmail"
                          type="email"
                          value={formData.clinicEmail}
                          placeholder="Enter clinic email address"
                          onChange={(e) =>
                            handleInputChange("clinicEmail", e.target.value)
                          }
                          className="pl-10 pr-4 py-3"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="establishmentYear">
                        Year of Establishment
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="establishmentYear"
                          type="date"
                          placeholder="DD/MM/YY"
                          value={formData.establishmentYear}
                          onChange={(e) =>
                            handleInputChange(
                              "establishmentYear",
                              e.target.value
                            )
                          }
                          className="pl-10 pr-4 py-3"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="State">State</Label>
                     <Select
  value={formData.state}
  onValueChange={(value) =>
    handleInputChange("state", value)
  }
>
  <SelectTrigger>
    <SelectValue placeholder="Select state" />
  </SelectTrigger>

  <SelectContent>
    {states.map((state) => (
      <SelectItem
        key={state.isoCode}
        value={state.name}
      >
        {state.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Select
  value={formData.city}
  onValueChange={(value) =>
    handleInputChange("city", value)
  }
>
  <SelectTrigger>
    <SelectValue placeholder="Select city" />
  </SelectTrigger>

  <SelectContent>
    {cities.map((city) => (
      <SelectItem
        key={city.name}
        value={city.name}
      >
        {city.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Clinic / Hospital Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <Textarea
                          id="address"
                          value={formData.address}
                            placeholder="Enter hospital address, building name"
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          className="pl-10 pr-4 py-3 min-h-[80px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Clinic Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          placeholder="Enter clinic phone number"
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className="pl-10 pr-4 py-3"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip/Postal Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                          placeholder="Enter ZIP / Postal code"
                        onChange={(e) =>
                          handleInputChange("zipCode", e.target.value)
                        }
                        className="py-3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Admin Account Setup */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="adminName">Admin Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="adminName"
                          value={formData.adminName}
                            placeholder="Full Name"
                          onChange={(e) =>
                            handleInputChange("adminName", e.target.value)
                          }
                          className="pl-10 pr-4 py-3"
                        />
                      </div>
                    </div>

                    

                    <div className="space-y-2">
                      <Label htmlFor="adminPhone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="adminPhone"
                          value={formData.adminPhone}
                          placeholder="Phone Number"
                          onChange={(e) =>
                            handleInputChange("adminPhone", e.target.value)
                          }
                          className="pl-10 pr-4 py-3"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="adminEmail"
                          type="email"
                          value={formData.adminEmail}
                            placeholder="Enter Email address"
                          onChange={(e) =>
                            handleInputChange("adminEmail", e.target.value)
                          }
                          className="pl-10 pr-4 py-3"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Create Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                            placeholder="password"
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          className="pl-10 pr-12 py-3"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                            placeholder="confirm password"
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          className="pl-10 pr-12 py-3"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Additional Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
  <Label>Working Days</Label>

  <div className="flex flex-wrap gap-4">
    {[
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day) => (
      <label
        key={day}
        className="flex items-center gap-2 cursor-pointer"
      >
       <Checkbox
  checked={formData.workingDays.includes(day)}
  onCheckedChange={() => handleWorkingDayChange(day)}
/>
        <span>{day}</span>
      </label>
    ))}
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
    <div className="space-y-2">
      <Label htmlFor="openingTime">Opening Time</Label>

      <div className="relative">
        <Clock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />

        <Input
          id="openingTime"
          type="time"
          value={formData.openingTime || ""}
          onChange={(e) =>
            handleInputChange("openingTime", e.target.value)
          }
          className="pl-10 pr-4 py-3"
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="closingTime">Closing Time</Label>

      <div className="relative">
        <Clock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />

        <Input
          id="closingTime"
          type="time"
          value={formData.closingTime || ""}
          onChange={(e) =>
            handleInputChange("closingTime", e.target.value)
          }
          className="pl-10 pr-4 py-3"
        />
      </div>
    </div>
  </div>
</div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="specialities">Primary Specialities</Label>
                      <div className="relative">
                        <Stethoscope className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <Input
                          id="specialities"
                          value={formData.specialities}
                          placeholder="e.g. Cardiology, Pediatrics, Orthopedics"
                          onChange={(e) =>
                            handleInputChange("specialities", e.target.value)
                          }
                          className="pl-10 pr-4 py-3"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numberOfDoctors">Number of Doctors</Label>
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="numberOfDoctors"
                          type="number"
                          value={formData.numberOfDoctors}
                          placeholder="Enter number of doctors"
                          onChange={(e) =>
                            handleInputChange("numberOfDoctors", e.target.value)
                          }
                          className="pl-10 pr-4 py-3"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numberOfStaff">
                        Number of Staff Members
                      </Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="numberOfStaff"
                          type="number"
                          value={formData.numberOfStaff}
                          placeholder="Enter number of staff members"
                          onChange={(e) =>
                            handleInputChange("numberOfStaff", e.target.value)
                          }
                          className="pl-10 pr-4 py-3"
                        />
                      </div>
                    </div>
                  </div>
                
              )}

              {/* Step 4: Key Functional Setup */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        id: "adminIsDoctor",
                        label: "Are Admin and Doctor the same Person?",
                        icon: UserCheck,
                      },
                      {
                        id: "hasReceptionist",
                        label: "Do you have receptionist?",
                        icon: Users,
                      },
                      {
                        id: "hasAmbulance",
                        label: "Do you have Ambulance Service?",
                        icon: Ambulance,
                      },
                      {
                        id: "hasPharmacy",
                        label: "Do you have Pharmacy?",
                        icon: Pill,
                      },
                      {
                        id: "hasLaboratory",
                        label: "Do you have Laboratory?",
                        icon: Microscope,
                      },
                      {
                        id: "hasNursingStaff",
                        label: "Do you have nursing Staff?",
                        icon: UserCheck,
                      },
                    ].map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3 p-4 border rounded-lg"
                      >
                        <Checkbox
                          id={item.id}
                          checked={
                            formData[
                              item.id as keyof typeof formData
                            ] as boolean
                          }
                          onCheckedChange={(checked) =>
                            handleInputChange(item.id, checked as boolean)
                          }
                        />
                        <item.icon className="w-5 h-5 text-gray-400" />
                        <Label
                          htmlFor={item.id}
                          className="flex-1 cursor-pointer"
                        >
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Verification */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 p-6 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Upload className="w-6 h-6 text-blue-600" />
                        <Label htmlFor="logo" className="text-lg font-semibold">
                          Upload Clinic Logo
                        </Label>
                      </div>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        className="py-3"
                      />
                    </div>

                    <div className="space-y-4 p-6 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <Label
                          htmlFor="document"
                          className="text-lg font-semibold"
                        >
                          Upload Clinic Registration Document
                        </Label>
                      </div>
                      <Input
                        id="document"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="py-3"
                      />
                      <p className="text-sm text-gray-500">PMS on APC</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) =>
                        handleInputChange("agreeToTerms", checked as boolean)
                      }
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-blue-600 hover:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    currentStep === 1 ? () => setSignupType(null) : prevStep
                  }
                  className="px-6"
                >
                  {currentStep === 1 ? "Back to Selection" : "Previous"}
                </Button>

                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                    disabled={!formData.agreeToTerms}
                  >
                    Complete Registration
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
