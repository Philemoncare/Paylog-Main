"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, ArrowLeft, CheckCircle2, Inbox, Trash2, Clock, Info, ShieldAlert, BellOff } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { notify } from "@/lib/notify";
import { cn, formatFullDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/student/notifications');
      if (data.notifications) setNotifications(data.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      await apiFetch(`/api/student/notifications?id=${id}`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      notify.error("Error", "Could not update notification status.");
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await apiFetch(`/api/student/notifications?id=${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
      notify.success("Cleared", "Notification removed from your inbox.");
    } catch (err) {
      notify.error("Error", "Could not delete notification.");
    }
  };

  if (loading) return <NotificationSkeleton />;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8fafc] pb-32 lg:pb-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto pt-8 space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-1">
             <Link href="/student/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors w-fit group">
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Back to Dashboard</span>
             </Link>
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <Bell size={28} className="text-blue-600" /> Notifications
             </h1>
           </div>

           <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20">
                 {notifications.filter(n => !n.is_read).length} Unread
              </span>
           </div>
        </div>

        {/* NOTIFICATION LIST */}
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
           {notifications.length > 0 ? (
             <div className="divide-y divide-slate-50">
                <AnimatePresence initial={false}>
                   {notifications.map((n) => (
                     <motion.div
                       key={n.id}
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: "auto" }}
                       exit={{ opacity: 0, x: -100 }}
                       className={cn(
                         "p-6 md:p-8 flex items-start gap-6 transition-all group relative",
                         !n.is_read && "bg-blue-50/30"
                       )}
                     >
                        {!n.is_read && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-blue-600 rounded-r-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />}

                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                          !n.is_read ? "bg-white text-blue-600" : "bg-slate-50 text-slate-400"
                        )}>
                           {n.title.toLowerCase().includes('alert') ? <ShieldAlert size={20} /> : <Inbox size={20} />}
                        </div>

                        <div className="flex-1 space-y-2">
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                              <h3 className={cn("text-sm font-bold", !n.is_read ? "text-slate-900" : "text-slate-500")}>
                                 {n.title}
                              </h3>
                              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                                 <Clock size={12} /> {formatFullDate(n.created_at)}
                              </span>
                           </div>
                           <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-2xl">
                              {n.message}
                           </p>

                           <div className="flex items-center gap-4 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!n.is_read && (
                                <button
                                  onClick={() => markAsRead(n.id)}
                                  className="text-[9px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                   Mark as Read
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(n.id)}
                                className="text-[9px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1.5"
                              >
                                 <Trash2 size={10} /> Delete
                              </button>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                </AnimatePresence>
             </div>
           ) : (
             <div className="py-32 px-8 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto border border-slate-100 shadow-inner">
                   <BellOff size={40} className="text-slate-300" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-xl font-bold text-slate-900">Inbox is Empty</h2>
                   <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">You have no new notifications from the academy.</p>
                </div>
                <Link href="/student/dashboard" className="inline-block px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-200">Return to Dashboard</Link>
             </div>
           )}
        </section>

        {/* PREFERENCES MOCK */}
        <div className="bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Bell size={120} />
           </div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center md:text-left">
                 <h3 className="text-xl font-bold tracking-tight">Notification Settings</h3>
                 <p className="text-xs text-slate-400 font-medium max-w-sm">Manage how you receive updates and announcements.</p>
              </div>
              <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
                 Manage Settings
              </button>
           </div>
        </div>
      </div>
    </motion.main>
  );
}

function NotificationSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
       <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48 rounded-2xl" />
          <Skeleton className="h-8 w-32 rounded-full" />
       </div>
       <div className="bg-white rounded-[2.5rem] border border-slate-100 p-2 space-y-2">
          {[1, 2, 3, 4].map(i => (
             <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
       </div>
    </div>
  );
}
