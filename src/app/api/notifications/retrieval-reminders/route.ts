import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { resend, isEmailEnabled } from "@/lib/email/client";
import { retrievalReminder } from "@/lib/email/templates";

// POST /api/notifications/retrieval-reminders
// Professor or admin triggers this to send reminder emails to students with due retrievals.
// Optional body: { courseId } — limit to a specific course's students.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["PROFESSOR", "ADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  if (!isEmailEnabled()) {
    return NextResponse.json({ error: "Email xizmati sozlanmagan (RESEND_API_KEY yo'q)" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const courseId = body.courseId as string | undefined;

  const now = new Date();

  // Find all students with pending due retrievals
  const dueRecords = await db.retrievalRecord.findMany({
    where: {
      status: "PENDING",
      dueAt: { lte: now },
      ...(courseId
        ? { topic: { courseId } }
        : session.user.role === "PROFESSOR" && session.user.profileId
        ? { topic: { course: { professorId: session.user.profileId } } }
        : {}),
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          user: { select: { email: true } },
        },
      },
      topic: {
        select: {
          title: true,
          course: { select: { title: true } },
        },
      },
    },
  });

  // Group by student
  const byStudent = new Map<
    string,
    {
      studentName: string;
      email: string;
      topics: { title: string; courseTitle: string }[];
    }
  >();

  for (const record of dueRecords) {
    const sid = record.student.id;
    if (!byStudent.has(sid)) {
      byStudent.set(sid, {
        studentName: record.student.firstName,
        email: record.student.user.email,
        topics: [],
      });
    }
    byStudent.get(sid)!.topics.push({
      title: record.topic.title,
      courseTitle: record.topic.course.title,
    });
  }

  const appUrl = process.env.NEXTAUTH_URL ?? "https://brainup-ndpi.vercel.app";
  let sent = 0;
  let failed = 0;

  for (const { studentName, email, topics } of byStudent.values()) {
    try {
      await resend!.emails.send({
        to: email,
        ...retrievalReminder({ studentName, dueTopics: topics, loginUrl: appUrl }),
      });
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({
    message: `${sent} ta talabaga eslatma yuborildi`,
    sent,
    failed,
    totalStudents: byStudent.size,
  });
}
