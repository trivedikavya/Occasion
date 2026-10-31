import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Scoped to the pure logic that actually has unit tests (selectors,
      // date math, AI response schemas, proposal name-matching). UI
      // components and API routes are verified by the build + manual
      // end-to-end checks instead (see README "Testing" section), so
      // including them here would just produce a misleadingly low number
      // rather than a meaningful one.
      include: ["lib/selectors.ts", "lib/dates.ts", "lib/schemas/ai.ts", "lib/proposal-matching.ts"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 80,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
