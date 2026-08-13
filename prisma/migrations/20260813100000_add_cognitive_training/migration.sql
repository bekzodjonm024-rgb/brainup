-- AlterTable: add nextDiagnosticAt to students
ALTER TABLE "students" ADD COLUMN "nextDiagnosticAt" TIMESTAMP(3);

-- CreateTable: cognitive_history
CREATE TABLE "cognitive_history" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assessmentSessionId" TEXT,
    "attentionScore" DOUBLE PRECISION NOT NULL,
    "workingMemoryScore" DOUBLE PRECISION NOT NULL,
    "processingSpeedScore" DOUBLE PRECISION NOT NULL,
    "memoryScore" DOUBLE PRECISION NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cognitive_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable: daily_training_plans
CREATE TABLE "daily_training_plans" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "planDate" TIMESTAMP(3) NOT NULL,
    "cycleDay" INTEGER NOT NULL,
    "exercises" JSONB NOT NULL,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_training_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable: training_sessions
CREATE TABLE "training_sessions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cognitive_history_assessmentSessionId_key" ON "cognitive_history"("assessmentSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_training_plans_studentId_planDate_key" ON "daily_training_plans"("studentId", "planDate");

-- AddForeignKey
ALTER TABLE "cognitive_history" ADD CONSTRAINT "cognitive_history_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_training_plans" ADD CONSTRAINT "daily_training_plans_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "daily_training_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
