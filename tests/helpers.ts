import { expect, type Page } from "@playwright/test";

export async function isolateThirdParties(page: Page) {
  // Keep route smoke tests deterministic if they enter a private portal screen.
  // Separate boundary tests assert that public pages never request these hosts.
  await page.route(
    /https:\/\/(cdn\.onesignal\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)/,
    (route) => route.fulfill({ status: 200, body: "" }),
  );
}

export async function ready(page: Page) {
  await expect(page.locator("#skybook-title")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

export async function revealAll(page: Page) {
  for (const section of await page.locator(".sk-home > section").all()) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
  }
  await page.evaluate(async () => {
    await Promise.all(
      [...document.images]
        .filter((image) => image.offsetWidth > 0)
        .map((image) => image.decode().catch(() => undefined)),
    );
  });
}

export function entry(
  type: string,
  slug: string,
  content: Record<string, unknown>,
  media: unknown[] = [],
) {
  return {
    id: slug,
    entryType: type,
    slug,
    content,
    media,
    seo: {},
    publishedAt: "2026-09-01T10:00:00Z",
  };
}
