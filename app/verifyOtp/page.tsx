// app/verify-otp/page.tsx
"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle, RotateCcw } from "lucide-react";
import Image from "next/image";
import Logo from "@/public/images/logo-landscape.png";
import { useApiMutation } from "@/lib/api/hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OtpResponse {
  message?: string;
  data?: string | { resetToken?: string };
  resetToken?: string;
}

// Move the main component logic to a separate component
function VerifyOTPForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const { mutate: verifyOtp, isPending: isVerifying } = useApiMutation<
    OtpResponse,
    { email: string; otp: string }
  >("/auth/verify-otp", "POST", {
    onSuccess: (data: OtpResponse) => {
      toast.success(data?.message || "OTP verified successfully!");
      setIsVerified(true);
      const resetToken = typeof data?.data === 'string' ? data.data : data?.data?.resetToken || data?.resetToken;
      if (resetToken) {
        setTimeout(() => router.push(`/resetPassword?token=${resetToken}`), 1000);
      } else {
        setTimeout(() => router.push(`/resetPassword`), 1000);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid OTP");
    },
  });

  const { mutate: resendOtpMutation, isPending: isResending } = useApiMutation<
    OtpResponse,
    { email: string }
  >("/auth/forgot-password", "POST", {
    onSuccess: (data: OtpResponse) => {
      toast.success(data?.message || "OTP resent to your email");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resend OTP");
    },
  });

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedNumbers = pastedData.replace(/\D/g, "").split("").slice(0, 6);

    const newOtp = [...otp];
    pastedNumbers.forEach((num, index) => {
      if (index < 6) {
        newOtp[index] = num;
      }
    });

    setOtp(newOtp);

    // Focus the last filled input or the last one
    const lastFilledIndex = pastedNumbers.length - 1;
    if (lastFilledIndex < 5) {
      inputRefs.current[lastFilledIndex + 1]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length === 6 && email) {
      verifyOtp({ email, otp: otpString });
    } else if (!email) {
      toast.error("Email not found. Please try requesting a new OTP.");
    }
  };

  const handleResendOTP = async () => {
    if (email) {
      resendOtpMutation({ email });
    } else {
      toast.error("Email not found.");
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Verification Successful!
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your email has been successfully verified. You can now access
                your account.
              </p>

              <Button asChild className="w-full">
                <Link href="/login">Continue to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 text-center">
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
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Verify OTP
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Enter the 6-digit code sent to {email || "your email"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Inputs */}
              <div className="space-y-4">
                <Label>Enter Verification Code</Label>
                <div className="flex justify-between space-x-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-lg font-semibold"
                      maxLength={1}
                      required
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                disabled={otp.join("").length !== 6 || isVerifying}
              >
                <Shield className="w-4 h-4 mr-2" />
                {isVerifying ? "Verifying..." : "Verify Code"}
              </Button>

              {/* Resend OTP */}
              <div className="text-center space-y-2">
                <p className="text-gray-600 dark:text-gray-400">
                  Didn&apos;t receive the code?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <RotateCcw
                    className={`w-4 h-4 mr-2 ${
                      isResending ? "animate-spin" : ""
                    }`}
                  />
                  {isResending ? "Resending..." : "Resend OTP"}
                </Button>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function VerifyOTPLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 text-center">
            <div className="inline-flex items-center gap-3 justify-center mb-4">
                <Image
          src={Logo}
          alt="Clinic Management Logo"
          width={100}
          height={100}
          className="mr-2"
        />
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto w-1/2"></div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3"></div>
              <div className="flex justify-between space-x-2">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>

            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>

            <div className="text-center space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto w-1/2"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto w-32"></div>
            </div>

            <div className="text-center">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto w-24"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<VerifyOTPLoading />}>
      <VerifyOTPForm />
    </Suspense>
  );
}
