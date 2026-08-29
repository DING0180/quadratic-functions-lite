import { defineConfig } from "vite";

export default defineConfig({
  base: "/quadratic-functions-v1/",
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
  },
});
