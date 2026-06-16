"use client";

import { useState, useCallback, useMemo } from "react";
import { adminService } from "@/services/adminService";
import {
  ShieldCheck, Award, Star, TrendingUp, Search, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStableFetch } from "@/hooks/useStableFetch";

export default function ReviewsPage() {
  const fetchFn = useCallback(() => adminService.getSubmissions({ status: 'approved' }), []);
  const { data, loading, error, execute: refresh } = useStableFetch(fetchFn, {
    cacheKey: 'reviews-approved'
  });

  const [searchTerm, setSearchTerm] = useState("");

  const submissions = useMemo(() => Array.isArray(data) ? data : [], [data]);

  const filteredSubmissions = useMemo(() => submissions.filter(s =>
    (s.student_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  ), [submissions, searchTerm]);

  const rankings = useMemo(() => {
    const studentGrades = filteredSubmissions.reduce((acc: any, s) => {
      if (!s.registration_id) return acc;
      if (!acc[s.registration_id]) {
        acc[s.registration_id] = {
          name: s.student_name || 'Anonymous',
          email: s.student_email || 'N/A',
          totalScore: 0,
          count: 0
        };
      }
      acc[s.registration_id].totalScore += (s.score || 0);
      acc[s.registration_id].count += 1;
      return acc;
    }, {});

    return Object.values(studentGrades).map((g: any) => ({
      ...g,
      average: Math.round(g.totalScore / (g.count || 1))
    })).sort((a: any, b: any) => b.average - a.average);
  }, [filteredSubmissions]);

  if (loading && rankings.length === 0) return <div className="p-10 space-y-8"><Skeleton className="h-20 w-full" /><Skeleton className="h-96 w-full" /></div>;

  if (error) return (
    <div className="p-10 text-center bg-white border border-slate-200 rounded-[2rem] flex flex-col items-center justify-center min-h-[400px] shadow-sm">
      <AlertCircle size={40} className="text-rose-500 mb-4" />
      <h2 className="text-xl font-black text-slate-900 uppercase">Sync Fault</h2>
      <p className="text-slate-500 text-sm mt-2 mb-8">Could not synchronize review data with the engine.</p>
      <button onClick={() => refresh(true)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Retry Sync</button>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Performance</h1>
          <p className="text-slate-500 font-medium text-xs mt-1">Cohort gradebook and individual growth tracking.</p>
        </div>
        <button onClick={() => refresh(true)} disabled={loading} className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2">
           {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
           Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Graded" value={submissions.length} icon={<ShieldCheck className="text-emerald-600" />} />
        <StatCard title="Cohort Average" value={rankings.length ? Math.round(rankings.reduce((a: any, b: any) => a + b.average, 0) / rankings.length) : 0} icon={<TrendingUp className="text-blue-600" />} />
        <StatCard title="Elite Performers" value={rankings.filter((r: any) => r.average >= 90).length} icon={<Award className="text-amber-600" />} />
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
         <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Leaderboard</h3>
            <div className="relative w-64">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
               <input
                 type="text"
                 placeholder="Search student..."
                 className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                     <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                     <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Engineer</th>
                     <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Modules</th>
                     <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                     <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Standing</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {rankings.map((student: any, i) => (
                     <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6 font-black text-slate-300">#{i + 1}</td>
                        <td className="px-8 py-6">
                           <div className="font-bold text-slate-900 text-xs uppercase tracking-tight">{student.name}</div>
                           <div className="text-[10px] text-slate-400 font-medium">{student.email}</div>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{student.count}</span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                              <span className={cn(
                                 "text-lg font-black",
                                 student.average >= 80 ? "text-emerald-600" : student.average >= 50 ? "text-blue-600" : "text-rose-600"
                              )}>{student.average}%</span>
                              {student.average >= 90 && <Star size={14} className="text-amber-400 fill-amber-400" />}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                              student.average >= 50 ? "border-emerald-100 bg-emerald-50 text-emerald-600" : "border-rose-100 bg-rose-50 text-rose-600"
                           )}>
                              {student.average >= 50 ? "Authorized" : "Warning"}
                           </span>
                        </td>
                     </tr>
                  ))}
                  {rankings.length === 0 && (
                    <tr>
                       <td colSpan={5} className="px-8 py-24 text-center">
                          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No academic data detected.</p>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex items-center justify-between hover:border-blue-500 transition-all duration-300 group">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-slate-600">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
      </div>
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
        {icon}
      </div>
    </div>
  );
}

import { RefreshCw, Loader2 } from "lucide-react";
