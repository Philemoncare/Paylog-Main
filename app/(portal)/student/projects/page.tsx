"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { studentService } from "@/services/studentService";
import {
  FolderKanban, Send, Github, Globe,
  CheckCircle2, Award, AlertCircle, Loader2, Plus, ArrowLeft, Lock, ShieldCheck
} from "lucide-react";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStableFetch } from "@/hooks/useStableFetch";
import Link from "next/link";

export default function StudentProjectsPage() {
  const { data: submissionsData, loading, execute: fetchData } = useStableFetch(studentService.getSubmissions, {
    cacheKey: 'student-projects'
  });

  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", repo_url: "", demo_url: "" });

  const submissions = useMemo(() =>
    Array.isArray(submissionsData) ? submissionsData.filter((s: any) => s.submission_type === 'project') : []
  , [submissionsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const tid = notify.loading("Transmitting project artifacts...");
    try {
      await studentService.submitWork({
        ...form,
        submission_type: 'project'
      });
      notify.success("Project Secured");
      setIsAdding(false);
      setForm({ title: "", description: "", repo_url: "", demo_url: "" });
      fetchData(true);
    } catch (err) {
      notify.error("Fault");
    } finally {
      setSubmitting(false);
      notify.dismiss(tid);
    }
  };

  if (loading && submissions.length === 0) return <div className="max-w-6xl mx-auto p-10 space-y-8"><Skeleton className="h-20 w-full" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="max-w-6xl mx-auto pb-32 pt-8 px-4 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
           <Link href="/student/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors w-fit mb-4">
              <ArrowLeft size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
           </Link>
           <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">Implementations</h1>
           <p className="text-slate-500 font-medium text-xs mt-2">Deploy and manage technical capstone projects.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-2xl shadow-slate-200 active:scale-95"
          >
             <Plus size={16} /> Deploy Node
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
           {isAdding && (
             <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-slate-200/50 space-y-10 animate-in zoom-in-95 duration-500 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Initialize Project Node</h2>
                   <button type="button" onClick={() => setIsAdding(false)} className="p-2 text-slate-300 hover:text-rose-600 transition-all"><AlertCircle size={24} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Project Identifier</label>
                      <input required placeholder="e.g. INFRA-BRIDGE-V1" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-blue-500 shadow-inner transition-all" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">GitHub Repository</label>
                      <input required type="url" placeholder="https://github.com/..." className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-blue-500 shadow-inner transition-all" value={form.repo_url} onChange={(e) => setForm({...form, repo_url: e.target.value})} />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Live Node Deployment (URL)</label>
                   <input type="url" placeholder="https://..." className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-blue-500 shadow-inner transition-all" value={form.demo_url} onChange={(e) => setForm({...form, demo_url: e.target.value})} />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Technical brief</label>
                   <textarea rows={5} placeholder="Node architecture details..." className="w-full bg-slate-50 border-2 border-slate-50 rounded-[2rem] px-6 py-5 text-xs font-medium outline-none focus:border-blue-500 resize-none shadow-inner transition-all" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                </div>

                <div className="flex gap-6 pt-6">
                   <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Abort</button>
                   <button disabled={submitting} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-[0.98]">
                      {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Transmit Protocol
                   </button>
                </div>
             </form>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {submissions.map((s) => (
                <div key={s.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-10 hover:border-blue-500 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 group flex flex-col justify-between shadow-sm relative overflow-hidden">
                   <div className="space-y-6">
                      <div className="flex justify-between items-start">
                         <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                            <FolderKanban size={28} />
                         </div>
                         <span className={cn(
                           "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                           s.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                           s.status === 'rejected' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-blue-50 text-blue-600 border-blue-100"
                         )}>
                            {s.status === 'approved' ? 'Qualified' : s.status}
                         </span>
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">{s.title}</h3>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Deployed on {new Date(s.submitted_at).toLocaleDateString()}</p>
                      </div>
                   </div>

                   <div className="mt-10 space-y-6 pt-8 border-t border-slate-50">
                      <div className="flex gap-4">
                         {s.repo_url && <a href={s.repo_url} target="_blank" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"><Github size={18} /></a>}
                         {s.demo_url && <a href={s.demo_url} target="_blank" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"><Globe size={18} /></a>}
                      </div>
                      {s.score !== null && (
                        <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl shadow-xl">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Grade</span>
                           <span className="text-xl font-black tabular-nums">{s.score}%</span>
                        </div>
                      )}
                   </div>
                </div>
              ))}
              {submissions.length === 0 && !isAdding && (
                <div className="col-span-full py-32 bg-white border-2 border-dashed border-slate-100 rounded-[3rem] text-center space-y-6 shadow-sm">
                   <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-100 shadow-inner">
                      <Plus size={40} />
                   </div>
                   <div className="space-y-1">
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[11px]">Deployments Empty</p>
                      <p className="text-slate-300 text-[10px] font-bold uppercase">Initialize your first implementation node.</p>
                   </div>
                </div>
              )}
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-150 group-hover:scale-[1.7] transition-transform duration-1000"><Award size={120} /></div>
              <div className="flex items-center gap-4 mb-10 relative z-10">
                 <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Award size={24} className="text-white" />
                 </div>
                 <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-400">Academic Standing</h3>
              </div>
              <div className="space-y-8 relative z-10">
                 <div>
                    <p className="text-4xl font-black tracking-tighter">ELITE <span className="text-blue-500">ENGINEER</span></p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Node Efficiency: HIGH</p>
                 </div>
                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-[85%] transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
                 </div>
                 <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic">
                    "Authentic engineering is evidenced by your code. Build for longevity, not just completion."
                 </p>
              </div>
           </div>

           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><ShieldCheck size={14} /> Audit Node Rules</h3>
              <div className="space-y-5">
                 <RuleItem text="Authorized GitHub source node" />
                 <RuleItem text="Live deployment link verified" />
                 <RuleItem text="SaaS-grade documentation" />
                 <RuleItem text="Single atomic submission" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function RuleItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600">
       <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
       {text}
    </div>
  );
}

import { Clock } from "lucide-react";
