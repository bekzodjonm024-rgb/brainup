import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SidebarLayout } from "@/components/layout/sidebar-layout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { avatarUrl: true, displayName: true },
  });

  const userName = user?.displayName ?? session.user.name ?? session.user.email ?? "Admin";

  return (
    <SidebarLayout role="ADMIN" userName={userName} avatarUrl={user?.avatarUrl}>
      {children}
    </SidebarLayout>
  );
}
