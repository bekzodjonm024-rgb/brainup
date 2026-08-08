import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default async function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "PROFESSOR" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const userName = session.user.name ?? session.user.email ?? "Professor";

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="PROFESSOR" userName={userName} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
