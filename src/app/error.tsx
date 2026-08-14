"use client";

import { useEffect } from "react";
import { BrainUPLogo } from "@/components/ui/brainup-logo";
import { Button } from "@/components/ui/button";
import { RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="flex justify-center">
          <BrainUPLogo size="lg" href="/" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1C1208]">Xatolik yuz berdi</h2>
          <p className="text-sm text-stone-500 mt-2">
            Kutilmagan muammo paydo bo'ldi. Qaytadan urinib ko'ring.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Qaytadan urinish
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")} className="gap-2">
            <Home className="h-4 w-4" />
            Bosh sahifa
          </Button>
        </div>
      </div>
    </div>
  );
}
