"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, User, Lock, GraduationCap, BadgeCheck } from "lucide-react";

interface ProfileSettingsProps {
  role: "STUDENT" | "PROFESSOR";
  firstName: string;
  lastName: string;
  title?: string | null;
  yearLevel?: number;
  groupName?: string | null;
}

function SaveButton({ loading, saved }: { loading: boolean; saved: boolean }) {
  return (
    <Button type="submit" size="sm" disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : saved ? <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-500" /> : null}
      {saved ? "Saqlandi" : "Saqlash"}
    </Button>
  );
}

export function ProfileSettings({ role, firstName, lastName, title, yearLevel, groupName }: ProfileSettingsProps) {
  const router = useRouter();

  // --- Name form ---
  const [nameForm, setNameForm] = useState({ firstName, lastName });
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  async function saveNameForm(e: React.FormEvent) {
    e.preventDefault();
    setNameLoading(true); setNameError(""); setNameSaved(false);
    const res = await fetch("/api/profile/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: nameForm.firstName, lastName: nameForm.lastName }),
    });
    setNameLoading(false);
    if (res.ok) { setNameSaved(true); router.refresh(); setTimeout(() => setNameSaved(false), 3000); }
    else { const d = await res.json(); setNameError(d.error ?? "Xato"); }
  }

  // --- Title form (professor) ---
  const [titleVal, setTitleVal] = useState(title ?? "");
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleSaved, setTitleSaved] = useState(false);
  const [titleError, setTitleError] = useState("");

  async function saveTitleForm(e: React.FormEvent) {
    e.preventDefault();
    setTitleLoading(true); setTitleError(""); setTitleSaved(false);
    const res = await fetch("/api/profile/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleVal }),
    });
    setTitleLoading(false);
    if (res.ok) { setTitleSaved(true); router.refresh(); setTimeout(() => setTitleSaved(false), 3000); }
    else { const d = await res.json(); setTitleError(d.error ?? "Xato"); }
  }

  // --- Student info form ---
  const [infoForm, setInfoForm] = useState({ yearLevel: yearLevel ?? 1, groupName: groupName ?? "" });
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);
  const [infoError, setInfoError] = useState("");

  async function saveInfoForm(e: React.FormEvent) {
    e.preventDefault();
    setInfoLoading(true); setInfoError(""); setInfoSaved(false);
    const res = await fetch("/api/profile/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ yearLevel: Number(infoForm.yearLevel), groupName: infoForm.groupName }),
    });
    setInfoLoading(false);
    if (res.ok) { setInfoSaved(true); router.refresh(); setTimeout(() => setInfoSaved(false), 3000); }
    else { const d = await res.json(); setInfoError(d.error ?? "Xato"); }
  }

  // --- Password form ---
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  async function savePwForm(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { setPwError("Yangi parollar mos kelmadi"); return; }
    setPwLoading(true); setPwError(""); setPwSaved(false);
    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
    });
    setPwLoading(false);
    if (res.ok) { setPwSaved(true); setPwForm({ current: "", newPw: "", confirm: "" }); setTimeout(() => setPwSaved(false), 3000); }
    else { const d = await res.json(); setPwError(d.error ?? "Xato"); }
  }

  return (
    <div className="space-y-4">
      {/* Name */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" /> Ism-familiya
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveNameForm} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Ism</Label>
                <Input id="firstName" value={nameForm.firstName}
                  onChange={e => setNameForm(p => ({ ...p, firstName: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Familiya</Label>
                <Input id="lastName" value={nameForm.lastName}
                  onChange={e => setNameForm(p => ({ ...p, lastName: e.target.value }))} required />
              </div>
            </div>
            {nameError && <p className="text-xs text-red-500">{nameError}</p>}
            <SaveButton loading={nameLoading} saved={nameSaved} />
          </form>
        </CardContent>
      </Card>

      {/* Professor title */}
      {role === "PROFESSOR" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-slate-500" /> Ilmiy unvon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveTitleForm} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="title">Unvon</Label>
                <Input id="title" value={titleVal}
                  onChange={e => setTitleVal(e.target.value)}
                  placeholder="Masalan: Dr., Prof., Dots." />
              </div>
              {titleError && <p className="text-xs text-red-500">{titleError}</p>}
              <SaveButton loading={titleLoading} saved={titleSaved} />
            </form>
          </CardContent>
        </Card>
      )}

      {/* Student info */}
      {role === "STUDENT" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-slate-500" /> O'quv ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveInfoForm} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="yearLevel">Kurs (yil)</Label>
                  <Input id="yearLevel" type="number" min={1} max={6}
                    value={infoForm.yearLevel}
                    onChange={e => setInfoForm(p => ({ ...p, yearLevel: Number(e.target.value) }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="groupName">Guruh nomi</Label>
                  <Input id="groupName" value={infoForm.groupName}
                    onChange={e => setInfoForm(p => ({ ...p, groupName: e.target.value }))}
                    placeholder="Masalan: MT-21" />
                </div>
              </div>
              {infoError && <p className="text-xs text-red-500">{infoError}</p>}
              <SaveButton loading={infoLoading} saved={infoSaved} />
            </form>
          </CardContent>
        </Card>
      )}

      {/* Password */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-500" /> Parolni o'zgartirish
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePwForm} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="currentPw">Joriy parol</Label>
              <Input id="currentPw" type="password" value={pwForm.current}
                onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="newPw">Yangi parol</Label>
                <Input id="newPw" type="password" value={pwForm.newPw}
                  onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                  placeholder="Kamida 6 ta belgi" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPw">Tasdiqlash</Label>
                <Input id="confirmPw" type="password" value={pwForm.confirm}
                  onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required />
              </div>
            </div>
            {pwError && <p className="text-xs text-red-500">{pwError}</p>}
            <SaveButton loading={pwLoading} saved={pwSaved} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
