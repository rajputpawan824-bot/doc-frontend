// app/SuperAdmin/page.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { LoginCredentials } from "@/lib/validations/SuperAdmin/auth";
import { useLoginMutation } from "@/lib/validations/SuperAdmin/auth";
import {
  useFormValidation,
  ValidationRules,
} from "@/lib/hooks/useFormValidation";
import { LOGIN_VALIDATION_RULES } from "@/lib/validations/SuperAdmin/auth";
import { clientApi } from "@/lib/api";

// Form Data Type
interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  // Use form validation hook
  const { errors, validate, clearError, clearAllErrors } = useFormValidation(
    LOGIN_VALIDATION_RULES
  );

  // Use login mutation from TanStack Query
  const {
    mutate: login,
    isPending: isLoading,
    error: mutationError,
  } = useLoginMutation({
    onSuccess: (data) => {
      // Store tokens using clientApi method
      clientApi.setTokens({
        accessToken: data.token,
      });

      // Store user data if available
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect to dashboard
      router.push("/SuperAdmin/dashboard");
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      clearError(name);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    clearAllErrors();

    // Validate form
    if (!validate(formData as unknown as Record<string, unknown>)) {
      return;
    }

    // Trigger mutation
    const credentials: LoginCredentials = {
      email: formData.email.trim(),
      password: formData.password,
    };

    login(credentials);
  };

  // Get error message from validation or API error
  const errorMessage = Object.values(errors)[0] || mutationError?.message || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="text-center lg:text-left">
            <Link
              href="/"
              className="inline-flex items-center gap-3 mb-8 transition-opacity hover:opacity-80"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">MF</span>
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                MedFlow
              </span>
            </Link>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome Back
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Manage your clinics with ease
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              Log in to Your Account
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {errorMessage && (
              <div
                className="p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 text-sm"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* name Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`pl-10 pr-4 py-6 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.email ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    placeholder="Enter your email"
                    required
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Password
                  </Label>
                  <Link
                    href="/forgotPassword"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`pl-10 pr-12 py-6 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.password ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    placeholder="Enter your password"
                    required
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
