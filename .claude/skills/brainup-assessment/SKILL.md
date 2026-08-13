# BRAINUP COGNITIVE ASSESSMENT UX

Assessment screens must minimize cognitive distraction.

Priority:

TASK
↓
INSTRUCTION
↓
ACTION
↓
PROGRESS
↓
FEEDBACK

During assessment avoid:

- unnecessary navigation
- advertisements
- unrelated statistics
- excessive decoration
- distracting animations

Always communicate:

- current task
- instruction
- progress
- remaining steps
- what happens next

Use clear feedback.

Loading states should explain what is happening.

Error states should be calm and actionable.

Never make users guess what to do.

Assessment results should translate raw data into understandable insights.

Avoid presenting psychological or cognitive metrics as absolute judgments about a person's ability.

Use supportive, non-stigmatizing language.

---

# ENGINE REFERENCE

Complete reference for the cognitive assessment system. Read before modifying assessment tasks, scoring, or the assessment flow.

## Architecture Overview

```
/assessment                → Landing page (start button)
/assessment/[sessionId]    → Interactive runner (client component)
  ├── ReactionTimeTask     → tasks/reaction-time-task.tsx
  ├── DigitSpanTask        → tasks/digit-span-task.tsx
  ├── AttentionCPTTask     → tasks/attention-cpt-task.tsx
  └── WordRecognitionTask  → tasks/word-recognition-task.tsx
```

## API Flow

```
POST /api/assessment/start
  → Creates AssessmentSession, generates task sequence
  → Returns { sessionId }

GET /api/assessment/[sessionId]
  → Returns current session state: tasks[], currentIndex, status

POST /api/assessment/[sessionId]/answer
  → Records RawResponse for current task
  → Returns { nextTask } or { complete: true }

POST /api/assessment/[sessionId]/complete
  → Runs scoreAssessment() → saves CognitiveProfile
  → Returns { profile: CognitiveProfile }
```

## Task Categories & Types

```typescript
// src/lib/modules/assessment/types.ts

type TaskCategory =
  | "ATTENTION"          // dikkat
  | "WORKING_MEMORY"     // ish xotirasi
  | "PROCESSING_SPEED"   // qayta ishlash tezligi
  | "RECOGNITION_MEMORY"; // tanib olish xotirasi

type TaskType =
  | "REACTION_TIME"      // → PROCESSING_SPEED
  | "DIGIT_SPAN"         // → WORKING_MEMORY
  | "ATTENTION_CPT"      // → ATTENTION
  | "WORD_RECOGNITION";  // → RECOGNITION_MEMORY
```

## Scoring Formulas

### ReactionTime → Processing Speed
```typescript
// Correct hits only, excluding outliers (< 150ms or > 2000ms)
const validRTs = responses.filter(r => r.correct && r.rt > 150 && r.rt < 2000).map(r => r.rt);
const meanRT = validRTs.reduce((a, b) => a + b) / validRTs.length;
// Score: faster = higher. Normalize: 300ms=1.0, 800ms=0.0
const score = Math.max(0, Math.min(1, (800 - meanRT) / 500));
```

### DigitSpan → Working Memory
```typescript
// Longest span correctly recalled
const maxSpan = Math.max(...responses.filter(r => r.correct).map(r => r.spanLength));
// Score: span 3=0.0, span 9=1.0
const score = Math.max(0, Math.min(1, (maxSpan - 3) / 6));
```

### AttentionCPT → Attention
```typescript
// d-prime calculation: hits vs false alarms
const hitRate = hits / totalTargets;
const faRate = falseAlarms / totalNonTargets;
// Clamp to avoid ±Infinity in z-score
const dPrime = zScore(Math.max(0.01, hitRate)) - zScore(Math.min(0.99, faRate));
const score = Math.max(0, Math.min(1, dPrime / 4)); // normalize: d'=4 → 1.0
```

### WordRecognition → Recognition Memory
```typescript
const correct = responses.filter(r => r.correct).length;
const score = correct / responses.length; // simple accuracy
```

## CognitiveProfile DB Model

```prisma
model CognitiveProfile {
  id               String   @id @default(cuid())
  studentId        String   @unique
  attentionScore   Float    // 0.0 – 1.0
  workingMemory    Float
  processingSpeed  Float
  recognitionMemory Float
  assessedAt       DateTime @default(now())
  student          StudentProfile @relation(fields: [studentId], references: [id])
}
```

## Task Component Interface

All task components follow the same contract:

```typescript
interface TaskProps {
  task: AssessmentTask;        // task config from DB/generated
  onComplete: (responses: RawResponse[]) => void; // called when task done
}

// Each task must be keyed by task ID to force remount between tasks:
<ReactionTimeTask key={currentTask.id} task={currentTask} onComplete={handleComplete} />
```

## CPT Task Rules (important bugs fixed)
- Target letter "X" must appear in **white** (`text-white`), NOT `text-emerald-400` (green) — that was a bug
- Non-target letters also `text-white` — color differentiation is NOT the cue, timing is
- User must press SPACE (or tap) within 600ms for a hit
- Each stimulus shows for 250ms, ISI 750ms

## ReactionTime Task Rules
- Show fixation cross `+` → random delay 500–1500ms → stimulus circle
- Measure RT from stimulus appear to click/tap
- Each component must be keyed: `key={currentTask.id}` — fixes stale state bug where RT from previous task leaked

## DigitSpan Task Rules
- Show digits one-by-one at 800ms each
- User types sequence from memory
- Start at span 4, increase by 1 on correct, stop after 2 consecutive wrong

## WordRecognition Task Rules
- Study phase: 15 words, 2 seconds each
- Distractor phase: 2 minute gap (can be shortened for testing)
- Recognition phase: 30 words (15 studied + 15 new) → old/new judgment

## Cognitive Profile Display (UI)

```tsx
// src/components/shared/cognitive-profile-card.tsx
// Shows 4 metrics with color-coded bars and labels

const metricColors = {
  attention: "violet",
  workingMemory: "blue",
  processingSpeed: "amber",
  recognitionMemory: "emerald",
};

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className={`font-medium text-${color}-600 dark:text-${color}-400`}>
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div
          className={`bg-${color}-500 h-2 rounded-full transition-all`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}
```

## Assessment Session States

```typescript
type SessionStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
```

- Assessment landing page shows "Baholashni boshlash" button
- If student already has a CognitiveProfile: show "Qayta baholash" (retake) option with lighter styling
- Completed session → redirect to `/dashboard` with profile updated

## Adapting Content to Cognitive Profile

After assessment, the adaptive engine uses cognitive scores to modulate:
- **Low attention score** → shorter practice sessions (max 5 questions instead of 10)
- **Low working memory** → simpler question phrasing, smaller digit spans in content
- **Low processing speed** → extended time limits for timed tasks
- **Low recognition memory** → increased retrieval frequency (shorter intervals)

These modulations are applied in `src/lib/modules/adaptive/engine.ts`.
