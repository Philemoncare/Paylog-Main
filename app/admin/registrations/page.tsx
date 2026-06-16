"use client";

import { useState, useMemo, useCallback } from "react";
import { adminService } from "@/services/adminService";
import { Mail, Smartphone, Search, Check, X, ShieldCheck, Clock, RefreshCw, Trash2, User, Loader2, Ban, CheckCircle2, AlertCircle } from "lucide-react";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useStableFetch } from "@/hooks/useStableFetch";
import { AnimatePresence, motion } from "framer-motion";

export default function RegistrationsPage() {
  const { data: registrationsData, loading, execute: fetchRegs } = useStableFetch(adminService.getRegistrations, {
    cacheKey: 'admin-registrations'
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Modal States
  const [activeModal, setActiveModal] = useState<{ type: 'approve' | 'reject' | 'delete', reg: any } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const registrations = useMemo(() => Array.isArray(registrationsData) ? registrationsData : [], [registrationsData]);

  const handleStatusAction = async () => {
    if (!activeModal) return;
    const { type, reg } = activeModal;

    setIsActionLoading(true);
    try {
      if (type === 'delete') {
        await adminService.deleteRegistration(reg.id);
        notify.success("Identity Purged", "Registry record permanently removed.");
      } else {
        const targetStatus = type === 'approve' ? 'approved' : 'rejected';
        await apiFetch('/api/admin/student-status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: reg.id, status: targetStatus }),
        });
        notify.success(
          type === 'approve' ? "Student Authorized" : "Application Rejected",
          type === 'approve' ? "Onboarding dispatch has been transmitted." : "Access restricted."
        );
      }
      fetchRegs(true);
      setActiveModal(null);
    } catch (error) {
      notify.error("Protocol failure.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      if (!r) return false;
      const matchesSearch =
        (r.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesPayment = paymentFilter === "all" ||
        (paymentFilter === "paid" && r.payment_status === "approved") ||
        (paymentFilter === "unpaid" && (!r.payment_status || r.payment_status !== "approved"));
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [registrations, searchTerm, statusFilter, paymentFilter]);

  if (loading && registrations.length === 0) return <div className="p-10 space-y-8"><Skeleton className="h-20 w-full rounded-2xl" /><Skeleton className="h-96 w-full rounded-[2rem]" /></div>;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">

      <ConfirmationModal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        onConfirm={handleStatusAction}
        isLoading={isActionLoading}
        title={
          activeModal?.type === 'approve' ? 'Authorize Student Node' :
          activeModal?.type === 'reject' ? 'Reject Application' : 'Purge Registry Record'
        }
        description={
          activeModal?.type === 'approve' ? `Confirm authorization for ${activeModal.reg.full_name}. This will automatically transmit the onboarding credentials.` :
          activeModal?.type === 'reject' ? `Are you sure you want to reject ${activeModal.reg.full_name}? Access to the student portal will be restricted.` :
          `PERMANENT ACTION: You are about to erase ${activeModal?.reg?.full_name} from the core registry. This cannot be undone.`
        }
        confirmText={
          activeModal?.type === 'approve' ? 'Authorize & Sync' :
          activeModal?.type === 'reject' ? 'Confirm Rejection' : 'Erase Record'
        }
        variant={activeModal?.type === 'approve' ? 'info' : 'danger'}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">Student Base</h1>
          <p className="text-slate-500 font-medium text-xs mt-1">Authorized node management for cohort enrollment and identity verification.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm hidden sm:block">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Registry Population</p>
             <p className="text-2xl font-black text-slate-900 tabular-nums">{registrations.length}</p>
          </div>
          <button onClick={() => fetchRegs(true)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
             <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-50/30">
           <div className="relative w-full xl:max-w-md group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
             <input
               type="text"
               placeholder="Search identify identifier..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
             />
           </div>

           <div className="flex flex-wrap items-center gap-4">
              <FilterGroup label="Authorization" value={statusFilter} onChange={setStatusFilter} options={['all', 'pending', 'approved', 'rejected']} />
              <FilterGroup label="Ledger" value={paymentFilter} onChange={setPaymentFilter} options={['all', 'paid', 'unpaid']} />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[9px]">Identity Node</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[9px]">Comms Bridge</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[9px]">Authorization</th>
                <th className="px-8 py-5 font-black text-slate-400 uppercase tracking-widest text-[9px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRegistrations.map((reg) => (
                <tr key={reg?.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm border border-slate-50">
                          <User size={18} />
                       </div>
                       <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-xs uppercase tracking-tight">{reg?.full_name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">{reg?.experience || 'Beginner'} • {reg?.age || '--'} Yrs</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2.5 text-slate-600 text-xs font-bold">
                      <Mail size={14} className="text-slate-300" />
                      {reg?.email}
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-tight">
                      <Smartphone size={14} className="text-slate-200" />
                      {reg?.whatsapp}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit shadow-sm",
                      reg?.status === "approved" ? "border-emerald-200 text-emerald-600 bg-emerald-50" :
                      reg?.status === "rejected" ? "border-rose-200 text-rose-600 bg-rose-50" :
                      "border-amber-200 text-amber-600 bg-amber-50"
                    )}>
                      {reg?.status === 'approved' ? <ShieldCheck size={10} /> : <Clock size={10} />}
                      {reg?.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <div className="flex justify-end items-center gap-2">
                        {reg?.status !== 'approved' && (
                           <ActionButton
                             onClick={() => setActiveModal({ type: 'approve', reg })}
                             icon={<Check size={18} />}
                             title="Authorize"
                             variant="success"
                           />
                        )}

                        {reg?.status !== 'rejected' && (
                           <ActionButton
                             onClick={() => setActiveModal({ type: 'reject', reg })}
                             icon={reg?.status === 'approved' ? <Ban size={16} /> : <X size={18} />}
                             title="Reject"
                             variant="danger"
                           />
                        )}

                        <div className="w-px h-6 bg-slate-100 mx-1" />

                        <ActionButton
                          onClick={() => setActiveModal({ type: 'delete', reg })}
                          icon={<Trash2 size={16} />}
                          title="Purge"
                          variant="ghost"
                        />
                     </div>
                  </td>
                </tr>
              ))}
              {filteredRegistrations.length === 0 && !loading && (
                <tr>
                   <td colSpan={4} className="px-8 py-32 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200 border border-slate-50 shadow-inner">
                         <Search size={32} />
                      </div>
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No matches detected in node filters.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ onClick, icon, title, variant }: any) {
   const styles: any = {
      success: "text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 shadow-emerald-100/50",
      danger: "text-rose-600 hover:bg-rose-50 hover:border-rose-100 shadow-rose-100/50",
      primary: "text-blue-600 hover:bg-blue-50 hover:border-blue-100",
      ghost: "text-slate-300 hover:text-rose-600 hover:bg-rose-50"
   };

   return (
      <button
         onClick={onClick}
         className={cn(
            "p-2.5 rounded-xl transition-all border border-transparent shadow-sm active:scale-90",
            styles[variant]
         )}
         title={title}
      >
         {icon}
      </button>
   );
}

function FilterGroup({ label, value, onChange, options }: any) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all uppercase tracking-widest cursor-pointer shadow-sm"
      >
        {options.map((o: string) => <option key={o} value={o}>{o.toUpperCase()}</option>)}
      </select>
    </div>
  );
}
