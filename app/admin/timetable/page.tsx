"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { adminService } from "@/services/adminService";
import {
  Plus, Trash2, Edit2, Save, X, Calendar, Clock,
  BookOpen, Loader2, LayoutGrid, FileText, CheckCircle2, Upload, Image as ImageIcon,
  RefreshCw
} from "lucide-react";
import { notify } from "@/lib/notify";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { useStableFetch } from "@/hooks/useStableFetch";

interface TimetableEntry {
  id: number;
  day: string;
  time: string;
  topic: string;
  description?: string;
}

export default function TimetablePage() {
  const fetchFn = useCallback(() => adminService.getTimetable(), []);
  const { data: timetableData, loading, execute: fetchTimetable } = useStableFetch(fetchFn, {
    cacheKey: 'admin-timetable'
  });

  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [timetableImage, setTimetableImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const timetable = useMemo(() => Array.isArray(timetableData) ? timetableData : [], [timetableData]);

  const [formData, setFormData] = useState({
    day: "Monday",
    time: "",
    topic: "",
    description: ""
  });

  useEffect(() => {
     const loadGraphic = async () => {
        try {
           const res = await adminService.getSetting('timetable_image');
           if (res?.value) setTimetableImage(res.value);
        } catch (e) {}
     };
     loadGraphic();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) return notify.warning("Limit: 2MB");

    setUploadingImage(true);
    const tid = notify.loading("Syncing graphic...");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await adminService.updateSetting('timetable_image', base64);
        setTimetableImage(base64);
        notify.success("Graphic Synced");
        setUploadingImage(false);
        notify.dismiss(tid);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      notify.error("Fault");
      setUploadingImage(false);
      notify.dismiss(tid);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic || !formData.time) return notify.warning("Missing data");

    setSubmitting(true);
    const tid = notify.loading("Publishing block...");
    try {
      await adminService.addTimetableEntry(formData);
      notify.success("Block Published");
      setFormData({ day: "Monday", time: "", topic: "", description: "" });
      setIsAdding(false);
      fetchTimetable(true);
    } catch (error: any) {
      notify.error("Protocol Error");
    } finally {
      setSubmitting(false);
      notify.dismiss(tid);
    }
  };

  const handleUpdate = async (id: number) => {
    setSubmitting(true);
    const tid = notify.loading("Updating block...");
    try {
      await adminService.updateTimetableEntry({ id, ...formData });
      notify.success("Block Updated");
      setEditingId(null);
      fetchTimetable(true);
    } catch (error: any) {
      notify.error("Sync Error");
    } finally {
      setSubmitting(false);
      notify.dismiss(tid);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Decommission this block?")) return;
    const tid = notify.loading("Removing...");
    try {
      await adminService.deleteTimetableEntry(id);
      notify.success("Block Removed");
      fetchTimetable(true);
    } catch (error) {
      notify.error("Fault");
    } finally {
      notify.dismiss(tid);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">Schedule</h1>
           <p className="text-slate-500 font-medium text-xs mt-1">Synchronize weekly sessions and technical labs.</p>
        </div>

        <div className="flex gap-4">
           <button onClick={() => fetchTimetable(true)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
             <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          {!isAdding && !editingId && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
            >
              New Block
            </button>
          )}
        </div>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 animate-in slide-in-from-top-4 duration-500">
           <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{editingId ? "Modify Block" : "Initialize Block"}</h2>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-2 text-slate-300 hover:text-rose-600 transition-all"><X size={24} /></button>
           </div>
           <form onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdate(editingId); } : handleAdd} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Session Day</label>
                    <select value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500 outline-none transition-all shadow-inner">
                       {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Session Topic</label>
                    <input className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500 outline-none transition-all shadow-inner" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} placeholder="e.g. ADVANCED-REACT-ARCHITECTURE" required />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Time Node</label>
                    <input className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500 outline-none transition-all shadow-inner" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} placeholder="10:00 AM - 12:00 PM" required />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Mission Notes</label>
                    <input className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500 outline-none transition-all shadow-inner" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Optional mission details..." />
                 </div>
              </div>
              <div className="flex justify-end pt-4">
                 <button type="submit" disabled={submitting} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : "Commit Block"}
                 </button>
              </div>
           </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-[2rem]" />) : timetable.map((s) => (
                  <div key={s.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 group relative">
                     <div className="flex justify-between items-start mb-6">
                        <span className="px-3 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-full">{s.day}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                           <button onClick={() => { setEditingId(s.id); setFormData({ day: s.day, topic: s.topic, time: s.time, description: s.description || "" }); }} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Edit2 size={16} /></button>
                           <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={16} /></button>
                        </div>
                     </div>
                     <h4 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight mb-2">{s.topic}</h4>
                     <div className="flex items-center gap-2 text-slate-400 mb-4">
                        <Clock size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{s.time}</span>
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">{s.description || "No further notes."}</p>
                  </div>
               ))}
               {timetable.length === 0 && !loading && <div className="col-span-2 py-32 text-center bg-white border border-slate-200 border-dashed rounded-[3rem] text-slate-300 font-black uppercase tracking-widest text-[10px]">Registry Empty</div>}
            </div>
         </div>

         <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Visual Protocol</h3>
               <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center overflow-hidden shadow-inner group cursor-pointer relative" onClick={() => imageInputRef.current?.click()}>
                  {timetableImage ? <img src={timetableImage} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="" /> : <ImageIcon size={40} className="text-slate-200" />}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                     <span className="text-white text-[9px] font-black uppercase tracking-widest">Update Graphic</span>
                  </div>
                  <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
               </div>
               <p className="text-[10px] text-slate-400 font-bold uppercase italic leading-relaxed">Students see this graphic as the primary schedule node.</p>
            </div>
         </aside>
      </div>
    </div>
  );
}
