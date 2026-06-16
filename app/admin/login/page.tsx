"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notify";
import { Lock, Mail, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Image from "next/image";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await apiFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.requiresVerification) {
        notify.success("Security Code Sent", "Please verify your identity with the key sent to your email.");
        router.push(`/admin/verify?email=${encodeURIComponent(email)}`);
      } else {
        notify.success("Access Granted", "Welcome back to the CodeStart Administration Portal.");
        router.push("/admin/dashboard");
      }
    } catch (error: any) {
      notify.error("Authentication Denied", error.message || "Invalid administrative credentials provided.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Real-time Infrastructure Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_30%,_rgba(37,99,235,0.08),_transparent_60%)]" />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-slate-800/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[460px] relative z-10">
        <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           {/* Primary Brand Identity - Logo Only */}
           <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6">
              <Image
                src="/images/faicom.png"
                alt="CodeStart Logo"
                fill
                className="object-contain"
                priority
              />
           </div>

           <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase leading-none">Administrative Login</h1>
              <p className="text-slate-500 font-bold text-[13px] leading-relaxed max-w-[280px] mx-auto">
                Authorized access only. Verify credentials to manage the platform.
              </p>
           </div>
        </div>

        {/* High-Performance Authentication Card */}
        <div className="bg-[#0F172A]/30 backdrop-blur-3xl border border-white/[0.06] p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          {/* Subtle light sweep animation */}
          <div className="absolute top-0 left-[-100%] w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-[shimmer_4s_infinite]" />

          <form onSubmit={handleLogin} className="space-y-7">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Administrative Email</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="admin@codestart.sh"
                  className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl pl-12 pr-6 py-4 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 focus:bg-white/[0.04] outline-none transition-all font-bold text-white placeholder:text-slate-700 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Secure Keyphrase</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl pl-12 pr-14 py-4 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 focus:bg-white/[0.04] outline-none transition-all font-bold text-white placeholder:text-slate-700 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                disabled={loading}
                type="submit"
                className="group w-full py-5 bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-blue-900/10"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Verify Credentials <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] opacity-40">CodeStart Security System • Node-GS-01</p>
        </div>
      </div>
    </main>
  );
}
