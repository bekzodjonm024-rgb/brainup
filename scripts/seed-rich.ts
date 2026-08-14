import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// ─── HELPERS ──────────────────────────────────────────────────
type MCQ = { stem: string; options: string[]; answer: string; explanation: string; difficulty: "BASIC" | "INTERMEDIATE" | "ADVANCED" };

async function addContent(topicId: string, title: string, body: string, order: number) {
  return db.contentItem.upsert({
    where: { id: `content-${topicId}-${order}` },
    update: {},
    create: {
      id: `content-${topicId}-${order}`,
      topicId,
      type: "TEXT",
      title,
      body,
      status: "APPROVED",
      orderIndex: order,
    },
  });
}

async function addQuestions(topicId: string, questions: MCQ[]) {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await db.question.upsert({
      where: { id: `q-${topicId}-${i}` },
      update: {},
      create: {
        id: `q-${topicId}-${i}`,
        topicId,
        type: "MULTIPLE_CHOICE",
        difficulty: q.difficulty,
        stem: q.stem,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        tags: [],
        isActive: true,
      },
    });
  }
}

// ─── MAIN ─────────────────────────────────────────────────────
async function main() {
  console.log("Rich seed boshlandi...\n");

  // Mavjud university
  const university = await db.university.findUnique({ where: { id: "ndpi-namangan" } });
  if (!university) throw new Error("University topilmadi — avval 'npm run seed' bajaring");

  // Mavjud pedagogy fakulteti
  const pedagogy = await db.faculty.findUnique({ where: { id: "pedagogy-faculty" } });
  if (!pedagogy) throw new Error("Pedagogika fakulteti topilmadi");

  // ─── FAKULTETLAR ─────────────────────────────────────────────
  const boshlangich = await db.faculty.upsert({
    where: { id: "boshlangich-faculty" },
    update: {},
    create: { id: "boshlangich-faculty", name: "Boshlang'ich ta'lim fakulteti", universityId: university.id },
  });

  const maktabgacha = await db.faculty.upsert({
    where: { id: "maktabgacha-faculty" },
    update: {},
    create: { id: "maktabgacha-faculty", name: "Maktabgacha ta'lim fakulteti", universityId: university.id },
  });

  console.log("✓ Fakultetlar qo'shildi");

  // ─── PROFESSORLAR ────────────────────────────────────────────
  const prof1User = await db.user.findUnique({ where: { email: "professor@ndpi.uz" }, include: { professor: true } });
  if (!prof1User?.professor) throw new Error("Asosiy professor topilmadi");
  const prof1 = prof1User.professor;

  const prof2pass = await hash("professor123", 12);
  const prof2User = await db.user.upsert({
    where: { email: "yusupova@ndpi.uz" },
    update: {},
    create: {
      email: "yusupova@ndpi.uz",
      passwordHash: prof2pass,
      role: "PROFESSOR",
      professor: { create: { firstName: "Nodira", lastName: "Yusupova", title: "Dotsent" } },
    },
    include: { professor: true },
  });
  const prof2 = prof2User.professor!;

  const prof3pass = await hash("professor123", 12);
  const prof3User = await db.user.upsert({
    where: { email: "toshmatov@ndpi.uz" },
    update: {},
    create: {
      email: "toshmatov@ndpi.uz",
      passwordHash: prof3pass,
      role: "PROFESSOR",
      professor: { create: { firstName: "Hamid", lastName: "Toshmatov", title: "Professor" } },
    },
    include: { professor: true },
  });
  const prof3 = prof3User.professor!;

  console.log("✓ Professorlar qo'shildi");

  // ─── KURS 1: PEDAGOGIK MAHORAT — mavjud, faqat kontent va savollar ─────
  const topic1Ids = [
    "ped-mahorat-course-topic-0",
    "ped-mahorat-course-topic-1",
    "ped-mahorat-course-topic-2",
    "ped-mahorat-course-topic-3",
    "ped-mahorat-course-topic-4",
  ];

  // Mavzu 1: Pedagogik mahorat tushunchasi
  await addContent(topic1Ids[0], "Pedagogik mahorat nima?", `
Pedagogik mahorat — bu o'qituvchining professional faoliyatida yuqori samara bilan ishlash qobiliyati bo'lib, u nazariy bilimlar, amaliy ko'nikmalar va shaxsiy sifatlarning uyg'un birligi hisoblanadi.

**Pedagogik mahoratning asosiy tarkibiy qismlari:**

1. **Pedagogik bilimlar** — predmet bo'yicha chuqur bilim, pedagogika va psixologiya asoslari, zamonaviy ta'lim metodlari.

2. **Pedagogik ko'nikmalar** — dars rejalashtirish, materialni tushunarli tushuntirish, talabalar bilan samarali muloqot qilish.

3. **Pedagogik texnika** — ovoz, imo-ishorat, yuz ifodasi, vaqtni to'g'ri boshqarish.

4. **Shaxsiy sifatlar** — sabr-toqat, mas'uliyatlilik, ijodkorlik, empatiya.

**Pedagogik mahoratning darajalari:**

- *Boshlang'ich daraja* — asosiy bilim va ko'nikmalar mavjud, lekin tajriba yetarli emas.
- *O'rta daraja* — mustaqil ravishda samarali dars o'tkazish imkoni bor.
- *Yuqori daraja* — ijodiy yondashish, individual metodlar ishlab chiqish.
- *Mahorat darajasi* — pedagogik innovatsiyalar yaratish, boshqalarga yo'l-yo'riq berish.

Buyuk pedagog A.S. Makarenko ta'kidlaganidek: "O'qituvchi — bu san'atkor, pedagog esa — yaratuvchi." Pedagogik mahorat — doimiy o'z-o'zini takomillashtirish jarayonidir.
`, 0);

  await addQuestions(topic1Ids[0], [
    { stem: "Pedagogik mahorat — bu nima?", options: ["A) O'qituvchining faqat predmet bo'yicha bilimlari", "B) Professional faoliyatda yuqori samara bilan ishlash qobiliyati", "C) Faqat dars o'tkazish texnikasi", "D) Talabalar bilan muloqot qilish ko'nikmasi"], answer: "B) Professional faoliyatda yuqori samara bilan ishlash qobiliyati", explanation: "Pedagogik mahorat — bilimlar, ko'nikmalar va shaxsiy sifatlarning uyg'un birligidir.", difficulty: "BASIC" },
    { stem: "Pedagogik mahoratning nechtа asosiy tarkibiy qismi ajratiladi?", options: ["A) 2 ta", "B) 3 ta", "C) 4 ta", "D) 5 ta"], answer: "C) 4 ta", explanation: "Bilimlar, ko'nikmalar, texnika va shaxsiy sifatlar — jami 4 ta komponent.", difficulty: "BASIC" },
    { stem: "Qaysi pedagog 'O'qituvchi — bu san'atkor' degan fikrni bildirgan?", options: ["A) K.D. Ushinskiy", "B) J.A. Komenskiy", "C) A.S. Makarenko", "D) L.S. Vыgotskiy"], answer: "C) A.S. Makarenko", explanation: "Makarenko o'qituvchini san'atkor, pedagogni yaratuvchi deb ta'riflagan.", difficulty: "BASIC" },
    { stem: "Pedagogik mahoratning 'mahorat darajasi'ga mos keladigan xususiyat qaysi?", options: ["A) Asosiy bilim va ko'nikmalar mavjud", "B) Mustaqil dars o'tkazish imkoni bor", "C) Pedagogik innovatsiyalar yaratish", "D) Tajriba yetarli emas"], answer: "C) Pedagogik innovatsiyalar yaratish", explanation: "Mahorat darajasida o'qituvchi yangi usullar yaratadi va boshqalarga yo'l-yo'riq beradi.", difficulty: "INTERMEDIATE" },
    { stem: "Pedagogik texnika qaysi elementlarni o'z ichiga oladi?", options: ["A) Faqat ovozni boshqarish", "B) Ovoz, imo-ishorat, yuz ifodasi va vaqtni boshqarish", "C) Faqat dars rejasini tuzish", "D) Talabalar bilan muloqot usullari"], answer: "B) Ovoz, imo-ishorat, yuz ifodasi va vaqtni boshqarish", explanation: "Pedagogik texnika — o'qituvchining tashqi ifoda vositalarini o'z ichiga oladi.", difficulty: "INTERMEDIATE" },
    { stem: "Pedagogik mahorat shakllanishining asosiy sharti nima?", options: ["A) Yuqori ish haqi", "B) Doimiy o'z-o'zini takomillashtirish", "C) Ko'p yil ish tajribasi", "D) Zo'r xotira"], answer: "B) Doimiy o'z-o'zini takomillashtirish", explanation: "Pedagogik mahorat — doimiy o'qish va o'z-o'zini takomillashtirish jarayonidir.", difficulty: "INTERMEDIATE" },
    { stem: "Qaysi sifat pedagogik mahoratning shaxsiy sifatlariga kirmaydi?", options: ["A) Sabr-toqat", "B) Ijodkorlik", "C) Qat'iyatlilik", "D) Chiroyli kiyinish"], answer: "D) Chiroyli kiyinish", explanation: "Tashqi ko'rinish mahoratning asosiy sifati emas; sabr, ijodkorlik va mas'uliyatlilik asosiy.", difficulty: "ADVANCED" },
    { stem: "O'qituvchining predmet bo'yicha chuqur bilimi pedagogik mahoratning qaysi tarkibiy qismiga kiradi?", options: ["A) Pedagogik ko'nikmalar", "B) Pedagogik texnika", "C) Pedagogik bilimlar", "D) Shaxsiy sifatlar"], answer: "C) Pedagogik bilimlar", explanation: "Predmet bilimlari pedagogik bilimlar komponentiga kiradi.", difficulty: "ADVANCED" },
  ]);

  // Mavzu 2: Pedagogik qobiliyatlar
  await addContent(topic1Ids[1], "Pedagogik qobiliyatlarning turlari", `
Pedagogik qobiliyatlar — bu o'qituvchining ta'lim-tarbiya jarayonini muvaffaqiyatli amalga oshirishga imkon beruvchi psixologik xususiyatlar majmuidir.

**Asosiy pedagogik qobiliyatlar:**

1. **Didaktik qobiliyat** — materialni tushunarli, qiziqarli va izchil tushuntirish qobiliyati. Bu qobiliyatga ega o'qituvchi murakkab mavzularni oddiy tilda izohlaydi.

2. **Akademik qobiliyat** — o'z fani sohasida bilimlarni doimiy yangilash va chuqurlashtirish qobiliyati.

3. **Kommunikativ qobiliyat** — talabalar, hamkasblar va ota-onalar bilan samarali muloqot o'rnatish.

4. **Organizatorlik qobiliyati** — darsni, guruhni, jarayonni samarali tashkil etish.

5. **Avtoritar qobiliyat** — talabalar hurmatini qozonish va ta'lim jarayoniga yo'naltirish.

6. **Pertseptiv qobiliyat** — talabaning ichki holatini, kayfiyatini his qila olish.

7. **Pedagogik tasavvur** — vaziyatni oldindan ko'ra bilish, natijani bashorat qilish.

**Qobiliyatlarni rivojlantirish yo'llari:**

- Tajribali o'qituvchilarning darslarini kuzatish
- Professional treninglar va seminarlarda qatnashish
- O'z darslarini tahlil qilish (video yozib olish)
- Pedagogik adabiyotlarni muntazam o'qish
`, 0);

  await addQuestions(topic1Ids[1], [
    { stem: "Materialni tushunarli va qiziqarli tushuntirish qobiliyati qanday nomlanadi?", options: ["A) Kommunikativ qobiliyat", "B) Didaktik qobiliyat", "C) Akademik qobiliyat", "D) Organizatorlik qobiliyati"], answer: "B) Didaktik qobiliyat", explanation: "Didaktik qobiliyat — o'qitish, tushuntirish, yetkazish qobiliyatidir.", difficulty: "BASIC" },
    { stem: "O'z fani sohasida bilimlarni doimiy yangilash qanday qobiliyat?", options: ["A) Pertseptiv", "B) Didaktik", "C) Akademik", "D) Avtoritar"], answer: "C) Akademik", explanation: "Akademik qobiliyat — fandagi yangiliklar bilan qadamlab borish.", difficulty: "BASIC" },
    { stem: "Talabaning ichki holatini his qila olish qanday qobiliyat?", options: ["A) Akademik", "B) Pertseptiv", "C) Didaktik", "D) Organizatorlik"], answer: "B) Pertseptiv", explanation: "Pertseptiv qobiliyat — talabaning kayfiyati va holatini sezish.", difficulty: "BASIC" },
    { stem: "Pedagogik qobiliyatlar nechtа asosiy turga bo'linadi?", options: ["A) 4", "B) 5", "C) 6", "D) 7"], answer: "D) 7", explanation: "7 asosiy pedagogik qobiliyat: didaktik, akademik, kommunikativ, organizatorlik, avtoritar, pertseptiv, pedagogik tasavvur.", difficulty: "INTERMEDIATE" },
    { stem: "Qaysi usul pedagogik qobiliyatlarni rivojlantirishda eng samarali?", options: ["A) Ko'p yil kutish", "B) Faqat kitob o'qish", "C) O'z darslarini tahlil qilish", "D) Boshqalarga o'rgatish"], answer: "C) O'z darslarini tahlil qilish", explanation: "Darsni video yozib, keyin tahlil qilish — refleksiya va o'sishning eng to'g'ri yo'li.", difficulty: "INTERMEDIATE" },
    { stem: "Talabalar hurmatini qozonish va yo'naltirish qanday qobiliyat?", options: ["A) Didaktik", "B) Pertseptiv", "C) Avtoritar", "D) Kommunikativ"], answer: "C) Avtoritar", explanation: "Avtoritar qobiliyat — ta'sir o'tkazish va yo'naltirish qobiliyati.", difficulty: "INTERMEDIATE" },
    { stem: "Pedagogik tasavvur qanday qobiliyat?", options: ["A) Materialni tushuntirish", "B) Vaziyatni oldindan ko'ra bilish", "C) Guruhni boshqarish", "D) Muloqot o'rnatish"], answer: "B) Vaziyatni oldindan ko'ra bilish", explanation: "Pedagogik tasavvur — natijani bashorat qila olish qobiliyatidir.", difficulty: "ADVANCED" },
    { stem: "Qaysi qobiliyat bevosita ota-onalar bilan munosabatlarda ko'proq ishlatiladi?", options: ["A) Didaktik", "B) Akademik", "C) Kommunikativ", "D) Pertseptiv"], answer: "C) Kommunikativ", explanation: "Kommunikativ qobiliyat — hamma bilan samarali muloqot o'rnatish.", difficulty: "ADVANCED" },
  ]);

  // Mavzu 3: Pedagogik texnika
  await addContent(topic1Ids[2], "Pedagogik texnika — o'qituvchi san'ati", `
Pedagogik texnika — o'qituvchining o'z xulq-atvorini, ovozini, harakatlarini boshqarish qobiliyatidir. Bu "pedagogik san'at"ning tashqi ko'rinishi.

**Ovoz texnikasi:**
- **Temp** — gapirish tezligi. Muhim fikrlarni sekinroq, misollarni tezroq aytish.
- **Dinamika** — ovoz kuchliligi. Xonaning hajmiga qarab moslashtirish.
- **Intonatsiya** — savol, ta'kidlash, tugatish ohanglari.
- **Pauza** — strategik jimlik. Muhim fikr oldidan va keyin pauza qilish.

**Tana tili (non-verbal muloqot):**
- Ko'z aloqasi — barcha talabalar bilan navbatma-navbat ko'z aloqasi.
- Holat — ochiq poza, oldinga egilish — qiziqish belgisi.
- Imo-ishorat — tabiiy, ortiqcha emas.
- Harakat — doskaga yaqin turmaslik, xonani kezish.

**Vaqtni boshqarish:**
- 45 daqiqa dars: 5 daqiqa motivatsiya, 20 daqiqa yangi mavzu, 15 daqiqa mustahkamlash, 5 daqiqa yakunlash.
- "10 daqiqa chegarasi" — diqqat har 10 daqiqada yangilanadi.

**Xona boshqaruvi:**
- Intizomni musobaqa, qiziqarli topshiriq orqali saqlash.
- Ovoz ko'tarmaslik — sekin gapirish ham intizomni saqlaydi.
`, 0);

  await addQuestions(topic1Ids[2], [
    { stem: "Pedagogik texnikada 'temp' nima?", options: ["A) Ovoz kuchliligi", "B) Gapirish tezligi", "C) Pauza davomiyligi", "D) Intonatsiya turi"], answer: "B) Gapirish tezligi", explanation: "Temp — gapirish sur'ati. Muhim ma'lumotni sekinroq aytiladi.", difficulty: "BASIC" },
    { stem: "Non-verbal muloqot nima?", options: ["A) Yozma muloqot", "B) Telefon orqali muloqot", "C) So'zsiz (tana tili) muloqot", "D) Rasmiy muloqot"], answer: "C) So'zsiz (tana tili) muloqot", explanation: "Non-verbal — so'zsiz muloqot: ko'z aloqasi, poza, imo-ishorat.", difficulty: "BASIC" },
    { stem: "45 daqiqa darsning qaysi qismi yangi mavzuga ajratiladi?", options: ["A) 5 daqiqa", "B) 10 daqiqa", "C) 20 daqiqa", "D) 35 daqiqa"], answer: "C) 20 daqiqa", explanation: "Standart darsda yangi mavzu 20 daqiqa, mustahkamlash 15 daqiqa.", difficulty: "BASIC" },
    { stem: "'10 daqiqa chegarasi' nimani anglatadi?", options: ["A) Dars 10 daqiqadan iborat", "B) Diqqat har 10 daqiqada yangilanishi kerak", "C) 10 daqiqada pauza qilish shart", "D) 10 daqiqadan keyin dars tugaydi"], answer: "B) Diqqat har 10 daqiqada yangilanishi kerak", explanation: "Kognitiv psixologiya: diqqat resursi har ~10 daqiqada yangi stimul talab qiladi.", difficulty: "INTERMEDIATE" },
    { stem: "Ko'z aloqasi pedagogik texnikada qanday ahamiyat kasb etadi?", options: ["A) Faqat estetik ko'rinish uchun", "B) Barcha talabalar bilan aloqa va nazoratni ta'minlaydi", "C) Talabalarni qo'rqitish uchun", "D) Faqat savolga javob berayotganda ishlatiladi"], answer: "B) Barcha talabalar bilan aloqa va nazoratni ta'minlaydi", explanation: "Ko'z aloqasi — diqqatni jalb qilish va ishtirokni rag'batlantirish vositasi.", difficulty: "INTERMEDIATE" },
    { stem: "Intizomni saqlashning eng samarali pedagogik usuli qaysi?", options: ["A) Ovoz ko'tarish", "B) Jazolash", "C) Qiziqarli topshiriq berish", "D) Darsdan chiqarish"], answer: "C) Qiziqarli topshiriq berish", explanation: "Qiziqarli topshiriq — talabaning ichki motivatsiyasini oshiradi va muammo o'z-o'zidan hal bo'ladi.", difficulty: "ADVANCED" },
    { stem: "Strategik pauza qachon ishlatiladi?", options: ["A) O'qituvchi charchaganda", "B) Muhim fikr oldidan va keyin", "C) Talabalar shovqin qilganda", "D) Dars boshlanishida"], answer: "B) Muhim fikr oldidan va keyin", explanation: "Pauza — eshituvchiga xabarni qayta ishlashga vaqt beradi.", difficulty: "ADVANCED" },
    { stem: "Ochiq poza (holat) qanday signalni bildiradi?", options: ["A) Himoya va yopiqlik", "B) Qiziqish va ochiqlik", "C) Hukmronlik", "D) Befarqlik"], answer: "B) Qiziqish va ochiqlik", explanation: "Tana tili psixologiyasida ochiq poza — qiziqish va ishonchni bildiradi.", difficulty: "INTERMEDIATE" },
  ]);

  // Mavzu 4: Pedagogik muloqot
  await addContent(topic1Ids[3], "Pedagogik muloqot shakllari va tamoyillari", `
Pedagogik muloqot — o'qituvchi va talabalar o'rtasidagi maqsadli, tarbiyaviy va rivojlantiruvchi o'zaro ta'sir jarayonidir.

**Muloqot uslublari:**

1. **Demokratik uslub** — talabalar fikrga jalb qilinadi, ularning mulohazalari hurmat qilinadi. Samaradorligi eng yuqori.

2. **Avtoritar uslub** — o'qituvchi buyuradi, talabalar bajaradi. Ijodkorlikka to'siq.

3. **Liberal uslub** — talabaga ko'p erkinlik, o'qituvchi passiv. Intizom zaif bo'ladi.

**Samarali pedagogik muloqotning tamoyillari:**

- **Hurmat** — har bir talabaga inson sifatida munosabat.
- **Faollik** — ikki tomonlama muloqot, monolog emas.
- **Aniqlik** — aniq va tushunarli so'zlash.
- **Rag'batlantirish** — to'g'ri javob va urinishlarni maqtash.
- **Empatiya** — talaba nuqtai nazaridan tushunish.

**Muloqot to'siqlari (barriers):**

- Terminologik — talabaga noma'lum so'zlar ishlatish.
- Psixologik — talabaning qo'rquvi, o'qituvchining mood-i.
- Fizik — shovqin, uzoq masofa.

Samarali pedagogik muloqot darsning 70% muvaffaqiyatini belgilaydi.
`, 0);

  await addQuestions(topic1Ids[3], [
    { stem: "Pedagogik muloqotning eng samarali uslubi qaysi?", options: ["A) Avtoritar", "B) Liberal", "C) Demokratik", "D) Neutral"], answer: "C) Demokratik", explanation: "Demokratik uslub — talabani jarayonga jalb qiladi, fikrlarni qadrlaydi.", difficulty: "BASIC" },
    { stem: "Avtoritar uslubning asosiy kamchiligi nima?", options: ["A) Talabalar ko'p so'zlaydi", "B) Ijodkorlikka to'siq bo'ladi", "C) Vaqtni tejamaydi", "D) Intizom zaif bo'ladi"], answer: "B) Ijodkorlikka to'siq bo'ladi", explanation: "Avtoritar uslubda talaba faqat bajaruvchi — ijodiy fikrlash rivojlanmaydi.", difficulty: "BASIC" },
    { stem: "Empatiya muloqotda nima?", options: ["A) Talabani yoqtirmaslik", "B) Talaba nuqtai nazaridan tushunish", "C) O'z fikrni qo'ymasdan tinglash", "D) Barcha savolga javob berish"], answer: "B) Talaba nuqtai nazaridan tushunish", explanation: "Empatiya — boshqaning his-tuyg'u va pozitsiyasini his qila bilish.", difficulty: "BASIC" },
    { stem: "Terminologik to'siq nima?", options: ["A) Talabalar shovqin qilishi", "B) Talabaga noma'lum so'zlar ishlatish", "C) O'qituvchi ovozi past bo'lishi", "D) Xona katta bo'lishi"], answer: "B) Talabaga noma'lum so'zlar ishlatish", explanation: "Noma'lum terminlar tushunishga to'siq yaratadi.", difficulty: "INTERMEDIATE" },
    { stem: "Liberal muloqot uslubida qanday muammo yuzaga keladi?", options: ["A) Talabalar haddan tashqari faol bo'ladi", "B) Intizom zaif bo'ladi", "C) Material yetarli o'zlashtirilmaydi", "D) B va C to'g'ri"], answer: "D) B va C to'g'ri", explanation: "Liberal uslubda intizom ham, o'zlashtirish ham zaif bo'ladi.", difficulty: "INTERMEDIATE" },
    { stem: "Samarali pedagogik muloqot darsning qancha qismini belgilaydi?", options: ["A) 30%", "B) 50%", "C) 70%", "D) 90%"], answer: "C) 70%", explanation: "Tadqiqotlar ko'rsatishicha, muloqot sifati dars samaradorligini 70% belgilaydi.", difficulty: "INTERMEDIATE" },
    { stem: "To'g'ri javobni rag'batlantirish pedagogik muloqotda nimani ta'minlaydi?", options: ["A) Talabaning uyqusini kelishi", "B) Ichki motivatsiya va ishonchni oshiradi", "C) Faqat to'g'ri javoblarni ta'minlaydi", "D) Intizomni kuchaytiradi"], answer: "B) Ichki motivatsiya va ishonchni oshiradi", explanation: "Maqtov — dopamin ishlab chiqaradi va o'qishga nisbatan ijobiy munosabatni mustahkamlaydi.", difficulty: "ADVANCED" },
    { stem: "Qaysi holda psixologik to'siq yuzaga keladi?", options: ["A) Dars uzoq bo'lganda", "B) Talabada qo'rquv yoki stress bo'lganda", "C) Material qiyin bo'lganda", "D) Dars erta boshlanganida"], answer: "B) Talabada qo'rquv yoki stress bo'lganda", explanation: "Stress va qo'rquv kognitiv resurslarni kamaytiradi — o'zlashtirish yomonlashadi.", difficulty: "ADVANCED" },
  ]);

  // Mavzu 5: O'qituvchi imiji
  await addContent(topic1Ids[4], "O'qituvchining professional imijini shakllantirish", `
Imij — bu shaxsning boshqalar ongida shakllangan umumiy taassurot va qiyofasi. O'qituvchining imiji professional muvaffaqiyatiga bevosita ta'sir qiladi.

**Imijning tarkibiy qismlari:**

1. **Tashqi ko'rinish** — kiyim-kechak, ozodalik, jismoniy holat. Birinchi taassurot 7 soniya ichida shakllanadi.

2. **Nutq madaniyati** — so'z boyligi, adabiy til, aniq ifodalash.

3. **Xulq-atvor madaniyati** — odob-axloq, punktuallik, vadasiga vafo qilish.

4. **Professional kompetentsiya** — fan bo'yicha chuqur bilim va zamonaviy metodlar.

5. **Ijtimoiy faollik** — hamjamiyatda, konferentsiyalarda, ijtimoiy tarmoqlarda ijobiy ishtiroki.

**Ijobiy imij shakllantirishning qoidalari:**

- Har doim vaqtida kelish — kechikish o'qituvchining noprofessionalligini ko'rsatadi.
- So'z va ish birligi — aytganini qilish.
- Talabalarni ism bilan chaqirish — hurmat belgisi.
- Xatoliklarni ochiq tan olish — bu zaiflik emas, balki kuch ko'rsatkichi.
- Ijobiy ruhda bo'lish — o'qituvchining kayfiyati sinfga "yuqadi".

**Raqamli imij** — bugun ijtimoiy tarmoqlardagi xatti-harakatlar ham professional imijning bir qismi.
`, 0);

  await addQuestions(topic1Ids[4], [
    { stem: "Birinchi taassurot qancha vaqtda shakllanadi?", options: ["A) 1 daqiqada", "B) 30 soniyada", "C) 7 soniyada", "D) 3 daqiqada"], answer: "C) 7 soniyada", explanation: "Psixologik tadqiqotlar: birinchi taassurot 7 soniyada shakllanadi va o'zgartirish qiyin.", difficulty: "BASIC" },
    { stem: "Imijning tarkibiy qismlaridan biri emas:", options: ["A) Tashqi ko'rinish", "B) Nutq madaniyati", "C) Moliyaviy ahvol", "D) Professional kompetentsiya"], answer: "C) Moliyaviy ahvol", explanation: "Moliyaviy ahvol imijning rasmiy komponenti emas.", difficulty: "BASIC" },
    { stem: "O'qituvchi xatoligini ochiq tan olishi qanday qabul qilinishi kerak?", options: ["A) Zaiflik belgisi", "B) Noprofessionalligi", "C) Kuch va halollik ko'rsatkichi", "D) Bilimdon emaslik"], answer: "C) Kuch va halollik ko'rsatkichi", explanation: "Xatoni tan olish — psixologik yetuklikning belgisi; talabalar hurmatini oshiradi.", difficulty: "BASIC" },
    { stem: "Raqamli imij nimani anglatadi?", options: ["A) Kompyuter bilimlarini", "B) Ijtimoiy tarmoqlardagi professional ishtiroki", "C) Onlayn dars o'tishni", "D) Raqamli sertifikatlarni"], answer: "B) Ijtimoiy tarmoqlardagi professional ishtiroki", explanation: "Bugun ijtimoiy tarmoqlar professional imijning ajralmas qismi.", difficulty: "INTERMEDIATE" },
    { stem: "Talabani ism bilan chaqirishning ahamiyati nima?", options: ["A) Vaqtni tejash", "B) Hurmat va shaxsiy yondashuv belgisi", "C) Intizomni saqlash", "D) Familiyaniy eslamaslik"], answer: "B) Hurmat va shaxsiy yondashuv belgisi", explanation: "Ism bilan murojaat — har bir insonni alohida qadrlash belgisi.", difficulty: "INTERMEDIATE" },
    { stem: "Kechikish o'qituvchi imijiga qanday ta'sir qiladi?", options: ["A) Hech qanday ta'sir qilmaydi", "B) Noprofessionalligi ko'rsatadi", "C) Ba'zan ijobiy ta'sir qiladi", "D) Talabalarni quvontiradi"], answer: "B) Noprofessionalligi ko'rsatadi", explanation: "Punktuallik — professional imijning asosi; kechikish ishonchni kamaytiradi.", difficulty: "INTERMEDIATE" },
    { stem: "O'qituvchi kayfiyati darsga qanday ta'sir qiladi?", options: ["A) Hech qanday ta'sir qilmaydi", "B) Faqat o'qituvchiga ta'sir qiladi", "C) Sinfga 'yuqadi' va umumiy muhitni belgilaydi", "D) Faqat yomon kayfiyat ta'sir qiladi"], answer: "C) Sinfga 'yuqadi' va umumiy muhitni belgilaydi", explanation: "Hissiyotlar yuqumli — o'qituvchining ijobiy energiyasi talabalarni ham faollashtiradi.", difficulty: "ADVANCED" },
    { stem: "Ijtimoiy faollik imijning qaysi jihatiga kiradi?", options: ["A) Tashqi ko'rinish", "B) Xulq-atvor", "C) Ijtimoiy faollik komponenti", "D) Professional kompetentsiya"], answer: "C) Ijtimoiy faollik komponenti", explanation: "Konferentsiyalar, hamjamiyat va faollikda ishtirok — alohida imij komponenti.", difficulty: "ADVANCED" },
  ]);

  console.log("✓ Kurs 1 (Pedagogik mahorat) — kontent va savollar qo'shildi");

  // ─── KURS 2: UMUMIY PSIXOLOGIYA ──────────────────────────────
  const course2 = await db.course.upsert({
    where: { id: "umumiy-psixologiya-course" },
    update: {},
    create: {
      id: "umumiy-psixologiya-course",
      professorId: prof2.id,
      facultyId: pedagogy.id,
      title: "Umumiy psixologiya",
      description: "Insonning ruhiy jarayonlari, shaxs va xulq-atvor asoslari",
      semester: "2024-2025/1",
    },
  });

  const psyTopics = [
    { id: "psy-t0", title: "Psixologiyaga kirish", objective: "Psixologiya fanining predmeti va vazifalarini tushuntira oladi", order: 0 },
    { id: "psy-t1", title: "Diqqat va uning xususiyatlari", objective: "Diqqatning turlarini va xususiyatlarini farqlay oladi", order: 1 },
    { id: "psy-t2", title: "Xotira turlari va rivojlantirish", objective: "Xotira turlarini tavsiflay oladi va mnemonik usullarni qo'llay oladi", order: 2 },
    { id: "psy-t3", title: "Tafakkur va nutq", objective: "Tafakkur turlarini va nutq bilan bog'liqligini izohlaya oladi", order: 3 },
    { id: "psy-t4", title: "Shaxs va temperament", objective: "Temperament turlarini aniqlaydi va shaxs rivojlanishini tushuntiradi", order: 4 },
  ];

  for (const t of psyTopics) {
    await db.topic.upsert({
      where: { id: t.id },
      update: {},
      create: { id: t.id, courseId: course2.id, title: t.title, learningObjective: t.objective, orderIndex: t.order },
    });
  }

  // Psixologiya mavzulari — kontent
  await addContent("psy-t0", "Psixologiya fani haqida", `
Psixologiya (yunon. psyche — ruh + logos — fan) — insonning ruhiy jarayonlari, holatlari va xususiyatlarini o'rganuvchi fandir.

**Psixologiyaning asosiy bo'limlari:**
- **Umumiy psixologiya** — barcha ruhiy jarayonlarning umumiy qonuniyatlarini o'rganadi.
- **Yosh psixologiyasi** — rivojlanish bosqichlari bo'yicha o'rganadi.
- **Ijtimoiy psixologiya** — guruhlarda va jamiyatda xulq-atvorni o'rganadi.
- **Pedagogik psixologiya** — ta'lim va tarbiya psixologiyasi.

**Ruhiy jarayonlar:**
1. *Kognitiv* — sezgi, idrok, diqqat, xotira, tafakkur, nutq, tasavvur.
2. *Hissiy* — emotsiyalar, his-tuyg'ular.
3. *Iroda jarayonlari* — qaror qabul qilish, maqsadga intilish.

**Psixologiyaning metodlari:**
- Kuzatish
- Eksperiment
- Test va so'rovnoma
- Suhbat (intervyu)
- Faoliyat mahsullarini tahlil qilish

Psixologiya bilimi o'qituvchiga talabalarni yaxshiroq tushunishga, ta'lim jarayonini samarali tashkil etishga yordam beradi.
`, 0);

  await addQuestions("psy-t0", [
    { stem: "Psixologiya so'zi qanday tarjima qilinadi?", options: ["A) Bilim haqida fan", "B) Ruh haqida fan", "C) Xulq haqida fan", "D) Aql haqida fan"], answer: "B) Ruh haqida fan", explanation: "Psyche — ruh, logos — fan (yunon tilidan).", difficulty: "BASIC" },
    { stem: "Ta'lim va tarbiya psixologiyasi qanday nomlanadi?", options: ["A) Umumiy psixologiya", "B) Ijtimoiy psixologiya", "C) Pedagogik psixologiya", "D) Yosh psixologiyasi"], answer: "C) Pedagogik psixologiya", explanation: "Pedagogik psixologiya — ta'lim-tarbiya jarayonining psixologik asoslarini o'rganadi.", difficulty: "BASIC" },
    { stem: "Diqqat, xotira, tafakkur qanday jarayonlarga kiradi?", options: ["A) Hissiy jarayonlar", "B) Iroda jarayonlari", "C) Kognitiv jarayonlar", "D) Ijtimoiy jarayonlar"], answer: "C) Kognitiv jarayonlar", explanation: "Kognitiv — bilish jarayonlari: sezgi, idrok, diqqat, xotira, tafakkur.", difficulty: "BASIC" },
    { stem: "Psixologiyaning qaysi metodi eng ob'ektiv hisoblanadi?", options: ["A) Suhbat", "B) Kuzatish", "C) Eksperiment", "D) Test"], answer: "C) Eksperiment", explanation: "Eksperiment — sababiy bog'liqlikni aniqlash uchun eng ishonchli metod.", difficulty: "INTERMEDIATE" },
    { stem: "Ijtimoiy psixologiya nimani o'rganadi?", options: ["A) Individual ruhiy jarayonlarni", "B) Guruhlarda va jamiyatda xulq-atvorni", "C) Bolalar rivojlanishini", "D) Ta'lim jarayonini"], answer: "B) Guruhlarda va jamiyatda xulq-atvorni", explanation: "Ijtimoiy psixologiya — guruh ta'siri, munosabatlar, normalar va hokazolarni o'rganadi.", difficulty: "INTERMEDIATE" },
    { stem: "Emotsiyalar psixologiyaning qaysi sohasiga kiradi?", options: ["A) Kognitiv jarayonlar", "B) Iroda jarayonlari", "C) Hissiy jarayonlar", "D) Rivojlanish jarayonlari"], answer: "C) Hissiy jarayonlar", explanation: "Emotsiyalar — hissiy (affektiv) jarayonlarga kiradi.", difficulty: "INTERMEDIATE" },
    { stem: "So'rovnoma metodi nimani o'lchaydi?", options: ["A) Faqat bilimni", "B) Fikr, munosabat, xulq-atvorni", "C) Faqat xotirani", "D) Reaktsiya tezligini"], answer: "B) Fikr, munosabat, xulq-atvorni", explanation: "So'rovnoma — keng doiradagi ruhiy ko'rsatkichlarni o'lchash imkonini beradi.", difficulty: "ADVANCED" },
    { stem: "Psixologiya bilimi o'qituvchiga asosan nima uchun kerak?", options: ["A) Dars rejasini tuzish", "B) Talabalarni yaxshiroq tushunish va jarayonni samarali tashkil etish", "C) Baholash tizimini o'rnatish", "D) Fan mazmunini belgilash"], answer: "B) Talabalarni yaxshiroq tushunish va jarayonni samarali tashkil etish", explanation: "Psixologiya — o'qituvchiga talaba omilini hisobga olishga yordam beradi.", difficulty: "ADVANCED" },
  ]);

  await addContent("psy-t1", "Diqqat — ongning yo'nalganligi", `
Diqqat — ongning muayyan ob'ektga yo'naltirilishi va to'planishi. U mustaqil jarayon emas, balki barcha kognitiv jarayonlarning sharti.

**Diqqat turlari:**
1. **Ixtiyorsiz diqqat** — o'z-o'zidan, qiziqarli va kutilmagan narsaga yo'naladi.
2. **Ixtiyoriy diqqat** — ongli, maqsadli, iroda kuchi bilan.
3. **Ixtiyoriydan keyingi diqqat** — avval ixtiyoriy bo'lib, keyin avtomatik tus oladi.

**Diqqatning xususiyatlari:**
- **Ko'lami** — bir vaqtda qancha ob'ektga diqqat qaratilishi (odatda 5-9 ob'ekt).
- **To'planishi (kontsentratsiya)** — bir ob'ektga chuqur e'tibor berish.
- **Turg'unligi** — uzoq vaqt diqqatni ushlab turish.
- **Ko'chuvchanligi** — bir ob'ektdan ikkinchisiga o'tish qobiliyati.
- **Taqsimlanishi** — bir vaqtda bir necha ob'ektga diqqat qaratish.

**Diqqatni rivojlantirish usullari:**
- Meditatsiya va mindfulness amaliyoti (10-15 daqiqa kuniga)
- Sport mashqlari — miya qon aylanishini yaxshilaydi
- "Deep work" — chalg'ituvchilarsiz 25-90 daqiqa ishlash (Pomodoro texnikasi)
- Yetarli uyqu — diqqat tiklash uchun zarur
`, 0);

  await addQuestions("psy-t1", [
    { stem: "Ixtiyorsiz diqqat qanday vujudga keladi?", options: ["A) Iroda kuchi bilan", "B) O'z-o'zidan, kutilmagan stimulga javoban", "C) Maxsus mashqlar natijasida", "D) Maqsad qo'yish orqali"], answer: "B) O'z-o'zidan, kutilmagan stimulga javoban", explanation: "Ixtiyorsiz diqqat — reflektiv, o'z-o'zidan yo'naladi.", difficulty: "BASIC" },
    { stem: "Diqqatning ko'lami odatda qancha ob'ektni qamrab oladi?", options: ["A) 1-3", "B) 5-9", "C) 10-15", "D) 20 dan ortiq"], answer: "B) 5-9", explanation: "Miller qonuni: ish xotirasi va diqqat ko'lami 7±2 ob'ektni qamrab oladi.", difficulty: "BASIC" },
    { stem: "Kontsentratsiya nima?", options: ["A) Diqqatni taqsimlash", "B) Bir ob'ektga chuqur e'tibor berish", "C) Diqqatni ko'chirish", "D) Ko'p narsani bir vaqtda kuzatish"], answer: "B) Bir ob'ektga chuqur e'tibor berish", explanation: "Kontsentratsiya — diqqatning to'planish xususiyati.", difficulty: "BASIC" },
    { stem: "Pomodoro texnikasi diqqatni qanday rivojlantiradi?", options: ["A) Uzluksiz 8 soat ishlash", "B) 25-90 daqiqa chalg'ituvchilarsiz ishlash, so'ng dam olish", "C) Ko'p vazifani bir vaqtda bajarish", "D) Har 5 daqiqada tanaffus qilish"], answer: "B) 25-90 daqiqa chalg'ituvchilarsiz ishlash, so'ng dam olish", explanation: "Pomodoro — fokusli ish va dam olish navbatma-navbatligiga asoslangan.", difficulty: "INTERMEDIATE" },
    { stem: "Ixtiyoriydan keyingi diqqat qanday xususiyatga ega?", options: ["A) Har doim qiyin bo'ladi", "B) Avval ixtiyoriy bo'lib, keyinchalik avtomatik tus oladi", "C) Faqat bolalarda kuzatiladi", "D) Irodadan mutlaq mustaqil"], answer: "B) Avval ixtiyoriy bo'lib, keyinchalik avtomatik tus oladi", explanation: "Ko'nikma hosil bo'lgach, diqqat kuchi sarflanmaydi — avtomatik tus oladi.", difficulty: "INTERMEDIATE" },
    { stem: "Diqqat turg'unligini oshirishda qaysi faoliyat yordam beradi?", options: ["A) Ko'p vazifali ishlash", "B) Tez-tez ijtimoiy tarmoqlarni ko'rish", "C) Meditatsiya va mindfulness", "D) Ko'p soat uxlash"], answer: "C) Meditatsiya va mindfulness", explanation: "Meditatsiya — prefrontal korteksni kuchaytiradi va diqqat turg'unligini oshiradi.", difficulty: "INTERMEDIATE" },
    { stem: "Taqsimlangan diqqat qanday qobiliyat?", options: ["A) Bir ob'ektga chuqur e'tibor", "B) Bir vaqtda bir necha ob'ektga diqqat qaratish", "C) Diqqatni tez ko'chirish", "D) Uzoq vaqt diqqatni ushlab turish"], answer: "B) Bir vaqtda bir necha ob'ektga diqqat qaratish", explanation: "Taqsimlangan diqqat — masalan, bir vaqtda gapirish va yozish.", difficulty: "ADVANCED" },
    { stem: "Uyqu diqqatga qanday ta'sir qiladi?", options: ["A) Hech qanday ta'sir yo'q", "B) Faqat kuchli uyqusizlikda ta'sir qiladi", "C) Yetarli uyqu diqqatni tiklaydi va mustahkamlaydi", "D) Ko'p uyqu diqqatni zaiflashtiradi"], answer: "C) Yetarli uyqu diqqatni tiklaydi va mustahkamlaydi", explanation: "Uyquda prefrontal korteks tiklanadi — bu diqqat va iroda markazi.", difficulty: "ADVANCED" },
  ]);

  await addContent("psy-t2", "Xotira — bilimlarni saqlash mexanizmi", `
Xotira — oldingi tajriba, bilim va ko'nikmalarni yodlash, saqlash va esga tushirish jarayoni.

**Xotira turlari (vaqt bo'yicha):**
1. **Sensorli xotira** — 0,5-3 soniya. Sezgi organlaridan kelgan axborotni qisqacha saqlaydi.
2. **Qisqa muddatli xotira (QMX)** — 15-30 soniya, 7±2 element. Ish xotirasi deb ham ataladi.
3. **Uzoq muddatli xotira (UMX)** — yillar, cheksiz. Turg'un bilim va tajriba.

**Xotira turlari (mazmun bo'yicha):**
- **Epizodik** — shaxsiy voqealar va tajribalar.
- **Semantik** — faktlar, tushunchalar, bilimlar.
- **Protsedural** — harakat va ko'nikmalar (velosiped minish).

**Xotirani kuchaytirish usullari:**
1. **Takrorlash** (spaced repetition) — materialga vaqt oralig'ida qaytish.
2. **Chunklash** — katta ma'lumotni kichik bloklarga bo'lish.
3. **Assotsiatsiya** — yangi ma'lumotni tanish narsaga bog'lash.
4. **Tasviriy usul** (Method of Loci) — xayoliy joy bilan bog'lash.
5. **Aktiv esga tushirish** — kitob yopib, o'qilganni yoddan yozish.

BrainUP platformasi spaced repetition tamoyiliga asoslanadi.
`, 0);

  await addQuestions("psy-t2", [
    { stem: "Qisqa muddatli xotira qancha vaqt davomida ma'lumotni saqlaydi?", options: ["A) 3 soniya", "B) 15-30 soniya", "C) 5 daqiqa", "D) 1 soat"], answer: "B) 15-30 soniya", explanation: "QMX — 15-30 soniya, sig'im 7±2 element (Miller, 1956).", difficulty: "BASIC" },
    { stem: "Velosiped minishni eslab qolish qanday xotira turi?", options: ["A) Epizodik", "B) Semantik", "C) Protsedural", "D) Sensorli"], answer: "C) Protsedural", explanation: "Protsedural xotira — harakat ko'nikmalari (velosiped, yozuv va h.k.).", difficulty: "BASIC" },
    { stem: "Spaced repetition (takrorlash) usuli qanday ishlaydi?", options: ["A) Materialni bir kunda ko'p marta takrorlash", "B) Materialga vaqt oralig'ida qayta qaytish", "C) Faqat imtihon oldidan o'qish", "D) Materialdan faqat bir marta o'tish"], answer: "B) Materialga vaqt oralig'ida qayta qaytish", explanation: "Ebbinghaus unutish egri chizig'iga qarshi: optimal oraliqda qaytish xotirani mustahkamlaydi.", difficulty: "BASIC" },
    { stem: "Chunklash usuli nima?", options: ["A) Materialga ko'p marta qaytish", "B) Katta ma'lumotni kichik bloklarga bo'lish", "C) Yangi narsani eski bilan bog'lash", "D) Xayoliy joyni tasavvur qilish"], answer: "B) Katta ma'lumotni kichik bloklarga bo'lish", explanation: "Chunklash — QMX ning 7±2 chegarasini yengish uchun ishlatiladigan strategiya.", difficulty: "INTERMEDIATE" },
    { stem: "Aktiv esga tushirish (retrieval practice) nima uchun samarali?", options: ["A) Materialni ko'proq o'qiydi", "B) Esga tushirish harakati xotira izini kuchaytiradi", "C) Vaqtni tejaydi", "D) Hamma materialni bir vaqtda o'rganish imkonini beradi"], answer: "B) Esga tushirish harakati xotira izini kuchaytiradi", explanation: "Testing effect: esga tushirish harakati xotira yo'llarini kuchaytiradi.", difficulty: "INTERMEDIATE" },
    { stem: "Uzoq muddatli xotiraning sig'imi qanday?", options: ["A) 7 element", "B) 100 element", "C) 1000 element", "D) Amalda cheksiz"], answer: "D) Amalda cheksiz", explanation: "UMX — neyronlar orasidagi sinaptik ulanishlar soni amalda cheksiz.", difficulty: "INTERMEDIATE" },
    { stem: "Method of Loci (tasviriy usul) qanday ishlaydi?", options: ["A) Materialni ko'p marta yozish", "B) Ma'lumotni xayoliy joy bilan bog'lash", "C) Ritmik takrorlash", "D) Rasmlar chizish"], answer: "B) Ma'lumotni xayoliy joy bilan bog'lash", explanation: "Qadimgi yunon notiqlari ishlagan usul: xayoliy xona bo'ylab yurish.", difficulty: "ADVANCED" },
    { stem: "Semantik xotira va epizodik xotira o'rtasidagi asosiy farq nima?", options: ["A) Semantik ko'proq tez unutiladi", "B) Epizodik faktlar, semantik voqealar saqlaydi", "C) Semantik faktlarni, epizodik shaxsiy voqealarni saqlaydi", "D) Ular bir xil"], answer: "C) Semantik faktlarni, epizodik shaxsiy voqealarni saqlaydi", explanation: "Semantik — bilim, epizodik — hayotiy voqealar (Tulving, 1972).", difficulty: "ADVANCED" },
  ]);

  await addContent("psy-t3", "Tafakkur va nutq: fikrlash va so'zlashning bog'liqligi", `
Tafakkur — voqelikni umumlashtirilgan va bilvosita aks ettirish jarayoni. U bevosita sezgi va idrok orqali anglab bo'lmaydigan narsalarni tushunishga yordam beradi.

**Tafakkur turlari:**
1. **Ko'rgazmali-harakat** — amaliy harakat orqali muammo yechish (3 yoshgacha asosiy).
2. **Ko'rgazmali-obrazli** — tasvirlar va ko'rinishlar orqali fikrlash.
3. **Mavhum-mantiqiy** — tushunchalar, muhokamalar, xulosalar orqali.
4. **Ijodiy tafakkur** — yangi, original g'oyalar yaratish.
5. **Tanqidiy tafakkur** — ma'lumotlarni tahlil qilish va baholash.

**Tafakkur operatsiyalari:**
- Tahlil (analiz) — butunni qismlarga bo'lish
- Sintez — qismlarni butunlashtirish
- Taqqoslash — o'xshash va farqli tomonlarni topish
- Umumlashtirish — umumiy xususiyatlarni ajratish
- Abstraktsiya — muhim bo'lmagan xususiyatlarni e'tiborsiz qoldirish

**Nutq va tafakkur:**
L.S. Vыgotskiy: tafakkur va nutq o'zaro chambarchas bog'liq, ammo bir xil emas. Tafakkur nutq orqali ifodalanadi, nutq esa tafakkurni shakllantiradi. Ichki nutq — fikrlash jarayonining asosi.
`, 0);

  await addQuestions("psy-t3", [
    { stem: "Ko'rgazmali-harakat tafakkuri qachon asosiy bo'ladi?", options: ["A) Maktab yoshida", "B) Kattalar yoshida", "C) 3 yoshgacha", "D) O'spirinlik davrida"], answer: "C) 3 yoshgacha", explanation: "Piaje: ko'rgazmali-harakat — bolalar tafakkurining ilk shakli.", difficulty: "BASIC" },
    { stem: "Tahlil (analiz) tafakkur operatsiyasi nima?", options: ["A) Qismlarni birlashtirish", "B) Butunni qismlarga bo'lish", "C) O'xshash tomonlarni topish", "D) Umumiy xususiyatlarni ajratish"], answer: "B) Butunni qismlarga bo'lish", explanation: "Analiz — predmet yoki hodisani tarkibiy qismlarga ajratib o'rganish.", difficulty: "BASIC" },
    { stem: "Nutq va tafakkur munosabati haqida Vыgotskiyning asosiy fikri nima?", options: ["A) Nutq va tafakkur bir xil", "B) Nutq tafakkurdan keyin paydo bo'ladi", "C) Tafakkur va nutq bog'liq, ammo bir xil emas", "D) Tafakkur nutqsiz bo'lishi mumkin emas"], answer: "C) Tafakkur va nutq bog'liq, ammo bir xil emas", explanation: "Vыgotskiy: ular ildizda ajralib, keyin birlashadi; o'zaro ta'sir qiladi.", difficulty: "INTERMEDIATE" },
    { stem: "Tanqidiy tafakkur nima?", options: ["A) Faqat xatolarni topish", "B) Ma'lumotlarni tahlil qilish va ob'ektiv baholash", "C) Boshqalarni tanqid qilish", "D) Yangi g'oyalar yaratish"], answer: "B) Ma'lumotlarni tahlil qilish va ob'ektiv baholash", explanation: "Tanqidiy tafakkur — dalillarga asoslanib, xulosa chiqarish qobiliyati.", difficulty: "INTERMEDIATE" },
    { stem: "Sintez operatsiyasi nima?", options: ["A) Butunni qismlarga bo'lish", "B) Qismlarni yangi butunlikka birlashtirish", "C) O'xshashliklarni topish", "D) Muhim bo'lmagan narsalarni e'tiborsiz qoldirish"], answer: "B) Qismlarni yangi butunlikka birlashtirish", explanation: "Sintez — analizning qarama-qarshisi: qismlardan butun yaratish.", difficulty: "INTERMEDIATE" },
    { stem: "Ijodiy tafakkurning asosiy xususiyati nima?", options: ["A) Mavjud bilimlarni qo'llash", "B) Tez fikrlash", "C) Yangi, original g'oyalar yaratish", "D) Mantiqiy xulosa chiqarish"], answer: "C) Yangi, original g'oyalar yaratish", explanation: "Kreativlik — divergent tafakkur; noyob va yangi yechimlar topish.", difficulty: "ADVANCED" },
    { stem: "Abstraktsiya nima?", options: ["A) Barcha xususiyatlarni hisobga olish", "B) Muhim bo'lmagan xususiyatlarni e'tiborsiz qoldirish", "C) Umumiy xususiyatlarni ajratish", "D) Predmetlarni taqqoslash"], answer: "B) Muhim bo'lmagan xususiyatlarni e'tiborsiz qoldirish", explanation: "Abstraktsiya — ikkinchi darajali xususiyatlardan chalg'imay, asosiyga e'tibor qaratish.", difficulty: "ADVANCED" },
    { stem: "Ichki nutq tafakkurda qanday rol o'ynaydi?", options: ["A) Hech qanday rol o'ynamaydi", "B) Faqat gapirish uchun tayyorlanish", "C) Fikrlash jarayonining asosi", "D) Faqat bolalarda kuzatiladi"], answer: "C) Fikrlash jarayonining asosi", explanation: "Vыgotskiy: ichki nutq — tafakkur vositasi, o'z-o'ziga murojaat.", difficulty: "ADVANCED" },
  ]);

  await addContent("psy-t4", "Shaxs va temperament psixologiyasi", `
Shaxs — ijtimoiy munosabatlar va faoliyat sub'ekti sifatida rivojlangan, o'ziga xos psixologik xususiyatlarga ega inson.

**Temperament turlari (Gippokrat-Pavlov):**

1. **Sangvinik** — tez, harakatchan, ijtimoiy, optimist. Moslashuvchan, ammo e'tibor tez o'zgaradi.
2. **Xolerik** — kuchli, tezkor, to'satdan, qizg'in. Energik, ammo nazorat qiyin.
3. **Flegmatik** — sekin, sabrli, barqaror, izchil. Ishonchli, ammo yangilikka qiyin moslashadi.
4. **Melankolik** — sezgir, chuqur his, pessimistga moyil. Ijodkor, ammo stress ta'sirida zaif.

**Shaxsning tarkibiy qismlari:**
- Temperament — tug'ma asoslar
- Xarakter — hayot davomida shakllanadi
- Qobiliyat — faoliyat muvaffaqiyatini ta'minlaydi
- Yo'nalganlik — manfaat, intilish, qadriyatlar

**Ta'limda temperamentni hisobga olish:**
- Xolerikka — tez sur'atli, qiziqarli vazifalar
- Sangvinikka — o'zgaruvchan va ijtimoiy vazifalar
- Flegmatikka — chuqur va izchil vazifalar
- Melankolikka — qo'llab-quvvatlash va ijodiy muhit
`, 0);

  await addQuestions("psy-t4", [
    { stem: "Xolerik temperamentga ega talabaning asosiy xususiyati?", options: ["A) Sekin va izchil", "B) Energik, to'satdan va qizg'in", "C) Sezgir va pessimist", "D) Harakatchan va optimist"], answer: "B) Energik, to'satdan va qizg'in", explanation: "Xolerik — kuchli, tez, baquvvat, ammo nazorat qiyin.", difficulty: "BASIC" },
    { stem: "Flegmatik talabaga qanday vazifalar mos keladi?", options: ["A) Tez sur'atli, o'zgaruvchan", "B) Ijtimoiy va guruhli", "C) Chuqur va izchil, bir mavzuda uzoq ishlash", "D) Ijodiy va erkin"], answer: "C) Chuqur va izchil, bir mavzuda uzoq ishlash", explanation: "Flegmatik — sabr, izchillik, barqarorlik ularga mos.", difficulty: "BASIC" },
    { stem: "Temperament va xarakter o'rtasidagi asosiy farq nima?", options: ["A) Ular bir xil", "B) Temperament tug'ma, xarakter hayot davomida shakllanadi", "C) Xarakter tug'ma, temperament shakllanadi", "D) Ikkalasi ham tug'ma"], answer: "B) Temperament tug'ma, xarakter hayot davomida shakllanadi", explanation: "Temperament — biologik asos; xarakter — tarbiya va tajriba mahsuli.", difficulty: "BASIC" },
    { stem: "Sangvinik talabaning zaif tomoni nima?", options: ["A) Pessimist", "B) Haddan tashqari sekin", "C) E'tibor tez o'zgaradi", "D) Ijtimoiy emas"], answer: "C) E'tibor tez o'zgaradi", explanation: "Sangvinik — moslashuvchan, ammo uzoq diqqat talab qiladigan ishlarda qiynaladi.", difficulty: "INTERMEDIATE" },
    { stem: "Melankolik talabaga eng mos muhit qaysi?", options: ["A) Raqobatli va tezkor", "B) Qo'llab-quvvatlash va ijodiy muhit", "C) Qattiq intizomli", "D) Ko'p notanish odamlar bilan"], answer: "B) Qo'llab-quvvatlash va ijodiy muhit", explanation: "Melankolik — sezgir, stressga ta'sirchan; xavfsiz muhitda gullaydi.", difficulty: "INTERMEDIATE" },
    { stem: "Shaxsning tarkibiy qismlaridan biri emas:", options: ["A) Temperament", "B) Qobiliyat", "C) Tashqi ko'rinish", "D) Yo'nalganlik"], answer: "C) Tashqi ko'rinish", explanation: "Tashqi ko'rinish shaxsning psixologik tarkibiy qismi emas.", difficulty: "INTERMEDIATE" },
    { stem: "Yo'nalganlik shaxs tarkibida nima?", options: ["A) Tug'ma xususiyatlar", "B) Manfaat, intilish va qadriyatlar", "C) Jismoniy kuch", "D) Bilim miqdori"], answer: "B) Manfaat, intilish va qadriyatlar", explanation: "Yo'nalganlik — insonning nima uchun yashashi, nimaga intilishi.", difficulty: "ADVANCED" },
    { stem: "Barcha 4 temperament turini tavsiflaydigan to'g'ri juftlik?", options: ["A) Sangvinik-sekin, xolerik-sezgir", "B) Sangvinik-optimist, xolerik-tezkor, flegmatik-barqaror, melankolik-sezgir", "C) Sangvinik-pessimist, flegmatik-tez", "D) Melankolik-optimist, xolerik-sekin"], answer: "B) Sangvinik-optimist, xolerik-tezkor, flegmatik-barqaror, melankolik-sezgir", explanation: "Klassik tavsiflash: Gippokrat-Pavlov 4 temperament tipologiyasi.", difficulty: "ADVANCED" },
  ]);

  console.log("✓ Kurs 2 (Umumiy psixologiya) — tayyor");

  // ─── KURS 3: TA'LIM TEXNOLOGIYALARI ──────────────────────────
  const course3 = await db.course.upsert({
    where: { id: "talim-texnologiyalari-course" },
    update: {},
    create: {
      id: "talim-texnologiyalari-course",
      professorId: prof3.id,
      facultyId: boshlangich.id,
      title: "Ta'lim texnologiyalari",
      description: "Zamonaviy ta'lim usullari, interaktiv metodlar va raqamli ta'lim vositalari",
      semester: "2024-2025/1",
    },
  });

  const techTopics = [
    { id: "tech-t0", title: "Ta'lim texnologiyasi tushunchasi", objective: "Ta'lim texnologiyasining mohiyatini va ahamiyatini izohlaya oladi", order: 0 },
    { id: "tech-t1", title: "Interaktiv o'qitish metodlari", objective: "Interaktiv metodlarni darsda qo'llay oladi", order: 1 },
    { id: "tech-t2", title: "Raqamli ta'lim vositalari", objective: "Raqamli ta'lim vositalaridan samarali foydalana oladi", order: 2 },
    { id: "tech-t3", title: "Loyiha asosida o'qitish (PBL)", objective: "Loyiha metodini tashkil qila oladi", order: 3 },
    { id: "tech-t4", title: "Ta'limda baholash tizimi", objective: "Formativ va summativ baholash usullarini farqlay oladi", order: 4 },
  ];

  for (const t of techTopics) {
    await db.topic.upsert({
      where: { id: t.id },
      update: {},
      create: { id: t.id, courseId: course3.id, title: t.title, learningObjective: t.objective, orderIndex: t.order },
    });
  }

  await addContent("tech-t0", "Ta'lim texnologiyasi nima?", `
Ta'lim texnologiyasi — ta'lim jarayonini loyihalash, amalga oshirish va baholashning tizimli usuli bo'lib, o'qitish va o'rganishni optimallashtirish maqsadida insoniy va texnik resurslardan foydalanishni o'z ichiga oladi.

**Ta'lim texnologiyasining xususiyatlari:**
1. **Tizimlilik** — maqsad, mazmun, metod va natijani birlikda ko'rish.
2. **Boshqarilishi** — jarayonni nazorat qilish va tuzatish imkoni.
3. **Samaradorlik** — minimal vaqt va resurs bilan maksimal natija.
4. **Takrorlanishi** — boshqa o'qituvchi ham xuddi shu natijani olishi mumkin.

**Ta'lim texnologiyalarining turlari:**
- *An'anaviy* — ma'ruza, seminar, amaliy mashg'ulot.
- *Interaktiv* — munozara, rolli o'yin, keys-stadi, loyiha.
- *Raqamli* — LMS, video darslar, gamifikatsiya, VR/AR.
- *Adaptiv* — o'quvchining darajasiga moslashuvchi (BrainUP kabi).

**Zamonaviy tendentsiyalar:**
- Flipped classroom (teskari sinf) — uyda video, sinfda amaliyot
- Blended learning — offline va online aralash
- Personalized learning — shaxsga moslashtirilgan yo'nalish
`, 0);

  await addQuestions("tech-t0", [
    { stem: "Ta'lim texnologiyasining asosiy maqsadi nima?", options: ["A) Faqat texnik vositalardan foydalanish", "B) O'qitish va o'rganishni optimallashtirish", "C) O'qituvchi ishini osonlashtirish", "D) Kompyuterlardan foydalanish"], answer: "B) O'qitish va o'rganishni optimallashtirish", explanation: "Ta'lim texnologiyasi — resurslardan samarali foydalanib, o'rganishni optimallashtirish.", difficulty: "BASIC" },
    { stem: "Flipped classroom (teskari sinf) modeli qanday ishlaydi?", options: ["A) O'qituvchi uyga topshiriq bermaydi", "B) Uyda video, sinfda amaliyot", "C) Sinfda video, uyda amaliyot", "D) Faqat onlayn ishlash"], answer: "B) Uyda video, sinfda amaliyot", explanation: "Flipped classroom — uy vazifasi video ko'rish, sinf vaqti — amaliy ishlash.", difficulty: "BASIC" },
    { stem: "Ta'lim texnologiyasining 'takrorlanishi' xususiyati nimani anglatadi?", options: ["A) Darsni qayta o'tkazish", "B) Boshqa o'qituvchi ham xuddi shu natijani olishi", "C) Talaba materialni qayta o'rganishi", "D) Texnikani ta'mirlash"], answer: "B) Boshqa o'qituvchi ham xuddi shu natijani olishi", explanation: "Takrorlanishi — texnologiya shaxsiy omildan mustaqil, tizimli ishlaydi.", difficulty: "INTERMEDIATE" },
    { stem: "BrainUP qanday texnologiyaga misol?", options: ["A) An'anaviy", "B) Raqamli faqat", "C) Adaptiv ta'lim texnologiyasi", "D) Flipped classroom"], answer: "C) Adaptiv ta'lim texnologiyasi", explanation: "BrainUP — har o'quvchining darajasiga moslashib, individual yo'nalish beradi.", difficulty: "INTERMEDIATE" },
    { stem: "Blended learning nima?", options: ["A) Faqat onlayn ta'lim", "B) Faqat offline ta'lim", "C) Offline va online ta'limning uyg'unligi", "D) Video dars ko'rish"], answer: "C) Offline va online ta'limning uyg'unligi", explanation: "Blended — ikki shaklni birlashtiradi: sinf + raqamli platformalar.", difficulty: "INTERMEDIATE" },
    { stem: "Ta'lim texnologiyasining 'boshqarilishi' xususiyati nima?", options: ["A) O'qituvchi hammani boshqarishi", "B) Jarayonni kuzatish, o'lchash va zarur holda tuzatish", "C) Kompyuter nazorat qilishi", "D) Talabalar o'zini boshqarishi"], answer: "B) Jarayonni kuzatish, o'lchash va zarur holda tuzatish", explanation: "Boshqarilishi — maqsaddan og'ish aniqlanganda tuzatish kiritish imkoni.", difficulty: "ADVANCED" },
    { stem: "Personalized learning tamoyilining mohiyati nima?", options: ["A) Hammaga bir xil material berish", "B) Har o'quvchiga individual yo'nalish, temp va mazmun", "C) Talabalar o'zlari dars rejasini tuzadi", "D) Faqat qiziqishlar bo'yicha o'qitish"], answer: "B) Har o'quvchiga individual yo'nalish, temp va mazmun", explanation: "Personalized learning — har o'quvchining o'ziga xos ehtiyojiga moslashtirilgan ta'lim.", difficulty: "ADVANCED" },
    { stem: "An'anaviy ta'lim texnologiyasiga misol?", options: ["A) Gamifikatsiya", "B) Virtual reallik", "C) Ma'ruza va seminar", "D) Loyiha metodi"], answer: "C) Ma'ruza va seminar", explanation: "Ma'ruza, seminar, amaliy — klassik an'anaviy shakllar.", difficulty: "BASIC" },
  ]);

  await addContent("tech-t1", "Interaktiv o'qitish metodlari", `
Interaktiv o'qitish — talabalar faol ishtirok etadigan, ular o'rtasida va o'qituvchi bilan hamkorlik asosida bilim quriladigan metodlar majmui.

**Asosiy interaktiv metodlar:**

1. **Aqliy hujum (Brainstorming)** — vaqt chegarasida maksimal g'oya generatsiya. Tanqid yo'q. 5-7 daqiqa.

2. **Keys-stadi (Case study)** — real hayotiy muammo tahlili. Guruhda muhokama, xulosa chiqarish.

3. **Rolli o'yin** — turli rollarni bajarib, vaziyatni his etish. Empatiya va muloqotni rivojlantiradi.

4. **Jigso metodi** — guruh kichik guruhlarga bo'linadi, har biri alohida mavzuni o'rganib, keyin qolganlariga o'rgatadi.

5. **Munozara (debate)** — bir mavzu bo'yicha ikkita pozitsiya. Dalil va argumentlar asosida.

6. **SWOT tahlili** — kuchli/zaif tomonlar, imkoniyat/xavflarni aniqlash.

**Interaktiv metodlarning afzalliklari:**
- Talabaning faolligini oshiradi
- Tanqidiy va ijodiy tafakkurni rivojlantiradi
- Bilim uzoq muddat saqlanadi
- Muloqot ko'nikmalarini shakllantiradi

**Ehtiyot bo'lish kerak:**
- Vaqtni nazorat qilish
- Barcha talabaning ishtirokini ta'minlash
- Vazifani aniq tushuntirish
`, 0);

  await addQuestions("tech-t1", [
    { stem: "Brainstorming metodida asosiy qoida nima?", options: ["A) Faqat eng yaxshi g'oyalarni aytish", "B) G'oyalar soni muhim emas", "C) G'oyalar soni muhim, tanqid yo'q", "D) O'qituvchi g'oyalarni baholaydi"], answer: "C) G'oyalar soni muhim, tanqid yo'q", explanation: "Brainstorming — miqdor, tanqid yo'q; keyinchalik filtrlash bo'ladi.", difficulty: "BASIC" },
    { stem: "Jigso metodi qanday ishlaydi?", options: ["A) Barcha bir xil materialdan o'qiydi", "B) Har kichik guruh alohida mavzuni o'rganib, qolganlariga o'rgatadi", "C) O'qituvchi aytadi, talabalar yozadi", "D) Raqobat asosida o'qitish"], answer: "B) Har kichik guruh alohida mavzuni o'rganib, qolganlariga o'rgatadi", explanation: "Jigso — 'expert groups' — har guruh mutaxassis bo'lib, bilimni tarqatadi.", difficulty: "BASIC" },
    { stem: "Keys-stadi metodida nima muhim?", options: ["A) Tezlik", "B) Real hayotiy muammoni tahlil qilish", "C) Yod olish", "D) To'g'ri javob topish"], answer: "B) Real hayotiy muammoni tahlil qilish", explanation: "Keys-stadi — real vaziyat, kompleks tahlil, guruh muhokamasi.", difficulty: "BASIC" },
    { stem: "Rolli o'yin metodi nimani asosan rivojlantiradi?", options: ["A) Yod olish qobiliyatini", "B) Matematik fikrlashni", "C) Empatiya va muloqot ko'nikmalarini", "D) Yozish ko'nikmalarini"], answer: "C) Empatiya va muloqot ko'nikmalarini", explanation: "Rolli o'yin — boshqa kishining o'rnida bo'lish orqali his etish.", difficulty: "INTERMEDIATE" },
    { stem: "Munozara (debate) metodida ikkala guruh bir xil fikrda bo'lsa nima qilish kerak?", options: ["A) Darsni bekor qilish", "B) O'qituvchi pozitsiyalarni belgilaydi, guruhlar himoya qiladi", "C) Faqat bir tomonni tinglash", "D) Yangi guruhlar tuzish"], answer: "B) O'qituvchi pozitsiyalarni belgilaydi, guruhlar himoya qiladi", explanation: "Debate — tayin qilingan pozitsiyani himoya qilish ko'nikmasi.", difficulty: "INTERMEDIATE" },
    { stem: "Interaktiv metodlarning qaysi kamchiligi bor?", options: ["A) Bilim uzoq esda qolmaydi", "B) Vaqt nazoratini talab qiladi va barcha ishtirokini ta'minlash qiyin", "C) Tanqidiy tafakkurni pasaytiradi", "D) Faqat qiziqarli talab"], answer: "B) Vaqt nazoratini talab qiladi va barcha ishtirokini ta'minlash qiyin", explanation: "Interaktiv metodlar samarali, lekin tashkiliy jihatdan talab ko'p.", difficulty: "INTERMEDIATE" },
    { stem: "SWOT tahlilida 'T' harfi nimani anglatadi?", options: ["A) Texnologiya", "B) Tahdid/Xavf (Threats)", "C) Ta'lim", "D) Tajriba"], answer: "B) Tahdid/Xavf (Threats)", explanation: "SWOT: Strengths, Weaknesses, Opportunities, Threats.", difficulty: "ADVANCED" },
    { stem: "Qaysi interaktiv metod bilimni eng uzoq muddatga saqlaydi?", options: ["A) Ma'ruza tinglash", "B) Video ko'rish", "C) O'qitish (boshqalarga tushuntirish)", "D) Kitob o'qish"], answer: "C) O'qitish (boshqalarga tushuntirish)", explanation: "Learning pyramid: o'qitish — 90% uzoq muddatli saqlash, ma'ruza — 5%.", difficulty: "ADVANCED" },
  ]);

  await addContent("tech-t2", "Raqamli ta'lim vositalari", `
Raqamli ta'lim vositalari — ta'lim jarayonini qo'llab-quvvatlash va samaradorligini oshirish uchun ishlatiladigan texnologiyalar va platformalar majmui.

**LMS (Learning Management System):**
- Moodle, Canvas, Google Classroom — kurs materiallarini joylashtirish va talabalarni boshqarish.
- BrainUP — adaptiv ta'lim imkoniyatli LMS.

**Video va multimedia:**
- YouTube, Khan Academy — bepul kontent resurslari.
- Loom, OBS — dars video yozib olish.
- Canva, PowerPoint — vizual prezentatsiya.

**Interaktiv vositalar:**
- Kahoot, Quizlet — geymifikatsiya asosida test.
- Miro, FigJam — virtual whiteboard.
- Mentimeter — real vaqt so'rovnomasi.

**Raqamli baholash:**
- Google Forms, Microsoft Forms — tezkor so'rovnoma.
- Turnitin — plagiat tekshiruvi.
- Grammarly — yozma ish tekshiruvi.

**Zamonaviy texnologiyalar:**
- VR/AR — virtual reallik orqali immersiv ta'lim.
- AI tutors — sun'iy intellekt asosida shaxsiy mentor.
- Gamifikatsiya — o'yin elementlarini ta'limga kiritish.

**Raqamli savod (Digital literacy)** — bugungi o'qituvchi uchun muhim kompetentsiya.
`, 0);

  await addQuestions("tech-t2", [
    { stem: "LMS nima?", options: ["A) O'qituvchi yordamchi sistema", "B) Ta'limni boshqarish tizimi (Learning Management System)", "C) Raqamli kutubxona", "D) Video platformasi"], answer: "B) Ta'limni boshqarish tizimi (Learning Management System)", explanation: "LMS — kurslar, materiallar, baholash va talabalarni boshqarish uchun platforma.", difficulty: "BASIC" },
    { stem: "Kahoot va Quizlet qanday vositalar?", options: ["A) Video yozib olish", "B) Geymifikatsiya asosida test va o'rganish", "C) Virtual whiteboard", "D) Plagiat tekshiruvi"], answer: "B) Geymifikatsiya asosida test va o'rganish", explanation: "Kahoot va Quizlet — o'yin shaklida bilimni tekshiradi va o'rgatadi.", difficulty: "BASIC" },
    { stem: "Gamifikatsiya ta'limda nimani anglatadi?", options: ["A) Faqat o'yin o'qitish", "B) O'yin elementlarini ta'limga kiritish", "C) Kompyuter o'yinlari o'ynash", "D) O'yin platformasida dars berish"], answer: "B) O'yin elementlarini ta'limga kiritish", explanation: "Gamifikatsiya — ball, daraja, mukofot elementlari orqali motivatsiyani oshirish.", difficulty: "BASIC" },
    { stem: "VR/AR ta'limda qanday afzallik beradi?", options: ["A) Tez va arzon", "B) Immersiv tajriba — go'yoki haqiqatda bo'lgandek o'rganish", "C) Faqat vizual", "D) Internet shart emas"], answer: "B) Immersiv tajriba — go'yoki haqiqatda bo'lgandek o'rganish", explanation: "Virtual reallik — xavfsiz muhitda amaliy tajriba (tibbiyot, muhandislik, tarix).", difficulty: "INTERMEDIATE" },
    { stem: "Raqamli savod (Digital literacy) o'qituvchi uchun nima?", options: ["A) Ixtiyoriy ko'nikma", "B) Faqat IT mutaxassislariga kerak", "C) Zamonaviy o'qituvchi uchun muhim professional kompetentsiya", "D) Faqat onlayn dars o'taydiganlarga kerak"], answer: "C) Zamonaviy o'qituvchi uchun muhim professional kompetentsiya", explanation: "Raqamli vositalardan foydalana bilish — bugungi ta'lim standartining bir qismi.", difficulty: "INTERMEDIATE" },
    { stem: "Mentimeter qanday vosita?", options: ["A) Plagiat tekshiruvi", "B) Real vaqt so'rovnomasi", "C) Video yozib olish", "D) Onlayn test"], answer: "B) Real vaqt so'rovnomasi", explanation: "Mentimeter — dars davomida talabalar fikrini real vaqtda ko'rish imkonini beradi.", difficulty: "INTERMEDIATE" },
    { stem: "Sun'iy intellekt asosida AI tutor nima?", options: ["A) Robot o'qituvchi", "B) Shaxsiy, adaptiv mentor funksiyasini bajaruvchi AI", "C) Faqat savol-javob boti", "D) Avtomatik baholash tizimi"], answer: "B) Shaxsiy, adaptiv mentor funksiyasini bajaruvchi AI", explanation: "AI tutor — talabaning darajasini tahlil qilib, individual yo'l-yo'riq beradi.", difficulty: "ADVANCED" },
    { stem: "Qaysi platforma BrainUP bilan bir kategoriyada?", options: ["A) YouTube", "B) Turnitin", "C) Moodle/Canvas (LMS)", "D) Canva"], answer: "C) Moodle/Canvas (LMS)", explanation: "BrainUP, Moodle, Canvas — barchasi LMS kategoriyasiga kiradi.", difficulty: "ADVANCED" },
  ]);

  await addContent("tech-t3", "Loyiha asosida o'qitish (Project-Based Learning)", `
PBL (Project-Based Learning) — talabalar real, murakkab muammoni hal qilish uchun uzoq muddatli loyiha ustida ishlaydigan ta'lim paradigmasi.

**PBL ning asosiy bosqichlari:**
1. **Muammo/savol qo'yish** — "Driving question" — markaziy savol.
2. **Loyihalash** — jarayon, rollar, vaqt jadvali.
3. **Tadqiqot** — ma'lumot to'plash, tahlil.
4. **Mahsulot yaratish** — hisobot, prezentatsiya, prototip.
5. **Taqdimot** — haqiqiy auditoriyaga ko'rsatish.
6. **Aks ettirish (Reflection)** — nima o'rgandik?

**PBL ning afzalliklari:**
- 21-asr ko'nikmalarini rivojlantiradi (muammo hal qilish, hamkorlik, tanqidiy tafakkur)
- Motivatsiya yuqori — real natija ko'rinadi
- Bilim chuqur va uzoq esda qoladi
- Ijtimoiy ko'nikmalar (teamwork) rivojlanadi

**PBL da baholash:**
- Portfolio — jarayon hujjatlari
- Rubrika — aniq mezonlar
- Tengdoshlar baholash — bir-birini baholash
- O'z-o'zini baholash

**Misol:** "Maktabimizda suv isrof qilinmasligini qanday kamaytirish mumkin?" — geografiya, matematika, biologiya birlashtirilgan loyiha.
`, 0);

  await addQuestions("tech-t3", [
    { stem: "PBL qanday qisqartma?", options: ["A) Problem Based Learning", "B) Project Based Learning", "C) Platform Based Learning", "D) Practical Based Learning"], answer: "B) Project Based Learning", explanation: "PBL — loyiha asosida o'qitish, real muammo yechishga yo'naltirilgan.", difficulty: "BASIC" },
    { stem: "PBLda 'Driving question' nima?", options: ["A) Imtihon savoli", "B) Loyihaning markaziy, bosh savoli", "C) O'qituvchi bergan vazifa", "D) Test savoli"], answer: "B) Loyihaning markaziy, bosh savoli", explanation: "Driving question — barcha tadqiqotni yo'naltiradigan asosiy savol.", difficulty: "BASIC" },
    { stem: "PBL da baholashning qaysi usuli jarayonni hujjatlashtiradi?", options: ["A) Test", "B) Portfolio", "C) Og'zaki imtihon", "D) Referat"], answer: "B) Portfolio", explanation: "Portfolio — loyiha jarayonidagi barcha ishlarni to'playdigan hujjat.", difficulty: "BASIC" },
    { stem: "PBL ning an'anaviy o'qitishdan asosiy farqi nima?", options: ["A) Ko'proq yod olish", "B) Real muammo yechish orqali chuqur bilim va ko'nikmalar", "C) Ko'proq dars soati", "D) Mustaqil ishlash"], answer: "B) Real muammo yechish orqali chuqur bilim va ko'nikmalar", explanation: "PBL — hayotiy kontekst, real natija, chuqur o'zlash tirishish.", difficulty: "INTERMEDIATE" },
    { stem: "PBL da tengdoshlar baholash (peer assessment) nima uchun ishlatiladi?", options: ["A) O'qituvchi vaqtini tejash", "B) Talabalarni bir-birini baholash orqali tanqidiy tafakkur va mas'uliyat rivojlantirish", "C) Ballarni kamaytirish", "D) Faqat rasmiy baholash uchun"], answer: "B) Talabalarni bir-birini baholash orqali tanqidiy tafakkur va mas'uliyat rivojlantirish", explanation: "Peer assessment — boshqalarni baholash orqali o'z-o'zini ham baholash ko'nikmasi oshadi.", difficulty: "INTERMEDIATE" },
    { stem: "PBL da reflection (aks ettirish) bosqichi nima maqsadda?", options: ["A) Loyihani tugatish", "B) O'qituvchi baholaydi", "C) Talabalar nima o'rganganini anglaydi va keyingi loyiha uchun saboq chiqaradi", "D) Faqat xatolarni topish"], answer: "C) Talabalar nima o'rganganini anglaydi va keyingi loyiha uchun saboq chiqaradi", explanation: "Reflection — metakognitsiya: o'z o'qish jarayonini anglab olish.", difficulty: "ADVANCED" },
    { stem: "Rubrika PBL da qanday ishlatiladi?", options: ["A) Vaqt rejasini tuzish", "B) Baholash uchun aniq mezonlar", "C) Guruh rollarini belgilash", "D) Ma'lumot to'plash"], answer: "B) Baholash uchun aniq mezonlar", explanation: "Rubrika — qanday sifat qaysi ballga mos ekanini oldindan belgilaydi.", difficulty: "ADVANCED" },
    { stem: "PBL 21-asr ko'nikmalaridan qaysilari ni rivojlantiradi?", options: ["A) Faqat yod olish", "B) Muammo hal qilish, hamkorlik, tanqidiy tafakkur, ijodkorlik", "C) Faqat yozma ko'nikmalar", "D) Faqat matematik ko'nikmalar"], answer: "B) Muammo hal qilish, hamkorlik, tanqidiy tafakkur, ijodkorlik", explanation: "4C: Critical thinking, Collaboration, Communication, Creativity — 21-asr ko'nikmalari.", difficulty: "INTERMEDIATE" },
  ]);

  await addContent("tech-t4", "Ta'limda baholash tizimi", `
Baholash — ta'lim jarayonining ajralmas qismi bo'lib, o'quvchining bilim darajasini aniqlash va ta'lim jarayonini takomillashtirish uchun xizmat qiladi.

**Baholash turlari:**

1. **Diagnostik baholash** — dars/kurs boshida boshlang'ich darajani aniqlash. Maqsad: rejalashtirish.

2. **Formativ baholash** — jarayon davomida. Maqsad: yo'naltirrish va tuzatish. Misol: savol-javob, topshiriqlar.

3. **Summativ baholash** — yakuniy, daraja aniqlash. Misol: imtihon, kurs ishi.

**Samarali baholash tamoyillari:**
- **Aniqlik** — mezonlar oldindan ma'lum.
- **Adolatlilik** — barcha uchun teng sharoit.
- **Foydalilik** — baholash o'rganishga yordam beradi (assessment for learning).
- **Yaxlit qamrov** — bilim, ko'nikma va munosabatni o'lchash.

**Alternativ baholash usullari:**
- Portfolio — ish to'plami
- O'z-o'zini baholash
- Ko'zatishga asoslangan baholash
- Autentik (real hayotiy) baholash

**BrainUP da baholash:**
Mastery score = 0.40×recentAccuracy + 0.25×historicalAccuracy + 0.20×retrievalScore + 0.15×consistencyScore. Bu formativ va summativ elementlarni birlashtiradi.
`, 0);

  await addQuestions("tech-t4", [
    { stem: "Formativ baholashning asosiy maqsadi nima?", options: ["A) Yakuniy baho qo'yish", "B) Jarayon davomida yo'naltirish va tuzatish", "C) Sertifikat berish", "D) Talabani aniqlash"], answer: "B) Jarayon davomida yo'naltirish va tuzatish", explanation: "Formativ — 'assessment for learning': o'qish jarayonida yordam berish.", difficulty: "BASIC" },
    { stem: "Diagnostik baholash qachon o'tkaziladi?", options: ["A) Kurs oxirida", "B) Kurs davomida", "C) Kurs yoki dars boshida", "D) Talaba xohlaganda"], answer: "C) Kurs yoki dars boshida", explanation: "Diagnostik baholash — boshlang'ich daraja aniqlash, rejalashtirish uchun.", difficulty: "BASIC" },
    { stem: "Summativ baholashning misoli?", options: ["A) Dars davomida savol-javob", "B) Uy vazifasini tekshirish", "C) Yakuniy imtihon", "D) Kuzatish"], answer: "C) Yakuniy imtihon", explanation: "Summativ — 'assessment of learning': yakuniy natijani aniqlash.", difficulty: "BASIC" },
    { stem: "Autentik baholash nima?", options: ["A) Test sinovlari", "B) Real hayotiy vaziyatlarda bilimni qo'llash", "C) O'qituvchi tomonidan baholash", "D) Belgilangan savollarga javob berish"], answer: "B) Real hayotiy vaziyatlarda bilimni qo'llash", explanation: "Autentik baholash — bilimni amaliy, real kontekstda namoyish qilish.", difficulty: "INTERMEDIATE" },
    { stem: "BrainUP mastery formulasida qaysi komponent eng katta og'irlikka ega?", options: ["A) Retrieval score (0.20)", "B) Historical accuracy (0.25)", "C) Recent accuracy (0.40)", "D) Consistency score (0.15)"], answer: "C) Recent accuracy (0.40)", explanation: "So'nggi natijalar eng muhim — 0.40 koeffitsient bilan.", difficulty: "INTERMEDIATE" },
    { stem: "Portfolio baholashning afzalligi nima?", options: ["A) Tez va arzon", "B) Faqat bilimni o'lchaydi", "C) O'qish jarayoni va o'sishni ko'rsatadi", "D) Standartlashtirilgan"], answer: "C) O'qish jarayoni va o'sishni ko'rsatadi", explanation: "Portfolio — bir vaqtli emas, balki dinamika va jarayonni aks ettiradi.", difficulty: "ADVANCED" },
    { stem: "Baholashning 'foydalilik' tamoyili nimani anglatadi?", options: ["A) Tez baholash", "B) Baholash o'rganishga yordam beradi", "C) Kichik xatolarga e'tibor bermaslik", "D) Ko'p baho qo'yish"], answer: "B) Baholash o'rganishga yordam beradi", explanation: "Assessment for learning: natija faqat baho emas, yo'nalish va rivojlanish uchun.", difficulty: "ADVANCED" },
    { stem: "O'z-o'zini baholash o'quvchida qanday ko'nikma rivojlantiradi?", options: ["A) Raqobatbardoshlik", "B) Metakognitsiya va o'z-o'zini anglash", "C) Matematik tafakkur", "D) Muloqot ko'nikmalari"], answer: "B) Metakognitsiya va o'z-o'zini anglash", explanation: "Metakognitsiya — o'z o'qish jarayonini nazorat qilish va anglab olish.", difficulty: "ADVANCED" },
  ]);

  console.log("✓ Kurs 3 (Ta'lim texnologiyalari) — tayyor");

  // ─── TALABALAR ────────────────────────────────────────────────
  const studentsData = [
    { email: "azimova@ndpi.uz", firstName: "Malika", lastName: "Azimova", year: 1, group: "P-11", research: "P0002", faculty: "pedagogy-faculty" },
    { email: "tursunov@ndpi.uz", firstName: "Jasur", lastName: "Tursunov", year: 1, group: "P-11", research: "P0003", faculty: "pedagogy-faculty" },
    { email: "xolmatova@ndpi.uz", firstName: "Zilola", lastName: "Xolmatova", year: 2, group: "P-21", research: "P0004", faculty: "pedagogy-faculty" },
    { email: "normatov@ndpi.uz", firstName: "Sherzod", lastName: "Normatov", year: 2, group: "P-22", research: "P0005", faculty: "pedagogy-faculty" },
    { email: "karimova@ndpi.uz", firstName: "Dildora", lastName: "Karimova", year: 3, group: "P-31", research: "P0006", faculty: "pedagogy-faculty" },
    { email: "ergashev@ndpi.uz", firstName: "Ulugbek", lastName: "Ergashev", year: 1, group: "BT-11", research: "P0007", faculty: "boshlangich-faculty" },
    { email: "salimova@ndpi.uz", firstName: "Nargiza", lastName: "Salimova", year: 1, group: "BT-11", research: "P0008", faculty: "boshlangich-faculty" },
    { email: "raximov@ndpi.uz", firstName: "Bobur", lastName: "Raximov", year: 2, group: "BT-21", research: "P0009", faculty: "boshlangich-faculty" },
    { email: "yuldasheva@ndpi.uz", firstName: "Sarvinoz", lastName: "Yuldasheva", year: 1, group: "MT-11", research: "P0010", faculty: "maktabgacha-faculty" },
    { email: "mirzayev@ndpi.uz", firstName: "Otabek", lastName: "Mirzayev", year: 3, group: "P-31", research: "P0011", faculty: "pedagogy-faculty" },
  ];

  const stuPassword = await hash("student123", 12);
  const studentIds: string[] = [];

  for (const s of studentsData) {
    const user = await db.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash: stuPassword,
        role: "STUDENT",
        student: {
          create: {
            firstName: s.firstName,
            lastName: s.lastName,
            universityId: university.id,
            facultyId: s.faculty,
            yearLevel: s.year,
            groupName: s.group,
            researchId: s.research,
          },
        },
      },
      include: { student: true },
    });
    if (user.student) studentIds.push(user.student.id);
  }

  console.log(`✓ ${studentsData.length} ta talaba qo'shildi`);

  // ─── YOZILISHLAR ─────────────────────────────────────────────
  const courseEnrollments = [
    // Pedagogika fakulteti talabalari — kurs 1 va 2
    { studentIdx: 0, courseId: "ped-mahorat-course" },
    { studentIdx: 0, courseId: "umumiy-psixologiya-course" },
    { studentIdx: 1, courseId: "ped-mahorat-course" },
    { studentIdx: 1, courseId: "umumiy-psixologiya-course" },
    { studentIdx: 2, courseId: "ped-mahorat-course" },
    { studentIdx: 2, courseId: "umumiy-psixologiya-course" },
    { studentIdx: 3, courseId: "ped-mahorat-course" },
    { studentIdx: 3, courseId: "umumiy-psixologiya-course" },
    { studentIdx: 4, courseId: "ped-mahorat-course" },
    { studentIdx: 4, courseId: "umumiy-psixologiya-course" },
    // Boshlang'ich ta'lim — kurs 3
    { studentIdx: 5, courseId: "talim-texnologiyalari-course" },
    { studentIdx: 5, courseId: "ped-mahorat-course" },
    { studentIdx: 6, courseId: "talim-texnologiyalari-course" },
    { studentIdx: 6, courseId: "umumiy-psixologiya-course" },
    { studentIdx: 7, courseId: "talim-texnologiyalari-course" },
    { studentIdx: 7, courseId: "ped-mahorat-course" },
    { studentIdx: 8, courseId: "umumiy-psixologiya-course" },
    { studentIdx: 9, courseId: "ped-mahorat-course" },
    { studentIdx: 9, courseId: "talim-texnologiyalari-course" },
  ];

  for (const e of courseEnrollments) {
    if (!studentIds[e.studentIdx]) continue;
    await db.enrollment.upsert({
      where: { studentId_courseId: { studentId: studentIds[e.studentIdx], courseId: e.courseId } },
      update: {},
      create: { studentId: studentIds[e.studentIdx], courseId: e.courseId },
    }).catch(() => {}); // ignore duplicate
  }

  console.log("✓ Talabalar kurslarga yozildi");

  // ─── XULOSA ───────────────────────────────────────────────────
  const totalContent = await db.contentItem.count({ where: { status: "APPROVED" } });
  const totalQuestions = await db.question.count({ where: { isActive: true } });
  const totalStudents = await db.student.count();
  const totalCourses = await db.course.count();

  console.log("\n═══════════════════════════════════════");
  console.log("           SEED YAKUNLANDI");
  console.log("═══════════════════════════════════════");
  console.log(`📚 Kurslar:      ${totalCourses}`);
  console.log(`📄 Materiallar:  ${totalContent} (APPROVED)`);
  console.log(`❓ Savollar:     ${totalQuestions}`);
  console.log(`👥 Talabalar:    ${totalStudents}`);
  console.log("\nProfessorlar:");
  console.log("  professor@ndpi.uz  / professor123  (Aziz Karimov)");
  console.log("  yusupova@ndpi.uz   / professor123  (Nodira Yusupova)");
  console.log("  toshmatov@ndpi.uz  / professor123  (Hamid Toshmatov)");
  console.log("\nTalabalar (barchasi: student123):");
  for (const s of studentsData) {
    console.log(`  ${s.email}`);
  }
}

main().catch(console.error).finally(() => db.$disconnect());
