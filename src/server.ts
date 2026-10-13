import { createServer } from "node:http";
import { app } from "./app";
import { connectProducer } from "./lib/kafka";
import { initSocket } from "./lib/socket";

await connectProducer();

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(3000, () => console.log("Server: http://localhost:3000"));
