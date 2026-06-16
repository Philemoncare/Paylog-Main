"use client";

import "@/styles/globals.css";
import { useEffect, useState, useMemo } from "react";
import {
  LayoutDashboard, Users, CreditCard, Calendar, LogOut,
  ShieldCheck, Menu, Settings, Mail, Bell,
  GraduationCap, TrendingUp, FileText, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { SystemAlerts } from "@/components/admin/SystemAlerts";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/admin') router.replace('/admin/dashboard');
  }, [pathname, router]);

  useEffect(() => {
    let active = true;
    const isAuthRoute = pathname === '/admin/login' || pathname === '/admin/verify';

    const verifyAccess = async () => {
      if (isAuthRoute) {
        if (active) setLoading(false);
        return;
      }

      try {
        const result = await apiFetch('/api/auth/me');
        if (active) {
          setUser(result.user);
          setLoading(false);
        }
      } catch (error) {
        if (active) {
          console.warn("[AUTH] Access restricted.");
          router.push("/admin/login");
          setLoading(false);
        }
      }
    };

    verifyAccess();
    return () => { active = false; };
  }, [pathname, router]);

  const navItems = useMemo(() => [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/registrations", icon: Users, label: "Student Base" },
    { href: "/admin/lms", icon: GraduationCap, label: "Curriculum" },
    { href: "/admin/submissions", icon: FileText, label: "Academic Work" },
    { href: "/admin/reviews", icon: ShieldCheck, label: "Performance" },
    { href: "/admin/analytics", icon: TrendingUp, label: "Growth Data" },
    { href: "/admin/notifications", icon: Bell, label: "System Alerts" },
    { href: "/admin/timetable", icon: Calendar, label: "Schedule" },
    { href: "/admin/message-logs", icon: Mail, label: "Comms Logs" },
    { href: "/admin/settings", icon: Settings, label: "Configuration" },
  ], []);

  // Safe identifier extraction to prevent ErrorBoundary crashes
  const adminIdentifier = useMemo(() => {
    if (!user?.email) return 'Administrator';
    return user.email.split('@')[0];
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Securing Node...</p>
      </div>
    );
  }

  if (pathname === '/admin/login' || pathname === '/admin/verify') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[115] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-[120] bg-white border-r border-slate-200 flex flex-col transition-all duration-500 lg:sticky lg:top-0 lg:h-screen w-72",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-24 flex items-center px-8 border-b border-slate-100 shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-4 no-underline group">
            <div className="w-10 h-10 relative shrink-0">
               <Image src="/images/faicom.png" alt="Logo" width={40} height={40} className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-slate-900 uppercase leading-none">CodeStart</span>
              <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-1">Management Node</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-1 overflow-y-auto custom-scrollbar">
           {navItems.map((item) => {
             const isActive = pathname === item.href;
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 onClick={() => setSidebarOpen(false)}
                 className={cn(
                   "flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-200 font-bold text-sm no-underline group",
                   isActive
                     ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                     : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                 )}
               >
                 <div className="flex items-center gap-3.5">
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-600")} />
                    <span>{item.label}</span>
                 </div>
                 {isActive && <ChevronRight size={14} className="opacity-40" />}
               </Link>
             );
           })}
        </nav>

        <div className="p-6 border-t border-slate-100">
           <button
             onClick={async () => { await fetch('/api/logout', { method: 'POST' }); router.push("/admin/login"); }}
             className="flex items-center gap-3 w-full px-5 py-3.5 text-slate-500 hover:text-red-600 hover:bg-rose-50 rounded-2xl transition-all font-black text-xs uppercase tracking-widest border-none bg-transparent cursor-pointer"
           >
             <LogOut size={16} />
             <span>Terminate Session</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col relative h-screen overflow-hidden">
        <header className="h-24 flex items-center justify-between px-8 sm:px-12 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] shrink-0">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2.5 bg-slate-50 rounded-xl border-none cursor-pointer hover:bg-slate-100 transition-all">
              <Menu size={22} className="text-slate-600" />
           </button>

           <div className="flex items-center gap-8 ml-auto">
              <SystemAlerts />
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-4">
                 <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-900 uppercase leading-none m-0 truncate max-w-[150px]">{adminIdentifier}</p>
                    <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-1.5 m-0 opacity-60">{user?.role || 'Root'}</p>
                 </div>
                 <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-lg relative group overflow-hidden">
                    <ShieldCheck size={20} className="relative z-10" />
                    <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                 </div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
           <div className="p-8 sm:p-12 max-w-7xl mx-auto w-full">
              <ErrorBoundary>
                 <motion.div
                   key={pathname}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.3 }}
                 >
                    {children}
                 </motion.div>
              </ErrorBoundary>
           </div>
        </div>
      </main>
    </div>
  );
}
