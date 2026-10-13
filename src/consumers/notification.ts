import { kafka, ensureTopics } from "../lib/kafka";

await ensureTopics(["order.created"]);

const consumer = kafka.consumer({ groupId: "notification-service" });

await consumer.connect();
await consumer.subscribe({ topic: "order.created", fromBeginning: true });

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value!.toString());
    console.log(`[${topic}] partition=${partition} offset=${message.offset}`, event);
  },
});

console.log("Notification consumer started");
