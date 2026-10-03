import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/** Stored as `scrypt$<saltHex>$<hashHex>` (same format as prisma/seed.mjs). */
export function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  const [alg, salt, hash] = (stored ?? "").split("$");
  if (alg !== "scrypt" || !salt || !hash) return Promise.resolve(false);
  return new Promise((resolve) =>
    scrypt(password, Buffer.from(salt, "hex"), 64, (err, key) => resolve(!err && timingSafeEqual(key, Buffer.from(hash, "hex")))),
  );
}

export function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) =>
    scrypt(password, salt, 64, (err, key) => (err ? reject(err) : resolve(`scrypt$${salt.toString("hex")}$${key.toString("hex")}`))),
  );
}
