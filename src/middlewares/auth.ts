import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../lib/http-error";

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw new HttpError(401, "Token required");
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!);
    res.locals.userId = Number(payload.sub);
    next();
  } catch {
    throw new HttpError(401, "Invalid token");
  }
};
