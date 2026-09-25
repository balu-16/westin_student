import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createHomeModel, safePublicUrl } from "../src/public/home-model";
import { entry, isolateThirdParties, ready, revealAll } from "./helpers";

test.beforeEach(async ({ page }) => isolateThirdParties(page));

for (const scenario of ["populated", "empty", "failed", "malformed"] as const) {
  test(`published mode keeps the full composition with ${scenario} content`, async ({
    page,
  }) => {
    const requests: Array<{ url: string; auth?: string }> = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/"))
        requests.push({
          url: request.url(),
          auth: request.headers().authorization,
        });
    });
    const entries =
      scenario === "populated"
        ? [
            entry("homepage-section", "hero", {
              title: "A published new beginning.",
              summary: "Published college introduction.",
            }),
            entry("news", "a-reviewed-story", {
              title: "A reviewed campus story",
              summary: "A published summary.",
            }),
          ]
        : [];
    await page.route("**/api/public/site", (route) =>
      route.fulfill({
        status: scenario === "failed" ? 503 : 200,
        json:
          scenario === "malformed"
            ? { entries: [null, { slug: "bad", content: null }] }
            : { entries, settings: {} },
      }),
    );
    await page.goto("/");
    await ready(page);
    await expect(page.locator(".sk-home > section")).toHaveCount(9);
    await expect(page.locator(".sk-hero-art img")).toBeVisible();
    if (scenario === "populated") {
      await expect(page.locator("h1")).toHaveText("A published new beginning.");
      await expect(page.getByText("A reviewed campus story")).toBeVisible();
    } else {
      await expect(page.locator("h1")).toHaveText(
        "Big dreams.Bright beginnings.",
      );
      await expect(page.locator(".sk-people blockquote")).toHaveCount(0);
      await expect(page.locator(".sk-editions")).toHaveCount(0);
    }
    if (scenario === "failed")
      await expect(page.getByRole("status")).toContainText(
        "couldn’t be loaded",
      );
    await expect(page.locator(".sk-preview-note")).toHaveCount(0);
    expect(requests.length).toBeGreaterThan(0);
    expect(
      requests.every(
        (request) => !request.auth && request.url.includes("/public/site"),
      ),
    ).toBe(true);
  });
}

test("slow content never blocks the headline or main actions", async ({
  page,
}) => {
  let release: () => void = () => undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/public/site", async (route) => {
    await held;
    await route.fulfill({ json: { entries: [], settings: {} } });
  });
  await page.goto("/");
  await ready(page);
  await expect(
    page.getByRole("link", { name: "Explore programs", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText(
    "Checking for the latest",
  );
  release();
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("published images, attributed quote and genuine PDF use the shared chapters", async ({
  page,
}) => {
  const media = {
    id: "media",
    mimeType: "image/webp",
    url: "/images/skybook/business-960.webp",
    altText: "Published image test fixture",
    focalX: 0.25,
    focalY: 0.75,
  };
  await page.route("**/api/public/site", (route) =>
    route.fulfill({
      json: {
        settings: {},
        entries: [
          entry(
            "program",
            "bba",
            {
              title: "Published business pathway",
              summary: "Published program overview.",
            },
            [media],
          ),
          entry(
            "homepage-section",
            "learning",
            { title: "A published learning chapter" },
            [media],
          ),
          entry("testimonial", "consented-voice", {
            quote: "This is a synthetic test quote.",
            name: "Test contributor",
            context: "Test attribution only",
          }),
          entry(
            "magazine",
            "reviewed-edition",
            { title: "Published test edition" },
            [
              {
                ...media,
                id: "pdf",
                mimeType: "application/pdf",
                url: "https://example.invalid/reviewed.pdf",
                sizeBytes: 1048576,
              },
            ],
          ),
          entry("news", "first-story", { title: "First published story" }, [
            media,
          ]),
          entry("event-story", "second-story", {
            title: "Second published story",
          }),
        ],
      },
    }),
  );
  await page.goto("/");
  await expect(page.getByRole("tabpanel")).toContainText(
    "Published business pathway",
  );
  await expect(
    page.getByRole("heading", { name: "A published learning chapter" }),
  ).toBeVisible();
  await expect(page.locator("blockquote")).toContainText("Test contributor");
  await expect(page.getByRole("link", { name: /Open PDF/ })).toHaveAttribute(
    "href",
    "https://example.invalid/reviewed.pdf",
  );
  await expect(page.getByRole("link", { name: /Open PDF/ })).toContainText(
    "1.0 MB",
  );
  await expect(
    page.getByAltText("Published image test fixture").first(),
  ).toHaveCSS("object-position", "25% 75%");
  await revealAll(page);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("long copy, hostile URLs and unavailable media do not break layout or execute content", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const longTitle = "A thoughtfully considered new beginning ".repeat(8);
  await page.route("**/api/public/site", (route) =>
    route.fulfill({
      json: {
        settings: {},
        entries: [
          entry("homepage-section", "hero", {
            title: longTitle,
            summary: "<img src=x onerror=alert(1)>",
          }),
          entry("program", "bba", { title: "W".repeat(120) }, [
            {
              mimeType: "image/webp",
              url: "https://example.invalid/missing.webp",
            },
          ]),
          entry(
            "magazine",
            "bad-pdf",
            { title: "Unsafe URL must be omitted" },
            [{ mimeType: "application/pdf", url: "javascript:alert(1)" }],
          ),
        ],
      },
    }),
  );
  await page.route("https://example.invalid/missing.webp", (route) =>
    route.abort(),
  );
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText(longTitle.trim());
  await revealAll(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.locator('a[href^="javascript:"], img[src="x"]'),
  ).toHaveCount(0);
  await expect(
    page.locator(".sk-program-mobile .sk-media-unavailable").first(),
  ).toBeVisible();
});

test("contact handoffs are independent of unavailable CMS content", async ({
  page,
}) => {
  await page.route("**/api/public/**", (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await page.goto("/admissions#visit");
  await expect(
    page.getByRole("heading", { name: "Picture yourself here." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Call the college" }),
  ).toHaveAttribute("href", "tel:+919393755755");
});

test("home view-model validates optional fields and never creates fake social proof", () => {
  const model = createHomeModel({
    settings: {},
    entries: [
      entry("testimonial", "incomplete", { title: "Missing quote and name" }),
      entry("news", "valid-news", {
        title: "Safe title",
        summary: ["not text"],
        date: "not a date",
      }),
    ],
  });
  expect(model.voice).toBeUndefined();
  expect(model.publications).toEqual([]);
  expect(model.stories[0].summary).toBe("");
  expect(model.stories[0].date).toBeUndefined();
  for (const url of [
    "javascript:alert(1)",
    "//bad.test/a",
    "/\\bad.test",
    "data:text/html,hi",
    "https://u:p@bad.test/a",
  ])
    expect(safePublicUrl(url)).toBeUndefined();
  expect(safePublicUrl("/images/a.webp")).toBe("/images/a.webp");
  expect(safePublicUrl("https://example.com/a.webp")).toBe(
    "https://example.com/a.webp",
  );
  const malformedMedia = createHomeModel({
    settings: {},
    entries: [
      entry("homepage-section", "learning", {}, [
        { mimeType: 5, url: "/invalid.webp" },
        {
          mimeType: "image/webp",
          url: "/valid.webp",
          altText: {},
          caption: [],
          focalX: NaN,
          focalY: 5,
        },
      ]),
    ],
  });
  expect(malformedMedia.sections.learning.image).toMatchObject({
    src: "/valid.webp",
    alt: "Published college image",
    position: "50% 100%",
  });
});
