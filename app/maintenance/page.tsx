"use client";

import React from "react";
import Link from "next/link";
import { Settings, Hammer, Clock, ShieldCheck, Mail } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative w-16 h-16">
            <img
              src="/images/faicom.png"
              alt="CodeStart Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Animated Icon */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <div className="relative bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
            <Settings className="w-12 h-12 text-[#2563EB] animate-spin-slow" />
          </div>
          <div className="absolute -top-2 -right-2 bg-yellow-400 p-2 rounded-lg shadow-lg rotate-12">
            <Hammer className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            Platform Upgrade
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            We’re currently improving the CodeStart Ghana platform to give you a better learning experience.
            We'll be back online shortly.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Time</span>
            <span className="text-sm font-bold text-slate-700">~ 15 Minutes</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data Status</span>
            <span className="text-sm font-bold text-slate-700">All Secure</span>
          </div>
        </div>

        {/* Contact info */}
        <div className="pt-8 border-t border-slate-200 flex flex-col items-center gap-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Need urgent help?</p>
          <a
            href="mailto:support@codestartghana.com"
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <Mail size={16} />
            support@codestartghana.com
          </a>
        </div>

        <p className="text-[10px] text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} CodeStart Ghana. Practical Engineering Academy.
        </p>
      </div>
    </div>
  );
}
