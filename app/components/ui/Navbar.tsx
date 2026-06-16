"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronRight } from "lucide-react";
import Image from "next/image";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const hasStudentSession = document.cookie.includes('student_email=');
      setIsStudent(hasStudentSession);
    };

    checkAuth();
    // Check auth less frequently (once per 10s) to save cycles
    const interval = setInterval(checkAuth, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("training_announcement_dismissed");
    if (dismissed === "true") setBannerVisible(false);

    const handleDismiss = () => setBannerVisible(false);
    window.addEventListener("announcement_dismissed", handleDismiss);
    return () => window.removeEventListener("announcement_dismissed", handleDismiss);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Curriculum", href: "/#curriculum" },
    { name: "About", href: "/#about" },
    { name: "Student Portal", href: "/login" },
  ];

  if (pathname.startsWith('/portal') || pathname.startsWith('/admin') || pathname.startsWith('/student/dashboard')) return null;

  return (
    <>
      <div className={cn(
        "fixed top-0 left-0 right-0 z-[1000] transition-all duration-500",
        isScrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-slate-100"
          : "bg-white/50 backdrop-blur-sm border-b border-transparent"
      )}>
        <nav className={cn(
          "max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between transition-all duration-500",
          isScrolled ? "h-16 md:h-20" : "h-20 md:h-24"
        )}>
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative w-9 h-9 md:w-11 md:h-11 transition-transform group-hover:scale-110 active:scale-95">
              <Image
                src="/images/faicom.png"
                alt="CodeStart"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-black text-xl md:text-2xl tracking-tighter text-slate-900 uppercase">CodeStart</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-blue-600",
                    pathname === link.href ? "text-blue-600" : "text-slate-500"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-6">
              {isStudent ? (
                <Link
                  href="/student/dashboard"
                  className="px-7 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-slate-900 transition-all flex items-center gap-2"
                >
                  Portal Dashboard <ChevronRight size={14} />
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all"
                >
                  Join Cohort
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-4">
            {!isStudent && (
                <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
                  Join
                </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 bg-slate-50 text-slate-900 rounded-xl transition-all border border-slate-100"
            >
              <Menu size={22} />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 z-[2000] lg:hidden transition-all duration-500",
        mobileMenuOpen ? "visible" : "invisible"
      )}>
        <div
          className={cn(
            "absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-500",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className={cn(
          "absolute right-0 top-0 bottom-0 w-[85%] max-w-[380px] bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="p-8 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Image src="/images/faicom.png" alt="Logo" width={32} height={32} />
                <span className="font-black text-lg tracking-tighter uppercase">Menu</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                <X size={20} />
              </button>
          </div>
          <div className="flex-1 p-8 space-y-8 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-3xl font-black text-slate-900 uppercase tracking-tight hover:text-blue-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
          </div>
          <div className="p-8 space-y-4">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-100 active:scale-95 transition-all"
              >
                Join Cohort &rarr;
              </Link>
              {isStudent && (
                <Link
                  href="/student/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px]"
                >
                    Dashboard
                </Link>
              )}
          </div>
        </div>
      </div>
    </>
  );
};
