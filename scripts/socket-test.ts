import { io } from "socket.io-client";

const res = await fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "test@mail.com", password: "123456" }),
});
const { token } = await res.json();

const socket = io("http://localhost:3000", { auth: { token } });
socket.on("connect", () => console.log("connected", socket.id));
socket.on("order:status", (e) => console.log("order:status", e));
socket.on("connect_error", (e) => console.log("error:", e.message));
