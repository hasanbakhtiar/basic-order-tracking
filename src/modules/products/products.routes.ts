import { Router } from "express";
import { z } from "zod";
import * as productsService from "./products.service";
import { requireAuth } from "../../middlewares/auth";

const createSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
});

export const productsRouter = Router();

productsRouter.get("/", async (_req, res) => {
  res.json(await productsService.listProducts());
});

productsRouter.get("/:id", async (req, res) => {
  res.json(await productsService.getProduct(Number(req.params.id)));
});

productsRouter.post("/", requireAuth, async (req, res) => {
  const data = createSchema.parse(req.body);
  res.status(201).json(await productsService.createProduct(data));
});
