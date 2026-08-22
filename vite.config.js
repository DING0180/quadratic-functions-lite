import { defineConfig } from "vite";

export default defineConfig({
  base: "/quadratic-functions-lite/",
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
  },
});
