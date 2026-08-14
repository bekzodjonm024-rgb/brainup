const { chromium } = require("playwright");

async function screenshot(page, name) {
  await page.screenshot({ path: `C:/Users/bekzo/Downloads/BRAINUP/scripts/${name}`, fullPage: false });
  console.log("saved:", name);
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  for (const [label, viewport] of [
    ["desk", { width: 1280, height: 800 }],
    ["mob", { width: 375, height: 812 }],
  ]) {
    const ctx = await browser.newContext({ viewport });
    await ctx.addInitScript("localStorage.setItem('theme','light')");
    const page = await ctx.newPage();

    // Login as professor
    await page.goto("http://localhost:3000/login");
    await page.waitForLoadState("networkidle");
    await page.fill('input[type="email"]', "professor@ndpi.uz");
    await page.fill('input[type="password"]', "professor123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/professor**", { timeout: 10000 });
    await page.waitForTimeout(500);

    // Go to professor courses
    await page.goto("http://localhost:3000/professor/courses");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);

    // Find first course link (not /new, not /analytics)
    const links = page.locator('a[href^="/professor/courses/"]');
    const count = await links.count();
    let courseHref = null;
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute("href");
      if (href && !href.endsWith("/new") && !href.includes("/analytics")) {
        courseHref = href;
        break;
      }
    }
    console.log(`[${label}] Course:`, courseHref);

    await page.goto(`http://localhost:3000${courseHref}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
    await screenshot(page, `ss_prof_course_detail_${label}.png`);

    // Navigate to course-specific analytics (not sidebar /professor/analytics)
    const analyticsHref = `${courseHref}/analytics`;
    console.log(`[${label}] Analytics:`, analyticsHref);
    await page.goto(`http://localhost:3000${analyticsHref}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
    await screenshot(page, `ss_prof_course_analytics_${label}.png`);

    await ctx.close();
  }

  await browser.close();
  console.log("done");
}

run().catch(console.error);
