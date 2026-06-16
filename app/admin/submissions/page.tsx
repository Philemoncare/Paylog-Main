"use client";

import { useState, useMemo, useCallback } from "react";
import { adminService } from "@/services/adminService";
import {
  FileText, CheckCircle, XCircle, Clock, Search,
  Filter, ExternalLink, MessageSquare, Award,
  ChevronRight, Loader2, Download, Github, Globe, AlertCircle, Check,
  ShieldCheck, RefreshCw, X
} from "lucide-react";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStableFetch } from "@/hooks/useStableFetch";

export default function SubmissionsPage() {
  const [filter, setFilter] = useState({ status: "all", type: "all" });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFn = useCallback(() => adminService.getSubmissions(filter), [filter]);
  const { data, loading, execute: fetchSubmissions } = useStableFetch(fetchFn, {
    cacheKey: `submissions-${filter.status}-${filter.type}`
  });

  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewForm, setReviewForm] = useState({ score: 0, feedback: "", status: "approved" });

  const submissions = useMemo(() => Array.isArray(data) ? data : [], [data]);

  const handleReviewSubmit = async () => {
    if (!selectedSubmission) return;
    const tid = notify.loading("Syncing evaluation...");
    try {
      await adminService.updateSubmission({
        id: selectedSubmission.id,
        ...reviewForm
      });
      notify.success("Evaluation Secured");
      setIsReviewing(false);
      setSelectedSubmission(null);
      fetchSubmissions(true);
    } catch (err) {
      notify.error("Evaluation Error");
    } finally {
      notify.dismiss(tid);
    }
  };

  const filteredSubmissions = useMemo(() => submissions.filter(s =>
    (s.student_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  ), [submissions, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">Academic Work</h1>
          <p className="text-slate-500 font-medium text-xs mt-1">Review student deployments and grade technical performance.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => fetchSubmissions(true)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
             <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
            <Filter size={14} className="text-slate-400" />
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="text-[11px] font-bold text-slate-600 outline-none bg-transparent cursor-pointer uppercase tracking-widest"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Qualified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Filter by name or identifier..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => <div key={i} className="p-8"><Skeleton className="h-12 w-full" /></div>)
              ) : filteredSubmissions.length === 0 ? (
                <div className="p-24 text-center">
                   <FileText size={48} className="mx-auto text-slate-100 mb-6" />
                   <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No active work signals detected.</p>
                </div>
              ) : (
                filteredSubmissions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSubmission(s);
                      setReviewForm({ score: s.score || 0, feedback: s.feedback || "", status: s.status || "approved" });
                      setIsReviewing(false);
                    }}
                    className={cn(
                      "w-full text-left p-6 transition-all group flex items-center justify-between",
                      selectedSubmission?.id === s.id ? "bg-slate-50 shadow-inner" : "hover:bg-slate-50/50"
                    )}
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border",
                        s.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        s.status === 'rejected' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-blue-50 text-blue-600 border-blue-100"
                      )}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-[11px] tracking-tight">{s.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.student_name}</span>
                          <div className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : 'Active'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {s.score !== null && s.score !== undefined && (
                        <div className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black shadow-lg">
                          {s.score}%
                        </div>
                      )}
                      <ChevronRight size={18} className={cn("text-slate-300 transition-transform", selectedSubmission?.id === s.id && "translate-x-1")} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          {selectedSubmission ? (
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 sticky top-24 space-y-10 animate-in fade-in slide-in-from-right-8 duration-500 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
              <div className="flex justify-between items-start">
                <span className={cn(
                  "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border shadow-sm",
                  selectedSubmission.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  selectedSubmission.status === 'rejected' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-blue-50 text-blue-600 border-blue-100"
                )}>
                  {selectedSubmission.status}
                </span>
                <button onClick={() => setSelectedSubmission(null)} className="p-2 text-slate-300 hover:text-rose-600 transition-all hover:bg-rose-50 rounded-xl"><X size={18} /></button>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">{selectedSubmission.title}</h3>
                <p className="text-slate-500 font-medium text-xs mt-3 leading-relaxed">{selectedSubmission.description || "Mission objective details pending."}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><div className="w-4 h-px bg-slate-200" /> Academic Assets</h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {selectedSubmission.repo_url && (
                    <AssetLink href={selectedSubmission.repo_url} icon={<Github size={18} />} label="Technical Repo" />
                  )}
                  {selectedSubmission.demo_url && (
                    <AssetLink href={selectedSubmission.demo_url} icon={<Globe size={18} />} label="Live Deployment" />
                  )}
                  {selectedSubmission.file_url && (
                    <AssetLink href={selectedSubmission.file_url} icon={<Download size={18} />} label="Documentation" />
                  )}
                </div>
              </div>

              {isReviewing ? (
                <div className="space-y-8 pt-8 border-t border-slate-50 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Academic Score (0-100)</label>
                    <input
                      type="number"
                      value={reviewForm.score}
                      onChange={(e) => setReviewForm({ ...reviewForm, score: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Mentor Signals (Feedback)</label>
                    <textarea
                      rows={5}
                      value={reviewForm.feedback}
                      onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                      placeholder="Input pedagogical feedback..."
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-5 text-xs font-medium outline-none focus:border-blue-500 resize-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setReviewForm({ ...reviewForm, status: 'approved' })}
                      className={cn(
                        "flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm",
                        reviewForm.status === 'approved' ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                      )}
                    >
                      Authorize
                    </button>
                    <button
                      onClick={() => setReviewForm({ ...reviewForm, status: 'rejected' })}
                      className={cn(
                        "flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm",
                        reviewForm.status === 'rejected' ? "bg-rose-600 text-white border-rose-600 shadow-xl" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                      )}
                    >
                      Reject
                    </button>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setIsReviewing(false)} className="flex-1 py-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Abort</button>
                    <button onClick={handleReviewSubmit} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all">Commit Evalu</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pt-6 border-t border-slate-50">
                  {selectedSubmission.feedback && (
                    <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-50 shadow-inner">
                      <p className="text-[10px] font-black uppercase text-blue-600 mb-3 tracking-widest">Pedagogical Notes</p>
                      <p className="text-[13px] text-slate-600 leading-relaxed font-medium italic">"{selectedSubmission.feedback}"</p>
                    </div>
                  )}
                  <button
                    onClick={() => setIsReviewing(true)}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <MessageSquare size={18} />
                    {selectedSubmission.status === 'pending' ? "Finalize Evaluation" : "Override Evaluation"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border-2 border-slate-100 border-dashed rounded-[3rem] p-24 text-center space-y-6 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-100 shadow-inner">
                <ShieldCheck size={40} />
              </div>
              <div className="space-y-1">
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Pending Analysis</p>
                 <p className="text-slate-300 text-[9px] font-bold uppercase">Select work node to initiate audit.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AssetLink({ href, icon, label }: any) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-lg transition-all group no-underline shadow-inner">
      <div className="flex items-center gap-4 text-slate-600">
        <span className="text-slate-400 group-hover:text-blue-600 transition-all duration-500">{icon}</span>
        <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <ExternalLink size={14} className="text-slate-300 group-hover:text-slate-900 group-hover:rotate-45 transition-all duration-500" />
    </a>
  );
}
