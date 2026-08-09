"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
type Difficulty = "BASIC" | "INTERMEDIATE" | "ADVANCED";

interface Question {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  stem: string;
  options: string[] | null;
  answer: unknown;
  explanation: string | null;
  isActive: boolean;
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  BASIC: "Oson",
  INTERMEDIATE: "O'rta",
  ADVANCED: "Qiyin",
};

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  BASIC: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INTERMEDIATE: "bg-amber-50 text-amber-700 border-amber-200",
  ADVANCED: "bg-red-50 text-red-700 border-red-200",
};

const TYPE_LABEL: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "Ko'p tanlov",
  TRUE_FALSE: "Ha/Yo'q",
  SHORT_ANSWER: "Qisqa javob",
};

// ─── Add/Edit form ───────────────────────────────────────────

interface FormState {
  type: QuestionType;
  difficulty: Difficulty;
  stem: string;
  options: [string, string, string, string];
  answerMc: string;
  answerTf: "true" | "false";
  answerSa: string;
  explanation: string;
}

const DEFAULT_FORM: FormState = {
  type: "MULTIPLE_CHOICE",
  difficulty: "BASIC",
  stem: "",
  options: ["", "", "", ""],
  answerMc: "0",
  answerTf: "true",
  answerSa: "",
  explanation: "",
};

function buildPayload(form: FormState) {
  if (form.type === "MULTIPLE_CHOICE") {
    return {
      type: form.type,
      difficulty: form.difficulty,
      stem: form.stem,
      options: form.options,
      answer: form.answerMc,
      explanation: form.explanation || undefined,
    };
  }
  if (form.type === "TRUE_FALSE") {
    return {
      type: form.type,
      difficulty: form.difficulty,
      stem: form.stem,
      answer: form.answerTf === "true",
      explanation: form.explanation || undefined,
    };
  }
  return {
    type: form.type,
    difficulty: form.difficulty,
    stem: form.stem,
    answer: form.answerSa,
    explanation: form.explanation || undefined,
  };
}

function formFromQuestion(q: Question): FormState {
  const base: FormState = { ...DEFAULT_FORM };
  base.type = q.type;
  base.difficulty = q.difficulty;
  base.stem = q.stem;
  base.explanation = q.explanation ?? "";

  if (q.type === "MULTIPLE_CHOICE" && Array.isArray(q.options)) {
    base.options = [
      q.options[0] ?? "",
      q.options[1] ?? "",
      q.options[2] ?? "",
      q.options[3] ?? "",
    ];
    base.answerMc = String(q.answer ?? "0");
  } else if (q.type === "TRUE_FALSE") {
    base.answerTf = q.answer ? "true" : "false";
  } else {
    base.answerSa = String(q.answer ?? "");
  }
  return base;
}

