import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SidebarLayout } from "@/components/layout/sidebar-layout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const userName = session.user.name ?? session.user.email ?? "Admin";

  return (
    <SidebarLayout role="ADMIN" userName={userName}>
      {children}
    </SidebarLayout>
  );
}
