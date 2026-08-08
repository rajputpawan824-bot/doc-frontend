"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  User,
  Building,
  Stethoscope,
  Users,
  Pill,
  Microscope,
} from "lucide-react";
import { useApiMutation, clientApi } from "@/lib/api";
import Image from "next/image";
import Logo from "@/public/images/logo-landscape.png";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { setAuthCookie } from "./actions";

const roles = [
  {
    value: "admin",
    label: "Admin",
    icon: <User className="w-5 h-5" />,
  },
  {
    value: "doctor",
    label: "Doctor",
    icon: <Stethoscope className="w-5 h-5" />,
  },
  {
    value: "receptionist",
    label: "Receptionist",
    icon: <Users className="w-5 h-5" />,
  },
  {
    value: "patient",
    label: "Patient",
    icon: <User className="w-5 h-5" />,
  },
  {
    value: "nurse",
    label: "Nurse / Staff",
    icon: <Users className="w-5 h-5" />,
  },
  {
    value: "pharmacy",
    label: "Pharmacy",
    icon: <Pill className="w-5 h-5" />,
  },
  {
    value: "lab-technician",
    label: "Lab Technician",
    icon: <Microscope className="w-5 h-5" />,
  },
];

const languages = [
  "English (B a.s.: Admin)",
  "Spanish",
  "French",
  "German",
  "Chinese",
];

interface LoginFormData {
  email?: string;
  phone?: string;
  password: string;
}

interface LoginResponse {
  success?: boolean;
  message?: string;
  token?: string;
}

export default function LoginClient() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("admin");
  const [otpSent, setOtpSent] =
  useState(false);

const [otp, setOtp] =
  useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(
    "English (B a.s.: Admin)",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

const loginEndpoint =
  selectedRole === "patient"
    ? "/patient/login"
    : selectedRole === "doctor"
    ? "/doctors/login"
    : selectedRole === "staff" ||
      selectedRole === "nurse"
    ? "/staff/login"
    : selectedRole === "receptionist"
    ? "/receptionists/login"
    : "/admins/login";

  const {
    mutate: login,
    isPending: isLoading,
    error,
  } = useApiMutation<LoginResponse, LoginFormData>(loginEndpoint, "POST", {
onSuccess: async (data: any) => {
  const token =
    data?.token ||
    data?.data?.token ||
    data?.access_token;

  // PATIENT - FIRST STEP
  if (
    selectedRole === "patient" &&
    !token
  ) {
    setOtpSent(true);

    toast.success(
      data?.message || "OTP sent successfully"
    );

    return;
  }

  // LOGIN SUCCESS
  if (token) {
    await setAuthCookie(token);

    localStorage.setItem(
      "access_token",
      token
    );

    clientApi.setTokens({
      accessToken: token,
      refreshToken: data?.refresh_token,
    });

    toast.success(
      data?.message || "Login successful!"
    );

    if (selectedRole === "patient") {
      router.push("/patient/clinicSelection");
    } else {
      const targetRole =
        selectedRole === "nurse"
          ? "staff"
          : selectedRole;

      router.push(
        `/${targetRole}/dashboard`
      );
    }
  }
},
    onError: (error: Error) => {
      toast.error(`Error logging in: ${error.message}`);
    },
  });

const handleSubmit = (
  e: React.FormEvent
) => {
  e.preventDefault();

  if (selectedRole === "patient") {
    if (!formData.phone) {
      toast.error(
        "Mobile number is required"
      );
      return;
    }

    if (!otpSent) {
      login({
        phone: formData.phone,
        email: formData.email,
      } as any);

      return;
    }

    login({
      phone: formData.phone,
      email: formData.email,
      otp,
    } as any);

    return;
  }

  const submitData: LoginFormData = {
    password: formData.password,
  };

  if (formData.email) {
    submitData.email = formData.email;
  }

  // if (formData.phone) {
  //   submitData.phone = formData.phone;
  // }

  login(submitData);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Branding */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-3 mb-8">
              <Image
                src={Logo}
                alt="Clinic Management Logo"
                width={100}
                height={100}
                className="mr-2"
              />
            </Link>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome Back
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose your Role and log in to continue
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Your Role
            </h2>
            <RadioGroup
              value={selectedRole}
              onValueChange={setSelectedRole}
              className="grid grid-cols-2 md:grid-cols-3 gap-3"
            >
              {roles.map((role) => (
                <div key={role.value}>
                  <RadioGroupItem
                    value={role.value}
                    id={role.value}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={role.value}
                    className={`
                      flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                      ${
                        selectedRole === role.value
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                      }
                    `}
                  >
                    <div
                      className={`
                      p-2 rounded-lg mb-2
                      ${
                        selectedRole === role.value
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }
                    `}
                    >
                      {role.icon}
                    </div>
                    <span className="font-medium text-sm">{role.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              Log in to Your Account
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 pr-4 py-6 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Mobile Number(Optional)
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      handleInputChange("phone", e.target.value)
                    }
                    className="pl-10 pr-4 py-6 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {selectedRole === "patient" &&
  otpSent && (
    <div className="space-y-2">
      <Label
        htmlFor="otp"
        className="text-sm font-medium"
      >
        OTP
      </Label>

      <Input
        id="otp"
        type="text"
        value={otp}
        onChange={(e) =>
          setOtp(e.target.value)
        }
        placeholder="Enter OTP"
      />
    </div>
)}

              {/* Password */}
{selectedRole !== "patient" && (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label htmlFor="password" className="text-sm font-medium">
        Password
      </Label>

      <Link
        href="/forgotPassword"
        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        Forgot Password?
      </Link>
    </div>

    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

      <Input
        id="password"
        type={showPassword ? "text" : "password"}
        value={formData.password}
        onChange={(e) =>
          handleInputChange("password", e.target.value)
        }
        className="pl-10 pr-12 py-6"
        placeholder="Enter your password"
      />
{/* 
      <button
        type="button"
        onClick={() =>
          setShowPassword(!showPassword)
        }
        className="absolute right-3 top-1/2 -translate-y-1/2"
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button> */}
    </div>
  </div>
)}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg cursor-pointer disabled:opacity-50"
                disabled={isLoading}
              >
                Log In
              </Button>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="py-3">
                <Building className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button variant="outline" className="py-3">
                <Building className="w-4 h-4 mr-2" />
                Microsoft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
