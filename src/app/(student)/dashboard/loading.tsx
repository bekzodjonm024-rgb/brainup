import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400 dark:text-slate-300" />
    </div>
  );
}
