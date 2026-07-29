"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
// import { cookies } from "next/headers";
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
import {
  Building2,
  UserCog,
  UserCheck,
  DollarSign,
  CalendarOff,
  Ticket,
  Wrench,
  LogIn,
  Search,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/public/images/logo-blue.png";
import Image from "next/image";
import "./global.css";

const hospitalColors = {
  primary: "#1a73e8",
  secondary: "#0ea5e9",
  accent: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  background: "#f8fafc",
  card: "#ffffff",
  darkBlue: "#1e40af",
  teal: "#0d9488",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  // const cookieStore = cookies();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const navigationItems = [
    {
      label: "Doctor Management",
      icon: <Stethoscope size={20} />,
      href: "/admin/doctor",
      color: hospitalColors.accent,
    },
    {
      label: "Staff Management",
      icon: <UserCog size={20} />,
      href: "/admin/staff",
      color: hospitalColors.teal,
    },
    {
      label: "Receptionist Management",
      icon: <UserCheck size={20} />,
      href: "/admin/reception",
      color: hospitalColors.warning,
    },
    {
      label: "Patient Management",
      icon: <Heart size={20} />,
      href: "/admin/patient",
      color: hospitalColors.danger,
    },
    {
      label: "Salary Management",
      icon: <DollarSign size={20} />,
      href: "/admin/salary",
      color: hospitalColors.secondary,
    },
    {
      label: "Leave Management",
      icon: <CalendarOff size={20} />,
      href: "/admin/leave",
      color: hospitalColors.primary,
    },
    {
      label: "Visit Token Management",
      icon: <Ticket size={20} />,
      href: "/admin/token",
      color: hospitalColors.accent,
    },
    // {
    //   label: "Services Management",
    //   icon: <Wrench size={20} />,
    //   href: "/admin/services",
    //   color: hospitalColors.teal,
    // },
    {
      label: "Login Master",
      icon: <LogIn size={20} />,
      href: "/admin/stafflogin",
      color: hospitalColors.darkBlue,
    },
    // {
    //   label: "Clinic Details / Profile",
    //   icon: <Building2 size={20} />,
    //   href: "/admin/clinics",
    //   color: hospitalColors.primary,
    // },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  // Authentication check - only run once on mount
  // useEffect(() => {
  //   const checkAuth = () => {
  //     if (typeof window !== "undefined") {
  //       const token = cookieStore.get("access_token");

  //       if (!token) {
  //         setIsAuthenticated(false);
  //         setIsChecking(false);
  //         router.replace("/login");
  //       } else {
  //         setIsAuthenticated(true);
  //         setIsChecking(false);
  //       }
  //     }
  //   };

  //   checkAuth();
  // }, []); // Only run once on mount

  // Show loading spinner while checking authentication
  // if (isChecking || isAuthenticated === null) {
  //   return (
  //     <div className="flex h-screen items-center justify-center bg-gray-50">
  //       <div className="text-center">
  //         <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
  //         <p className="text-gray-600">Verifying access...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // If not authenticated, don't render anything (redirecting)
  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - Fixed position */}
      <aside
        className={` fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white shadow-lg transition-all duration-300 ${
          sidebarOpen ? "w-72" : "w-20"
        }`}
      >
        {/* Logo Section */}
        <div className="border-b border-gray-200 p-4">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <Image src={Logo} alt="Logo" width={40} height={40} />
              <div>
                <h1 className="text-lg font-bold text-blue-600">Clinic Name</h1>
                <p className="text-xs text-gray-500">By DOCPLUS</p>
                <p className="text-[10px] text-blue-500">
                  AI-Powered Smart Clinic
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Image src={Logo} alt="Logo" width={40} height={40} />
            </div>
          )}
        </div>

        {/* Navigation without scrollbar */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide ">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-2 flex items-center rounded-lg px-3 py-3 transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                } ${!sidebarOpen && "justify-center"}`}
              >
                <span style={{ color: isActive ? item.color : undefined }}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button - Fixed at Bottom */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className={`flex w-full items-center rounded-lg px-3 py-3 text-red-600 transition-colors hover:bg-red-50 ${
              !sidebarOpen && "justify-center"
            }`}
          >
            <LogOut size={20} />
            {sidebarOpen && (
              <span className="ml-3 text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content with margin to account for fixed sidebar */}
      <main
        className={`flex-1 overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg transition-colors hover:cursor-pointer hover:bg-blue-50"
            >
              {sidebarOpen ? (
                <PanelLeftOpen className="h-6 w-6 text-gray-600" />
              ) : (
                <PanelRightOpen className="h-6 w-6 text-gray-600" />
              )}
            </button>
         
              <Link href="/admin/myProfile" className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">Admin</p>
                  <p className="text-xs text-gray-500">System Administrator</p>
                </div>
                <Shield className="h-5 w-5 text-blue-600" />
              </Link>
            </div>
        
        </header>

        {/* Page Content */}
        <div className="h-[calc(100vh-73px)] overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
