"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Shield,
  UserCircle,
  Calendar,
  History,
  FileText,
  Ticket,
  Users,
  Menu,
  X,
  PanelLeftOpen,
  PanelRightOpen,
} from "lucide-react";
import Logo from "@/public/images/logo-blue.png";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

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

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const navigationItems = [
    {
      label: "Dashboard",
      icon: <Shield size={20} />,
      href: "/patient/dashboard",
      color: hospitalColors.primary,
    },
    {
      label: "My Profiles",
      icon: <Users size={20} />,
      href: "/patient/profiles",
      color: hospitalColors.accent,
    },
    {
      label: "Appointments",
      icon: <Calendar size={20} />,
      href: "/patient/appointments",
      color: hospitalColors.secondary,
    },
    {
      label: "Token Status",
      icon: <Ticket size={20} />,
      href: "/patient/token",
      color: hospitalColors.warning,
    },
    {
      label: "Medical History",
      icon: <History size={20} />,
      href: "/patient/history",
      color: hospitalColors.teal,
    },
    {
      label: "Reports",
      icon: <FileText size={20} />,
      href: "/patient/reports",
      color: hospitalColors.danger,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    document.cookie = "access_token=; Max-Age=0; path=/";
    setIsAuthenticated(false);
    router.push("/login");
  };

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setIsAuthenticated(false);
          setIsChecking(false);
          router.replace("/login");
        } else {
          setIsAuthenticated(true);
          setIsChecking(false);
        }
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isChecking || isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-gray-600">Preparing your health portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white shadow-lg transition-all duration-300 
          ${sidebarOpen ? "w-72" : "w-20"} 
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <Image src={Logo} alt="Logo" width={40} height={40} />
              <div>
                <h1 className="text-lg font-bold text-blue-600">Clinic Name</h1>
                <p className="text-[10px] text-blue-500 font-medium tracking-widest">PATIENT PORTAL</p>
              </div>
            </div>
          ) : (
            <div className="flex w-full justify-center">
              <Image src={Logo} alt="Logo" width={40} height={40} />
            </div>
          )}
          <button className="lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`mb-2 flex items-center rounded-lg px-3 py-3 transition-all ${
                  isActive ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-700 hover:bg-gray-100"
                } ${!sidebarOpen && "justify-center"}`}
              >
                <span style={{ color: isActive ? item.color : undefined }}>{item.icon}</span>
                {sidebarOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className={`flex w-full items-center rounded-lg px-3 py-3 text-red-600 transition-colors hover:bg-red-50 ${
              !sidebarOpen && "justify-center"
            }`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <main
        className={`flex-1 overflow-hidden transition-all duration-300 
          ${sidebarOpen ? "lg:ml-72" : "lg:ml-20"}
        `}
      >
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden rounded-lg p-1 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block rounded-lg p-1 transition-colors hover:bg-blue-50"
              >
                {sidebarOpen ? (
                  <PanelLeftOpen className="h-6 w-6 text-gray-600" />
                ) : (
                  <PanelRightOpen className="h-6 w-6 text-gray-600" />
                )}
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">John Doe</p>
                <p className="text-[10px] text-slate-500">ID: P-10294</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
                JD
              </div>
            </div>
          </div>
        </header>

        <div className="h-[calc(100vh-73px)] overflow-y-auto p-4 lg:p-6 bg-slate-50/50">
          {children}
        </div>
      </main>
    </div>
  );
}
