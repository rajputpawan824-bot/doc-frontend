"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Ticket, 
  Clock, 
  User, 
  Activity,
  RefreshCcw,
  AlertCircle
} from "lucide-react";

export default function PatientTokenPage() {
  const token = {
    myNumber: "DR-J-015",
    currentServing: "DR-J-012",
    doctorsName: "Dr. John Smith",
    department: "Cardiology",
    expectedTime: "11:30 AM",
    waitingPatients: 2,
    avgWaitPerPatient: "12 mins"
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Token Status</h1>
          <p className="text-slate-500">Track your position in the queue in real-time.</p>
        </div>
        <Button variant="outline" className="gap-2 h-10 px-4 group">
          <RefreshCcw className="h-4 w-4 text-slate-400 group-hover:rotate-180 transition-all duration-500" /> Refresh
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <div className="bg-blue-600 p-8 text-white text-center space-y-2">
          <p className="text-xs text-blue-100 font-bold uppercase tracking-widest">My Token Number</p>
          <h2 className="text-6xl font-black">{token.myNumber}</h2>
          <div className="pt-4 flex justify-center gap-4">
            <Badge className="bg-white/10 text-white border-white/20 px-3 py-1">
              {token.doctorsName}
            </Badge>
          </div>
        </div>

        <CardContent className="p-8 space-y-10">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center p-6 bg-slate-50 rounded-3xl space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Now Serving</p>
              <p className="text-3xl font-black text-blue-600">{token.currentServing}</p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-3xl space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Expected At</p>
              <p className="text-3xl font-black text-slate-900">{token.expectedTime}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <User className="h-5 w-5 text-orange-500" />
                </div>
                <span className="text-sm font-medium text-slate-600">Patients ahead of you</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{token.waitingPatients}</span>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Activity className="h-5 w-5 text-green-500" />
                </div>
                <span className="text-sm font-medium text-slate-600">Avg. wait time per patient</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{token.avgWaitPerPatient}</span>
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              We recommend arriving at the clinic at least 15 minutes before your expected time. Times are estimates and may vary based on clinical needs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
