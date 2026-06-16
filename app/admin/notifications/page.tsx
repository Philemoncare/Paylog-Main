"use client";

import { NotificationCenter } from "@/components/admin/notifications/NotificationCenter";
import { Bell, ShieldAlert, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 rounded-[1.75rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200">
              <Bell size={24} />
            </div>
            <div>
               <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">System Signals</h1>
               <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.25em] mt-3">Node Monitoring: GS-01-ACTIVE</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-2.5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm">
           <div className="px-5 py-2 flex items-center gap-3 border-r border-slate-50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mainnet Sync</span>
           </div>
           <div className="px-5 py-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Health: Stable</span>
           </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         <SignalCard icon={<ShieldAlert size={20} />} label="Security" value="Intact" accent="rose" />
         <SignalCard icon={<CheckCircle2 size={20} />} label="Financial" value="Verified" accent="emerald" />
         <SignalCard icon={<Info size={20} />} label="Academic" value="Active" accent="blue" />
         <SignalCard icon={<AlertTriangle size={20} />} label="Database" value="Pooled" accent="amber" />
      </div>

      <div className="bg-white border border-slate-200 rounded-[3rem] p-4 md:p-1 shadow-sm">
         <NotificationCenter />
      </div>
    </div>
  );
}

function SignalCard({ icon, label, value, accent }: any) {
   const styles: any = {
      rose: "bg-rose-50 text-rose-600 border-rose-100",
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
      blue: "bg-blue-50 text-blue-600 border-blue-100",
      amber: "bg-amber-50 text-amber-600 border-amber-100"
   };

   return (
      <div className="bg-white p-7 rounded-[2.25rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
         <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all shadow-sm border", styles[accent])}>
            {icon}
         </div>
         <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-500">{label}</p>
            <p className="text-xl font-black text-slate-900 uppercase tracking-tight">{value}</p>
         </div>
      </div>
   );
}

import { cn } from "@/lib/utils";
