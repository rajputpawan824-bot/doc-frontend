"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ReactNode;
  color: string;
  gradient: string;
  details?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  icon,
  gradient,
  details,
}: StatsCardProps) {
  const isPositive = change?.startsWith("+");

  return (
    <Card
      className="border-0 shadow-lg hover:shadow-xl transition-shadow hover:scale-[1.02] transition-transform group"
      style={{ background: gradient }}
    >
      <CardContent className="p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
            {icon}
          </div>
          {change && (
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                isPositive ? "bg-green-500/20" : "bg-red-500/20"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {change}
            </div>
          )}
        </div>
        <h3 className="text-3xl font-bold mb-2">{value}</h3>
        <p className="text-white/90 mb-1">{title}</p>
        {details && <p className="text-white/70 text-sm">{details}</p>}
      </CardContent>
    </Card>
  );
}
