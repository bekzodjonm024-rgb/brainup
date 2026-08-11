"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function AddUniversityForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", shortName: "", city: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/universities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Xatolik yuz berdi");
      return;
    }
    setForm({ name: "", shortName: "", city: "" });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Yangi universitet qo'shish</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Nomi *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="To'liq nomi"
              className="h-9 w-64"
              required
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Qisqa nomi</Label>
            <Input
              value={form.shortName}
              onChange={(e) => setForm((p) => ({ ...p, shortName: e.target.value }))}
              placeholder="NamDPI"
              className="h-9 w-28"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Shahar</Label>
            <Input
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              placeholder="Namangan"
              className="h-9 w-32"
            />
          </div>
          <Button type="submit" size="sm" disabled={loading} className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Qo'shish
          </Button>
          {error && <p className="text-xs text-red-500 w-full">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}

export function AddFacultyForm({ universityId, universityName }: { universityId: string; universityName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`/api/admin/universities/${universityId}/faculties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Xatolik");
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`${universityName} — yangi fakultet`}
        className="h-8 text-xs flex-1"
        required
      />
      <Button type="submit" size="sm" variant="outline" disabled={loading} className="h-8 text-xs">
        <Plus className="h-3.5 w-3.5 mr-1" />
        Fakultet
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
