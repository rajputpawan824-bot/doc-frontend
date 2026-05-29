// app/(dashboard)/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Lock,
  Eye,
  EyeOff,
  Save,
  LogOut,
  Clock,
  Award,
  Key,
  Upload,
  AlertCircle,
  Mail as MailIcon,
  RefreshCw,
} from "lucide-react";
import {
  useProfileUpdateValidation,
  formatDateForDisplay,
  getRoleDisplayName,
  isSubscriptionValid,
  formatSubscriptionDate,
  type ProfileFormData,
  type ChangePasswordData,
  type ProfileResponse,
} from "@/lib/validations/Admin/profile";
import { useUpdateProfile, useChangePassword } from "@/services/admin/profile";
import { clientApi } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";

// Mock data - In real app, this would come from API
const mockProfileData: ProfileResponse = {
  id: "b5275da9-bbbb-4d65-9ec4-7668721d9be6",
  name: "Dr. Clinic Owner",
  email: "clinicowner11@yopmail.com",
  phone: "9876543210",
  role: "ADMIN",
  isActive: true,
  lastLogin: "2025-12-20T20:29:31.481Z",
  createdAt: "2025-12-20T19:59:27.230Z",
  clinic: {
    id: "476b94af-f76b-4223-9144-b7e86af1913c",
    clinicName: "Healthy Life Clinic",
    location: "Delhi, India",
    subsValidity: "2026-01-20T19:59:27.227Z",
  },
};

