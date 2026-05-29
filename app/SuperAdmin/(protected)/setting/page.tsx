"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Bell,
  Calendar,
  CreditCard,
  Shield,
  Database,
  Cloud,
  Key,
  Users,
  Globe,
  Palette,
  Save,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";

const hospitalColors = {
  primary: "#1a73e8",
  secondary: "#0ea5e9",
  accent: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  teal: "#0d9488",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General
    clinicName: "MedCare Pro System",
    timezone: "UTC-5",
    language: "English",

    // Security
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    billingAlerts: true,
    securityAlerts: true,

    // Display
    theme: "light",
    compactMode: false,
  });

  const [activeTab, setActiveTab] = useState("general");
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const tabs = [
    { id: "general", label: "General", icon: <Settings className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
    },
    { id: "display", label: "Display", icon: <Palette className="w-4 h-4" /> },
    {
      id: "integrations",
      label: "Integrations",
      icon: <Cloud className="w-4 h-4" />,
    },
  ];

  const handleSave = () => {
    console.log("Settings saved:", settings);
    // Add API call here
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log("Password changed");
    // Add API call here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
        <p className="text-slate-600">
          Configure your healthcare management system
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === tab.id
                        ? "shadow-md transform scale-[1.02]"
                        : "hover:bg-slate-50"
                    }`}
                    style={{
                      background:
                        activeTab === tab.id
                          ? `linear-gradient(90deg, ${hospitalColors.primary}10, ${hospitalColors.primary}05)`
                          : "transparent",
                      color:
                        activeTab === tab.id
                          ? hospitalColors.primary
                          : "#475569",
                    }}
                  >
                    <div
                      style={{
                        color:
                          activeTab === tab.id
                            ? hospitalColors.primary
                            : "#64748b",
                      }}
                    >
                      {tab.icon}
                    </div>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">
                    {tabs.find((t) => t.id === activeTab)?.label} Settings
                  </CardTitle>
                  <p className="text-slate-600 mt-1">
                    {activeTab === "general" &&
                      "Configure basic system settings"}
                    {activeTab === "security" &&
                      "Manage security and access controls"}
                    {activeTab === "notifications" &&
                      "Configure notification preferences"}
                    {activeTab === "display" && "Customize display options"}
                    {activeTab === "integrations" &&
                      "Manage third-party integrations"}
                  </p>
                </div>
                <Button
                  onClick={handleSave}
                  className="hover:scale-105 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${hospitalColors.primary}, ${hospitalColors.secondary})`,
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* General Settings */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        System Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={settings.clinicName}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            clinicName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Timezone
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        value={settings.timezone}
                        onChange={(e) =>
                          setSettings({ ...settings, timezone: e.target.value })
                        }
                      >
                        <option value="UTC-5">Eastern Time (UTC-5)</option>
                        <option value="UTC-6">Central Time (UTC-6)</option>
                        <option value="UTC-7">Mountain Time (UTC-7)</option>
                        <option value="UTC-8">Pacific Time (UTC-8)</option>
                        <option value="UTC+0">UTC</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Language
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        value={settings.language}
                        onChange={(e) =>
                          setSettings({ ...settings, language: e.target.value })
                        }
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Chinese">Chinese</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        System Logo
                      </label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">
                          Click to upload logo
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PNG, JPG up to 2MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div className="space-y-8">
                  {/* Password Change */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Change Password
                    </h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="mt-4 hover:scale-105 transition-transform"
                        style={{
                          background: `linear-gradient(135deg, ${hospitalColors.accent}, ${hospitalColors.teal})`,
                        }}
                      >
                        Update Password
                      </Button>
                    </form>
                  </div>

                  {/* Security Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      Security Preferences
                    </h3>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                      <div>
                        <p className="font-medium text-slate-800">
                          Two-Factor Authentication
                        </p>
                        <p className="text-sm text-slate-600">
                          Add an extra layer of security
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.twoFactorAuth}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              twoFactorAuth: e.target.checked,
                            })
                          }
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="p-4 rounded-lg border border-slate-200">
                      <p className="font-medium text-slate-800 mb-2">
                        Session Timeout
                      </p>
                      <p className="text-sm text-slate-600 mb-4">
                        Automatically log out after inactivity
                      </p>
                      <div className="flex items-center gap-4">
                        {[15, 30, 60, 120].map((minutes) => (
                          <button
                            key={minutes}
                            type="button"
                            onClick={() =>
                              setSettings({
                                ...settings,
                                sessionTimeout: minutes,
                              })
                            }
                            className={`px-4 py-2 rounded-lg border ${
                              settings.sessionTimeout === minutes
                                ? "border-blue-500 bg-blue-50 text-blue-600"
                                : "border-slate-300 hover:border-slate-400"
                            }`}
                          >
                            {minutes} min
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  {[
                    {
                      key: "emailNotifications",
                      label: "Email Notifications",
                      description: "Receive updates via email",
                    },
                    {
                      key: "pushNotifications",
                      label: "Push Notifications",
                      description: "Receive browser notifications",
                    },
                    {
                      key: "billingAlerts",
                      label: "Billing Alerts",
                      description: "Get notified about billing activities",
                    },
                    {
                      key: "securityAlerts",
                      label: "Security Alerts",
                      description: "Receive security-related notifications",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-800">
                          {item.label}
                        </p>
                        <p className="text-sm text-slate-600">
                          {item.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={
                            settings[
                              item.key as keyof typeof settings
                            ] as boolean
                          }
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              [item.key]: e.target.checked,
                            })
                          }
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Display Settings */}
              {activeTab === "display" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <button
                      onClick={() =>
                        setSettings({ ...settings, theme: "light" })
                      }
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        settings.theme === "light"
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="w-full h-32 bg-gradient-to-br from-white to-slate-100 rounded-lg mb-4 border"></div>
                      <p className="font-medium text-slate-800">Light Mode</p>
                      <p className="text-sm text-slate-600">
                        Clean and bright interface
                      </p>
                    </button>
                    <button
                      onClick={() =>
                        setSettings({ ...settings, theme: "dark" })
                      }
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        settings.theme === "dark"
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="w-full h-32 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg mb-4 border border-slate-700"></div>
                      <p className="font-medium text-slate-800">Dark Mode</p>
                      <p className="text-sm text-slate-600">Easy on the eyes</p>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                    <div>
                      <p className="font-medium text-slate-800">Compact Mode</p>
                      <p className="text-sm text-slate-600">
                        Use less spacing between elements
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.compactMode}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            compactMode: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Integrations Settings */}
              {activeTab === "integrations" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        name: "Google Calendar",
                        icon: <Calendar className="w-5 h-5" />,
                        connected: true,
                      },
                      {
                        name: "Slack",
                        icon: <Bell className="w-5 h-5" />,
                        connected: false,
                      },
                      {
                        name: "Stripe",
                        icon: <CreditCard className="w-5 h-5" />,
                        connected: true,
                      },
                      {
                        name: "AWS",
                        icon: <Cloud className="w-5 h-5" />,
                        connected: true,
                      },
                      {
                        name: "Zapier",
                        icon: <Globe className="w-5 h-5" />,
                        connected: false,
                      },
                      {
                        name: "Google Drive",
                        icon: <Database className="w-5 h-5" />,
                        connected: false,
                      },
                    ].map((integration) => (
                      <div
                        key={integration.name}
                        className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100">
                              {integration.icon}
                            </div>
                            <span className="font-medium text-slate-800">
                              {integration.name}
                            </span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              integration.connected
                                ? "bg-green-100 text-green-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {integration.connected ? "Connected" : "Connect"}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full hover:scale-105 transition-transform"
                          style={{
                            borderColor: integration.connected
                              ? hospitalColors.danger
                              : hospitalColors.accent,
                            color: integration.connected
                              ? hospitalColors.danger
                              : hospitalColors.accent,
                          }}
                        >
                          {integration.connected ? "Disconnect" : "Connect Now"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
