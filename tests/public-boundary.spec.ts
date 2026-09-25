import { test, expect } from "@playwright/test";
import { ready } from "./helpers";

test("public pages and login never request a push SDK or external fonts", async ({
  page,
}) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    if (/onesignal\.com|fonts\.google/.test(new URL(request.url()).hostname))
      requests.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const route of ["/", "/contact", "/login"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await page.waitForLoadState("networkidle");
  }
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
  await expect(page.locator('meta[name="description"]')).toHaveCount(1);
  await expect(page.locator("#portal-default-description")).toHaveCount(1);
});

test("private notification facade initializes once, then identifies without a permission prompt", async ({
  page,
}) => {
  let sdkRequests = 0;
  await page.route("https://cdn.onesignal.com/**", (route) => {
    sdkRequests++;
    return route.fulfill({
      contentType: "application/javascript",
      body: `
      window.pushTest = { calls: [], options: null };
      const api = {
        init: async options => { window.pushTest.options = options; window.pushTest.calls.push('init'); },
        login: async id => window.pushTest.calls.push('login:' + id),
        logout: async () => window.pushTest.calls.push('logout'),
        User: { addTags: async () => {}, PushSubscription: {
          optedIn: false, optIn: async () => window.pushTest.calls.push('optIn'),
          addEventListener: () => {},
        } },
        Notifications: { permissionNative: 'default', permission: false,
          isPushSupported: () => true, requestPermission: () => window.pushTest.calls.push('prompt') },
      };
      window.OneSignal = api;
      for (const callback of window.OneSignalDeferred || []) callback(api);
      window.OneSignalDeferred = { push: callback => callback(api) };
    `,
    });
  });
  await page.goto("/");
  await ready(page);
  expect(sdkRequests).toBe(0);
  // Exercise the exact facade called by AuthContext, without a real login or
  // subscription. Imports are from the local Vite test server, not production.
  const result = await page.evaluate(async () => {
    const path = "/src/lib/onesignal.ts";
    const facade = await import(/* @vite-ignore */ path);
    await Promise.all([
      facade.identifyOneSignalUser({ id: "test-only" }),
      facade.getOneSignalState(),
    ]);
    await facade.getOneSignalState();
    return (
      window as unknown as {
        pushTest: { calls: string[]; options: Record<string, unknown> };
      }
    ).pushTest;
  });
  expect(sdkRequests).toBe(1);
  expect(result.calls).toEqual(["init", "login:student_test-only"]);
  expect(result.options).toMatchObject({
    autoResubscribe: false,
    notifyButton: { enable: false },
    promptOptions: { slidedown: { prompts: [] } },
    welcomeNotification: { disable: true },
  });
});

test("blocked notification SDK settles safely without breaking the page", async ({
  page,
}) => {
  await page.route("https://cdn.onesignal.com/**", (route) => route.abort());
  await page.goto("/");
  const state = await page.evaluate(async () => {
    const path = "/src/lib/onesignal.ts";
    const facade = await import(/* @vite-ignore */ path);
    return facade.getOneSignalState();
  });
  expect(state.isSupported).toBe(false);
  await ready(page);
});
