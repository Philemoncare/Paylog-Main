'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('CRITICAL_APP_ERROR:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center">
           <div className="relative w-12 h-12 grayscale opacity-50">
             <img src="/images/faicom.png" alt="Logo" className="w-full h-full object-contain" />
           </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-red-50 p-4 rounded-full">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            Something went wrong
          </h1>
          <p className="text-slate-500 font-medium">
            An unexpected error occurred. Our engineers have been notified.
            You can try refreshing the page or return to the home screen.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <RefreshCcw size={16} />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <Home size={16} />
            Go Home
          </Link>
        </div>

        <div className="pt-8 text-[10px] text-slate-400 font-mono">
           ERROR_ID: {error.digest || 'unknown-internal-error'}
        </div>
      </div>
    </div>
  );
}
