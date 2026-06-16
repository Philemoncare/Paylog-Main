import { StudentNavbar } from "@/components/student/StudentNavbar";
import { StudentBottomNav } from "@/components/student/StudentBottomNav";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FBFBFE] flex flex-col pb-32 lg:pb-0 pt-16 md:pt-20">
      <StudentNavbar />
      <main className="flex-1">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <StudentBottomNav />
    </div>
  );
}
