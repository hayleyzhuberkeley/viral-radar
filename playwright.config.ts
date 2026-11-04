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

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/login",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
