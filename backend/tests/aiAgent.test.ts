// backend/tests/aiAgent.test.ts
import { describe, it, expect } from '@jest/globals';
import { classifyProduct } from "../src/ai/aiAgent";

describe("classifyProduct", () => {
  it("should return a number between 0 and 100", async () => {
    // For testing, provide a known product description.
    const description = "This product is proudly manufactured in Canada using local materials.";
    const score = await classifyProduct(description);
    expect(typeof score).toBe("number");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
