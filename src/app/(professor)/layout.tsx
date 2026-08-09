import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SidebarLayout } from "@/components/layout/sidebar-layout";

export default async function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "PROFESSOR" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const userName = session.user.name ?? session.user.email ?? "Professor";

  return (
    <SidebarLayout role="PROFESSOR" userName={userName}>
      {children}
    </SidebarLayout>
  );
}
