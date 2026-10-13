import express from "express";
import swaggerUi from "swagger-ui-express";
import { prisma } from "./lib/prisma";
import { openapi } from "./lib/swagger";
import { authRouter } from "./modules/auth/auth.routes";
import { productsRouter } from "./modules/products/products.routes";
import { ordersRouter } from "./modules/orders/orders.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { errorHandler } from "./middlewares/error";
import { rateLimit } from "./middlewares/rate-limit";

export const app = express();
app.use(express.json());

app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok" });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.use("/api/auth/login", rateLimit("login", 5, 60));
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);
