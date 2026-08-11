import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// ── Word pool for word recognition (40 Uzbek nouns) ──────────────────────────
const WORD_POOL = [
  "kitob", "qalam", "stol", "deraza", "eshik", "oyna", "xona", "qog'oz",
  "daraxt", "gul", "tosh", "suv", "shamol", "tog'", "dengiz", "yulduz",
  "qush", "ot", "havo", "yer", "ko'z", "qo'l", "og'iz", "quloq",
  "burun", "oyoq", "bosh", "yuz", "lab", "tish",
  "bola", "ayol", "erkak", "o'quvchi", "do'st", "ota", "ona", "aka",
  "uka", "singl",
];

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomDigitSequence(length: number): number[] {
  const seq: number[] = [];
  for (let i = 0; i < length; i++) {
    let d: number;
    do { d = Math.floor(Math.random() * 10); }
    while (i > 0 && d === seq[i - 1]); // no consecutive repeats
    seq.push(d);
  }
  return seq;
}

function randomCPTLetters(
  target: string,
  total: number,
  targetRatio: number,
): string[] {
  const nonTargets = ["A", "B", "C", "D", "E", "F", "G", "H"].filter(
    (l) => l !== target,
  );
  const targetCount = Math.round(total * targetRatio);
  const letters: string[] = [
    ...Array(targetCount).fill(target),
    ...Array(total - targetCount)
      .fill(null)
      .map(() => nonTargets[Math.floor(Math.random() * nonTargets.length)]),
  ];
  return letters.sort(() => Math.random() - 0.5);
}

function generateOverrides(
  items: { id: string; taskType: string; stimuluData: unknown }[],
): Record<string, unknown> {
  const overrides: Record<string, unknown> = {};

  for (const item of items) {
    const base = (item.stimuluData ?? {}) as Record<string, unknown>;

    if (item.taskType === "DIGIT_SPAN") {
      const origLen = ((base.sequence as number[]) ?? [3]).length;
      overrides[item.id] = { ...base, sequence: randomDigitSequence(origLen) };
    } else if (item.taskType === "ATTENTION_CPT") {
      const target = (base.targetLetter as string) ?? "X";
      const total = (base.letters as string[] | undefined)?.length ?? 20;
      overrides[item.id] = {
        ...base,
        letters: randomCPTLetters(target, total, 0.3),
      };
    } else if (item.taskType === "WORD_RECOGNITION") {
      const studyWords = pickRandom(WORD_POOL, 10);
      const remaining = WORD_POOL.filter((w) => !studyWords.includes(w));
      const distractors = pickRandom(remaining, 10);
      overrides[item.id] = { ...base, studyWords, distractors };
    }
    // REACTION_TIME: delayRange already uses Math.random() in the client — no override needed
  }

  return overrides;
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const studentId = session.user.profileId;

  // Return existing in-progress session so student can resume
  const existing = await db.assessmentSession.findFirst({
    where: { studentId, status: "IN_PROGRESS" },
  });
  if (existing) return NextResponse.json(existing);

  const assessment = await db.assessment.findFirst({
    where: { isActive: true },
    include: { items: { orderBy: { orderIndex: "asc" } } },
  });
  if (!assessment)
    return NextResponse.json({ error: "Baholash topilmadi" }, { status: 404 });

  const itemOverrides = generateOverrides(assessment.items);

  const assessmentSession = await db.assessmentSession.create({
    data: {
      studentId,
      assessmentId: assessment.id,
      status: "IN_PROGRESS",
      startedAt: new Date(),
      itemOverrides: itemOverrides as Parameters<typeof db.assessmentSession.create>[0]["data"]["itemOverrides"],
    },
  });

  await db.learningEvent.create({
    data: { studentId, eventType: "ASSESSMENT_STARTED" },
  });

  return NextResponse.json(assessmentSession, { status: 201 });
}
