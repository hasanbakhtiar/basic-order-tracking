import type { RequestHandler } from "express";
import { redis } from "../lib/redis";
import { HttpError } from "../lib/http-error";

// Fixed window: windowSec saniyədə IP başına max sorğu
export const rateLimit =
  (name: string, max: number, windowSec: number): RequestHandler =>
  async (req, res, next) => {
    const key = `rl:${name}:${req.ip}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSec);

    res.set("X-RateLimit-Remaining", String(Math.max(0, max - count)));
    if (count > max) throw new HttpError(429, "Too many requests");
    next();
  };
