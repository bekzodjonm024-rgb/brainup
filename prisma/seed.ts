import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // University
  const university = await db.university.upsert({
    where: { id: "ndpi-namangan" },
    update: {},
    create: {
      id: "ndpi-namangan",
      name: "Namangan davlat pedagogika instituti",
      shortName: "NamDPI",
      city: "Namangan",
    },
  });

  // Faculties
  const pedagogy = await db.faculty.upsert({
    where: { id: "pedagogy-faculty" },
    update: {},
    create: {
      id: "pedagogy-faculty",
      name: "Pedagogika fakulteti",
      universityId: university.id,
    },
  });

  // Professor user
  const profPassword = await hash("professor123", 12);
  const profUser = await db.user.upsert({
    where: { email: "professor@ndpi.uz" },
    update: {},
    create: {
      email: "professor@ndpi.uz",
      passwordHash: profPassword,
      role: "PROFESSOR",
      professor: {
        create: {
          firstName: "Aziz",
          lastName: "Karimov",
          title: "Dotsent",
        },
      },
    },
    include: { professor: true },
  });

  // Demo student
  const stuPassword = await hash("student123", 12);
  await db.user.upsert({
    where: { email: "student@ndpi.uz" },
    update: {},
    create: {
      email: "student@ndpi.uz",
      passwordHash: stuPassword,
      role: "STUDENT",
      student: {
        create: {
          firstName: "Sardor",
          lastName: "Rahimov",
          universityId: university.id,
          facultyId: pedagogy.id,
          yearLevel: 2,
          groupName: "P-21",
          researchId: "P0001",
        },
      },
    },
  });

  // Course
  const course = await db.course.upsert({
    where: { id: "ped-mahorat-course" },
    update: {},
    create: {
      id: "ped-mahorat-course",
      professorId: profUser.professor!.id,
      facultyId: pedagogy.id,
      title: "Pedagogik mahorat",
      description: "Pedagogik mahorat asoslari va amaliy ko'nikmalar",
      semester: "2024-2025/1",
    },
  });

  // Topics
  const topicData = [
    { title: "Pedagogik mahorat tushunchasi", objective: "Pedagogik mahorat tushunchasini ta'riflay oladi", order: 0 },
    { title: "Pedagogik qobiliyatlar", objective: "Pedagogik qobiliyatlarning turlarini farqlay oladi", order: 1 },
    { title: "Pedagogik texnika", objective: "Pedagogik texnikani amalda qo'llay oladi", order: 2 },
    { title: "Pedagogik muloqot", objective: "Muloqot shakllari va usullarini izohlay oladi", order: 3 },
    { title: "O'qituvchi imijini shakllantirish", objective: "Professional imij shakllantirishning ahamiyatini tushuntira oladi", order: 4 },
  ];

  for (const t of topicData) {
    await db.topic.upsert({
      where: { id: `${course.id}-topic-${t.order}` },
      update: {},
      create: {
        id: `${course.id}-topic-${t.order}`,
        courseId: course.id,
        title: t.title,
        learningObjective: t.objective,
        orderIndex: t.order,
      },
    });
  }

  // Assessment
  const assessment = await db.assessment.upsert({
    where: { id: "initial-assessment-v1" },
    update: {},
    create: {
      id: "initial-assessment-v1",
      title: "Boshlang'ich kognitiv baholash",
      description: "Diqqat, ishchi xotira, qayta ishlash tezligi va xotira ko'rsatkichlarini o'lchaydi.",
      durationMin: 15,
      version: "1.0",
    },
  });

  // Assessment items
  const assessmentItems = [
    // PROCESSING SPEED — 3 reaction time trials
    {
      id: "item-rt-1",
      category: "PROCESSING_SPEED",
      taskType: "REACTION_TIME",
      prompt: "Yashil doira paydo bo'lganda imkon qadar tezroq bosing.",
      stimuluData: { color: "green", delayRange: [1000, 3000], timeoutMs: 2000 },
      orderIndex: 0,
    },
    {
      id: "item-rt-2",
      category: "PROCESSING_SPEED",
      taskType: "REACTION_TIME",
      prompt: "Yashil doira paydo bo'lganda imkon qadar tezroq bosing.",
      stimuluData: { color: "green", delayRange: [1500, 3500], timeoutMs: 2000 },
      orderIndex: 1,
    },
    {
      id: "item-rt-3",
      category: "PROCESSING_SPEED",
      taskType: "REACTION_TIME",
      prompt: "Yashil doira paydo bo'lganda imkon qadar tezroq bosing.",
      stimuluData: { color: "green", delayRange: [800, 2500], timeoutMs: 2000 },
      orderIndex: 2,
    },
    // WORKING MEMORY — 3 digit span trials
    {
      id: "item-ds-1",
      category: "WORKING_MEMORY",
      taskType: "DIGIT_SPAN",
      prompt: "Raqamlar ketma-ketligini yodlang va tartibda kiriting.",
      stimuluData: { sequence: [3, 7, 2], displayMs: 800, gapMs: 400 },
      orderIndex: 3,
    },
    {
      id: "item-ds-2",
      category: "WORKING_MEMORY",
      taskType: "DIGIT_SPAN",
      prompt: "Raqamlar ketma-ketligini yodlang va tartibda kiriting.",
      stimuluData: { sequence: [8, 1, 4, 6], displayMs: 800, gapMs: 400 },
      orderIndex: 4,
    },
    {
      id: "item-ds-3",
      category: "WORKING_MEMORY",
      taskType: "DIGIT_SPAN",
      prompt: "Raqamlar ketma-ketligini yodlang va tartibda kiriting.",
      stimuluData: { sequence: [5, 9, 2, 7, 3], displayMs: 800, gapMs: 400 },
      orderIndex: 5,
    },
    // ATTENTION — CPT task
    {
      id: "item-cpt-1",
      category: "ATTENTION",
      taskType: "ATTENTION_CPT",
      prompt: "Faqat 'X' harfi ko'ringanda bosing. Boshqa harflar uchun bosmang.",
      stimuluData: {
        targetLetter: "X",
        letters: ["A","B","X","C","X","D","X","E","A","X","B","X","C","D","X","A","X","B","C","X"],
        displayMs: 500,
        itiMs: 300,
      },
      orderIndex: 6,
    },
    // MEMORY — Word recognition
    {
      id: "item-wr-1",
      category: "MEMORY",
      taskType: "WORD_RECOGNITION",
      prompt: "Quyidagi so'zlarni yodlab oling. Keyingi bosqichda ularni tanishingiz kerak bo'ladi.",
      stimuluData: {
        studyWords: ["kitob","qalam","deraza","stol","daraxt","suv","shamol","tosh","ko'z","qo'l"],
        distractors: ["eshik","uy","guldon","tog'","yulduz","qoʻshiq","sabzi","oyna","temir","gul"],
        studyTimeMs: 12000,
      },
      orderIndex: 7,
    },
  ];

  for (const item of assessmentItems) {
    await db.assessmentItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        assessmentId: assessment.id,
        category: item.category,
        taskType: item.taskType,
        prompt: item.prompt,
        stimuluData: item.stimuluData,
        orderIndex: item.orderIndex,
      },
    });
  }

  console.log("Seed completed successfully!");
  console.log("\nDemo accounts:");
  console.log("  Professor: professor@ndpi.uz / professor123");
  console.log("  Student:   student@ndpi.uz   / student123");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
