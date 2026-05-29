// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Logo from "@/public/images/logo-landscape.png";
import { useApiMutation } from "@/lib/api/hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const { mutate: sendForgotPassword, isPending: isLoading } = useApiMutation<
    { success: boolean; message: string },
    { email: string }
  >("/auth/forgot-password", "POST", {
    onSuccess: (data) => {
      toast.success(data?.message || "Verification code sent to email!");
      router.push(`/verifyOtp?email=${encodeURIComponent(email)}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process forgot password request");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    sendForgotPassword({ email });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Check Your Email
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We&apos;ve sent a password reset link to <strong>{email}</strong>.
                Please check your inbox and follow the instructions to reset
                your password.
              </p>

              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link href="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Link>
                </Button>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Didn&apos;t receive the email?{" "}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-blue-600 hover:underline"
                  >
                    Try again
                  </button>
                </p>
              </div>
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
              Forgot Password
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Enter your email to receive a password reset link
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 pr-4 py-3"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
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
