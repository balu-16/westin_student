import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const destination = fileURLToPath(new URL("../../references/homepage-rebuild/", import.meta.url));
const browser = await chromium.launch();
try {
  for (const [name, width, height] of [
    ["desktop", 1440, 1000], ["mobile", 390, 844], ["tablet", 1024, 1000],
  ]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(process.env.SKYBOOK_PREVIEW_URL || "http://127.0.0.1:4173/");
    await page.locator("#skybook-title").waitFor();
    await page.evaluate(() => document.fonts.ready);
    // Load each lazy section before attempting to decode all visible media.
    for (const section of await page.locator(".sk-home > section").all()) {
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
    }
    await page.evaluate(async () => {
      await Promise.all([...document.images].filter(image => image.offsetWidth > 0).map(image => image.decode().catch(() => undefined)));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(200);
    if (errors.length) throw new Error(`${name}: ${errors.join("; ")}`);
    await page.screenshot({ path: path.join(destination, `homepage-${name}.png`), fullPage: true });
    await page.screenshot({ path: path.join(destination, `hero-${name}.png`) });
    console.log(`${name}: saved full page and hero, no runtime errors`);
    await context.close();
  }
} finally {
  await browser.close();
}
