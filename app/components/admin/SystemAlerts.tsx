"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Bell,
  RefreshCw,
  Clock,
  CheckCheck,
  Inbox,
  ArrowRight,
  ShieldAlert,
  Info,
  CreditCard,
  UserPlus
} from "lucide-react";
import { alertService, Alert } from "@/services/alertService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/time";

export function SystemAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAlerts = useCallback(async (isSilent = false) => {
    // Only fetch if tab is visible to save resources
    if (document.hidden) return;

    if (!isSilent) setLoading(true);
    try {
      const data = await alertService.getAlerts({ limit: 5, status: 'unread' });
      if (data && data.alerts) {
        setAlerts(data.alerts);
        setUnreadCount(data.pagination?.total || 0);
      }
    } catch (error) {
      console.warn("[ALERTS] Sync suppressed.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchAlerts();
      // Increase interval to 2 minutes for production performance
      const interval = setInterval(() => fetchAlerts(true), 120000);
      return () => clearInterval(interval);
    }
  }, [fetchAlerts, mounted]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await alertService.updateAlert(id, { is_read: true });
      setAlerts(prev => prev.filter(a => a.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Protocol failed.");
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'payment': return <CreditCard size={15} />;
      case 'registration': return <UserPlus size={15} />;
      case 'security': return <ShieldAlert size={15} />;
      default: return <Info size={15} />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'critical': return "bg-rose-50 text-rose-600 border-rose-100";
      case 'warning': return "bg-amber-50 text-amber-600 border-amber-100";
      case 'success': return "bg-emerald-50 text-emerald-600 border-emerald-100";
      default: return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2.5 rounded-xl transition-all duration-300 active:scale-95",
          isOpen ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
        )}
      >
        <Bell size={18} className={cn(unreadCount > 0 && !isOpen && "animate-bounce")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={cn(
              "fixed inset-x-4 top-24 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-4 w-auto sm:w-[380px] bg-white border border-slate-100 rounded-[1.75rem] shadow-2xl z-[1000] overflow-hidden flex flex-col",
              "max-h-[70vh]"
            )}
          >
            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/40">
              <div className="space-y-0.5">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Recent Signals</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{unreadCount} Pending Alerts</p>
              </div>
              <button
                onClick={() => fetchAlerts()}
                className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-slate-900"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar bg-white">
              {loading ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scanning...</span>
                </div>
              ) : alerts.length === 0 ? (
                <div className="py-16 text-center px-10">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-200">
                    <Inbox size={20} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Node Synchronized</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="p-4 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm",
                          getStyles(alert.type)
                        )}>
                          {getIcon(alert.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                             <p className="text-[11px] font-bold text-slate-900 truncate">{alert.title || alert.message}</p>
                             <button
                               onClick={() => handleMarkAsRead(alert.id)}
                               className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-blue-600 transition-all shrink-0"
                             >
                               <CheckCheck size={14} />
                             </button>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 font-medium leading-relaxed">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock size={9} />
                                {formatRelativeTime(alert.created_at)}
                             </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="p-4 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all border-t border-slate-800"
            >
              Signal Management Hub <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { AnimatePresence, motion } from "framer-motion";
