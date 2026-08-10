import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const BASE = "https://brainup-ndpi.vercel.app";
const OUT = path.join(process.cwd(), "scripts", "screenshots-v2");
fs.mkdirSync(OUT, { recursive: true });

async function shot(page: any, name: string) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  console.log(`📸 ${name}.png`);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const desk = await browser.newContext({ viewport: { width: 1280, height: 800 } });

  // Landing
  { const p = await desk.newPage(); await p.goto(BASE, { waitUntil: "networkidle" }); await shot(p, "01-landing"); await p.close(); }

  // Login
  { const p = await desk.newPage(); await p.goto(`${BASE}/login`, { waitUntil: "networkidle" }); await shot(p, "02-login"); await p.close(); }

  // Register
  { const p = await desk.newPage(); await p.goto(`${BASE}/register`, { waitUntil: "networkidle" }); await shot(p, "03-register"); await p.close(); }

  // Student
  const stuCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const stuPage = await stuCtx.newPage();
  await stuPage.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await stuPage.fill('input[type="email"]', "student@ndpi.uz");
  await stuPage.fill('input[type="password"]', "student123");
  await stuPage.click('button[type="submit"]');
  await stuPage.waitForURL("**/dashboard", { timeout: 10000 });
  await shot(stuPage, "04-student-dashboard");
  await stuPage.goto(`${BASE}/courses`, { waitUntil: "networkidle" }); await shot(stuPage, "05-student-courses");
  await stuPage.goto(`${BASE}/progress`, { waitUntil: "networkidle" }); await shot(stuPage, "06-student-progress");

  // Professor
  const profCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const profPage = await profCtx.newPage();
  await profPage.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await profPage.fill('input[type="email"]', "professor@ndpi.uz");
  await profPage.fill('input[type="password"]', "professor123");
  await profPage.click('button[type="submit"]');
  await profPage.waitForURL("**/professor/**", { timeout: 10000 });
  await shot(profPage, "07-professor-dashboard");

  // Mobile
  const mob = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobStu = await mob.newPage();
  await mobStu.goto(`${BASE}/login`, { waitUntil: "networkidle" }); await shot(mobStu, "08-login-mobile");
  await mobStu.fill('input[type="email"]', "student@ndpi.uz");
  await mobStu.fill('input[type="password"]', "student123");
  await mobStu.click('button[type="submit"]');
  await mobStu.waitForURL("**/dashboard", { timeout: 10000 });
  await shot(mobStu, "09-student-dashboard-mobile");
  await mobStu.goto(`${BASE}/progress`, { waitUntil: "networkidle" }); await shot(mobStu, "10-progress-mobile");

  const mobLanding = await mob.newPage();
  await mobLanding.goto(BASE, { waitUntil: "networkidle" }); await shot(mobLanding, "11-landing-mobile");

  await browser.close();
  console.log(`\nScreenshots saved to: ${OUT}`);
}

run().catch(e => { console.error(e); process.exit(1); });
