import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
      "~test": path.resolve(__dirname, "test"),
    },
  },
  test: {
    // File test real email tidak dijalankan secara default.
    // Jalankan eksplisit dengan: RUN_EMAIL_TEST=true pnpm test
    include: [
      "test/e2e/**/*.e2e.test.ts",
    ],
    testTimeout: 0,
    hookTimeout: 0,
    reporters: "tree",
  },
});
