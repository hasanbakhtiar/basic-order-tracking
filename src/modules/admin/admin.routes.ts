import { Router } from "express";
import { eventBus } from "../../lib/events";
import { requireAuth } from "../../middlewares/auth";

export const adminRouter = Router();

// SSE: admin üçün canlı sifariş axını
adminRouter.get("/orders/stream", requireAuth, (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  const send = (type: string) => (data: unknown) =>
    res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  const onCreated = send("order.created");
  const onStatus = send("order.status");

  eventBus.on("order.created", onCreated);
  eventBus.on("order.status", onStatus);
  const ping = setInterval(() => res.write(": ping\n\n"), 25000);

  req.on("close", () => {
    clearInterval(ping);
    eventBus.off("order.created", onCreated);
    eventBus.off("order.status", onStatus);
  });
});