function QuestionForm({
  topicId,
  initial,
  questionId,
  onClose,
}: {
  topicId: string;
  initial?: Question;
  questionId?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    initial ? formFromQuestion(initial) : DEFAULT_FORM
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateOpt(idx: number, val: string) {
    setForm((prev) => {
      const opts = [...prev.options] as [string, string, string, string];
      opts[idx] = val;
      return { ...prev, options: opts };
    });
  }

  async function handleSubmit() {
    if (!form.stem.trim()) { setError("Savol matni kerak"); return; }
    if (form.type === "MULTIPLE_CHOICE" && form.options.some((o) => !o.trim())) {
      setError("Barcha 4 ta variant to'ldirilishi kerak");
      return;
    }
    setError("");
    setLoading(true);
    const payload = buildPayload(form);
    const url = questionId ? `/api/questions/${questionId}` : `/api/topics/${topicId}/questions`;
    const method = questionId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] ?? "Xatolik yuz berdi");
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Tur</Label>
          <Select
            value={form.type}
            onValueChange={(v) => setForm((p) => ({ ...p, type: v as QuestionType }))}
            disabled={!!questionId}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MULTIPLE_CHOICE">Ko'p tanlov</SelectItem>
              <SelectItem value="TRUE_FALSE">Ha/Yo'q</SelectItem>
              <SelectItem value="SHORT_ANSWER">Qisqa javob</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Daraja</Label>
          <Select
            value={form.difficulty}
            onValueChange={(v) => setForm((p) => ({ ...p, difficulty: v as Difficulty }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BASIC">Oson</SelectItem>
              <SelectItem value="INTERMEDIATE">O'rta</SelectItem>
              <SelectItem value="ADVANCED">Qiyin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Savol matni</Label>
        <Textarea
          placeholder="Savolingizni yozing..."
          value={form.stem}
          onChange={(e) => setForm((p) => ({ ...p, stem: e.target.value }))}
          rows={3}
        />
      </div>

      {form.type === "MULTIPLE_CHOICE" && (
        <div className="space-y-2">
          <Label>Variantlar (to'g'ri javobni belgilang)</Label>
          {form.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={form.answerMc === String(i)}
                onChange={() => setForm((p) => ({ ...p, answerMc: String(i) }))}
                className="shrink-0"
              />
              <Input
                placeholder={`${i + 1}-variant`}
                value={opt}
                onChange={(e) => updateOpt(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {form.type === "TRUE_FALSE" && (
        <div className="space-y-1.5">
          <Label>To'g'ri javob</Label>
          <Select
            value={form.answerTf}
            onValueChange={(v) => setForm((p) => ({ ...p, answerTf: v as "true" | "false" }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Ha (To'g'ri)</SelectItem>
              <SelectItem value="false">Yo'q (Noto'g'ri)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {form.type === "SHORT_ANSWER" && (
        <div className="space-y-1.5">
          <Label>Kutilgan javob</Label>
          <Input
            placeholder="To'g'ri javob matni"
            value={form.answerSa}
            onChange={(e) => setForm((p) => ({ ...p, answerSa: e.target.value }))}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Izoh (ixtiyoriy)</Label>
        <Textarea
          placeholder="Nima uchun bu javob to'g'ri..."
          value={form.explanation}
          onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))}
          rows={2}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Bekor</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saqlanmoqda..." : questionId ? "Saqlash" : "Qo'shish"}
        </Button>
      </div>
    </div>
  );
}

// ─── Add Button ──────────────────────────────────────────────

export function AddQuestionDialog({ topicId }: { topicId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> Savol qo'shish
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Yangi savol</DialogTitle></DialogHeader>
        <QuestionForm topicId={topicId} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

// ─── Question list ───────────────────────────────────────────

export function QuestionList({
  questions,
  topicId,
}: {
  questions: Question[];
  topicId: string;
}) {
  const router = useRouter();
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);

  async function handleToggle(q: Question) {
    await fetch(`/api/questions/${q.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !q.isActive }),
    });
    router.refresh();
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-500 text-sm">Hali savollar yo'q. "Savol qo'shish" yoki AI orqali yarating.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {questions.map((q, idx) => (
          <Card key={q.id} className={cn(!q.isActive && "opacity-50")}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-xs text-slate-400 shrink-0 mt-1 w-6 text-right">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs text-slate-500">{TYPE_LABEL[q.type]}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full border font-medium",
                      DIFFICULTY_COLOR[q.difficulty]
                    )}>
                      {DIFFICULTY_LABEL[q.difficulty]}
                    </span>
                    {!q.isActive && (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Nofaol
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-900 line-clamp-2">{q.stem}</p>
                  {q.type === "MULTIPLE_CHOICE" && Array.isArray(q.options) && (
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {q.options.map((opt, i) => (
                        <p key={i} className={cn(
                          "text-xs px-2 py-1 rounded",
                          String(q.answer) === String(i)
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : "text-slate-500"
                        )}>
                          {i + 1}. {opt}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-slate-600"
                    onClick={() => handleToggle(q)}
                    title={q.isActive ? "Nofaol qilish" : "Faollashtirish"}
                  >
                    {q.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-blue-600"
                    onClick={() => setEditQuestion(q)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit dialog */}
      {editQuestion && (
        <Dialog open={!!editQuestion} onOpenChange={(o) => !o && setEditQuestion(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Savolni tahrirlash</DialogTitle></DialogHeader>
            <QuestionForm
              topicId={topicId}
              initial={editQuestion}
              questionId={editQuestion.id}
              onClose={() => setEditQuestion(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
