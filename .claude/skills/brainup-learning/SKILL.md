# BrainUP Learning Engine

Complete reference for the mastery system, adaptive engine, practice sessions, and retrieval (spaced repetition). Read before touching any of these modules.

## Module Locations

```
src/lib/modules/
├── mastery/
│   ├── calculator.ts    — calculateMastery(), updateRecentAccuracy() (EMA)
│   └── updater.ts       — updateLearnerKnowledge() — DB update + retrieval scheduling
├── adaptive/
│   └── engine.ts        — decideNextAction() → CONTINUE/PRACTICE/RETRIEVE/etc.
├── learning/
│   └── question-selector.ts — selectNextQuestion() with wrong+difficulty priority
└── retrieval/
    └── scheduler.ts     — computeNextDue() spaced repetition intervals
```

## Mastery Formula

```typescript
// src/lib/modules/mastery/calculator.ts
mastery = 0.40 × recentAccuracy    // last 10 attempts, EMA-weighted
         + 0.25 × historicalAccuracy // all-time accuracy
         + 0.20 × retrievalScore    // avg retrieval performance
         + 0.15 × consistencyScore  // low variance in recent attempts

// EMA (Exponential Moving Average) — alpha = 0.3
function updateRecentAccuracy(current: number, newCorrect: boolean): number {
  const alpha = 0.3;
  return alpha * (newCorrect ? 1 : 0) + (1 - alpha) * current;
}
```

## LearnerKnowledge DB Model

```prisma
model LearnerKnowledge {
  id                  String   @id @default(cuid())
  studentId           String
  topicId             String
  masteryScore        Float    @default(0)
  recentAccuracy      Float    @default(0)
  historicalAccuracy  Float    @default(0)
  retrievalScore      Float    @default(0)
  consistencyScore    Float    @default(0)
  attemptCount        Int      @default(0)
  lastPracticedAt     DateTime?
  @@unique([studentId, topicId])
}
```

## Adaptive Decisions

```typescript
// src/lib/modules/adaptive/engine.ts
type AdaptiveDecision =
  | "CONTINUE"           // Keep learning content — mastery < 0.60
  | "PRACTICE"           // Do more practice — 0.60 ≤ mastery < 0.85
  | "EXPLAIN_AGAIN"      // Accuracy too low — show content again
  | "PREREQUISITE"       // Prerequisites not met — go back
  | "RETRIEVE"           // Mastery ≥ 0.85 — schedule retrieval
  | "ADVANCED_PRACTICE"; // Mastery ≥ 0.85 — harder questions

// Decision thresholds
const MASTERY_PRACTICE_THRESHOLD = 0.60;
const MASTERY_RETRIEVE_THRESHOLD = 0.85;
const RECENT_ACCURACY_EXPLAIN = 0.40; // trigger EXPLAIN_AGAIN if < 40%
```

## Practice Session Flow

```
GET /api/practice/next?topicId={id}
  → selectNextQuestion(): wrong answers first, then by difficulty
  → Returns { question, options, questionIndex, totalQuestions }

POST /api/practice/answer
  Body: { questionId, answerId, topicId, timeTaken }
  → Check answer → update PracticeAttempt → updateLearnerKnowledge()
  → Returns { correct, correctAnswerId, explanation, masteryDelta }

// After 10 questions (or topic complete):
GET /api/learning/next-action?topicId={id}
  → Returns { decision, masteryScore, message, actionHref }
  → Redirects user to /topics/[topicId]/result
```

## Question Selector Priority

```typescript
// src/lib/modules/learning/question-selector.ts
// Priority order:
// 1. Questions answered incorrectly before (wrong first)
// 2. Questions never attempted
// 3. Questions by difficulty (ascending when mastery < 0.5, descending when > 0.7)
// 4. Exclude recently correct answers (last 3 sessions)

function selectNextQuestion(
  questions: Question[],
  attempts: PracticeAttempt[],
  mastery: number
): Question
```

## Retrieval (Spaced Repetition) Flow

