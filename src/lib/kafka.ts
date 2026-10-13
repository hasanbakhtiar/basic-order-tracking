import { Kafka, Partitioners } from "kafkajs";

export const kafka = new Kafka({
  clientId: "order-tracking",
  brokers: [process.env.KAFKA_BROKER ?? "localhost:9092"],
});

const producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });

export async function ensureTopics(topics: string[]) {
  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({
    topics: topics.map((topic) => ({ topic, numPartitions: 3 })),
  });
  await admin.disconnect();
}

export async function connectProducer() {
  await ensureTopics(["order.created"]);
  await producer.connect();
}

export async function publish(topic: string, key: string, value: unknown) {
  await producer.send({
    topic,
    messages: [{ key, value: JSON.stringify(value) }],
  });
}
