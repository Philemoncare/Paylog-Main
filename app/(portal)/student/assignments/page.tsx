"use client";

import { studentService } from "@/services/studentService";
import {
  FileText, Clock, Send, Award, AlertCircle, Loader2, Lock, ShieldCheck, ArrowLeft
} from "lucide-react";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStableFetch } from "@/hooks/useStableFetch";
import { useState, useMemo } from "react";
import Link from "next/link";

export default function StudentAssignmentsPage() {
  const { data: assignmentsData, loading: loadAssignments } = useStableFetch(studentService.getAssignments);
  const { data: submissionsData, execute: refreshSubs } = useStableFetch(studentService.getSubmissions);

  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", repo_url: "", demo_url: "" });

  const isRestricted = (assignmentsData as any)?.restricted === true;
  const assignments = useMemo(() => Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData as any)?.assignments || [], [assignmentsData]);
  const submissions = useMemo(() => Array.isArray(submissionsData) ? submissionsData : [], [submissionsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmitting(true);
    const tid = notify.loading("Transmitting work nodes...");
    try {
      await studentService.submitWork({
        ...form,
        assignment_id: selectedAssignment.id,
        title: selectedAssignment.title,
        submission_type: 'assignment'
      });
      notify.success("Transmission Successful");
      setSelectedAssignment(null);
      refreshSubs(true);
    } catch (err) {
      notify.error("Node Transmission Error");
    } finally {
      setSubmitting(false);
      notify.dismiss(tid);
    }
  };

  const getSub = (id: number) => submissions.find(s => s.assignment_id === id);

  if (loadAssignments && assignments.length === 0) return <div className="max-w-6xl mx-auto p-10 space-y-8"><Skeleton className="h-20 w-full" /><Skeleton className="h-96 w-full" /></div>;

  if (isRestricted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-10 text-center bg-[#FBFBFE] animate-in fade-in">
        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100 shadow-xl">
           <Lock size={48} className="text-blue-600 animate-pulse" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-4">Assignments Locked</h2>
        <p className="text-slate-500 font-medium max-w-md mb-12 leading-relaxed">
           Your technical assignments node is currently restricted. Please complete your enrollment verification to unlock academic challenges.
        </p>
        <Link href="/student/dashboard" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Return to Hub</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-32 pt-8 px-4 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
           <Link href="/student/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors w-fit mb-4">
              <ArrowLeft size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
           </Link>
           <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">Challenges</h1>
           <p className="text-slate-500 font-medium text-xs mt-2">Cohort-specific technical assignments and implementation labs.</p>
        </div>
        <div className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest">{assignments.length} Tasks Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          {assignments.map((a) => {
            const sub = getSub(a.id);
            return (
              <div key={a.id} className={cn("bg-white border rounded-[2.5rem] p-8 md:p-10 transition-all group relative overflow-hidden", selectedAssignment?.id === a.id ? "border-blue-500 shadow-2xl shadow-blue-900/10 ring-8 ring-blue-50" : "border-slate-200 hover:border-slate-300 shadow-sm")}>
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">{a.module_title}</p>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{a.title}</h3>
                  </div>
                  {sub && (
                     <span className={cn(
                       "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                       sub.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                     )}>
                        {sub.status === 'approved' ? 'Verified' : 'Pending Review'}
                     </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 mb-10">{a.description}</p>
                <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-300" /> {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'Active Node'}</span>
                    <span className="flex items-center gap-1.5"><Award size={12} className="text-amber-500" /> {a.max_score} XP</span>
                  </div>
                  <button onClick={() => setSelectedAssignment(a)} className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95">{sub ? "Override Node" : "Transmit Hub"}</button>
                </div>
              </div>
            );
          })}
          {assignments.length === 0 && (
             <div className="py-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
                <ShieldCheck size={48} className="mx-auto text-slate-100 mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No academic challenges detected.</p>
             </div>
          )}
        </div>

        <aside className="lg:col-span-5">
           {selectedAssignment ? (
             <div className="bg-white border border-slate-200 rounded-[3rem] p-10 sticky top-24 space-y-10 animate-in slide-in-from-right-8 duration-500 shadow-2xl shadow-slate-200/50">
                <div className="flex justify-between items-start">
                   <h2 className="text-2xl font-black text-slate-900 leading-none uppercase tracking-tighter">{selectedAssignment.title}</h2>
                   <button onClick={() => setSelectedAssignment(null)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><AlertCircle size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">GitHub Repository URL</label>
                      <input required type="url" placeholder="https://github.com/..." className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all shadow-inner" value={form.repo_url} onChange={e => setForm({...form, repo_url: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Technical Implementation Notes</label>
                      <textarea rows={6} placeholder="Briefly explain your architecture..." className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-5 text-xs font-medium text-slate-600 outline-none focus:border-blue-500 resize-none transition-all shadow-inner" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                   </div>
                   <button disabled={submitting} className="w-full py-5 bg-blue-600 text-white rounded-[1.75rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                      {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Transmit Work Node
                   </button>
                </form>
             </div>
           ) : (
             <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-[3rem] p-24 text-center space-y-6 shadow-inner">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-slate-200"><FileText size={40} /></div>
                <div className="space-y-1">
                   <p className="text-slate-400 font-black uppercase tracking-[0.25em] text-[10px]">Select Assignment</p>
                   <p className="text-slate-300 text-[9px] font-bold uppercase">Academic Node Authorization Required</p>
                </div>
             </div>
           )}
        </aside>
      </div>
    </div>
  );
}
