import { defineConfig } from "@playwright/test";

// The tests run against the local app and the real Supabase project.
// Test accounts live in .env.test.local, which is git-ignored.
for (const file of [".env.local", ".env.test.local"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // Missing file: the test will explain what is needed.
  }
}

// Set BASE_URL to run the same tests against the deployed app, for example
// BASE_URL=https://viral-radar-xi.vercel.app npm run test:e2e
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000/login",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
