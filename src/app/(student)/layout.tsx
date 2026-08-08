import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role === "PROFESSOR") redirect("/professor/dashboard");

  const userName = session.user.name ?? session.user.email ?? "Talaba";

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="STUDENT" userName={userName} />
      <div className="flex flex-1 flex-col overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
