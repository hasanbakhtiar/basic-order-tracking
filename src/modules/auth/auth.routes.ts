import { Router } from "express";
import { z } from "zod";
import * as authService from "./auth.service";
import { requireAuth } from "../../middlewares/auth";
import { prisma } from "../../lib/prisma";

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const { email, password } = credentials.parse(req.body);
  res.status(201).json(await authService.register(email, password));
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = credentials.parse(req.body);
  res.json(await authService.login(email, password));
});

authRouter.get("/me", requireAuth, async (_req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: res.locals.userId },
    select: { id: true, email: true, createdAt: true },
  });
  res.json(user);
});
