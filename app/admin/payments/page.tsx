"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { Loader2, ExternalLink, Check, X, Search, DollarSign, Mail, RefreshCw } from "lucide-react";
import { notify } from "@/lib/notify";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

import { Skeleton } from "@/components/ui/Skeleton";
import { REGISTRATION_FEE_GHS } from "@/lib/constants";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPayments();
      setPayments(data || []);
    } catch (error) {
      notify.error("Data Sync Error", "Failed to load payment records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    const tid = toast.loading(
      <div className="flex flex-col gap-1">
        <span className="font-black text-white text-sm tracking-tight">{status === 'approved' ? 'Verifying Ledger' : 'Rejecting Payment'}</span>
        <span className="text-slate-400 text-xs font-medium animate-pulse">{status === 'approved' ? 'Finalizing transaction records...' : 'Updating student profile...'}</span>
      </div>
    );
    try {
      await adminService.updatePaymentStatus(id, status);
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-black text-white text-sm tracking-tight">Record Synchronized</span>
          <span className="text-slate-400 text-xs font-medium">{status === 'approved' ? 'Student has been officially enrolled.' : 'The application has been declined.'}</span>
        </div>,
        { id: tid }
      );
      fetchData();
    } catch (error: any) {
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-black text-white text-sm tracking-tight">Update Failed</span>
          <span className="text-slate-400 text-xs font-medium">{error.message || "Unable to update payment status."}</span>
        </div>,
        { id: tid }
      );
    }
  };

  const handleResendWelcome = async (regId: number) => {
    const toastId = notify.loading("Generating and sending welcome package...");
    try {
      await adminService.resendWelcomeEmail(regId);
      notify.success("Email Transmitted", "Onboarding instructions have been delivered.");
    } catch (error: any) {
      notify.error("Transmission Failed", "Unable to resend the welcome email.");
    } finally {
      notify.dismiss(toastId);
    }
  };

  const filteredPayments = payments.filter(p =>
    p.student_name?.toLowerCase().includes(filter.toLowerCase()) ||
    p.transaction_id?.toLowerCase().includes(filter.toLowerCase())
  );

  const approvedTotal = payments
    .filter(p => p.payment_status === 'approved')
    .reduce((sum, p) => sum + (p.amount || REGISTRATION_FEE_GHS), 0);

  const openScreenshot = (url: string) => {
    if (url.startsWith('data:')) {
      setSelectedImage(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6 md:space-y-10">
      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-10"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <button
              className="absolute top-0 right-0 m-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Payment Proof"
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Financial Ledger</h1>
          <p className="text-slate-500 font-medium">Verify student transactions and manage revenue.</p>
        </div>
        <div className="w-full sm:w-auto bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-4">
           <div className="p-2.5 bg-green-50 rounded-xl border border-green-100">
             <DollarSign className="text-green-600" size={20} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Verified</p>
              <p className="text-xl font-black text-slate-900 leading-none">
                {loading ? <Skeleton className="h-6 w-20" /> : `GHS ${approvedTotal}`}
              </p>
           </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-card">
        <div className="p-5 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or Ref ID..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <button onClick={fetchData} className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest text-left md:text-right">
            {loading ? "Refreshing..." : "Refresh Registry"}
          </button>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Student / Origin</th>
                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Transaction Details</th>
                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[9px]">Status</th>
                <th className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[9px] text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-32" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-48" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-10 w-20" /></td>
                    <td className="px-8 py-6 text-right"><Skeleton className="h-10 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium">No transactions found matching your search.</td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{pay.student_name}</div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">{pay.sender_number}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-block mb-1.5">{pay.transaction_id}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(pay.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        pay.payment_status === "approved" ? "border-green-200 text-green-600 bg-green-50" :
                        pay.payment_status === "rejected" ? "border-red-200 text-red-600 bg-red-50" :
                        "border-yellow-200 text-yellow-600 bg-yellow-50"
                      )}>
                        {pay.payment_status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center gap-3">
                          {pay.payment_status === 'pending' ? (
                            <>
                              <button onClick={() => handleStatusUpdate(pay.id, 'approved')} className="p-2 text-green-600 hover:bg-green-50 border border-green-100 rounded-lg transition-colors" title="Verify & Send Welcome Email"><Check size={18} /></button>
                              <button onClick={() => handleStatusUpdate(pay.id, 'rejected')} className="p-2 text-red-600 hover:bg-red-50 border border-red-100 rounded-lg transition-colors" title="Decline Payment"><X size={18} /></button>
                            </>
                          ) : pay.payment_status === 'approved' ? (
                            <div className="flex items-center gap-2">
                               {pay.approval_email_sent ? (
                                 <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100" title={`Sent at: ${pay.approval_email_sent_at ? new Date(pay.approval_email_sent_at).toLocaleString() : 'N/A'}`}>
                                    <Mail size={12} /> Email Sent
                                 </div>
                               ) : (
                                 <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                                    <Mail size={12} /> Not Sent
                                 </div>
                               )}
                               <button
                                 onClick={() => handleResendWelcome(pay.registration_id)}
                                 className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                                 title="Resend Onboarding Email"
                               >
                                  <RefreshCw size={14} />
                               </button>
                            </div>
                          ) : null}
                          <button
                            onClick={() => openScreenshot(pay.screenshot_url)}
                            className="p-2 text-slate-400 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                            title="Open Screenshot"
                          >
                            <ExternalLink size={18} />
                          </button>
                        </div>
                      </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {filteredPayments.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-medium">No transactions found.</div>
          ) : (
            filteredPayments.map((pay) => (
              <div key={pay.id} className="p-6 space-y-5 bg-white active:bg-slate-50 transition-all">
                <div className="flex justify-between items-start">
                   <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">{pay.student_name}</h3>
                      <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{pay.sender_number}</p>
                   </div>
                   <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                      pay.payment_status === "approved" ? "border-green-200 text-green-600 bg-green-50" :
                      pay.payment_status === "rejected" ? "border-red-200 text-red-600 bg-red-50" :
                      "border-yellow-200 text-yellow-600 bg-yellow-50"
                    )}>
                      {pay.payment_status}
                    </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</span>
                      <span className="font-mono text-[11px] font-bold text-slate-700">{pay.transaction_id}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</span>
                      <span className="text-[11px] font-bold text-slate-700">{new Date(pay.created_at).toLocaleDateString()}</span>
                   </div>
                </div>

                <div className="flex gap-3 pt-1">
                   {pay.payment_status === 'pending' ? (
                     <>
                        <button
                          onClick={() => handleStatusUpdate(pay.id, 'approved')}
                          className="flex-1 py-3 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                        >
                           <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(pay.id, 'rejected')}
                          className="flex-1 py-3 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                           <X size={14} /> Reject
                        </button>
                     </>
                   ) : (
                     <div className="flex-1 py-3 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-center">
                        Verification Complete
                     </div>
                   )}
                   <button
                    onClick={() => openScreenshot(pay.screenshot_url)}
                    className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm shrink-0"
                   >
                      <ExternalLink size={18} />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
