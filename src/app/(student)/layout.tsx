import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SidebarLayout } from "@/components/layout/sidebar-layout";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role === "PROFESSOR") redirect("/professor/dashboard");

  const userName = session.user.name ?? session.user.email ?? "Talaba";

  let pendingRetrievals = 0;
  if (session.user.profileId) {
    pendingRetrievals = await db.retrievalRecord.count({
      where: {
        studentId: session.user.profileId,
        status: "PENDING",
        dueAt: { lte: new Date() },
      },
    });
  }

  return (
    <SidebarLayout role="STUDENT" userName={userName} badges={{ "/retrieval": pendingRetrievals }}>
      {children}
    </SidebarLayout>
  );
}