// Password reset steps enum
enum PasswordResetStep {
  INITIAL = "INITIAL",
  SEND_OTP = "SEND_OTP",
  VERIFY_OTP = "VERIFY_OTP",
  RESET_PASSWORD = "RESET_PASSWORD",
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordResetStep, setPasswordResetStep] = useState<PasswordResetStep>(
    PasswordResetStep.INITIAL,
  );
  const [resetToken, setResetToken] = useState<string>("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: mockProfileData.name,
      email: mockProfileData.email,
      phone: mockProfileData.phone,
    },
  });

  // OTP form
  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
    reset: resetOtp,
  } = useForm<{ otp: string }>();

  // Reset password form
  const {
    register: registerResetPassword,
    handleSubmit: handleSubmitResetPassword,
    formState: { errors: resetPasswordErrors },
    reset: resetResetPassword,
    watch,
  } = useForm<{ newPassword: string; confirmPassword: string }>();

  const {
    data: doctors = [],
    isLoading: isLoadingDoctors,
    error: fetchError,
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      try {
        const response =
          await clientApi.get<ApiResponse<ProfileResponse[]>>("/admin/me");
        return response?.data?.data || [];
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors");
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Validation hooks
  const { validate: validateProfileForm, errors: validationErrors } =
    useProfileUpdateValidation();

  // API mutations
  const updateProfileMutation = useUpdateProfile({
    onSuccess: (data: ProfileResponse) => {
      toast.success("Profile updated successfully");
      setIsLoading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
      setIsLoading(false);
    },
  });

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await clientApi.post("/auth/send-otp", {
        identifier: mockProfileData.email,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(`OTP sent to ${mockProfileData.email}`);
      setOtpSent(true);
      setOtpTimer(180); // 3 minutes timer
      setPasswordResetStep(PasswordResetStep.VERIFY_OTP);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to send OTP");
      setIsLoading(false);
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (otp: string) => {
      const response = await clientApi.post("/auth/verify-otp", {
        identifier: mockProfileData.email,
        otp,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("OTP verified successfully");
      setResetToken(data.data.resetToken);
      setPasswordResetStep(PasswordResetStep.RESET_PASSWORD);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Invalid OTP");
      setIsLoading(false);
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const response = await clientApi.post("/auth/reset-password", {
        resetToken,
        newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(
        "Password reset successful. Please login with new password.",
      );
      setPasswordResetStep(PasswordResetStep.INITIAL);
      resetOtp();
      resetResetPassword();
      setIsLoading(false);
      // Optionally, log the user out after password reset
      handleLogout();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to reset password");
      setIsLoading(false);
    },
  });

  // OTP timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    } else if (otpTimer === 0 && otpSent) {
      setOtpSent(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [otpTimer, otpSent]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    await updateProfileMutation.mutateAsync(data);
  };

  const handleStartPasswordReset = () => {
    setPasswordResetStep(PasswordResetStep.SEND_OTP);
    setIsLoading(true);
    sendOtpMutation.mutate();
  };

  const onOtpSubmit = async (data: { otp: string }) => {
    setIsLoading(true);
    await verifyOtpMutation.mutateAsync(data.otp);
  };

  const onResetPasswordSubmit = async (data: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    await resetPasswordMutation.mutateAsync(data.newPassword);
  };

  const handleResendOtp = () => {
    setIsLoading(true);
    sendOtpMutation.mutate();
  };

  const handleCancelPasswordReset = () => {
    setPasswordResetStep(PasswordResetStep.INITIAL);
    resetOtp();
    resetResetPassword();
    setResetToken("");
    setOtpSent(false);
    setOtpTimer(0);
  };

  const handleLogout = () => {
    // Implement logout logic
    toast.success("Logged out successfully");
  };

  const handleResetProfile = () => {
    resetProfile({
      name: mockProfileData.name,
      email: mockProfileData.email,
      phone: mockProfileData.phone,
    });
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <span>Profile Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Avatar */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {mockProfileData.name.charAt(0)}
                      </span>
                    </div>
                    {mockProfileData.isActive && (
                      <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {mockProfileData.name}
                    </h3>
                    <Badge
                      variant={
                        mockProfileData.role === "ADMIN"
                          ? "default"
                          : "secondary"
                      }
                      className="mt-1"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {getRoleDisplayName(mockProfileData.role)}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Profile Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{mockProfileData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Phone className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{mockProfileData.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Building className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Clinic</p>
                      <p className="font-medium">
                        {mockProfileData.clinic.clinicName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <MapPin className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">
                        {mockProfileData.clinic.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Last Login</p>
                      <p className="font-medium">
                        {formatDateForDisplay(mockProfileData.lastLogin)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Subscription Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Subscription Status
                    </span>
                    <Badge
                      variant={
                        isSubscriptionValid(mockProfileData.clinic.subsValidity)
                          ? "default"
                          : "destructive"
                      }
                    >
                      {isSubscriptionValid(
                        mockProfileData.clinic.subsValidity,
                      ) ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {isSubscriptionValid(mockProfileData.clinic.subsValidity)
                        ? "Active"
                        : "Expired"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatSubscriptionDate(
                      mockProfileData.clinic.subsValidity,
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="font-medium">
                    {new Date(mockProfileData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <Badge
                    variant={mockProfileData.isActive ? "default" : "secondary"}
                  >
                    {mockProfileData.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Role Level</span>
                  <Badge variant="outline">
                    {mockProfileData.role === "ADMIN"
                      ? "Full Access"
                      : "Limited Access"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Forms */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader></CardHeader>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="profile"
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Profile Information
                    </TabsTrigger>
                    <TabsTrigger
                      value="password"
                      className="flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      Change Password
                    </TabsTrigger>
                  </TabsList>
                  {/* Profile Information Tab */}
                  <TabsContent value="profile" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Personal Information
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Update your personal details here. Changes will be
                        reflected across your account.
                      </p>
                    </div>

                    <form
                      onSubmit={handleSubmitProfile(onProfileSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            placeholder="Enter your full name"
                            {...registerProfile("name")}
                            className={
                              profileErrors.name ? "border-red-500" : ""
                            }
                          />
                          {profileErrors.name && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {profileErrors.name.message}
                            </p>
                          )}
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            {...registerProfile("email")}
                            className={
                              profileErrors.email ? "border-red-500" : ""
                            }
                          />
                          {profileErrors.email && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {profileErrors.email.message}
                            </p>
                          )}
                        </div>

                        {/* Phone Field */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="phone"
                            className="flex items-center gap-2"
                          >
                            <Phone className="h-4 w-4" />
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            placeholder="Enter your phone number"
                            {...registerProfile("phone")}
                            className={
                              profileErrors.phone ? "border-red-500" : ""
                            }
                          />
                          {profileErrors.phone && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {profileErrors.phone.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 md:flex-none"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleResetProfile}
                          disabled={isLoading}
                        >
                          Reset
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  {/* Change Password Tab */}
                  <TabsContent value="password" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Change Password
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Update your password regularly to keep your account
                        secure.
                      </p>
                    </div>

                    {/* Password Reset Flow */}
                    <div className="space-y-6">
                      {/* Step 1: Initial - Show email and start button */}
                      {passwordResetStep === PasswordResetStep.INITIAL && (
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              <MailIcon className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium text-blue-800">
                                  Email Verification Required
                                </p>
                                <p className="text-sm text-blue-600">
                                  We&apos;ll send an OTP to your registered email to
                                  verify your identity.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Registered Email</Label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                              <MailIcon className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">
                                {mockProfileData.email}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              OTP will be sent to this email address
                            </p>
                          </div>

                          <Button
                            onClick={handleStartPasswordReset}
                            disabled={isLoading}
                            className="w-full"
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Send OTP to Email
                          </Button>
                        </div>
                      )}

                      {/* Step 2: Verify OTP */}
                      {passwordResetStep === PasswordResetStep.VERIFY_OTP && (
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <MailIcon className="h-5 w-5 text-blue-600" />
                                <div>
                                  <p className="font-medium text-blue-800">
                                    OTP Sent to Email
                                  </p>
                                  <p className="text-sm text-blue-600">
                                    Enter the 6-digit OTP sent to{" "}
                                    <span className="font-semibold">
                                      {mockProfileData.email}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              {otpTimer > 0 && (
                                <Badge variant="outline" className="bg-white">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTimer(otpTimer)}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <form
                            onSubmit={handleSubmitOtp(onOtpSubmit)}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="otp">Enter OTP</Label>
                              <Input
                                id="otp"
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                {...registerOtp("otp", {
                                  required: "OTP is required",
                                  pattern: {
                                    value: /^[0-9]{6}$/,
                                    message: "OTP must be 6 digits",
                                  },
                                })}
                                className={
                                  otpErrors.otp ? "border-red-500" : ""
                                }
                              />
                              {otpErrors.otp && (
                                <p className="text-sm text-red-500">
                                  {otpErrors.otp.message}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-3">
                              <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1"
                              >
                                Verify OTP
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleResendOtp}
                                disabled={otpTimer > 0 || isLoading}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Resend OTP
                                {otpTimer > 0 && ` (${formatTimer(otpTimer)})`}
                              </Button>
                            </div>
                          </form>

                          <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCancelPasswordReset}
                            className="w-full"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}

                      {/* Step 3: Reset Password */}
                      {passwordResetStep ===
                        PasswordResetStep.RESET_PASSWORD && (
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium text-green-800">
                                  OTP Verified Successfully
                                </p>
                                <p className="text-sm text-green-600">
                                  Now set your new password
                                </p>
                              </div>
                            </div>
                          </div>

                          <form
                            onSubmit={handleSubmitResetPassword(
                              onResetPasswordSubmit,
                            )}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="new-password">New Password</Label>
                              <div className="relative">
                                <Input
                                  id="new-password"
                                  type={showNewPassword ? "text" : "password"}
                                  placeholder="Enter your new password"
                                  {...registerResetPassword("newPassword", {
                                    required: "New password is required",
                                    minLength: {
                                      value: 6,
                                      message:
                                        "Password must be at least 6 characters",
                                    },
                                  })}
                                  className={
                                    resetPasswordErrors.newPassword
                                      ? "border-red-500"
                                      : ""
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                                  onClick={() =>
                                    setShowNewPassword(!showNewPassword)
                                  }
                                >
                                  {showNewPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              {resetPasswordErrors.newPassword && (
                                <p className="text-sm text-red-500">
                                  {resetPasswordErrors.newPassword.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="confirm-password">
                                Confirm New Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="confirm-password"
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  placeholder="Confirm your new password"
                                  {...registerResetPassword("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (value) =>
                                      value === watch("newPassword") ||
                                      "Passwords do not match",
                                  })}
                                  className={
                                    resetPasswordErrors.confirmPassword
                                      ? "border-red-500"
                                      : ""
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              {resetPasswordErrors.confirmPassword && (
                                <p className="text-sm text-red-500">
                                  {resetPasswordErrors.confirmPassword.message}
                                </p>
                              )}
                            </div>

                            {/* Password Strength Indicator */}
                            <div className="space-y-2">
                              <Label>Password Strength</Label>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    watch("newPassword")?.length >= 6
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  } transition-all duration-300`}
                                  style={{
                                    width: `${Math.min(
                                      (watch("newPassword")?.length || 0) * 10,
                                      100,
                                    )}%`,
                                  }}
                                />
                              </div>
                              <p className="text-xs text-gray-500">
                                {watch("newPassword")
                                  ? `${watch("newPassword").length} characters`
                                  : "Enter password"}
                              </p>
                            </div>

                            <div className="flex gap-3">
                              <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1"
                              >
                                <Key className="h-4 w-4 mr-2" />
                                {isLoading ? "Resetting..." : "Reset Password"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelPasswordReset}
                                disabled={isLoading}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Additional Information Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Account Activity
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex justify-between">
                        <span>Account Created</span>
                        <span className="font-medium">
                          {new Date(
                            mockProfileData.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Last Updated</span>
                        <span className="font-medium">Today</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Login Count (This Month)</span>
                        <span className="font-medium">24</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security Information
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center justify-between">
                        <span>Two-Factor Authentication</span>
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700"
                        >
                          Not Enabled
                        </Badge>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Password Last Changed</span>
                        <span className="font-medium">15 days ago</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Security Questions</span>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700"
                        >
                          Set
                        </Badge>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading state component (unchanged)
export function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-3">
                  <Skeleton className="w-32 h-32 rounded-full" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-20 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-10 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
