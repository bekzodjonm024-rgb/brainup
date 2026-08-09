import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SidebarLayout } from "@/components/layout/sidebar-layout";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role === "PROFESSOR") redirect("/professor/dashboard");

  let userName = session.user.email ?? "Talaba";
  let avatarUrl: string | null = null;
  let pendingRetrievals = 0;

  if (session.user.profileId) {
    const [student, retrievals] = await Promise.all([
      db.student.findUnique({
        where: { id: session.user.profileId },
        select: { firstName: true, lastName: true, user: { select: { avatarUrl: true } } },
      }),
      db.retrievalRecord.count({
        where: {
          studentId: session.user.profileId,
          status: "PENDING",
          dueAt: { lte: new Date() },
        },
      }),
    ]);
    if (student) {
      userName = `${student.firstName} ${student.lastName}`;
      avatarUrl = student.user.avatarUrl ?? null;
    }
    pendingRetrievals = retrievals;
  }

  return (
    <SidebarLayout role="STUDENT" userName={userName} avatarUrl={avatarUrl} badges={{ "/retrieval": pendingRetrievals }}>
      {children}
    </SidebarLayout>
  );
}
