import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { toCSVRow } from "@/lib/research/anonymize";

type ExportType = "events" | "mastery" | "attempts" | "interventions";

function anonId(researchId: string | null, studentId: string): string {
  return researchId ?? `ANON-${studentId.slice(0, 8)}`;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.profileId || session.user.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") ?? "events") as ExportType;
  const courseId = searchParams.get("courseId") ?? undefined;

  const professorId = session.user.profileId;

  // Get course IDs belonging to this professor
  const courses = await db.course.findMany({
    where: { professorId, ...(courseId ? { id: courseId } : {}) },
    select: { id: true },
  });
  const courseIds = courses.map((c) => c.id);

  if (courseIds.length === 0) {
    return new NextResponse("researchId,note\n,Ma'lumot topilmadi", {
      headers: csvHeaders("empty"),
    });
  }

  // Get student IDs enrolled in these courses
  const enrollments = await db.enrollment.findMany({
    where: { courseId: { in: courseIds } },
    include: { student: { select: { id: true, researchId: true } } },
  });

  const studentResearchMap = new Map<string, string | null>();
  for (const e of enrollments) {
    studentResearchMap.set(e.student.id, e.student.researchId);
  }
  const studentIds = Array.from(studentResearchMap.keys());

  let csv = "";

  if (type === "events") {
    const events = await db.learningEvent.findMany({
      where: { studentId: { in: studentIds } },
      orderBy: { createdAt: "asc" },
      select: {
        studentId: true, eventType: true, topicId: true,
        courseId: true, payload: true, createdAt: true,
      },
    });

    csv = [
      toCSVRow(["researchId", "eventType", "topicId", "courseId", "payload", "createdAt"]),
      ...events.map((e) =>
        toCSVRow([
          anonId(studentResearchMap.get(e.studentId) ?? null, e.studentId),
          e.eventType, e.topicId ?? "", e.courseId ?? "",
          e.payload ? JSON.stringify(e.payload) : "",
          e.createdAt.toISOString(),
        ])
      ),
    ].join("\n");

  } else if (type === "mastery") {
    const knowledge = await db.learnerKnowledge.findMany({
      where: { studentId: { in: studentIds } },
      orderBy: { updatedAt: "asc" },
      select: {
        studentId: true, topicId: true,
        masteryScore: true, recentAccuracy: true, historicalAccuracy: true,
        retrievalScore: true, consistencyScore: true,
        attempts: true, correctAttempts: true,
        lastPracticedAt: true, lastRetrievedAt: true, updatedAt: true,
      },
    });

    csv = [
      toCSVRow([
        "researchId", "topicId",
        "masteryScore", "recentAccuracy", "historicalAccuracy",
        "retrievalScore", "consistencyScore",
        "attempts", "correctAttempts",
        "lastPracticedAt", "lastRetrievedAt", "updatedAt",
      ]),
      ...knowledge.map((k) =>
        toCSVRow([
          anonId(studentResearchMap.get(k.studentId) ?? null, k.studentId),
          k.topicId,
          k.masteryScore.toFixed(4), k.recentAccuracy.toFixed(4),
          k.historicalAccuracy.toFixed(4), k.retrievalScore.toFixed(4),
          k.consistencyScore.toFixed(4),
          k.attempts, k.correctAttempts,
          k.lastPracticedAt?.toISOString() ?? "",
          k.lastRetrievedAt?.toISOString() ?? "",
          k.updatedAt.toISOString(),
        ])
      ),
    ].join("\n");

  } else if (type === "attempts") {
    const attempts = await db.attempt.findMany({
      where: {
        studentId: { in: studentIds },
        question: { topicId: { in: await db.topic.findMany({ where: { courseId: { in: courseIds } }, select: { id: true } }).then((t) => t.map((x) => x.id)) } },
      },
      orderBy: { createdAt: "asc" },
      select: {
        studentId: true, questionId: true,
        question: { select: { topicId: true, difficulty: true, type: true } },
        isCorrect: true, responseTimeMs: true, createdAt: true,
      },
    });

    csv = [
      toCSVRow(["researchId", "questionId", "topicId", "difficulty", "questionType", "isCorrect", "responseTimeMs", "createdAt"]),
      ...attempts.map((a) =>
        toCSVRow([
          anonId(studentResearchMap.get(a.studentId) ?? null, a.studentId),
          a.questionId, a.question.topicId,
          a.question.difficulty, a.question.type,
          a.isCorrect ? "1" : "0",
          a.responseTimeMs ?? "",
          a.createdAt.toISOString(),
        ])
      ),
    ].join("\n");

  } else if (type === "interventions") {
    const interventions = await db.intervention.findMany({
      where: {
        studentId: { in: studentIds },
        topic: { courseId: { in: courseIds } },
      },
      orderBy: { createdAt: "asc" },
      select: {
        studentId: true, topicId: true,
        action: true, reason: true, createdAt: true,
      },
    });

    csv = [
      toCSVRow(["researchId", "topicId", "action", "reason", "createdAt"]),
      ...interventions.map((i) =>
        toCSVRow([
          anonId(studentResearchMap.get(i.studentId) ?? null, i.studentId),
          i.topicId, i.action, i.reason ?? "",
          i.createdAt.toISOString(),
        ])
      ),
    ].join("\n");
  }

  const filename = `brainup_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, { headers: csvHeaders(filename) });
}

function csvHeaders(filename: string) {
  return {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store",
  };
}
