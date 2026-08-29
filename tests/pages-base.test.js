import { describe, expect, it } from "vitest";
import viteConfig from "../vite.config.js";

describe("V1 GitHub Pages configuration", () => {
  it("builds asset URLs under the V1 repository path", () => {
    expect(viteConfig.base).toBe("/quadratic-functions-v1/");
  });
});
