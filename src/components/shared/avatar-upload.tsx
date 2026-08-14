"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Camera } from "lucide-react";

interface AvatarUploadProps {
  currentUrl?: string | null;
  initials: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { outer: "h-12 w-12", text: "text-base", icon: "h-3 w-3" },
  md: { outer: "h-16 w-16", text: "text-xl", icon: "h-4 w-4" },
  lg: { outer: "h-20 w-20", text: "text-2xl", icon: "h-4 w-4" },
};

export function AvatarUpload({ currentUrl, initials, size = "md" }: AvatarUploadProps) {
  const [url, setUrl] = useState(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const s = sizeMap[size];

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm fayllari (.jpg, .png, .webp)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Rasm 5MB dan oshmasligi kerak");
      return;
    }

    setError(null);
    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
      if (!uploadRes.ok) throw new Error("Yuklashda xato");
      const { url: blobUrl } = await uploadRes.json();

      const saveRes = await fetch("/api/profile/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: blobUrl }),
      });
      if (!saveRes.ok) throw new Error("Saqlashda xato");

      setUrl(blobUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xato yuz berdi");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`relative ${s.outer} rounded-full overflow-hidden group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309]`}
        title="Rasm yuklash"
      >
        {url ? (
          <Image src={url} alt="Avatar" fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full bg-[#FDE8C8] flex items-center justify-center">
            <span className={`${s.text} font-bold text-[#B45309]`}>{initials}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <Loader2 className={`${s.icon} text-white animate-spin`} />
          ) : (
            <Camera className={`${s.icon} text-white`} />
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
