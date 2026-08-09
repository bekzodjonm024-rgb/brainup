import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrainUPLogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

const sizeMap = {
  sm: { badge: 34, mark: 20 },
  md: { badge: 38, mark: 24 },
  lg: { badge: 72, mark: 46 },
};

export function BrainUPLogo({ size = "md", href, className }: BrainUPLogoProps) {
  const { badge, mark } = sizeMap[size];

  const el = (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-white",
        "ring-1 ring-black/[.08]",
        "shadow-[0_2px_8px_rgba(15,23,42,0.08)]",
        "transition-all duration-200 ease-in-out",
        "hover:shadow-[0_4px_16px_rgba(15,23,42,0.12)] hover:scale-[1.02]",
        className
      )}
      style={{ width: badge, height: badge }}
    >
      <Image
        src="/brainup-logo-transparent.png"
        alt="BrainUP"
        width={mark}
        height={mark}
        className="object-contain"
        unoptimized
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="BrainUP bosh sahifa">
        {el}
      </Link>
    );
  }

  return el;
}
