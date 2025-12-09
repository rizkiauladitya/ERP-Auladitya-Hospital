import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Users, DollarSign, Clock } from 'lucide-react';
import { StatCard } from './StatCard';
import { CHART_DATA } from '../constants';
import { formatRupiah } from '../utils/formatters';
import { ViewState } from '../App';

interface DashboardProps {
  totalRevenue: number;
  onAction: (action: string, details?: any) => void;
  onNavigate?: (view: ViewState) => void;
  onShowToast?: (message: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ totalRevenue, onAction, onNavigate, onShowToast }) => {
  const [chartTimeRange, setChartTimeRange] = useState('7 Hari Terakhir');

  // Mock data switch based on filter
  const displayData = chartTimeRange === '7 Hari Terakhir' 
    ? CHART_DATA 
    : CHART_DATA.map(d => ({ ...d, revenue: d.revenue * 0.8, patients: d.patients * 0.9 })); // Simulating different data for "30 Hari"

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div 
          onClick={() => {
             onAction('Click Stat Card', { type: 'Revenue' });
             if (onNavigate) onNavigate(ViewState.BILLING);
          }} 
          className="cursor-pointer active:scale-[0.98] transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#0D7A68] rounded-xl"
          tabIndex={0}
        >
          <StatCard 
            title="Total Pendapatan" 
            value={formatRupiah(totalRevenue)} 
            trend={12.5} 
            trendLabel="vs bulan lalu" 
            icon={<DollarSign size={24} />}
          />
        </div>
        <div 
          onClick={() => {
            onAction('Click Stat Card', { type: 'Active Patients' });
            if (onNavigate) onNavigate(ViewState.PATIENTS);
          }} 
          className="cursor-pointer active:scale-[0.98] transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#0D7A68] rounded-xl"
          tabIndex={0}
        >
          <StatCard 
            title="Pasien Aktif" 
            value="452" 
            trend={8.2} 
            trendLabel="Okupansi Bed 85%" 
            icon={<Users size={24} />} 
          />
        </div>
        <div 
          onClick={() => {
            onAction('Click Stat Card', { type: 'Pending Claims' });
            if (onNavigate) onNavigate(ViewState.BILLING);
          }} 
          className="cursor-pointer active:scale-[0.98] transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#0D7A68] rounded-xl"
          tabIndex={0}
        >
          <StatCard 
            title="Klaim Tertunda" 
            value={formatRupiah(486000000)} 
            trend={2.4} 
            trendLabel="Waktu proses -5%" 
            icon={<Clock size={24} />} 
            positive={false}
          />
        </div>
        <div 
          onClick={() => {
            onAction('Click Stat Card', { type: 'Waiting Time' });
            if (onShowToast) onShowToast("Detail Waktu Tunggu: Rata-rata 14 menit di Poli Umum.");
          }} 
          className="cursor-pointer active:scale-[0.98] transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#0D7A68] rounded-xl"
          tabIndex={0}
        >
          <StatCard 
            title="Rata-rata Waktu Tunggu" 
            value="14m" 
            trend={15} 
            trendLabel="Peningkatan signifikan" 
            icon={<Activity size={24} />} 
          />
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div 
          className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2 cursor-pointer hover:shadow-md transition-shadow group focus-within:ring-2 focus-within:ring-[#0D7A68]"
          onClick={() => onAction('Click Chart Container', { chart: 'Revenue' })}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1D2939] group-hover:text-[#0D7A68] transition-colors">Performa Rumah Sakit</h3>
              <p className="text-sm text-slate-500">Korelasi Kunjungan Pasien vs Pendapatan</p>
            </div>
            <select 
              value={chartTimeRange}
              className="rounded-lg border border-slate-200 bg-[#F2F4F7] px-3 py-1 text-sm text-[#1D2939] outline-none cursor-pointer hover:border-[#0D7A68] transition-colors focus:border-[#0D7A68]"
              onClick={(e) => e.stopPropagation()} // Prevent card click
              onChange={(e) => {
                setChartTimeRange(e.target.value);
                onAction('Filter Chart', { range: e.target.value });
              }}
            >
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>
          
          <div className="h-80 w-full" onClick={(e) => { e.stopPropagation(); onAction('Click Chart Area'); }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D7A68" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0D7A68" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#475569', fontWeight: 600 }}
                  formatter={(value: any, name: any) => {
                     if (name === 'Revenue ($)' || name === 'revenue') return [formatRupiah(value), 'Pendapatan'];
                     if (name === 'Patients' || name === 'patients') return [value, 'Pasien'];
                     return [value, name];
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0D7A68" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Pendapatan" />
                <Area type="monotone" dataKey="patients" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorPatients)" name="Pasien" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Triage / Status */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="mb-4 text-lg font-bold text-[#1D2939]">Status Departemen</h3>
            <div className="space-y-4">
              {[
                { label: 'IGD (Darurat)', val: 88, status: 'Kritis', color: 'bg-rose-600', badgeColor: 'bg-rose-100 text-rose-800' },
                { label: 'Kardiologi', val: 45, status: 'Normal', color: 'bg-emerald-600', badgeColor: 'bg-emerald-100 text-emerald-800' },
                { label: 'Poli Anak', val: 62, status: 'Sibuk', color: 'bg-amber-500', badgeColor: 'bg-amber-100 text-amber-800' },
                { label: 'Radiologi', val: 30, status: 'Renggang', color: 'bg-[#0D7A68]', badgeColor: 'bg-teal-100 text-teal-800' },
              ].map((dept, i) => (
                <div 
                  key={i} 
                  className="group cursor-pointer rounded-lg border border-slate-100 p-3 hover:bg-[#F2F4F7] transition-colors active:bg-slate-200"
                  onClick={() => {
                    onAction('Click Department Status', { dept: dept.label });
                    if (onShowToast) onShowToast(`Membuka detail operasional untuk ${dept.label}`);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#1D2939] group-hover:text-[#0D7A68] transition-colors">{dept.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${dept.badgeColor} border border-transparent`}>
                      {dept.status}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div 
                      className={`h-2 rounded-full ${dept.color}`} 
                      style={{ width: `${dept.val}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className="mt-6 w-full rounded-lg border border-slate-300 py-3 text-sm font-bold text-slate-700 hover:border-[#0D7A68] hover:text-[#0D7A68] hover:bg-slate-50 transition-colors cursor-pointer active:scale-[0.98] focus:ring-2 focus:ring-[#0D7A68]"
            onClick={() => {
              onAction('View All Departments');
              if (onShowToast) onShowToast("Membuka daftar lengkap departemen...");
            }}
          >
            Lihat Semua Departemen
          </button>
        </div>
      </div>
    </div>
  );
};