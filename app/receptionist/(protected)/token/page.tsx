"use client";

import { useState } from "react";
import { 
  Ticket, 
  Plus, 
  Minus, 
  RotateCcw, 
  Settings2,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReusableModal, { FieldConfig } from "@/components/reusable/reusable-modal";

export default function ReceptionistTokenPage() {
  const [tokenCount, setTokenCount] = useState(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [prefix, setPrefix] = useState("GEN");

  const settingsFields: FieldConfig[] = [
    { name: "prefix", label: "Token Prefix", type: "text", defaultValue: prefix },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Visit Token Management</h1>
        <Button variant="outline" onClick={() => setIsSettingsOpen(true)} className="gap-2">
          <Settings2 className="h-4 w-4" /> Settings
        </Button>
      </div>

      <Card className="shadow-lg border-2 border-blue-100">
        <CardHeader className="bg-blue-50/30 text-center pb-8">
          <CardTitle className="text-blue-600 flex items-center justify-center gap-2">
            <Ticket className="h-6 w-6" /> Current Token
          </CardTitle>
          <CardDescription>Issue the next visit token</CardDescription>
        </CardHeader>
        <CardContent className="py-12 flex flex-col items-center">
          <div className="text-9xl font-black text-slate-900 tracking-tighter">
            <span className="text-4xl text-slate-300 font-medium mr-2">{prefix}-</span>
            {tokenCount.toString().padStart(3, "0")}
          </div>

          <div className="flex gap-6 mt-16">
            <Button variant="outline" size="icon" className="h-16 w-16 rounded-full" onClick={() => setTokenCount(prev => Math.max(0, prev - 1))}>
              <Minus className="h-8 w-8 text-slate-400" />
            </Button>
            <Button className="h-24 w-24 rounded-full bg-blue-600 shadow-xl" onClick={() => setTokenCount(prev => prev + 1)}>
              <Plus className="h-12 w-12" />
            </Button>
            <Button variant="outline" size="icon" className="h-16 w-16 rounded-full" onClick={() => setTokenCount(1)}>
              <RotateCcw className="h-7 w-7 text-slate-400" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <ReusableModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(data) => { setPrefix(data.prefix); setIsSettingsOpen(false); }}
        title="Token Settings"
        fields={settingsFields}
      />
    </div>
  );
}
