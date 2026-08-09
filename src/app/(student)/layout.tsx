import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SidebarLayout } from "@/components/layout/sidebar-layout";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role === "PROFESSOR") redirect("/professor/dashboard");

  const userName = session.user.name ?? session.user.email ?? "Talaba";

  return (
    <SidebarLayout role="STUDENT" userName={userName}>
      {children}
    </SidebarLayout>
  );
}
