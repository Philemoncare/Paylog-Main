"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { studentService } from "@/services/studentService";
import {
  Calendar, Bell, ShieldCheck,
  BookOpen, FolderKanban, User,
  Camera, ArrowRight, Loader2, AlertCircle, Clock, CheckCircle2
} from "lucide-react";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { TRAINING_START_DATE } from "@/lib/constants";
import { motion } from "framer-motion";
import { useStableFetch } from "@/hooks/useStableFetch";
import Link from "next/link";

export default function StudentDashboardPage() {
  const router = useRouter();
  const { data, loading, error, execute: fetchData } = useStableFetch(studentService.getDashboardData, {
    cacheKey: 'student-dashboard'
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (error && (error.status === 403 || error.message?.includes('UNAUTHORIZED'))) {
      router.push('/login');
    }
  }, [error, router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return notify.error("Maximum size: 2MB");

    setUploadingPhoto(true);
    try {
      const res = await studentService.updateProfilePhoto(file);
      if (res.success) {
        notify.success("Identity updated");
        fetchData(true);
      }
    } catch (err) {
      notify.error("Update failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const countdown = useMemo(() => {
    const diff = TRAINING_START_DATE.getTime() - currentTime.getTime();
    if (diff <= 0) return null;
    return {
      d: Math.floor(diff / (1000 * 60 * 60 * 24)),
      h: Math.floor((diff / (1000 * 60 * 60)) % 24),
      m: Math.floor((diff / 1000 / 60) % 60),
      s: Math.floor((diff / 1000) % 60)
    };
  }, [currentTime]);

  if (loading && !data) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-10 text-center bg-white border border-slate-200 rounded-[3rem] shadow-sm max-w-4xl mx-auto my-10 animate-in fade-in">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
          <AlertCircle size={32} className="text-rose-500" />
        </div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Sync Failure</h2>
        <p className="text-slate-500 text-sm mt-2 mb-10 max-w-xs mx-auto leading-relaxed">
           The academic node is currently synchronizing. Please attempt to reconnect your workspace.
        </p>
        <div className="flex gap-4">
           <button onClick={() => fetchData(true)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">Retry Load</button>
           <button onClick={() => router.push('/login')} className="px-10 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Sign Out</button>
        </div>
      </div>
    );
  }

  const student = data?.student || {};
  const progress = data?.progress || { percentage: 0, completedModules: 0, totalModules: 0, currentModule: 'Curriculum' };
  const notifications = Array.isArray(data?.notifications) ? data.notifications : [];
  const isApproved = data?.isApproved === true;

  if (!isApproved) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 md:p-20 text-center bg-[#FBFBFE] animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-8 border border-slate-200 shadow-xl">
           <ShieldCheck size={48} className="text-blue-500 animate-pulse" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-4">Verification Node Active</h2>
        <p className="text-slate-500 font-medium max-w-md mb-12 leading-relaxed">
           Your enrollment is currently being audited. The technical curriculum will be provisioned once your transaction is verified.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
           <button onClick={() => fetchData(true)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95">Refresh Node</button>
           <Link href="/student/profile" className="px-10 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">View Identity</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#FBFBFE] pb-32 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-slate-100">
           <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="relative group">
                 <div className="h-24 w-24 overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-xl group-hover:border-blue-500 transition-all duration-500">
                    {student.profile_photo_url ? <img src={student.profile_photo_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-slate-50 text-2xl font-black text-slate-200">{student.fullName?.[0] || 'E'}</div>}
                    {uploadingPhoto && <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-blue-600" size={20} /></div>}
                 </div>
                 <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 shadow-xl hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"><Camera size={16} /></button>
                 <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
              </div>
              <div className="space-y-1">
                 <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase">Engineer {student.fullName?.split(' ')[0] || 'Member'}</h1>
                 <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-blue-500" /> ID: #CS-{student.id?.toString().padStart(4, '0') || '----'}</span>
                    <span className="flex items-center gap-2 text-emerald-600"><CheckCircle2 size={14} /> Mainnet Authorized</span>
                 </div>
              </div>
           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-8 space-y-10">
              <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
                 <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="flex-1 space-y-6">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Active Path</p>
                          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{progress.currentModule}</h2>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">Synchronization at {progress.percentage}%. Maintain consistent frequency to earn certification.</p>
                       </div>
                       <Link href="/student/learning-space" className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95">Enter Workspace <ArrowRight size={16} /></Link>
                    </div>
                    <div className="relative h-32 w-32 shrink-0">
                       <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="44" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                          <motion.circle cx="50" cy="50" r="44" fill="none" stroke="#2563EB" strokeWidth="8" strokeDasharray="276" initial={{ strokeDashoffset: 276 }} animate={{ strokeDashoffset: 276 - (276 * progress.percentage) / 100 }} transition={{ duration: 1.5 }} strokeLinecap="round" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-black text-slate-900 tabular-nums">{progress.percentage}%</span>
                       </div>
                    </div>
                 </div>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <ActionCard href="/student/learning-space" title="Learning Space" desc="Technical modules & labs." icon={<BookOpen size={20} />} accent="blue" />
                 <ActionCard href="/student/projects" title="Project Hub" desc="Manage deployments." icon={<FolderKanban size={20} />} accent="indigo" />
                 <ActionCard href="/student/notifications" title="Comms Node" desc="Signal alerts." icon={<Bell size={20} />} accent="slate" />
                 <ActionCard href="/student/profile" title="Configuration" desc="Identity keys." icon={<User size={20} />} accent="slate" />
              </div>
           </div>

           <div className="lg:col-span-4 space-y-10">
              {countdown && (
                 <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6 text-center">Cohort Launch Frequency</p>
                    <div className="grid grid-cols-4 gap-2">
                       <TimeBox value={countdown.d} label="Days" />
                       <TimeBox value={countdown.h} label="Hrs" />
                       <TimeBox value={countdown.m} label="Min" />
                       <TimeBox value={countdown.s} label="Sec" />
                    </div>
                 </section>
              )}

              <section className="space-y-6">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2 px-2"><Bell size={14} className="text-blue-500" /> Recent Alerts</h3>
                 <div className="space-y-4">
                    {notifications.length > 0 ? notifications.map((n: any) => (
                       <SignalItem key={n.id} title={n.title} desc={n.message} />
                    )) : <div className="p-12 text-center bg-white border border-slate-200 border-dashed rounded-[2rem] text-slate-400 text-[10px] font-black uppercase tracking-widest italic shadow-sm">No signals logged</div>}
                 </div>
              </section>
           </div>
        </div>
      </div>
    </motion.main>
  );
}

function ActionCard({ href, title, desc, icon, accent }: any) {
  return (
    <Link href={href} className="group p-8 rounded-[2.25rem] bg-white border border-slate-100 transition-all hover:border-blue-500 hover:shadow-2xl hover:shadow-slate-200 shadow-sm active:scale-95 no-underline">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all shadow-sm border border-slate-50", accent === 'blue' ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" : "bg-slate-50 text-slate-500 group-hover:bg-slate-900 group-hover:text-white")}>{icon}</div>
      <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{title}</h4>
      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{desc}</p>
    </Link>
  );
}

function TimeBox({ value, label }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-4 bg-white/5 border border-white/5 rounded-2xl shadow-inner">
       <span className="text-xl font-black tabular-nums">{value.toString().padStart(2, '0')}</span>
       <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

function SignalItem({ title, desc }: any) {
  return (
    <div className="flex gap-5 p-6 bg-white border border-slate-100 rounded-[1.75rem] shadow-sm hover:border-blue-200 transition-all group cursor-default">
       <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 animate-pulse" />
       <div className="space-y-1">
          <p className="text-[11px] font-black text-slate-900 uppercase group-hover:text-blue-600 transition-colors">{title}</p>
          <p className="text-[10px] font-medium text-slate-500 leading-relaxed line-clamp-2">{desc}</p>
       </div>
    </div>
  );
}

function DashboardSkeleton() {
  return <div className="max-w-6xl mx-auto p-10 space-y-10"><Skeleton className="h-24 w-full rounded-[2rem]" /><div className="grid grid-cols-12 gap-10"><div className="col-span-8 space-y-10"><Skeleton className="h-64 w-full rounded-[3rem]" /><div className="grid grid-cols-2 gap-6"><Skeleton className="h-40 rounded-[2rem]" /><Skeleton className="h-40 rounded-[2rem]" /></div></div><div className="col-span-4 space-y-10"><Skeleton className="h-48 w-full rounded-[2.5rem]" /></div></div></div>;
}
