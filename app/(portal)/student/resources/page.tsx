"use client";

import { useEffect, useState } from "react";
import {
  Map, FileText, Download, ExternalLink,
  BookOpen, Code, Github, Globe, Youtube,
  Search, Filter
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function StudentResourcesPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const resources = [
    { title: "Academy Handbook 2026", type: "PDF", category: "General", icon: <FileText size={18} /> },
    { title: "Git & Version Control Mastery", type: "Link", category: "Technical", icon: <Github size={18} /> },
    { title: "React Design Patterns", type: "PDF", category: "Engineering", icon: <Code size={18} /> },
    { title: "System Architecture Docs", type: "Link", category: "Engineering", icon: <Globe size={18} /> },
    { title: "Interview Prep Guide", type: "PDF", category: "Career", icon: <BookOpen size={18} /> },
    { title: "Engineering Blog List", type: "Link", category: "Community", icon: <Youtube size={18} /> },
  ];

  if (loading) return <div className="p-10 space-y-8"><Skeleton className="h-20 w-full" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="max-w-6xl mx-auto pb-32 pt-8 px-4 space-y-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Academic Resources</h1>
        <p className="text-slate-500 font-medium text-xs">Essential guides, documentation, and tools for your engineering journey.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((r, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50/50 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {r.icon}
               </div>
               <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{r.category}</span>
                  <h3 className="text-lg font-black text-slate-900 mt-1 leading-tight">{r.title}</h3>
               </div>
            </div>
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{r.type} Resource</span>
               <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                  {r.type === 'PDF' ? <Download size={18} /> : <ExternalLink size={18} />}
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
