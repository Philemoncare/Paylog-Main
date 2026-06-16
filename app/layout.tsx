import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "sonner";
import { ScrollManagement } from "@/components/ui/ScrollManagement";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { BackToTop } from "@/components/ui/BackToTop";
import { Suspense } from "react";
import { Analytics } from "@/components/ui/Analytics";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "CodeStart | Practical Software Engineering Training",
  description: "Elite engineering-focused learning environment designed for real-world technical mastery.",
  icons: {
    icon: "/images/faicom.png",
    shortcut: "/images/faicom.png",
    apple: "/images/faicom.png",
  },
  metadataBase: new URL('https://codestart.sh'),
};

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans bg-white text-slate-900 antialiased min-h-screen selection:bg-blue-100 selection:text-blue-900`}>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>

        <ScrollManagement />

        {children}

        <BackToTop />
        <CookieConsent />

        <Toaster
          position="bottom-right"
          expand={false}
          richColors
          closeButton
          duration={4000}
          visibleToasts={3}
          theme="light"
          toastOptions={{
            style: {
              borderRadius: '1rem',
              padding: '12px 16px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              fontSize: '13px',
              fontWeight: 600,
            },
            className: 'font-sans',
          }}
        />
      </body>
    </html>
  );
}
