import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StudentFocusedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "PROFESSOR") redirect("/professor/dashboard");
  if (session.user.role === "ADMIN") redirect("/admin");
  return <>{children}</>;
}
