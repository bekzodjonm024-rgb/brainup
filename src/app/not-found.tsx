import Link from "next/link";
import { BrainUPLogo } from "@/components/ui/brainup-logo";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="flex justify-center">
          <BrainUPLogo size="lg" href="/" />
        </div>
        <div>
          <h1 className="text-6xl font-black text-slate-200 leading-none">404</h1>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Sahifa topilmadi</h2>
          <p className="text-sm text-slate-500 mt-2">
            Bu sahifa mavjud emas yoki o'chirilgan.
          </p>
        </div>
        <Link href="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Bosh sahifaga qaytish
          </Button>
        </Link>
      </div>
    </div>
  );
}
