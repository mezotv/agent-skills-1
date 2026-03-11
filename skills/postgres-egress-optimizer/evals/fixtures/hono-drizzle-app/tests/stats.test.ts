import { describe, it, expect } from "bun:test";
import app from "../src/index";

describe("GET /stats", () => {
  it("returns review statistics per product", async () => {
    const res = await app.request("/stats");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(5);
  });

  it("each stat has productId, avgRating, reviewCount", async () => {
    const res = await app.request("/stats");
    const data = await res.json();

    for (const stat of data) {
      expect(stat).toHaveProperty("productId");
      expect(stat).toHaveProperty("avgRating");
      expect(stat).toHaveProperty("reviewCount");
      expect(typeof stat.avgRating).toBe("number");
      expect(typeof stat.reviewCount).toBe("number");
    }
  });

  it("computes correct averages", async () => {
    const res = await app.request("/stats");
    const data = await res.json();

    // Product 1 (Laptop): ratings 5, 4, 3 -> avg 4.0, count 3
    const laptop = data.find((s: any) => s.productId === 1);
    expect(laptop.avgRating).toBe(4);
    expect(laptop.reviewCount).toBe(3);
  });
});
