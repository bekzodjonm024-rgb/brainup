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
  let avatarUrl: string | null = null;
  let pendingContentCount = 0;

  if (session.user.profileId) {
    const [professor, contentCount] = await Promise.all([
      db.professor.findUnique({
        where: { id: session.user.profileId },
        select: { firstName: true, lastName: true, user: { select: { avatarUrl: true } } },
      }),
      db.contentItem.count({
        where: {
          topic: { course: { professorId: session.user.profileId } },
          status: { in: ["PENDING_REVIEW", "REJECTED"] },
        },
      }),
    ]);
    if (professor) {
      userName = `${professor.firstName} ${professor.lastName}`;
      avatarUrl = professor.user.avatarUrl ?? null;
    }
    pendingContentCount = contentCount;
  }

  return (
    <SidebarLayout
      role="PROFESSOR"
      userName={userName}
      avatarUrl={avatarUrl}
      badges={{ "/professor/courses": pendingContentCount }}
    >
      {children}
    </SidebarLayout>
  );
}
