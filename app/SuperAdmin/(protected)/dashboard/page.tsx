"use client";

import { useState, useEffect } from "react";
import StatsCard from "@/components/ui/stats-card";
import LineChart from "@/components/charts/line-chart";
import PieChart from "@/components/charts/pie-chart";
import BarChart from "@/components/charts/bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  Heart,
  Stethoscope,
  Pill,
} from "lucide-react";

const hospitalColors = {
  primary: "#1a73e8",
  secondary: "#0ea5e9",
  accent: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  teal: "#0d9488",
  purple: "#8b5cf6",
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalClinics: 156,
    activeClinics: 132,
    expiredSubscriptions: 8,
    upcomingExpiries: 16,
    totalPatients: 8425,
    totalAppointments: 12420,
    completedAppointments: 11850,
    revenue: 485000,
    staffCount: 324,
    occupancyRate: 78,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const statsCards = [
    {
      title: "Total Clinics",
      value: stats.totalClinics,
      change: "+12%",
      icon: <Building className="w-5 h-5" />,
      color: hospitalColors.primary,
      gradient: `linear-gradient(135deg, ${hospitalColors.primary}, ${hospitalColors.secondary})`,
      details: `${stats.activeClinics} Active`,
    },
    {
      title: "Active Patients",
      value: stats.totalPatients,
      change: "+8%",
      icon: <Users className="w-5 h-5" />,
      color: hospitalColors.accent,
      gradient: `linear-gradient(135deg, ${hospitalColors.accent}, ${hospitalColors.teal})`,
      details: "This Month",
    },
    {
      title: "Appointments",
      value: stats.totalAppointments,
      change: "+15%",
      icon: <Calendar className="w-5 h-5" />,
      color: hospitalColors.teal,
      gradient: `linear-gradient(135deg, ${hospitalColors.teal}, #14b8a6)`,
      details: `${stats.completedAppointments} Completed`,
    },
    {
      title: "Revenue",
      value: `$${(stats.revenue / 1000).toFixed(1)}K`,
      change: "+22%",
      icon: <TrendingUp className="w-5 h-5" />,
      color: hospitalColors.purple,
      gradient: `linear-gradient(135deg, ${hospitalColors.purple}, #a855f7)`,
      details: "Monthly Revenue",
    },
  ];

  const statusCards = [
    {
      title: "Active Clinics",
      value: stats.activeClinics,
      icon: <CheckCircle className="w-5 h-5" />,
      color: hospitalColors.accent,
      percentage: ((stats.activeClinics / stats.totalClinics) * 100).toFixed(1),
    },
    {
      title: "Expiring Soon",
      value: stats.upcomingExpiries,
      icon: <Clock className="w-5 h-5" />,
      color: hospitalColors.warning,
      description: "Within 30 days",
    },
    {
      title: "Expired",
      value: stats.expiredSubscriptions,
      icon: <AlertCircle className="w-5 h-5" />,
      color: hospitalColors.danger,
      description: "Needs attention",
    },
    {
      title: "Occupancy Rate",
      value: `${stats.occupancyRate}%`,
      icon: <Activity className="w-5 h-5" />,
      color: hospitalColors.secondary,
      description: "Hospital beds",
    },
  ];

  const chartData = {
    subscriptions: [
      { month: "Jan", active: 45, expired: 2 },
      { month: "Feb", active: 48, expired: 1 },
      { month: "Mar", active: 52, expired: 0 },
      { month: "Apr", active: 55, expired: 1 },
      { month: "May", active: 58, expired: 3 },
      { month: "Jun", active: 62, expired: 2 },
    ],
    clinicDistribution: [
      { name: "Active", value: 85, color: hospitalColors.accent },
      { name: "Expiring Soon", value: 10, color: hospitalColors.warning },
      { name: "Expired", value: 5, color: hospitalColors.danger },
    ],
    revenue: [
      { month: "Jan", revenue: 4200 },
      { month: "Feb", revenue: 3800 },
      { month: "Mar", revenue: 4500 },
      { month: "Apr", revenue: 5100 },
      { month: "May", revenue: 4800 },
      { month: "Jun", revenue: 5300 },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6">
            <Heart
              className="w-12 h-12 animate-pulse"
              style={{ color: hospitalColors.primary }}
            />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            Loading Dashboard
          </h3>
          <p className="text-slate-500">Fetching healthcare data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card
        className="border-0 shadow-xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${hospitalColors.primary}15, ${hospitalColors.teal}15)`,
        }}
      >
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Welcome back, Admin
              </h1>
              <p className="text-slate-600">
                Here&apos;s what&apos;s happening with your healthcare facilities today.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusCards.map((card, index) => (
          <Card
            key={index}
            className="border-0 shadow-lg hover:shadow-xl transition-shadow"
            style={{
              background: `linear-gradient(135deg, ${card.color}10, ${card.color}05)`,
              borderTop: `3px solid ${card.color}`,
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${card.color}15` }}
                >
                  <div style={{ color: card.color }}>{card.icon}</div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/50">
                  {card.percentage ? `${card.percentage}%` : ""}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-1">
                {card.value}
              </h3>
              <p className="text-sm font-medium text-slate-700 mb-1">
                {card.title}
              </p>
              {card.description && (
                <p className="text-xs text-slate-500">{card.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Trend */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">
              Subscription Trend
            </CardTitle>
            <p className="text-sm text-slate-600">
              Monthly active vs expired subscriptions
            </p>
          </CardHeader>
          <CardContent>
            <BarChart
              data={chartData.subscriptions}
              xKey="month"
              series={[
                {
                  key: "active",
                  label: "Active",
                  color: hospitalColors.accent,
                },
                {
                  key: "expired",
                  label: "Expired",
                  color: hospitalColors.danger,
                },
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        {/* Clinic Distribution */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">
              Clinic Status Distribution
            </CardTitle>
            <p className="text-sm text-slate-600">
              Overview of all healthcare facilities
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-2/3">
                <PieChart data={chartData.clinicDistribution} height={250} />
              </div>
              <div className="lg:w-1/3 space-y-4 mt-6 lg:mt-0">
                {chartData.clinicDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="font-medium text-slate-700">
                      {item.name}
                    </span>
                    <span
                      className="ml-auto font-bold px-2 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                      }}
                    >
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">
                Revenue Overview
              </CardTitle>
              <p className="text-sm text-slate-600">Monthly revenue growth</p>
            </div>
            <Button
              className="hover:scale-105 transition-transform"
              style={{
                background: `linear-gradient(135deg, ${hospitalColors.primary}, ${hospitalColors.secondary})`,
              }}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <LineChart
            data={chartData.revenue}
            xKey="month"
            yKey="revenue"
            color={hospitalColors.primary}
            height={350}
          />
        </CardContent>
      </Card>
    </div>
  );
}
