"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Key, Mail, User, Bell, Save, Loader2, Smartphone, Github, Linkedin, RefreshCw, AlertCircle } from "lucide-react";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { adminService } from "@/services/adminService";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [adminUser, setAdminUser] = useState<any>(null);
  const [alertPrefs, setAlertPrefs] = useState({
    critical: true, warning: true, info: true, email: true, whatsapp: false, whatsappNumber: ""
  });
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await apiFetch('/api/auth/me');
      setAdminUser(res.user);
    } catch (e) {}
  }, []);

  const fetchPrefs = useCallback(async () => {
    try {
      const res = await adminService.getSetting('alert_preferences');
      if (res?.value) setAlertPrefs(JSON.parse(res.value));
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchPrefs();
  }, [fetchProfile, fetchPrefs]);

  const handleSaveAlertPrefs = async () => {
    setLoading(true);
    const tid = notify.loading("Syncing preferences...");
    try {
      await adminService.updateSetting('alert_preferences', JSON.stringify(alertPrefs));
      notify.success("Preferences Saved");
    } catch (error: any) {
      notify.error("Protocol Fault");
    } finally {
      setLoading(false);
      notify.dismiss(tid);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    setLoading(true);
    const tid = notify.loading("Refreshing security node...");
    try {
      await apiFetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      notify.success("Security Refreshed");
      setTimeout(() => router.push("/admin/login"), 1500);
    } catch (error: any) {
      notify.error("Auth Failure");
    } finally {
      setLoading(false);
      notify.dismiss(tid);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">Configuration</h1>
           <p className="text-slate-500 font-medium text-xs mt-1">Manage administrative identity and system monitoring protocols.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-72 space-y-2">
           <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={<User size={18} />} label="Administrative Profile" />
           <TabButton active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={<Shield size={18} />} label="Access Keys" />
           <TabButton active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} icon={<Bell size={18} />} label="Signal Alerts" />
        </aside>

        <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          {activeTab === "profile" && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-8 pb-10 border-b border-slate-50">
                 <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl">{adminUser?.email?.[0].toUpperCase() || 'A'}</div>
                 <div>
                    <p className="font-black text-slate-900 text-2xl uppercase tracking-tighter leading-none">{adminUser?.email?.split('@')[0] || 'Administrator'}</p>
                    <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.25em] mt-3">Node Role: {adminUser?.role || 'Root'}</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <SettingsInput label="Node Identifier" value={adminUser?.email} icon={<User size={16} />} disabled />
                 <SettingsInput label="Authorized Email" value={adminUser?.email} icon={<Mail size={16} />} disabled />
                 <SettingsInput label="GitHub Handle" defaultValue="Philemoncare" icon={<Github size={16} />} />
                 <SettingsInput label="LinkedIn Node" defaultValue="Philemon Melabah" icon={<Linkedin size={16} />} />
              </div>
              <div className="pt-6">
                 <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center gap-3">
                    <Save size={18} /> Commit Profile Changes
                 </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
             <form onSubmit={handleUpdatePassword} className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-6">
                   <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-8">Access Key Management</h3>
                   <SettingsInput required name="currentPassword" label="Existing Security Key" type="password" placeholder="••••••••" icon={<Key size={16} />} />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <SettingsInput required name="newPassword" label="New Security Key" type="password" placeholder="••••••••" icon={<Key size={16} />} />
                      <SettingsInput required name="confirmPassword" label="Verify New Key" type="password" placeholder="••••••••" icon={<Key size={16} />} />
                   </div>
                </div>
                <div className="p-6 bg-blue-50 border border-blue-50 rounded-3xl shadow-inner">
                   <div className="flex items-center gap-3 text-blue-600 mb-2">
                      <Shield size={18} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Encryption Protocol</p>
                   </div>
                   <p className="text-xs text-blue-700 font-medium leading-relaxed">Changing access keys will invalidate all current node sessions across all platforms.</p>
                </div>
                <div className="pt-4">
                  <button disabled={loading} className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-100 hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : "Update Security Protocol"}
                  </button>
                </div>
             </form>
          )}

          {activeTab === "notifications" && (
             <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-6">
                   <div className="flex justify-between items-center px-2">
                      <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">System Heuristics</h3>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">Sync Active</span>
                   </div>
                   <div className="space-y-3">
                      <PreferenceToggle title="Security Breach Signals" desc="Unauthorized node access and login failures." checked={alertPrefs.critical} onChange={(v: boolean) => setAlertPrefs({...alertPrefs, critical: v})} />
                      <PreferenceToggle title="Administrative Signals" desc="New registrations, payments, and record updates." checked={alertPrefs.warning} onChange={(v: boolean) => setAlertPrefs({...alertPrefs, warning: v})} />
                   </div>
                </div>
                <div className="pt-8 border-t border-slate-50">
                   <button onClick={handleSaveAlertPrefs} disabled={loading} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Signal Rules"}
                   </button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={cn("w-full flex items-center gap-4 px-8 py-5 rounded-[1.75rem] font-black text-xs uppercase tracking-widest transition-all", active ? "bg-white border border-slate-200 text-blue-600 shadow-md scale-[1.02]" : "text-slate-500 hover:text-slate-900 hover:bg-white/50")}>
    <span className={cn(active ? "text-blue-600" : "text-slate-400")}>{icon}</span>
    {label}
  </button>
);

const SettingsInput = ({ label, name, defaultValue, value, onChange, type = "text", placeholder, icon, disabled = false, required = false }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</label>
    <div className="relative">
       <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
       <input name={name} required={required} type={type} disabled={disabled} defaultValue={defaultValue} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 disabled:opacity-50 shadow-inner transition-all" />
    </div>
  </div>
);

const PreferenceToggle = ({ title, desc, checked, onChange }: any) => (
  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-50 shadow-inner">
     <div className="space-y-1">
        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{title}</p>
        <p className="text-[10px] text-slate-500 font-medium max-w-xs">{desc}</p>
     </div>
     <button onClick={() => onChange(!checked)} className={cn("w-12 h-6 rounded-full transition-all relative", checked ? "bg-blue-600 shadow-lg shadow-blue-100" : "bg-slate-300 shadow-inner")}><div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md", checked ? "left-7" : "left-1")} /></button>
  </div>
);
