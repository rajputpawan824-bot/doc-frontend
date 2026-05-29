"use client";

import { useState, useEffect } from "react";
import { 
  Ticket, 
  Plus, 
  Minus, 
  RotateCcw, 
  Settings2, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ReusableModal, { FieldConfig } from "@/components/reusable/reusable-modal";

export default function DoctorTokenPage() {
  const [tokenCount, setTokenCount] = useState(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tokenSettings, setTokenSettings] = useState({
    prefix: "DR-J",
    autoReset: true,
    lastReset: new Date().toLocaleDateString(),
  });

  const handleIncrement = () => setTokenCount(prev => prev + 1);
  const handleDecrement = () => setTokenCount(prev => (prev > 0 ? prev - 1 : 0));
  const handleReset = () => {
    if (confirm("Are you sure you want to reset the token count to 1?")) {
      setTokenCount(1);
    }
  };

  const settingsFields: FieldConfig[] = [
    {
      name: "prefix",
      label: "Token Prefix",
      type: "text",
      placeholder: "e.g., DR-A",
      width: "half",
      defaultValue: tokenSettings.prefix,
    },
    {
      name: "autoReset",
      label: "Auto-reset daily",
      type: "checkbox",
      width: "half",
      defaultValue: tokenSettings.autoReset,
    },
  ];

  const handleSaveSettings = (data: any) => {
    setTokenSettings(prev => ({
      ...prev,
      prefix: data.prefix,
      autoReset: data.autoReset,
    }));
    setIsSettingsOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visit Token Management</h1>
          <p className="text-slate-500">Manage the queue and issuance of patient visit tokens</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setIsSettingsOpen(true)}>
          <Settings2 className="h-4 w-4" />
          Queue Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Counter */}
        <Card className="md:col-span-2 shadow-lg border-2 border-blue-100 overflow-hidden">
          <CardHeader className="bg-blue-50/50 pb-8 text-center border-b">
            <CardTitle className="text-blue-600 flex items-center justify-center gap-2">
              <Ticket className="h-6 w-6" />
              Current Token Number
            </CardTitle>
            <CardDescription>Click + to issue the next token in the queue</CardDescription>
          </CardHeader>
          <CardContent className="pt-12 pb-12 flex flex-col items-center">
            <div className="relative">
              <div className="text-8xl md:text-9xl font-black text-slate-900 tracking-tighter flex items-center">
                <span className="text-3xl text-slate-300 font-medium mr-2">{tokenSettings.prefix}-</span>
                {tokenCount.toString().padStart(3, "0")}
              </div>
              <Badge className="absolute -top-4 -right-4 bg-green-500 hover:bg-green-600 px-3 py-1">
                ACTIVE
              </Badge>
            </div>

            <div className="flex items-center gap-6 mt-16">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-full border-2 border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                onClick={handleDecrement}
              >
                <Minus className="h-8 w-8" />
              </Button>
              
              <Button 
                className="h-24 w-24 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 hover:scale-105 transition-all"
                onClick={handleIncrement}
              >
                <Plus className="h-12 w-12" />
              </Button>

              <Button 
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-full border-2 border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                onClick={handleReset}
              >
                <RotateCcw className="h-7 w-7" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Queue Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Tokens Issued Today</span>
                <span className="font-bold">{tokenCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Average Wait Time</span>
                <span className="font-bold">12 mins</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Last Reset</span>
                <span className="font-bold">{tokenSettings.lastReset}</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label className="text-xs">Auto-reset daily</Label>
                    <p className="text-[10px] text-slate-400">Resets at 12:00 AM</p>
                  </div>
                  <Switch 
                    checked={tokenSettings.autoReset} 
                    onCheckedChange={(val) => setTokenSettings(prev => ({ ...prev, autoReset: val }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-none">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Hash className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">NEXT UP</p>
                  <p className="text-lg font-bold">{tokenSettings.prefix}-{(tokenCount + 1).toString().padStart(3, "0")}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Next patient should be ready at the clinic entrance.
              </p>
            </CardContent>
          </Card>
          
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-xs">
              <strong>Tip:</strong> You can set a custom prefix like "OPD-1" in settings to distinguish between different departments.
            </p>
          </div>
        </div>
      </div>

      <ReusableModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        title="Queue & Token Configuration"
        fields={settingsFields}
        saveButtonText="Update Settings"
        size="md"
      />
    </div>
  );
}
