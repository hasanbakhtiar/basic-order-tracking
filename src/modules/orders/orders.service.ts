import { prisma } from "../../lib/prisma";
import { redis } from "../../lib/redis";
import { publish } from "../../lib/kafka";
import { eventBus } from "../../lib/events";
import { HttpError } from "../../lib/http-error";
import { PRODUCTS_KEY } from "../products/products.service";

type Item = { productId: number; quantity: number };
export type Status = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED";

export async function createOrder(userId: number, items: Item[]) {
  const order = await prisma.$transaction(async (tx) => {
    const ids = [...new Set(items.map((i) => i.productId))];
    const products = await tx.product.findMany({ where: { id: { in: ids } } });
    if (products.length !== ids.length) throw new HttpError(404, "Product not found");

    for (const item of items) {
      // Atomik yoxlama + azaltma: race condition olmur
      const { count } = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (count === 0) throw new HttpError(409, `Not enough stock (product ${item.productId})`);
    }

    return tx.order.create({
      data: {
        userId,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: products.find((p) => p.id === i.productId)!.price,
          })),
        },
      },
      include: { items: true },
    });
  });

  await redis.del(PRODUCTS_KEY); // stok dəyişdi, cache köhnəlib

  const event = { orderId: order.id, userId, items: order.items };
  publish("order.created", String(order.id), event).catch((err) =>
    console.error("Kafka publish failed", err),
  );
  eventBus.emit("order.created", event);

  return order;
}

export async function updateStatus(orderId: number, status: Status) {
  const exists = await prisma.order.findUnique({ where: { id: orderId } });
  if (!exists) throw new HttpError(404, "Order not found");

  const order = await prisma.order.update({ where: { id: orderId }, data: { status } });
  eventBus.emit("order.status", { orderId, userId: order.userId, status });
  return order;
}

export function listOrders(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { id: "desc" },
  });
}
