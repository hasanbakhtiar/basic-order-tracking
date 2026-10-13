import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http-error";

export async function register(email: string, password: string) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new HttpError(409, "Email already registered");

  const hash = await Bun.password.hash(password);
  const user = await prisma.user.create({ data: { email, password: hash } });
  return { id: user.id, email: user.email };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await Bun.password.verify(password, user.password))) {
    throw new HttpError(401, "Invalid credentials");
  }
  const token = jwt.sign({ sub: String(user.id) }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
  return { token };
}
