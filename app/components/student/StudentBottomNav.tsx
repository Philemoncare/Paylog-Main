"use client";

import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, FolderKanban, Bell, User, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const StudentBottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Dash", href: "/student/dashboard", icon: Home },
    { label: "Learn", href: "/student/learning-space", icon: BookOpen },
    { label: "Tasks", href: "/student/assignments", icon: FileText },
    { label: "Labs", href: "/student/projects", icon: FolderKanban },
    { label: "Me", href: "/student/profile", icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-[100]">
      <div className="bg-white border border-slate-200 shadow-xl rounded-2xl flex items-center justify-around h-16 px-2 relative overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-all relative z-10",
                isActive ? "text-[#0F172A]" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className="relative flex items-center justify-center">
                <item.icon
                  size={19}
                  className={cn("transition-transform duration-300", isActive ? "scale-110" : "scale-100")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-tight transition-all duration-300",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-x-2 inset-y-2 bg-slate-100 -z-10 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
