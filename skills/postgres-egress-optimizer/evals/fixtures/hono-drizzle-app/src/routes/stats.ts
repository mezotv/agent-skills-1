import { Hono } from "hono";
import { db } from "../db/client";
import { reviews } from "../db/schema";

export const statsRoute = new Hono();

// GET /stats — review statistics per product
statsRoute.get("/", async (c) => {
  const allReviews = await db.select().from(reviews);

  const statsMap = allReviews.reduce(
    (acc, review) => {
      const key = review.productId;
      if (!acc[key]) acc[key] = { totalRating: 0, count: 0 };
      acc[key].totalRating += review.rating;
      acc[key].count += 1;
      return acc;
    },
    {} as Record<number, { totalRating: number; count: number }>,
  );

  const stats = Object.entries(statsMap).map(([productId, s]) => ({
    productId: Number(productId),
    avgRating: s.totalRating / s.count,
    reviewCount: s.count,
  }));

  return c.json(stats);
});
