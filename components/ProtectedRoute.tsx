/**
 * Protected Route Wrapper
 * Ensures user is authenticated before accessing the page
 */

"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if access token exists
        const accessToken = localStorage.getItem("access_token");

        if (!accessToken) {
          router.push("/login");
          return;
        }

        // Check if user role matches required role (if specified)
        if (requiredRole) {
          const user = localStorage.getItem("user");
          if (user) {
            const userData = JSON.parse(user);
            if (userData.role !== requiredRole) {
              router.push("/unauthorized");
              return;
            }
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
