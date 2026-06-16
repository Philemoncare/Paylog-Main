"use client";

import { useMemo, useState } from "react";
import { adminService } from "@/services/adminService";
import {
  Users, CheckCircle, Clock, DollarSign, Loader2,
  ExternalLink, Check, X, ArrowRight, TrendingUp,
  RefreshCw, FileText, BookOpen, AlertCircle, ShieldCheck
} from "lucide-react";
import { notify } from "@/lib/notify";
import { cn, formatCompactDate } from "@/lib/utils";
import Link from "next/link";

import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { COHORT_SEAT_TARGET } from "@/lib/constants";
import { useStableFetch } from "@/hooks/useStableFetch";
import { apiFetch } from "@/lib/api";

export default function AdminDashboard() {
  const { data, loading, execute: fetchData } = useStableFetch(adminService.getDashboardData, {
    cacheKey: 'admin-dashboard'
  });

  const [activeModal, setActiveModal] = useState<{ type: 'approve' | 'reject', pay: any } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const stats = useMemo(() => data?.stats || {
    totalApplications: 0,
    pendingPayments: 0,
    approvedStudents: 0,
    totalRevenue: 0,
    activeLearners: 0,
    avgCompletion: 0
  }, [data]);

  const payments = useMemo(() => Array.isArray(data?.payments) ? data.payments : [], [data]);

  const handlePaymentAction = async () => {
    if (!activeModal) return;
    const { type, pay } = activeModal;

    setIsActionLoading(true);
    try {
      const status = type === 'approve' ? 'approved' : 'rejected';
      await apiFetch('/api/admin/payment-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pay.payment_id, status }),
      });

      notify.success(
        type === 'approve' ? "Payment Authorized" : "Payment Rejected",
        type === 'approve' ? "Student identity has been synchronized." : "Ledger record updated."
      );

      fetchData(true);
      setActiveModal(null);
    } catch (err) {
      notify.error("Ledger sync failure.");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">

      <ConfirmationModal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        onConfirm={handlePaymentAction}
        isLoading={isActionLoading}
        title={activeModal?.type === 'approve' ? 'Authorize Payment' : 'Reject Payment Signal'}
        description={
          activeModal?.type === 'approve'
            ? `Confirm receipt of registration fee for ${activeModal.pay.student_name}. This will unlock their technical curriculum.`
            : `Are you sure you want to reject the payment signal from ${activeModal?.pay?.student_name}?`
        }
        confirmText={activeModal?.type === 'approve' ? 'Authorize & Unlock' : 'Reject Signal'}
        variant={activeModal?.type === 'approve' ? 'info' : 'danger'}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Overview</h1>
          <p className="text-slate-500 font-medium text-xs mt-1">Real-time cohort synchronization and metabolic tracking.</p>
        </div>
        <button onClick={() => fetchData(true)} disabled={loading} className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 min-w-[120px]">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Registry" value={loading ? <Skeleton className="h-9 w-12" /> : stats.totalApplications} icon={<Users className="text-blue-600" />} />
        <StatCard title="Pending Review" value={loading ? <Skeleton className="h-9 w-12" /> : stats.pendingPayments} icon={<Clock className="text-yellow-600" />} />
        <StatCard title="Verified Builders" value={loading ? <Skeleton className="h-9 w-12" /> : stats.approvedStudents} icon={<CheckCircle className="text-green-600" />} />
        <StatCard title="Engaged Learners" value={loading ? <Skeleton className="h-9 w-12" /> : stats.activeLearners} icon={<BookOpen className="text-indigo-600" />} />
        <StatCard title="Avg. Completion" value={loading ? <Skeleton className="h-9 w-12" /> : `${stats.avgCompletion}%`} icon={<TrendingUp className="text-emerald-600" />} />
        <StatCard title="Total Revenue" value={loading ? <Skeleton className="h-9 w-24" /> : `GHS ${stats.totalRevenue}`} icon={<DollarSign className="text-emerald-600" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.25rem] overflow-hidden shadow-sm">
          <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Recent Activity</h3>
            <Link href="/admin/registrations" className="text-[10px] font-black uppercase text-blue-600 hover:underline flex items-center gap-1">Student Registry <ArrowRight size={12} /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100 hidden sm:table-header-group">
                <tr>
                  <th className="px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-[9px]">Student</th>
                  <th className="px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-[9px]">Transaction</th>
                  <th className="px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-[9px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(3)].map((_, i) => <tr key={i}><td colSpan={3} className="px-8 py-6"><Skeleton className="h-12 w-full" /></td></tr>)
                ) : (payments.length === 0) ? (
                  <tr><td colSpan={3} className="px-8 py-16 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">No signals detected.</td></tr>
                ) : (
                  payments.map((pay: any) => (
                    <tr key={pay.registration_id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{pay.student_name}</div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">Joined: {pay.signup_date ? formatCompactDate(pay.signup_date) : 'Recently'}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-mono text-[10px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg inline-block border border-slate-100">{pay.transaction_id || 'AWAITING'}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-2">
                           {pay.payment_status === 'pending' && pay.payment_id ? (
                             <>
                               <button onClick={() => setActiveModal({ type: 'approve', pay })} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-emerald-100 shadow-sm"><Check size={18} /></button>
                               <button onClick={() => setActiveModal({ type: 'reject', pay })} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-rose-100 shadow-sm"><X size={18} /></button>
                             </>
                           ) : pay.payment_status === 'approved' ? (
                             <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck size={10} /> Verified</div>
                           ) : (
                             <div className="px-3 py-1.5 bg-slate-50 text-slate-400 border border-slate-100 rounded-full text-[9px] font-black uppercase tracking-widest">{pay.payment_status}</div>
                           )}
                           {pay.screenshot_url && <button onClick={() => window.open(pay.screenshot_url, '_blank')} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><ExternalLink size={18} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-700"><TrendingUp size={100} /></div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6">Enrollment Velocity</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-3xl font-black tracking-tighter">{loading ? "..." : Math.round((stats.approvedStudents / COHORT_SEAT_TARGET) * 100)}%</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase">Target: {COHORT_SEAT_TARGET}</span>
                 </div>
                 <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000 ease-out" style={{ width: `${loading ? 0 : (stats.approvedStudents / COHORT_SEAT_TARGET) * 100}%` }} />
                 </div>
              </div>
           </div>

           <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Management</h4>
              <div className="grid grid-cols-1 gap-2">
                 <Link href="/admin/registrations" className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95 shadow-lg no-underline">
                    <Users size={16} /> Student Base
                 </Link>
                 <Link href="/admin/lms" className="w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all no-underline">
                    <BookOpen size={16} /> Curriculum
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:border-blue-500 transition-all duration-300 group">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white">
          {icon}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-600">{title}</p>
      </div>
      <div className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">{value || 0}</div>
    </div>
  );
}
