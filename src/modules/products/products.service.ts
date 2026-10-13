import { prisma } from "../../lib/prisma";
import { redis } from "../../lib/redis";
import { HttpError } from "../../lib/http-error";

export const PRODUCTS_KEY = "products:all";

// Cache-aside: əvvəl cache, yoxdursa DB-dən oxu və cache-ə yaz
export async function listProducts() {
  const cached = await redis.get(PRODUCTS_KEY);
  if (cached) return JSON.parse(cached);

  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  await redis.set(PRODUCTS_KEY, JSON.stringify(products), "EX", 60);
  return products;
}

export async function getProduct(id: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new HttpError(404, "Product not found");
  return product;
}

export async function createProduct(data: { name: string; price: number; stock: number }) {
  const product = await prisma.product.create({ data });
  await redis.del(PRODUCTS_KEY); // cache invalidation
  return product;
}
