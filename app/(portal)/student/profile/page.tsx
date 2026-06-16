"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { studentService } from "@/services/studentService";
import {
  User, Mail, Phone, School, ShieldCheck,
  Save, Loader2, Camera, Lock, Eye, EyeOff, Calendar, Award, Zap, ChevronRight, ArrowLeft, Settings, LogOut, Check, AlertCircle
} from "lucide-react";
import { notify } from "@/lib/notify";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, formatFullDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    whatsapp: "",
    school: "",
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getProfile();
      if (!data || data.error) throw new Error(data.error || "Failed to load profile");
      setStudent(data);
      setFormData(prev => ({
        ...prev,
        whatsapp: data.whatsapp || "",
        school: data.school || ""
      }));
    } catch (err: any) {
      console.error("Profile Fetch Error:", err);
      setError(err.message || "Failed to load profile data.");
      notify.error("Sync Error", "We couldn't retrieve your profile information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return notify.error("Image too large (max 2MB)");

    setUploadingPhoto(true);
    try {
      const res = await studentService.updateProfilePhoto(file);
      if (res.success) {
        notify.success("Profile photo updated");
        setStudent((prev: any) => ({ ...prev, profile_photo_url: res.url }));
      }
    } catch (err) {
      notify.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      return notify.warning("Security Conflict", "New passwords do not match.");
    }

    setSubmitting(true);
    const tid = notify.loading("Updating profile details...");
    try {
      await studentService.updateProfile(formData);
      notify.success("Identity Updated", "Your profile details have been synchronized.");
      setFormData(prev => ({ ...prev, current_password: "", new_password: "", confirm_password: "" }));
      fetchProfile();
    } catch (error: any) {
      notify.error("Update Failed", error.message || "Unable to save profile changes.");
    } finally {
      setSubmitting(false);
      notify.dismiss(tid);
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (error || !student) return <ErrorState onRetry={fetchProfile} />;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F8FAFC] pb-40 lg:pb-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto pt-10 space-y-12">

        {/* HEADER SECTION */}
        <div className="space-y-2 border-b border-slate-200 pb-8">
           <div className="flex items-center gap-2 text-slate-500 hover:text-[#0F172A] transition-colors w-fit group cursor-pointer mb-4" onClick={() => window.history.back()}>
              <ArrowLeft size={16} />
              <span className="text-xs font-semibold">Dashboard Overview</span>
           </div>
           <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Account Parameters</h1>
           <p className="text-sm text-slate-500 font-medium">Configure your engineering profile and security protocols.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

           {/* ASIDE: AVATAR & METRICS */}
           <aside className="lg:col-span-4 space-y-8">
              <div className="space-y-6">
                <div className="relative group w-24 h-24 mx-auto lg:mx-0">
                  <div className="h-full w-full overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
                    {student.profile_photo_url ? (
                      <img src={student.profile_photo_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-3xl font-bold text-slate-300">
                        {student.full_name?.charAt(0)}
                      </div>
                    )}
                    <AnimatePresence>
                      {uploadingPhoto && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm"
                        >
                           <Loader2 size={18} className="animate-spin text-[#0F172A]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-2 bg-white border border-slate-200 text-slate-500 rounded-xl shadow-sm hover:text-[#0F172A] transition-all z-10"
                  >
                    <Camera size={12} />
                  </motion.button>
                  <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                </div>

                <div className="space-y-1 text-center lg:text-left">
                  <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">{student.full_name}</h2>
                  <p className="text-xs font-bold text-[#2563EB] uppercase tracking-widest">ID #CS-{student.id?.toString().padStart(4, '0')}</p>
                </div>

                <div className="space-y-5 pt-6 border-t border-slate-200">
                  <CompactDetail label="Level" value={student.experience} icon={<Award size={14} />} />
                  <CompactDetail label="Contact" value={student.email} icon={<Mail size={14} />} />
                  <CompactDetail label="Node Start" value={formatFullDate(student.created_at)} icon={<Calendar size={14} />} />
                </div>
              </div>
           </aside>

           {/* CONTENT: FORM & ACTIONS */}
           <div className="lg:col-span-8 space-y-10">
              <div className="flex p-1 bg-slate-100 rounded-xl w-fit border border-slate-200/50">
                 {["general", "security"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-6 py-2 rounded-lg text-xs font-bold capitalize transition-all",
                        activeTab === tab ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                       {tab}
                    </button>
                 ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                 <AnimatePresence mode="wait">
                    {activeTab === "general" ? (
                       <motion.div
                         key="general"
                         initial={{ opacity: 0, x: 10 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -10 }}
                         transition={{ duration: 0.2 }}
                         className="space-y-8"
                       >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Legal Identifier</label>
                                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 flex items-center justify-between cursor-not-allowed">
                                   {student.full_name} <Lock size={12} className="opacity-30" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">WhatsApp Primary</label>
                                <input
                                  required
                                  value={formData.whatsapp}
                                  onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                                  className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-sm font-medium focus:border-[#0F172A] focus:ring-0 outline-none transition-all placeholder:text-slate-300"
                                  placeholder="+233..."
                                />
                             </div>
                             <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Institution / Entity</label>
                                <input
                                  required
                                  value={formData.school}
                                  onChange={e => setFormData({...formData, school: e.target.value})}
                                  className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-sm font-medium focus:border-[#0F172A] focus:ring-0 outline-none transition-all placeholder:text-slate-300"
                                  placeholder="Academic affiliation"
                                />
                             </div>
                          </div>
                       </motion.div>
                    ) : (
                       <motion.div
                         key="security"
                         initial={{ opacity: 0, x: 10 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -10 }}
                         transition={{ duration: 0.2 }}
                         className="space-y-8"
                       >
                          <div className="space-y-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Active Password</label>
                                <div className="relative">
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.current_password}
                                    onChange={e => setFormData({...formData, current_password: e.target.value})}
                                    placeholder="••••••••"
                                    className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-sm font-medium focus:border-[#0F172A] outline-none transition-all"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A] transition-colors"
                                  >
                                     {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">New Secret</label>
                                   <input
                                     type="password"
                                     value={formData.new_password}
                                     onChange={e => setFormData({...formData, new_password: e.target.value})}
                                     placeholder="Min 8 characters"
                                     className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-sm font-medium focus:border-[#0F172A] outline-none transition-all"
                                   />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Confirm Rotation</label>
                                   <input
                                     type="password"
                                     value={formData.confirm_password}
                                     onChange={e => setFormData({...formData, confirm_password: e.target.value})}
                                     className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-sm font-medium focus:border-[#0F172A] outline-none transition-all"
                                   />
                                </div>
                             </div>
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>

                 <div className="pt-8 border-t border-slate-200 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 bg-[#0F172A] text-white rounded-xl font-bold text-xs transition-all hover:bg-[#1E293B] disabled:opacity-50 active:scale-95 shadow-lg shadow-slate-200 flex items-center gap-2"
                    >
                       {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                       Update Parameters
                    </button>
                 </div>
              </form>

              {/* DANGER ZONE / LOGOUT */}
              <div className="pt-20">
                 <div className="p-8 border border-red-100 bg-red-50/50 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-red-900">Session Termination</h3>
                    <p className="text-xs text-red-700/70 font-medium">Terminate your current technical session and exit the student portal.</p>
                    <button
                      onClick={() => studentService.logout().then(() => window.location.href = '/login')}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all active:scale-95 shadow-sm"
                    >
                       Terminate Connection
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </motion.main>
  );
}

function CompactDetail({ label, value, icon }: any) {
  return (
    <div className="flex items-center gap-3">
       <div className="text-slate-400 shrink-0">{icon}</div>
       <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-xs font-bold text-[#0F172A] truncate">{value}</p>
       </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 space-y-12">
       <div className="space-y-4 pb-8 border-b border-slate-200">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-lg" />
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-8">
             <Skeleton className="h-24 w-24 rounded-2xl" />
             <div className="space-y-5">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
             </div>
          </div>
          <div className="lg:col-span-8">
             <Skeleton className="h-[400px] rounded-3xl" />
          </div>
       </div>
    </div>
  );
}

function ErrorState({ onRetry }: any) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-white">
       <div className="mb-8 rounded-3xl bg-slate-50 p-8 border border-slate-200">
          <AlertCircle size={40} className="text-slate-400" />
       </div>
       <h2 className="text-2xl font-bold text-[#0F172A] mb-2 tracking-tight">Connection Failed</h2>
       <p className="mb-10 max-w-sm text-sm font-medium text-slate-500 leading-relaxed">We couldn't load your profile. Please check your internet and try again.</p>
       <button onClick={onRetry} className="rounded-2xl bg-[#0F172A] px-10 py-4 text-xs font-bold text-white shadow-xl shadow-slate-200 hover:bg-[#1E293B] transition-all">Retry Connection</button>
    </div>
  );
}
