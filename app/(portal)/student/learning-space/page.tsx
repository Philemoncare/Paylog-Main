"use client";

import { useEffect, useState } from "react";
import { studentService } from "@/services/studentService";
import {
  Play, CheckCircle2, ChevronRight, BookOpen,
  Zap, ArrowLeft, ChevronDown, Trophy, Info, FileText, Loader2, Lock, ShieldCheck
} from "lucide-react";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useStableFetch } from "@/hooks/useStableFetch";

export default function LearningSpacePage() {
  const { data, loading, error, execute: fetchData } = useStableFetch(studentService.getCurriculum);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [completing, setCompleting] = useState(false);

  // Sync internal selection with fetched data
  useEffect(() => {
    if (data?.curriculum?.length > 0 && !selectedModule) {
      const firstWithLessons = data.curriculum.find((m: any) => m.lessons?.length > 0) || data.curriculum[0];
      setSelectedModule(firstWithLessons);
      if (firstWithLessons.lessons?.length > 0) {
        setSelectedLesson(firstWithLessons.lessons[0]);
      }
    }
  }, [data, selectedModule]);

  const handleComplete = async (lesson: any) => {
    if (lesson.isCompleted || completing) return;
    setCompleting(true);
    try {
      await studentService.completeLesson(lesson.id);
      notify.success("Goal Achieved!", `+100 XP added to your engineering profile.`);
      fetchData(true); // Force refresh state
    } catch (err: any) {
      notify.error("Sync Error", err.message || "Could not save progress.");
    } finally {
      setCompleting(false);
    }
  };

  if (loading && !data) return <LearningSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-[#FBFBFE]">
        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-6 border border-rose-100 shadow-sm">
           <Zap size={40} className="text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Academic Sync Fault</h2>
        <p className="text-slate-500 font-medium max-w-sm mt-2 mb-10">We encountered an issue synchronizing with your curriculum modules.</p>
        <div className="flex gap-4">
           <button onClick={() => fetchData(true)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Retry Sync</button>
           <Link href="/student/dashboard" className="px-10 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Back to Node</Link>
        </div>
      </div>
    );
  }

  // Handle Locked State (Verification Pending)
  if (data?.isLocked) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-10 text-center bg-[#FBFBFE] animate-in fade-in">
        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100 shadow-xl">
           <Lock size={48} className="text-blue-600 animate-pulse" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-4">Curriculum Restricted</h2>
        <p className="text-slate-500 font-medium max-w-md mb-12 leading-relaxed">
           Your technical syllabus is currently under lock. Our mentors are verifying your enrollment credentials. You will receive a signal once the workspace is provisioned.
        </p>
        <Link href="/student/dashboard" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">Return to Dashboard</Link>
      </div>
    );
  }

  const curriculum = Array.isArray(data?.curriculum) ? data.curriculum : [];
  const xp = curriculum.reduce((acc: number, m: any) =>
    acc + (m.lessons?.filter((l: any) => l.isCompleted).length || 0) * 100, 0
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 lg:pb-12 animate-in fade-in duration-500">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/student/dashboard" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
          <div className="h-6 w-px bg-slate-200 hidden md:block" />
          <div className="hidden md:block">
            <h1 className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest flex items-center gap-2"><BookOpen size={14} className="text-blue-600" /> Workspace: CURRICULUM-ENGINE</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl shadow-lg">
            <Trophy size={14} className="text-amber-400" />
            <span className="text-[11px] font-black text-white uppercase tracking-widest">{xp} <span className="opacity-50">XP</span></span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 p-4 md:p-8">
        {/* SIDEBAR */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-2">Authorized Syllabus</h2>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {curriculum.length === 0 ? (
                <div className="py-20 text-center">
                   <ShieldCheck size={32} className="mx-auto text-slate-100 mb-4" />
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Core nodes empty.</p>
                </div>
              ) : curriculum.map((m) => (
                <div key={m.id} className="space-y-2">
                  <button
                    onClick={() => setSelectedModule(selectedModule?.id === m.id ? null : m)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl transition-all group border",
                      selectedModule?.id === m.id ? "bg-slate-50 border-slate-200 shadow-inner" : "bg-white border-transparent hover:border-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm", selectedModule?.id === m.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>{m.order_index}</div>
                      <span className="text-[12px] font-black text-[#0F172A] text-left uppercase tracking-tight leading-tight">{m.title}</span>
                    </div>
                    <ChevronDown size={14} className={cn("text-slate-300 transition-transform duration-300", selectedModule?.id === m.id && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {selectedModule?.id === m.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pl-6 space-y-1 py-1">
                          {m.lessons?.map((l: any) => (
                            <button
                              key={l.id}
                              onClick={() => { setSelectedLesson(l); if (window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className={cn(
                                "w-full flex items-center justify-between p-3.5 rounded-xl transition-all border",
                                selectedLesson?.id === l.id ? "bg-slate-900 text-white shadow-xl border-slate-900" : "hover:bg-slate-50 text-slate-500 border-transparent"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {l.isCompleted ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Play size={12} className={selectedLesson?.id === l.id ? "text-white" : "text-slate-300"} />}
                                <span className="text-[11px] font-bold uppercase tracking-tight truncate max-w-[180px]">{l.title}</span>
                              </div>
                              <span className="text-[9px] font-black opacity-30">{l.duration_minutes}M</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-[#0F172A] rounded-[2rem] space-y-4 shadow-2xl shadow-blue-900/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-[0.03] scale-150"><Zap size={100} /></div>
             <div className="flex items-center gap-3 text-white relative z-10">
               <Info size={16} className="text-blue-500" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Pedagogical Signal</h3>
             </div>
             <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic relative z-10">"Mastery is the byproduct of consistent technical repetition. Implement, then iterate."</p>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="lg:col-span-8">
           <AnimatePresence mode="wait">
             {selectedLesson ? (
               <motion.div key={selectedLesson.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                  <div className="aspect-video bg-slate-100 rounded-[2.5rem] border border-slate-200 overflow-hidden relative shadow-inner group">
                     {selectedLesson.video_url ? (
                       <iframe src={selectedLesson.video_url} className="w-full h-full" allowFullScreen />
                     ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm text-slate-200"><BookOpen size={32} /></div>
                          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Interactive Module</h4>
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2 max-w-xs leading-relaxed">This node is focused on technical documentation and practical code execution.</p>
                       </div>
                     )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-14 shadow-sm space-y-12">
                     <div className="flex flex-col md:flex-row justify-between items-start gap-8 pb-10 border-b border-slate-50">
                        <div className="space-y-3">
                           <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">Node {selectedModule?.order_index || 0}</span>
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Type: Technical Module</span>
                           </div>
                           <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight uppercase">{selectedLesson.title}</h2>
                        </div>
                        <button
                          onClick={() => handleComplete(selectedLesson)}
                          disabled={selectedLesson.isCompleted || completing}
                          className={cn(
                            "px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-2xl flex items-center gap-3",
                            selectedLesson.isCompleted ? "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-emerald-100/50" : "bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200"
                          )}
                        >
                           {completing ? <Loader2 size={16} className="animate-spin" /> : selectedLesson.isCompleted ? <><CheckCircle2 size={16} /> Synchronized</> : "Finalize Module"}
                        </button>
                     </div>

                     {selectedLesson.pdf_url && (
                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-50 flex items-center justify-between shadow-inner">
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-xl border border-slate-100"><FileText size={28} /></div>
                              <div>
                                 <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Technical documentation</p>
                                 <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Asset Ref: DOC-PACKAGE-V1</p>
                              </div>
                           </div>
                           <a href={selectedLesson.pdf_url} target="_blank" className="px-8 py-3.5 bg-white text-[#0F172A] border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">Download Node</a>
                        </div>
                     )}

                     <div className="prose prose-slate max-w-none">
                        <div className="text-slate-600 leading-relaxed font-medium space-y-8" dangerouslySetInnerHTML={{ __html: selectedLesson.content || "<p>Implementation instructions for this session are loading from the core...</p>" }} />
                     </div>
                  </div>
               </motion.div>
             ) : (
               <div className="min-h-[60vh] flex flex-col items-center justify-center border-2 border-slate-100 border-dashed rounded-[3rem] bg-white shadow-sm p-24 text-center space-y-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-100 shadow-inner"><BookOpen size={48} /></div>
                  <div className="space-y-2">
                     <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Initialize Workspace</h3>
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">Select technical module to synchronize your academic node.</p>
                  </div>
               </div>
             )}
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function LearningSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 animate-pulse"><Skeleton className="h-16 w-full rounded-2xl" /><div className="grid grid-cols-1 lg:grid-cols-12 gap-10"><div className="lg:col-span-4 space-y-6"><Skeleton className="h-[600px] w-full rounded-[2rem]" /></div><div className="lg:col-span-8 space-y-10"><Skeleton className="aspect-video w-full rounded-[2.5rem]" /><Skeleton className="h-96 w-full rounded-[2.5rem]" /></div></div></div>
  );
}
