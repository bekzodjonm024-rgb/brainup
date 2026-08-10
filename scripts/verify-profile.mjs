import { chromium } from "playwright";
import { writeFileSync } from "fs";

const BASE = "https://brainup-ndpi.vercel.app";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  // ── STUDENT ──────────────────────────────────────────────
  console.log("\n=== STUDENT ===");
  await page.goto(`${BASE}/login`);
  await page.fill('input[type=email]', 'student@ndpi.uz');
  await page.fill('input[type=password]', 'student123');
  await page.click('button[type=submit]');
  await page.waitForURL("**/dashboard", { timeout: 12000 });
  console.log("Login: OK");

  await page.goto(`${BASE}/profile`);
  await page.waitForLoadState("networkidle");

  // Check settings sections
  const h2s = await page.locator("h2").allTextContents();
  console.log("H2 sections:", h2s);

  const forms = await page.locator("form").count();
  console.log("Forms count:", forms);

  const cardTitles = await page.locator("[class*='CardTitle']").allTextContents();
  console.log("Card titles:", cardTitles);

  await page.screenshot({ path: "/tmp/student-profile.png", fullPage: true });
  console.log("Screenshot: student-profile.png");

  // Test name edit
  const firstNameInput = page.locator('#firstName');
  const originalName = await firstNameInput.inputValue();
  await firstNameInput.fill("TestIlmiy");
  await page.locator("form").first().locator('button[type=submit]').click();
  await page.waitForTimeout(2000);
  const savedMsg = await page.locator("text=Saqlandi").isVisible();
  console.log("Name save feedback visible:", savedMsg);
  // Restore
  await firstNameInput.fill(originalName);
  await page.locator("form").first().locator('button[type=submit]').click();
  await page.waitForTimeout(1500);

  // Test wrong password
  await page.locator('#currentPw').fill("wrongpassword");
  await page.locator('#newPw').fill("newpass123");
  await page.locator('#confirmPw').fill("newpass123");
  const pwForm = page.locator("form").last();
  await pwForm.locator('button[type=submit]').click();
  await page.waitForTimeout(2000);
  const pwError = await page.locator("text=noto'g'ri, text=xato").first().isVisible().catch(() => false);
  const pwErrorText = await page.locator(".text-red-500").last().textContent().catch(() => "");
  console.log("Wrong password error:", pwErrorText);
  await page.screenshot({ path: "/tmp/student-profile-pw-error.png", fullPage: true });

  // ── PROFESSOR ──────────────────────────────────────────────
  console.log("\n=== PROFESSOR ===");
  await page.goto(`${BASE}/login`);
  await page.fill('input[type=email]', 'professor@ndpi.uz');
  await page.fill('input[type=password]', 'professor123');
  await page.click('button[type=submit]');
  await page.waitForURL("**/dashboard", { timeout: 12000 });
  console.log("Professor Login: OK");

  await page.goto(`${BASE}/professor/profile`);
  await page.waitForLoadState("networkidle");

  const profH2s = await page.locator("h2").allTextContents();
  console.log("Professor H2 sections:", profH2s);

  const profCardTitles = await page.locator("[class*='CardTitle']").allTextContents();
  console.log("Professor card titles:", profCardTitles);

  // Check sidebar has Profilim link
  const sidebarLinks = await page.locator("aside a").allTextContents();
  console.log("Sidebar links:", sidebarLinks.map(s => s.trim()).filter(Boolean));

  await page.screenshot({ path: "/tmp/professor-profile.png", fullPage: true });
  console.log("Screenshot: professor-profile.png");

  // Test title edit
  const titleInput = page.locator('#title');
  const titleExists = await titleInput.isVisible();
  console.log("Title input visible:", titleExists);
  if (titleExists) {
    await titleInput.fill("Dr.");
    await page.locator("form").nth(1).locator('button[type=submit]').click();
    await page.waitForTimeout(2000);
    const titleSaved = await page.locator("text=Saqlandi").isVisible();
    console.log("Title save feedback:", titleSaved);
    await page.screenshot({ path: "/tmp/professor-title-saved.png", fullPage: true });
  }

  console.log("\nAll checks complete.");
} catch (e) {
  console.error("ERROR:", e.message);
  await page.screenshot({ path: "/tmp/verify-error.png", fullPage: true });
} finally {
  await browser.close();
}
