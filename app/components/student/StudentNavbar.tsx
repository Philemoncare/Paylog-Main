"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X, Home, BookOpen, Map, FolderKanban, FileText, Bell, Settings, ChevronRight } from "lucide-react";
import { studentService } from "@/services/studentService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const StudentNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await studentService.logout();
      router.push("/");
    } catch (e) {
      router.push("/");
    }
  };

  const menuItems = [
    { label: "Dashboard", href: "/student/dashboard", icon: Home },
    { label: "My Learning", href: "/student/learning-space", icon: BookOpen },
    { label: "Assignments", href: "/student/assignments", icon: FileText },
    { label: "Projects", href: "/student/projects", icon: FolderKanban },
    { label: "Resources", href: "/student/resources", icon: Map },
    { label: "Notifications", href: "/student/notifications", icon: Bell },
    { label: "Profile", href: "/student/profile", icon: Settings },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-[110] bg-white border-b border-slate-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/student/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 transition-all group-hover:opacity-80 active:scale-95">
              <Image src="/images/faicom.png" alt="Logo" fill className="object-contain" priority />
            </div>
            <span className="font-bold text-base tracking-tighter text-[#0F172A] uppercase">CodeStart</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <NavLink href="/student/dashboard" active={pathname === "/student/dashboard"}>Dashboard</NavLink>
            <NavLink href="/student/learning-space" active={pathname === "/student/learning-space"}>My Learning</NavLink>
            <NavLink href="/student/assignments" active={pathname === "/student/assignments"}>Assignments</NavLink>
            <NavLink href="/student/projects" active={pathname === "/student/projects"}>Projects</NavLink>
            <NavLink href="/student/resources" active={pathname === "/student/resources"}>Resources</NavLink>
            <NavLink href="/student/notifications" active={pathname === "/student/notifications"}>Notifications</NavLink>
            <NavLink href="/student/profile" active={pathname === "/student/profile"}>Profile</NavLink>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button
             onClick={handleLogout}
             className="hidden sm:flex items-center gap-2 px-4 py-2 text-slate-500 rounded-xl text-[11px] font-bold hover:bg-slate-50 hover:text-[#0F172A] transition-all border border-transparent hover:border-slate-200"
           >
             <LogOut size={14} /> Exit Portal
           </button>
           <button
             onClick={() => setIsOpen(true)}
             className="p-2 bg-[#0F172A] text-white rounded-xl lg:hidden active:scale-95 transition-all shadow-md"
           >
             <Menu size={18} />
           </button>
        </div>
      </nav>

      {/* 4. PREMIUM DRAWER */}
      <div className={cn(
        "fixed inset-0 z-[150] lg:hidden transition-all duration-500",
        isOpen ? "visible" : "invisible"
      )}>
        <div
          className={cn(
            "absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity duration-500",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsOpen(false)}
        />
        <aside className={cn(
          "absolute right-0 top-0 bottom-0 w-full max-w-[300px] bg-white border-l border-slate-100 shadow-2xl transition-transform duration-500 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}>
           <div className="p-6 h-16 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
              <span className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Portal Navigation</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-[#0F172A] transition-colors"
              >
                 <X size={18} />
              </button>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl transition-all border",
                    pathname === item.href
                      ? "bg-slate-50 border-slate-200 text-[#0F172A]"
                      : "bg-white border-transparent text-slate-500 hover:bg-slate-50 hover:text-[#0F172A]"
                  )}
                >
                   <item.icon size={18} className={cn(pathname === item.href ? "text-[#2563EB]" : "text-slate-400")} />
                   <span className="font-bold text-xs uppercase tracking-tight">{item.label}</span>
                </Link>
              ))}
           </div>
           <div className="p-6 border-t border-slate-100 bg-slate-50/20">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
              >
                 <LogOut size={16} /> Sign Out
              </button>
           </div>
        </aside>
      </div>
    </div>
  );
};

function NavLink({ href, children, active = false }: any) {
  return (
    <Link
      href={href}
      className={cn(
        "text-xs font-bold transition-all relative py-1 uppercase tracking-tight",
        active ? "text-[#0F172A]" : "text-slate-400 hover:text-[#0F172A]"
      )}
    >
      {children}
      {active && (
        <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-[#2563EB] rounded-full" />
      )}
    </Link>
  );
}
