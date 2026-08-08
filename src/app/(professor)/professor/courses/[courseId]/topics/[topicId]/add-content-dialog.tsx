"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { ContentType } from "@/generated/prisma";

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "TEXT", label: "Matn" },
  { value: "LINK", label: "Havola" },
  { value: "VIDEO", label: "Video" },
  { value: "PDF", label: "PDF" },
  { value: "ARTICLE", label: "Maqola" },
  { value: "BOOK", label: "Kitob" },
];

interface AddContentDialogProps {
  topicId: string;
  asButton?: boolean;
}

export function AddContentDialog({ topicId, asButton }: AddContentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sourceCount, setSourceCount] = useState(0);

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

  function updateSource(idx: number, field: "title" | "url", value: string) {
    setForm((prev) => {
      const arr = [...(field === "title" ? prev.sourceTitles : prev.sourceUrls)];
      arr[idx] = value;
      return { ...prev, [field === "title" ? "sourceTitles" : "sourceUrls"]: arr };
    });
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
        sources: sources.length ? sources : undefined,
      }),
    });

    setLoading(false);
    if (res.ok) {
      setOpen(false);
      setForm({ type: "TEXT", title: "", body: "", externalUrl: "", sourceTitles: [], sourceUrls: [] });
      setSourceCount(0);
      router.refresh();
    }
  }

  const needsUrl = ["LINK", "VIDEO", "ARTICLE"].includes(form.type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              <Select value={form.type} onValueChange={(v) => update("type", v)}>
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Qo'shish
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
