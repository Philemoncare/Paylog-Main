"use client";

import { useMemo, useCallback } from "react";
import { adminService } from "@/services/adminService";
import {
  TrendingUp, BarChart3, PieChart, Users,
  BookOpen, FileText,
  DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStableFetch } from "@/hooks/useStableFetch";

export default function AnalyticsPage() {
  const { data, loading, error, execute: refresh } = useStableFetch(adminService.getAnalytics, {
    cacheKey: 'analytics-main'
  });

  const stats = useMemo(() => ({
    revenue: data?.revenue || 0,
    registrations: Array.isArray(data?.registrations) ? data.registrations : [],
    submissions: Array.isArray(data?.submissions) ? data.submissions : [],
    total_progress: data?.total_progress || 0
  }), [data]);

  const approvedCount = useMemo(() =>
    stats.registrations.find((r: any) => r.status === 'approved')?.count || 0
  , [stats.registrations]);

  if (loading && !data) return <div className="p-10 space-y-8"><Skeleton className="h-20 w-full" /><Skeleton className="h-96 w-full" /></div>;

  if (error) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-10 text-center bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
      <TrendingUp size={48} className="text-rose-500 mb-4" />
      <h2 className="text-xl font-black text-slate-900 uppercase">Engine Fault</h2>
      <p className="text-slate-500 text-sm mt-2 mb-8">Unable to synchronize with the analytics node.</p>
      <button onClick={() => refresh(true)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Retry Connection</button>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">Growth Data</h1>
          <p className="text-slate-500 font-medium text-xs mt-1">Real-time heuristics for platform health and academic volume.</p>
        </div>
        <button onClick={() => refresh(true)} disabled={loading} className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2">
           {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
           Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue" value={`GHS ${stats.revenue}`} trend="+0%" icon={<DollarSign size={20} className="text-emerald-600" />} />
        <MetricCard title="Authorized" value={approvedCount} trend="Live" icon={<Users size={20} className="text-blue-600" />} />
        <MetricCard title="Work Volume" value={stats.submissions.reduce((acc: number, s: any) => acc + (parseInt(s.count) || 0), 0)} trend="Stable" icon={<FileText size={20} className="text-amber-600" />} />
        <MetricCard title="Mastery Score" value={stats.total_progress} trend="+0" icon={<BookOpen size={20} className="text-indigo-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-8">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><BarChart3 size={14} /> Intake Distribution</h3>
           <div className="space-y-6">
              {stats.registrations.map((reg: any) => (
                 <div key={reg.status} className="space-y-2">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{reg.status}</span>
                       <span className="text-sm font-bold text-slate-900">{reg.count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                       <div className={cn("h-full transition-all duration-1000", reg.status === 'approved' ? "bg-blue-600" : "bg-slate-200")} style={{ width: `${Math.min(100, (parseInt(reg.count) / (stats.registrations.length || 1) * 10))}%` }} />
                    </div>
                 </div>
              ))}
           </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-8">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><PieChart size={14} /> QC Pass Rate</h3>
           <div className="grid grid-cols-2 gap-4">
              {stats.submissions.map((sub: any) => (
                 <div key={sub.status} className="p-6 bg-slate-50 rounded-3xl border border-slate-50 flex flex-col items-center justify-center text-center gap-1 hover:bg-white hover:border-slate-100 transition-all">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{sub.status}</span>
                    <span className="text-3xl font-black text-slate-900">{sub.count}</span>
                 </div>
              ))}
              {stats.submissions.length === 0 && <div className="col-span-2 py-10 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">No evaluation logs</div>}
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-6 hover:shadow-xl transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">{icon}</div>
        <div className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest">{trend}</div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h3>
      </div>
    </div>
  );
}
