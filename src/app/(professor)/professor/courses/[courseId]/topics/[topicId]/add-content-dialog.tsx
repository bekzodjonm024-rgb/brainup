"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, UploadCloud, X, FileText } from "lucide-react";
import { ContentType } from "@/generated/prisma";

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "TEXT", label: "Matn" },
  { value: "LINK", label: "Havola" },
  { value: "VIDEO", label: "Video" },
  { value: "PDF", label: "PDF" },
  { value: "WORD", label: "Word" },
  { value: "PPT", label: "PowerPoint" },
  { value: "ARTICLE", label: "Maqola" },
  { value: "BOOK", label: "Kitob" },
];

const FILE_TYPES: ContentType[] = ["PDF", "WORD", "PPT", "BOOK"];

const ACCEPT_MAP: Record<string, string> = {
  PDF: ".pdf,application/pdf",
  WORD: ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  PPT: ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
  BOOK: ".pdf,.epub,.djvu,application/pdf",
};

interface AddContentDialogProps {
  topicId: string;
  asButton?: boolean;
}

export function AddContentDialog({ topicId, asButton }: AddContentDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sourceCount, setSourceCount] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: "TEXT" as ContentType,
    title: "",
    body: "",
    externalUrl: "",
    sourceTitles: [] as string[],
    sourceUrls: [] as string[],
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleTypeChange(val: string) {
    update("type", val);
    setUploadedFile(null);
    setFileError(null);
  }

  function updateSource(idx: number, field: "title" | "url", value: string) {
    setForm((prev) => {
      const arr = [...(field === "title" ? prev.sourceTitles : prev.sourceUrls)];
      arr[idx] = value;
      return { ...prev, [field === "title" ? "sourceTitles" : "sourceUrls"]: arr };
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setFileError("Fayl hajmi 50MB dan oshmasligi kerak");
      return;
    }

    setFileError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Yuklashda xato");
      const { url } = await res.json();
      setUploadedFile({ name: file.name, url });
    } catch {
      setFileError("Fayl yuklashda xato yuz berdi");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const sources = Array.from({ length: sourceCount }, (_, i) => ({
      title: form.sourceTitles[i] ?? "",
      url: form.sourceUrls[i] ?? "",
    })).filter((s) => s.title.trim());

    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topicId,
        type: form.type,
        title: form.title,
        body: form.body || undefined,
        externalUrl: form.externalUrl || undefined,
        fileUrl: uploadedFile?.url || undefined,
        sources: sources.length ? sources : undefined,
      }),
    });

    setLoading(false);
    if (res.ok) {
      setOpen(false);
      setForm({ type: "TEXT", title: "", body: "", externalUrl: "", sourceTitles: [], sourceUrls: [] });
      setSourceCount(0);
      setUploadedFile(null);
      router.refresh();
    }
  }

  const needsUrl = ["LINK", "VIDEO", "ARTICLE"].includes(form.type);
  const needsFile = FILE_TYPES.includes(form.type as ContentType);

  function resetAndClose() {
    setOpen(false);
    setUploadedFile(null);
    setFileError(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        {asButton ? (
          <Button size="sm">Material qo'shish</Button>
        ) : (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Material qo'shish
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yangi material qo'shish</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Material turi</Label>
              <Select value={form.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Sarlavha <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Material nomi"
                required
              />
            </div>
          </div>

          {needsUrl && (
            <div className="space-y-2">
              <Label htmlFor="externalUrl">Havola (URL)</Label>
              <Input
                id="externalUrl"
                type="url"
                value={form.externalUrl}
                onChange={(e) => update("externalUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          {needsFile && (
            <div className="space-y-2">
              <Label>Fayl yuklash</Label>
              {uploadedFile ? (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-sm text-emerald-700 flex-1 truncate">{uploadedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-slate-500 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  ) : (
                    <UploadCloud className="h-6 w-6" />
                  )}
                  <span className="text-sm">
                    {uploading ? "Yuklanmoqda..." : "Fayl tanlash yoki shu yerga tashlang"}
                  </span>
                  <span className="text-xs text-slate-400">Max 50MB</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_MAP[form.type] ?? "*"}
                className="hidden"
                onChange={handleFileChange}
              />
              {fileError && <p className="text-xs text-red-500">{fileError}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="body">Matn / Tavsif</Label>
            <Textarea
              id="body"
              value={form.body}
              onChange={(e) => update("body", e.target.value)}
              placeholder="Material matni yoki qisqacha izoh..."
              rows={4}
            />
          </div>

          {/* Scientific sources */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Ilmiy manbalar</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSourceCount((n) => n + 1)}
              >
                <Plus className="h-3 w-3 mr-1" /> Manba qo'shish
              </Button>
            </div>
            {Array.from({ length: sourceCount }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <Input
                  placeholder={`Manba ${i + 1} — sarlavha`}
                  value={form.sourceTitles[i] ?? ""}
                  onChange={(e) => updateSource(i, "title", e.target.value)}
                />
                <Input
                  placeholder="URL (ixtiyoriy)"
                  value={form.sourceUrls[i] ?? ""}
                  onChange={(e) => updateSource(i, "url", e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading || uploading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Qo'shish
            </Button>
            <Button type="button" variant="outline" onClick={resetAndClose}>
              Bekor qilish
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
