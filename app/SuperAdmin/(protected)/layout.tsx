"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Building,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  Users,
  FileText,
  Bell,
  Activity,
  Stethoscope,
  Heart,
  Pill,
  PanelLeftOpen,
  PanelRightOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/public/images/logo-white.png";
import Image from "next/image";

const hospitalColors = {
  primary: "#1a73e8", // Medical Blue
  secondary: "#0ea5e9", // Light Blue
  accent: "#10b981", // Medical Green
  warning: "#f59e0b", // Amber
  danger: "#ef4444", // Red
  background: "#f8fafc", // Light Gray
  card: "#ffffff", // White
  darkBlue: "#1e40af", // Deep Blue
  teal: "#0d9488", // Teal for health
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    return Boolean(localStorage.getItem("access_token"));
  });

  const navigationItems = [
    {
      label: "Dashboard",
      icon: <Home className="w-5 h-5" />,
      href: "/SuperAdmin/dashboard",
      color: hospitalColors.primary,
    },
    {
      label: "Clinic Management",
      icon: <Building className="w-5 h-5" />,
      href: "/SuperAdmin/clinic",
      color: hospitalColors.accent,
    },
    {
      label: "Subscription",
      icon: <CreditCard className="w-5 h-5" />,
      href: "/SuperAdmin/subscription",
      color: hospitalColors.teal,
    },
    {
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
      href: "/SuperAdmin/setting",
      color: hospitalColors.secondary,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/SuperAdmin");
  };

  useEffect(() => {
    if (isAuthenticated === false) {
      console.log("No token, redirecting to login");
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Show loading spinner while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirecting)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-70" : "w-22"
        } bg-sidebar text-white transition-all duration-300 sticky top-0 h-screen shadow-2xl z-50`}
      >
        <div className="flex items-center justify-center bg-white  bg-sidebar">
          {sidebarOpen ? (
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="flex items-center flex-row justify-center ">
                <Image src={Logo} alt="Logo" height={100} width={80} />
                <div className="flex items-center flex-col justify-center ">
                  <h1>
                    <span className="justify-center font-bold text-3xl w-full flex">
                      DOCPLUS
                    </span>
                  </h1>
                  <h3>AI-Powered Smart Clinic</h3>
                </div>
              </div>
            </Link>
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto">
              <Image src={Logo} alt="Logo" height={100} width={80} />
            </div>
          )}
        </div>

        <nav className="py-4 ps-5 space-y-2 overflow-hidden">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "shadow-lg transform scale-[1.02] text-blue-800"
                    : "hover:bg-blue-800/50"
                }`}
                style={{
                  background: isActive ? `white` : "transparent",
                  borderRadius: isActive ? "10px 0 0px 10px" : "0px",
                }}
              >
                <div
                  className={`${
                    isActive ? "scale-110" : ""
                  } transition-transform`}
                >
                  {item.icon}
                </div>
                {sidebarOpen && (
                  <span className="font-medium tracking-wide">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-blue-800 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-blue-300 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 hover:scale-[1.02]"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Header */}
        <div
          className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-40 border-b"
          style={{ borderColor: hospitalColors.primary }}
        >
          <div className="flex items-center justify-between ps-4 px-8 py-4">
            <div className="flex flex-row gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className=" rounded-lg transition-colors hover:cursor-pointer hover:bg-blue-50"
           
              >
                {sidebarOpen ? (
                  <PanelRightOpen className="w-6 h-6 " />
                ) : (
                  <PanelLeftOpen className="w-6 h-6" />
                )}
              </button>
             
            </div>
            <div className="flex items-center gap-4">
              <button
                className="relative p-2 hover:bg-blue-50 rounded-xl transition-colors"
                style={{ color: hospitalColors.primary }}
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${hospitalColors.primary}, ${hospitalColors.teal})`,
                  }}
                >
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Admin</p>
                  <p className="text-xs text-slate-600">System Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 bg-gradient-to-b from-transparent to-blue-50/50 min-h-[calc(100vh-80px)]">
          {children}
        </div>
      </main>
    </div>
  );
}
