import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SidebarLayout } from "@/components/layout/sidebar-layout";

export default async function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "PROFESSOR" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  let userName = session.user.email ?? "Professor";
  if (session.user.profileId) {
    const professor = await db.professor.findUnique({
      where: { id: session.user.profileId },
      select: { firstName: true, lastName: true },
    });
    if (professor) userName = `${professor.firstName} ${professor.lastName}`;
  }

  return (
    <SidebarLayout role="PROFESSOR" userName={userName}>
      {children}
    </SidebarLayout>
  );
}
