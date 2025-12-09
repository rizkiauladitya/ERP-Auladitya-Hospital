import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: React.ReactNode;
  positive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendLabel, icon, positive = true }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-extrabold text-[#1D2939] tracking-tight">{value}</h3>
        </div>
        <div className="rounded-lg bg-[#F0FDFA] border border-teal-100 p-3 text-[#0D7A68]">
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <span className={`flex items-center text-sm font-bold ${positive ? 'text-emerald-700' : 'text-rose-600'}`}>
          {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trend}%
        </span>
        <span className="text-sm font-medium text-slate-500">{trendLabel}</span>
      </div>
    </div>
  );
};