```
// When mastery ≥ 0.85: updater.ts auto-creates RetrievalRecord
// Intervals: first review after 3 days, then 7, 14, 30 days
// src/lib/modules/retrieval/scheduler.ts

function computeNextDue(attemptCount: number): Date {
  const intervals = [3, 7, 14, 30]; // days
  const days = intervals[Math.min(attemptCount, intervals.length - 1)];
  return addDays(new Date(), days);
}
```

### Retrieval Session Flow
```
/retrieval                     → List: due today, upcoming, completed
/retrieval/[topicId]?recordId= → Retrieval session (same Q&A UI as practice)

POST /api/retrieval/complete
  Body: { recordId, topicId, score }
  → Updates RetrievalRecord.completedAt, score, schedules next due date
  → Updates retrievalScore in LearnerKnowledge
```

## RetrievalRecord DB Model

```prisma
model RetrievalRecord {
  id           String    @id @default(cuid())
  studentId    String
  topicId      String
  dueDate      DateTime
  completedAt  DateTime?
  score        Float?    // 0.0–1.0 on completion
  attemptCount Int       @default(0)
  createdAt    DateTime  @default(now())
}
```

## AI Question Generation (Sprint 8)

```typescript
// POST /api/ai/generate-questions
// Body: { contentId } — generates MCQ from approved content text
// Uses Claude Haiku: src/lib/ai/client.ts

// POST /api/ai/save-questions
// Body: { topicId, questions: GeneratedQuestion[] }
// Saves to Question + Answer tables

// POST /api/ai/generate-feedback
// Body: { questionId, answerId, studentAnswer }
// Returns per-answer explanation string
```

## Student Topic Page Structure

```
/topics/[topicId]
├── Approved content list (text/file)
├── MasteryBreakdown component (4 sub-scores)
├── Adaptive decision banner (from GET /api/learning/next-action)
└── "Amaliyot boshlash" button → /topics/[topicId]/practice
```

## MasteryBreakdown Component

```tsx
// src/components/shared/mastery-badge.tsx
// Shows current mastery % with color coding

function MasteryBadge({ score }: { score: number }) {
  const config =
    score >= 0.85 ? { label: "Ustuvor", color: "emerald" } :
    score >= 0.60 ? { label: "Yaxshi", color: "blue" } :
    score >= 0.40 ? { label: "O'rganmoqda", color: "amber" } :
                    { label: "Boshlang'ich", color: "red" };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
      bg-${config.color}-100 text-${config.color}-700
      dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
      {Math.round(score * 100)}% · {config.label}
    </span>
  );
}
```

## Practice UI (Client Component)

```tsx
// /topics/[topicId]/practice → src/app/(student)/topics/[topicId]/practice/page.tsx
// Key UI rules:
// - Show question text prominently
// - 4 answer options as cards (not radio buttons)
// - Selected option highlighted blue, correct=emerald, wrong=red after submit
// - Show AI explanation after answer revealed
// - Progress bar: currentQuestion / totalQuestions
// - "Keyingi savol" button after answer revealed
```

## Result Page (Adaptive Decision Display)

```tsx
// /topics/[topicId]/result
// Shows: mastery score, decision type, actionable message, CTA button

const decisionMessages = {
  CONTINUE:          { title: "Davom eting!", msg: "Kontent bilan tanishishni davom eting", href: `/topics/${id}` },
  PRACTICE:          { title: "Amaliyot vaqti", msg: "Ko'proq mashq qiling", href: `/topics/${id}/practice` },
  RETRIEVE:          { title: "Zo'r natija!", msg: "Qaytarish vaqti keldi", href: `/retrieval` },
  ADVANCED_PRACTICE: { title: "Mukammal!", msg: "Qiyinroq savollarni sinab ko'ring", href: `/topics/${id}/practice` },
  EXPLAIN_AGAIN:     { title: "Qayta o'qing", msg: "Materialni yana bir bor ko'rib chiqing", href: `/topics/${id}` },
  PREREQUISITE:      { title: "Old bilimlar kerak", msg: "Avval asoslarni o'rganing", href: `/courses/${courseId}` },
};
```
