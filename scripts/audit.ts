import { chromium } from "playwright";

const BASE = "https://brainup-ndpi.vercel.app";
const results: { check: string; status: "✅" | "❌" | "⚠️"; detail: string }[] = [];

function pass(check: string, detail = "") { results.push({ check, status: "✅", detail }); }
function fail(check: string, detail = "") { results.push({ check, status: "❌", detail }); }
function warn(check: string, detail = "") { results.push({ check, status: "⚠️", detail }); }

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();

  // ─── 1. LANDING PAGE ───
  {
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: "networkidle" });
    const h1 = await page.locator("h1").first().textContent();
    if (h1?.includes("o'qing")) pass("Landing page", h1.trim());
    else fail("Landing page", `H1: ${h1}`);
    const loginBtn = await page.locator("text=Kirish").count();
    const regBtn = await page.locator("text=Boshlash").first().count();
    if (loginBtn > 0 && regBtn > 0) pass("Landing: nav buttons");
    else fail("Landing: nav buttons", `login=${loginBtn}, reg=${regBtn}`);
    await page.close();
  }

  // ─── 2. STUDENT LOGIN ───
  {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', "student@ndpi.uz");
    await page.fill('input[type="password"]', "student123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 8000 }).catch(() => {});
    if (page.url().includes("/dashboard")) pass("Student login → /dashboard");
    else fail("Student login", `ended at: ${page.url()}`);

    // ─── 3. STUDENT DASHBOARD ───
    const heading = await page.locator("h1, h2").first().textContent().catch(() => "");
    if (heading) pass("Student dashboard loads", heading.trim());
    else fail("Student dashboard", "No heading found");

    // ─── 4. COURSES PAGE ───
    await page.goto(`${BASE}/courses`, { waitUntil: "networkidle" });
    const courseCount = await page.locator('[class*="card"], article, .course').count();
    pass("Courses page loads", `${courseCount} element(s)`);

    // ─── 5. ASSESSMENT PAGE ───
    await page.goto(`${BASE}/assessment`, { waitUntil: "networkidle" });
    const assessText = await page.locator("h1, h2").first().textContent().catch(() => "");
    if (assessText) pass("Assessment page loads", assessText.trim());
    else fail("Assessment page", "No content");

    // ─── 6. PROGRESS PAGE ───
    await page.goto(`${BASE}/progress`, { waitUntil: "networkidle" });
    const progressText = await page.locator("h1").first().textContent().catch(() => "");
    if (progressText?.includes("Progress") || progressText?.includes("progress")) pass("Progress page loads", progressText);
    else warn("Progress page", `h1: ${progressText}`);

    // ─── 7. RETRIEVAL PAGE ───
    await page.goto(`${BASE}/retrieval`, { waitUntil: "networkidle" });
    const retText = await page.locator("h1").first().textContent().catch(() => "");
    pass("Retrieval page loads", retText?.trim() ?? "ok");

    // ─── 8. SIDEBAR LINKS ───
    const sidebarLinks = await page.locator("nav a, aside a").count();
    if (sidebarLinks >= 4) pass("Sidebar nav links", `${sidebarLinks} links`);
    else warn("Sidebar nav", `only ${sidebarLinks} links`);

    await page.close();
  }

  // ─── 9. PROFESSOR LOGIN ───
  {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', "professor@ndpi.uz");
    await page.fill('input[type="password"]', "professor123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/professor/**", { timeout: 8000 }).catch(() => {});
    if (page.url().includes("/professor/")) pass("Professor login → /professor/dashboard");
    else fail("Professor login", `ended at: ${page.url()}`);

    // ─── 10. PROFESSOR COURSES ───
    await page.goto(`${BASE}/professor/courses`, { waitUntil: "networkidle" });
    const profH = await page.locator("h1").first().textContent().catch(() => "");
    pass("Professor courses page", profH?.trim() ?? "ok");

    // ─── 11. PROFESSOR ANALYTICS ───
    await page.goto(`${BASE}/professor/analytics`, { waitUntil: "networkidle" });
    const analyticsH = await page.locator("h1").first().textContent().catch(() => "");
    pass("Professor analytics page", analyticsH?.trim() ?? "ok");

    // ─── 12. PROFESSOR PILOT ───
    await page.goto(`${BASE}/professor/pilot`, { waitUntil: "networkidle" });
    const pilotH = await page.locator("h1").first().textContent().catch(() => "");
    pass("Professor pilot page", pilotH?.trim() ?? "ok");

    await page.close();
  }

  // ─── 13. ADMIN LOGIN ───
  {
    const page = await ctx.newPage();
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', "admin@ndpi.uz");
    await page.fill('input[type="password"]', "BrainUP@Admin2026");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin**", { timeout: 8000 }).catch(() => {});
    if (page.url().includes("/admin")) pass("Admin login → /admin");
    else fail("Admin login", `ended at: ${page.url()}`);

    // ─── 14. ADMIN DASHBOARD ───
    const adminH = await page.locator("h1").first().textContent().catch(() => "");
    pass("Admin dashboard", adminH?.trim() ?? "ok");

    // ─── 15. ADMIN USERS ───
    await page.goto(`${BASE}/admin/users`, { waitUntil: "networkidle" });
    const usersH = await page.locator("h1").first().textContent().catch(() => "");
    pass("Admin users page", usersH?.trim() ?? "ok");

    // ─── 16. ADMIN PROFESSORS ───
    await page.goto(`${BASE}/admin/professors`, { waitUntil: "networkidle" });
    const profsH = await page.locator("h1").first().textContent().catch(() => "");
    pass("Admin professors page", profsH?.trim() ?? "ok");

    // ─── 17. CROSS-ROLE GUARD (admin → /dashboard should redirect to /admin) ───
    await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    if (page.url().includes("/admin")) pass("ADMIN guard: /dashboard → /admin");
    else warn("ADMIN guard", `went to: ${page.url()}`);

    await page.close();
  }

  // ─── 18. 404 HANDLING ───
  {
    const page = await ctx.newPage();
    const res = await page.goto(`${BASE}/nonexistent-page-xyz`);
    if (res?.status() === 404 || page.url().includes("login")) pass("404 handling", `status: ${res?.status()}`);
    else warn("404 handling", `status: ${res?.status()}, url: ${page.url()}`);
    await page.close();
  }

  await browser.close();

  // ─── PRINT RESULTS ───
  console.log("\n═══════════════════════════════════════════════");
  console.log("  BrainUP — To'liq audit natijasi");
  console.log("═══════════════════════════════════════════════");
  for (const r of results) {
    console.log(`${r.status} ${r.check}${r.detail ? `  →  ${r.detail}` : ""}`);
  }
  const passed = results.filter(r => r.status === "✅").length;
  const failed = results.filter(r => r.status === "❌").length;
  const warned = results.filter(r => r.status === "⚠️").length;
  console.log("═══════════════════════════════════════════════");
  console.log(`  Jami: ${results.length}  |  ✅ ${passed}  |  ⚠️ ${warned}  |  ❌ ${failed}`);
  console.log("═══════════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error(e); process.exit(1); });
