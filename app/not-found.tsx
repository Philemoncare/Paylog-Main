import React from "react";
import Link from "next/link";
import { Search, ChevronLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center">
           <div className="relative w-12 h-12 grayscale opacity-30">
             <img src="/images/faicom.png" alt="Logo" className="w-full h-full object-contain" />
           </div>
        </div>

        <div className="space-y-4">
          <div className="relative inline-block">
             <span className="text-9xl font-black text-slate-200 select-none">404</span>
             <div className="absolute inset-0 flex items-center justify-center">
               <Search className="w-16 h-16 text-[#0F172A]" />
             </div>
          </div>

          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            Page Not Found
          </h1>
          <p className="text-slate-500 font-medium">
            We couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-[#0F172A] text-white rounded-2xl font-bold text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <ChevronLeft size={18} />
            Back to Safety
          </Link>
        </div>
      </div>
    </div>
  );
}
