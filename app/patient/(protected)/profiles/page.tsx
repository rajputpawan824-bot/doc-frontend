"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  ArrowRight, 
  Plus,
  Phone,
  Calendar
} from "lucide-react";

export default function FamilyProfilesPage() {
  const familyMembers = [
    {
      id: "P-10294",
      name: "John Doe",
      relation: "Self (Primary)",
      age: 35,
      gender: "Male",
      image: ""
    },
    {
      id: "P-10295",
      name: "Jane Doe",
      relation: "Wife",
      age: 32,
      gender: "Female",
      image: ""
    },
    {
      id: "P-10296",
      name: "Junior Doe",
      relation: "Son",
      age: 8,
      gender: "Male",
      image: ""
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Family Profiles</h1>
          <p className="text-slate-500">Manage all profiles associated with <span className="font-bold text-slate-700">+1 (555) 000-0000</span></p>
        </div>
        <Button className="w-full sm:w-auto bg-blue-600 gap-2 h-10">
          <Plus className="h-4 w-4" /> Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {familyMembers.map((member) => (
          <Card key={member.id} className="hover:border-blue-200 transition-all shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
                <Avatar className="h-16 w-16 lg:h-20 lg:w-20 border-2 border-slate-100">
                  <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                    <Badge variant="secondary" className="w-fit mx-auto sm:mx-0 bg-slate-100 text-slate-600 border-none">
                      {member.relation}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-3">
                    <span>{member.age} years</span>
                    <span className="h-1 w-1 bg-slate-300 rounded-full" />
                    <span>{member.gender}</span>
                    <span className="h-1 w-1 bg-slate-300 rounded-full" />
                    <span className="font-mono text-xs">ID: {member.id}</span>
                  </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" className="flex-1 sm:w-auto gap-2">
                    View History
                  </Button>
                  <Button className="flex-1 sm:w-auto gap-2 bg-blue-600">
                    Switch Profile <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3 text-yellow-800 text-sm">
        <User className="h-5 w-5 flex-shrink-0" />
        <p>
          <strong>Note:</strong> All medical reports and appointment history are specific to each profile. You can switch profiles to book appointments or view reports for family members.
        </p>
      </div>
    </div>
  );
}
