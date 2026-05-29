"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DeleteModal from "@/components/ui/delete-modal";
import {
  CreditCard,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
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

interface Subscription {
  id: number;
  name: string;
  price: number;
  duration: string;
  clinics: number;
  features: string[];
  status: "active" | "inactive";
  renewals: number;
  revenue: number;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: 1,
      name: "Premium Plan",
      price: 299,
      duration: "monthly",
      clinics: 45,
      features: [
        "Unlimited Patients",
        "Advanced Analytics",
        "24/7 Support",
        "API Access",
      ],
      status: "active",
      renewals: 42,
      revenue: 13455,
    },
    {
      id: 2,
      name: "Standard Plan",
      price: 199,
      duration: "monthly",
      clinics: 68,
      features: ["500 Patients", "Basic Analytics", "Business Hours Support"],
      status: "active",
      renewals: 60,
      revenue: 13532,
    },
    {
      id: 3,
      name: "Basic Plan",
      price: 99,
      duration: "monthly",
      clinics: 43,
      features: ["100 Patients", "Email Support"],
      status: "active",
      renewals: 38,
      revenue: 4257,
    },
    {
      id: 4,
      name: "Enterprise",
      price: 499,
      duration: "yearly",
      clinics: 12,
      features: ["Custom Everything", "Dedicated Support", "On-premise"],
      status: "inactive",
      renewals: 10,
      revenue: 5988,
    },
  ]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSubscription) {
      setSubscriptions(
        subscriptions.filter((s) => s.id !== selectedSubscription.id)
      );
      setIsDeleteModalOpen(false);
      setSelectedSubscription(null);
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.revenue, 0);
  const totalClinics = subscriptions.reduce((sum, sub) => sum + sub.clinics, 0);
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === "active"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Subscription Plans
          </h1>
          <p className="text-slate-600">
            Manage subscription plans and billing
          </p>
        </div>
        <Button
          className="hover:scale-105 transition-transform"
          style={{
            background: `linear-gradient(135deg, ${hospitalColors.teal}, #14b8a6)`,
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Plan
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="border-0 shadow-xl"
          style={{ borderTop: `4px solid ${hospitalColors.primary}` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-800">
                  ${totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    +12.5%
                  </span>
                  <span className="text-sm text-slate-500">
                    from last month
                  </span>
                </div>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${hospitalColors.primary}15` }}
              >
                <DollarSign
                  className="w-6 h-6"
                  style={{ color: hospitalColors.primary }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-xl"
          style={{ borderTop: `4px solid ${hospitalColors.accent}` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Plans</p>
                <p className="text-2xl font-bold text-slate-800">
                  {activeSubscriptions}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-slate-500">
                    All systems operational
                  </span>
                </div>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${hospitalColors.accent}15` }}
              >
                <CreditCard
                  className="w-6 h-6"
                  style={{ color: hospitalColors.accent }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-xl"
          style={{ borderTop: `4px solid ${hospitalColors.purple}` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Clinics</p>
                <p className="text-2xl font-bold text-slate-800">
                  {totalClinics}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-slate-500">
                    Using subscription plans
                  </span>
                </div>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${hospitalColors.purple}15` }}
              >
                <Users
                  className="w-6 h-6"
                  style={{ color: hospitalColors.purple }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search subscription plans..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredSubscriptions.map((subscription) => (
          <Card
            key={subscription.id}
            className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group"
            style={{
              borderTop: `4px solid ${
                subscription.name === "Premium Plan"
                  ? hospitalColors.primary
                  : subscription.name === "Standard Plan"
                  ? hospitalColors.accent
                  : subscription.name === "Basic Plan"
                  ? hospitalColors.teal
                  : hospitalColors.purple
              }`,
            }}
          >
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {subscription.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscription.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {subscription.status === "active" ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                    <span className="text-sm text-slate-500">
                      {subscription.duration}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                    onClick={() => console.log("Edit", subscription.id)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                    style={{ borderColor: hospitalColors.danger }}
                    onClick={() => handleDelete(subscription)}
                  >
                    <Trash2
                      className="w-3 h-3"
                      style={{ color: hospitalColors.danger }}
                    />
                  </Button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-slate-900">
                    ${subscription.price}
                  </span>
                  <span className="text-slate-500 ml-1">
                    /{subscription.duration === "yearly" ? "year" : "month"}
                  </span>
                </div>
                <p className="text-sm text-slate-600">per clinic</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Clinics</span>
                  </div>
                  <div className="text-xl font-bold text-slate-800">
                    {subscription.clinics}
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Renewals</span>
                  </div>
                  <div className="text-xl font-bold text-slate-800">
                    {subscription.renewals}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                <h4 className="text-sm font-semibold text-slate-700">
                  Features
                </h4>
                <ul className="space-y-2">
                  {subscription.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Revenue */}
              <div
                className="p-4 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${hospitalColors.teal}10, ${hospitalColors.primary}10)`,
                  border: `1px solid ${hospitalColors.primary}20`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">
                    Monthly Revenue
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: hospitalColors.primary }}
                  >
                    ${subscription.revenue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                className="w-full mt-4 hover:scale-105 transition-transform"
                style={{
                  background:
                    subscription.status === "active"
                      ? `linear-gradient(135deg, ${hospitalColors.primary}, ${hospitalColors.secondary})`
                      : `linear-gradient(135deg, ${hospitalColors.warning}, #f59e0b)`,
                }}
              >
                {subscription.status === "active"
                  ? "Manage Plan"
                  : "Activate Plan"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Subscription Plan"
        description="Are you sure you want to delete this subscription plan? This will affect all clinics using this plan."
        data={
          selectedSubscription
            ? {
                "Plan Name": selectedSubscription.name,
                Price: `$${selectedSubscription.price}/${selectedSubscription.duration}`,
                "Active Clinics": selectedSubscription.clinics,
                "Monthly Revenue": `$${selectedSubscription.revenue.toLocaleString()}`,
              }
            : {}
        }
      />
    </div>
  );
}
