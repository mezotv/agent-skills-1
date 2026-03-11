import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import { categories, products, reviews } from "../src/db/schema";
import { $ } from "bun";

let databaseUrl: string;
let provisioned = false;

export async function provisionDatabase() {
  if (provisioned) return databaseUrl;

  // Use existing DATABASE_URL if set, otherwise provision via neon.new
  if (process.env.DATABASE_URL) {
    databaseUrl = process.env.DATABASE_URL;
  } else {
    const res = await fetch("https://neon.new/api/v1/database", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: "agent-skills" }),
    });
    const data = await res.json();
    databaseUrl = data.connection_string;
    process.env.DATABASE_URL = databaseUrl;
  }

  // Push schema using drizzle-kit
  await $`bunx drizzle-kit push --force`.env({
    ...process.env,
    DATABASE_URL: databaseUrl,
  });

  provisioned = true;
  return databaseUrl;
}

export function getTestDb() {
  const client = neon(databaseUrl);
  return drizzle({ client });
}

export async function seed() {
  const db = getTestDb();

  // Categories
  await db.insert(categories).values([
    { name: "Electronics", slug: "electronics" },
    { name: "Books", slug: "books" },
    { name: "Clothing", slug: "clothing" },
  ]);

  // Products (with large description and rawPayload to simulate real data)
  const description = "A ".repeat(2500); // ~5KB
  const rawPayload = { data: "x".repeat(50000) }; // ~50KB

  await db.insert(products).values([
    {
      name: "Laptop",
      price: "999.99",
      categoryId: 1,
      description,
      rawPayload,
      imageUrls: ["https://example.com/laptop.jpg"],
    },
    {
      name: "Phone",
      price: "699.99",
      categoryId: 1,
      description,
      rawPayload,
      imageUrls: ["https://example.com/phone.jpg"],
    },
    {
      name: "TypeScript Handbook",
      price: "29.99",
      categoryId: 2,
      description,
      rawPayload,
      imageUrls: ["https://example.com/ts-book.jpg"],
    },
    {
      name: "Winter Jacket",
      price: "149.99",
      categoryId: 3,
      description,
      rawPayload,
      imageUrls: ["https://example.com/jacket.jpg"],
    },
    {
      name: "Running Shoes",
      price: "89.99",
      categoryId: 3,
      description,
      rawPayload,
      imageUrls: ["https://example.com/shoes.jpg"],
    },
  ]);

  // Reviews — multiple for product 1 to test P5 (JOIN duplication)
  await db.insert(reviews).values([
    { productId: 1, userName: "alice", rating: 5, body: "Great laptop!" },
    { productId: 1, userName: "bob", rating: 4, body: "Good value." },
    { productId: 1, userName: "charlie", rating: 3, body: "Decent." },
    { productId: 2, userName: "diana", rating: 5, body: "Love this phone." },
    { productId: 2, userName: "eve", rating: 4, body: "Nice screen." },
    { productId: 3, userName: "frank", rating: 5, body: "Excellent book." },
    { productId: 3, userName: "grace", rating: 4, body: "Very helpful." },
    { productId: 4, userName: "hank", rating: 3, body: "Runs small." },
    { productId: 5, userName: "iris", rating: 5, body: "Very comfortable." },
    { productId: 5, userName: "jack", rating: 4, body: "Good for running." },
  ]);
}

export async function cleanup() {
  const db = getTestDb();
  await db.execute(
    sql`TRUNCATE reviews, products, categories RESTART IDENTITY CASCADE`,
  );
}
