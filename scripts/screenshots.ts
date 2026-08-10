import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const BASE = "https://brainup-ndpi.vercel.app";
const OUT = path.join(process.cwd(), "scripts", "screenshots");
fs.mkdirSync(OUT, { recursive: true });

async function shot(page: any, name: string) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  console.log(`📸 ${name}.png`);
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  // ── Desktop (1280×800) ──
  const desk = await browser.newContext({ viewport: { width: 1280, height: 800 } });

  // Landing
  { const p = await desk.newPage(); await p.goto(BASE, { waitUntil: "networkidle" }); await shot(p, "01-landing-desktop"); await p.close(); }

  // Login
  { const p = await desk.newPage(); await p.goto(`${BASE}/login`, { waitUntil: "networkidle" }); await shot(p, "02-login-desktop"); await p.close(); }

  // Register
  { const p = await desk.newPage(); await p.goto(`${BASE}/register`, { waitUntil: "networkidle" }); await shot(p, "03-register-desktop"); await p.close(); }

  // Student pages
  const stuCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const stuPage = await stuCtx.newPage();
  await stuPage.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await stuPage.fill('input[type="email"]', "student@ndpi.uz");
  await stuPage.fill('input[type="password"]', "student123");
  await stuPage.click('button[type="submit"]');
  await stuPage.waitForURL("**/dashboard", { timeout: 8000 });

  await shot(stuPage, "04-student-dashboard");
  await stuPage.goto(`${BASE}/courses`, { waitUntil: "networkidle" }); await shot(stuPage, "05-student-courses");
  await stuPage.goto(`${BASE}/assessment`, { waitUntil: "networkidle" }); await shot(stuPage, "06-student-assessment");
  await stuPage.goto(`${BASE}/retrieval`, { waitUntil: "networkidle" }); await shot(stuPage, "07-student-retrieval");
  await stuPage.goto(`${BASE}/progress`, { waitUntil: "networkidle" }); await shot(stuPage, "08-student-progress");

  // Professor pages
  const profCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const profPage = await profCtx.newPage();
  await profPage.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await profPage.fill('input[type="email"]', "professor@ndpi.uz");
  await profPage.fill('input[type="password"]', "professor123");
  await profPage.click('button[type="submit"]');
  await profPage.waitForURL("**/professor/**", { timeout: 8000 });

  await shot(profPage, "09-professor-dashboard");
  await profPage.goto(`${BASE}/professor/courses`, { waitUntil: "networkidle" }); await shot(profPage, "10-professor-courses");
  await profPage.goto(`${BASE}/professor/analytics`, { waitUntil: "networkidle" }); await shot(profPage, "11-professor-analytics");
  await profPage.goto(`${BASE}/professor/pilot`, { waitUntil: "networkidle" }); await shot(profPage, "12-professor-pilot");

  // Admin pages
  const adminCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const adminPage = await adminCtx.newPage();
  await adminPage.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await adminPage.fill('input[type="email"]', "admin@ndpi.uz");
  await adminPage.fill('input[type="password"]', "BrainUP@Admin2026");
  await adminPage.click('button[type="submit"]');
  await adminPage.waitForURL("**/admin**", { timeout: 8000 });

  await shot(adminPage, "13-admin-dashboard");
  await adminPage.goto(`${BASE}/admin/users`, { waitUntil: "networkidle" }); await shot(adminPage, "14-admin-users");
  await adminPage.goto(`${BASE}/admin/professors`, { waitUntil: "networkidle" }); await shot(adminPage, "15-admin-professors");

  // ── Mobile (390×844) ──
  const mob = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobStu = await mob.newPage();
  await mobStu.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await mobStu.fill('input[type="email"]', "student@ndpi.uz");
  await mobStu.fill('input[type="password"]', "student123");
  await mobStu.click('button[type="submit"]');
  await mobStu.waitForURL("**/dashboard", { timeout: 8000 });
  await shot(mobStu, "16-student-dashboard-mobile");
  await mobStu.goto(`${BASE}/progress`, { waitUntil: "networkidle" }); await shot(mobStu, "17-student-progress-mobile");

  const mobLanding = await mob.newPage();
  await mobLanding.goto(BASE, { waitUntil: "networkidle" }); await shot(mobLanding, "18-landing-mobile");

  await browser.close();
  console.log(`\nScreenshots saved to: ${OUT}`);
}

run().catch(e => { console.error(e); process.exit(1); });
