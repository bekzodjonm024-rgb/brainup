const FROM = "BrainUP <noreply@brainup-ndpi.uz>";

export function enrollmentWelcome({
  studentName,
  courseTitle,
  professorName,
  loginUrl,
}: {
  studentName: string;
  courseTitle: string;
  professorName: string;
  loginUrl: string;
}) {
  return {
    from: FROM,
    subject: `BrainUP: "${courseTitle}" kursiga yozildingiz`,
    html: `
<!DOCTYPE html>
<html lang="uz">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#2563eb;padding:32px 40px">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">BrainUP</h1>
      <p style="margin:4px 0 0;color:#bfdbfe;font-size:14px">Adaptiv o'quv platformasi</p>
    </div>
    <div style="padding:32px 40px">
      <p style="margin:0 0 16px;font-size:16px;color:#0f172a">Assalomu alaykum, <strong>${studentName}</strong>!</p>
      <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6">
        Siz <strong>${professorName}</strong> tomonidan
        <strong>"${courseTitle}"</strong> kursiga qo'shildingiz.
        Platformaga kirib o'qishni boshlashingiz mumkin.
      </p>
      <a href="${loginUrl}"
         style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600">
        Kursni boshlash →
      </a>
      <p style="margin:32px 0 0;font-size:13px;color:#94a3b8">
        BrainUP — NamDPI
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}

export function retrievalReminder({
  studentName,
  dueTopics,
  loginUrl,
}: {
  studentName: string;
  dueTopics: { title: string; courseTitle: string }[];
  loginUrl: string;
}) {
  const topicList = dueTopics
    .slice(0, 5)
    .map((t) => `<li style="margin:4px 0;color:#475569">${t.title} <span style="color:#94a3b8;font-size:13px">(${t.courseTitle})</span></li>`)
    .join("");

  const extra = dueTopics.length > 5 ? `<li style="color:#94a3b8;font-style:italic">va yana ${dueTopics.length - 5} ta...</li>` : "";

  return {
    from: FROM,
    subject: `BrainUP: ${dueTopics.length} ta takrorlash kutilmoqda`,
    html: `
<!DOCTYPE html>
<html lang="uz">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#7c3aed;padding:32px 40px">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">BrainUP</h1>
      <p style="margin:4px 0 0;color:#ddd6fe;font-size:14px">Takrorlash eslatmasi</p>
    </div>
    <div style="padding:32px 40px">
      <p style="margin:0 0 16px;font-size:16px;color:#0f172a">Salom, <strong>${studentName}</strong>!</p>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6">
        Quyidagi mavzularni takrorlash vaqti keldi.
        Takrorlash bilimni mustahkamlashga yordam beradi:
      </p>
      <ul style="margin:0 0 24px;padding-left:20px">
        ${topicList}${extra}
      </ul>
      <a href="${loginUrl}/retrieval"
         style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600">
        Takrorlashni boshlash →
      </a>
      <p style="margin:32px 0 0;font-size:13px;color:#94a3b8">BrainUP — NamDPI</p>
    </div>
  </div>
</body>
</html>`,
  };
}
