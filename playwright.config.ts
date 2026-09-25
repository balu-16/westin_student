import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 3,
  timeout: 45_000,
  expect: { timeout: 8000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    browserName: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    reducedMotion: "reduce",
  },
  projects: [
    {
      name: "preview",
      testMatch: /homepage\.spec\.ts/,
      use: { baseURL: "http://127.0.0.1:5180" },
    },
    {
      name: "published",
      testMatch: /published\.spec\.ts/,
      use: { baseURL: "http://127.0.0.1:5181" },
    },
  ],
  webServer: [
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5180 --strictPort",
      url: "http://127.0.0.1:5180",
      env: { VITE_PUBLIC_CONTENT_MODE: "fixture" },
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5181 --strictPort",
      url: "http://127.0.0.1:5181",
      env: { VITE_PUBLIC_CONTENT_MODE: "api" },
      reuseExistingServer: false,
    },
  ],
});
