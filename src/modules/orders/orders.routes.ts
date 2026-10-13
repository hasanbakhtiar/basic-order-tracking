import { Router } from "express";
import { z } from "zod";
import * as ordersService from "./orders.service";
import { requireAuth } from "../../middlewares/auth";

const createSchema = z.object({
  items: z
    .array(z.object({ productId: z.number().int(), quantity: z.number().int().positive() }))
    .min(1),
});

const statusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED"]),
});

export const ordersRouter = Router();
ordersRouter.use(requireAuth);

ordersRouter.post("/", async (req, res) => {
  const { items } = createSchema.parse(req.body);
  res.status(201).json(await ordersService.createOrder(res.locals.userId, items));
});

ordersRouter.get("/", async (_req, res) => {
  res.json(await ordersService.listOrders(res.locals.userId));
});

ordersRouter.patch("/:id/status", async (req, res) => {
  const { status } = statusSchema.parse(req.body);
  res.json(await ordersService.updateStatus(Number(req.params.id), status));
});
