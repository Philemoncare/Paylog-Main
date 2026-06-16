"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Mail, Smartphone, Clock, CheckCircle2, XCircle, Search, RefreshCw,
  RotateCcw, User, AlertCircle, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { useStableFetch } from "@/hooks/useStableFetch";

interface MessageLog {
  id: number;
  student_name: string;
  recipient: string;
  message: string;
  type: string;
  status: string;
  provider_response: string;
  created_at: string;
}

export default function MessageLogsPage() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [retryingId, setRetryingId] = useState<number | null>(null);

  const fetchLogsFn = useCallback(async () => {
    const res = await fetch('/api/admin/message-logs');
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return Array.isArray(data) ? data : [];
  }, []);

  const { data, loading, error, execute: refresh } = useStableFetch(fetchLogsFn, {
    cacheKey: 'admin-message-logs'
  });

  const logs = useMemo(() => Array.isArray(data) ? data : [], [data]);

  const handleRetry = async (id: number) => {
    setRetryingId(id);
    try {
      const res = await fetch('/api/admin/message-logs/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Retry Command Success");
        refresh(true);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRetryingId(null);
    }
  };

  const filteredLogs = useMemo(() => logs.filter(log => {
    const matchesSearch =
      (log.recipient?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (log.message?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (log.student_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || log.status === filter;
    return matchesSearch && matchesFilter;
  }), [logs, searchTerm, filter]);

  if (error) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-10 text-center bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
      <AlertCircle size={40} className="text-rose-500 mb-4" />
      <h2 className="text-xl font-black text-slate-900 uppercase">Comms Sync Fault</h2>
      <p className="text-slate-500 text-sm mt-2 mb-8">Unable to synchronize outbound logs with the main server node.</p>
      <button onClick={() => refresh(true)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Retry Load</button>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">Comms Logs</h1>
           <p className="text-slate-500 font-medium text-xs mt-1">Audit outbound SMS and Email signals delivered to students.</p>
        </div>
        <button onClick={() => refresh(true)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
           <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by student or recipient node..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             {['all', 'sent', 'failed'].map((f) => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={cn(
                   "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                   filter === f
                     ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                     : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                 )}
               >
                 {f}
               </button>
             ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Student</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Recipient Node</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Signal Body</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Status</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Timestamp</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && logs.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-8 py-6"><Skeleton className="h-8 w-full rounded-lg" /></td></tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                     <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200"><Mail size={24} /></div>
                     <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest italic">No comms nodes logged.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100"><User size={14} /></div>
                         <div className="font-bold text-slate-900 text-xs uppercase tracking-tight truncate max-w-[120px]">{log.student_name || 'Anonymous'}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                          {log.type === 'sms' ? <Smartphone size={14} /> : <Mail size={14} />}
                        </div>
                        <div className="font-bold text-slate-900 text-xs tracking-tight">{log.recipient}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-[220px] font-medium leading-relaxed italic">"{log.message}"</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        log.status === 'sent' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100 shadow-sm"
                      )}>
                        {log.status === 'sent' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {log.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-tight">
                        <Clock size={12} className="text-slate-300" />
                        {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {log.status === 'failed' && (
                        <button onClick={() => handleRetry(log.id)} disabled={retryingId === log.id} className="p-2.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                          <RotateCcw className={cn("transition-transform", retryingId === log.id && "animate-spin")} size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
