import bcrypt from "bcryptjs";
import { db, genUserId } from "../data/store.js";

/**
 * Each function here mirrors what a Mongoose model method would do
 * (User.findOne, User.create, etc). In Phase 3, replace the bodies
 * with real Mongoose calls and every controller keeps working as-is.
 */

// Seed one demo user on boot so login can be tested immediately.
(function seedDemoUser() {
  const passwordHash = bcrypt.hashSync("password123", 10);
  db.users.push({
    id: genUserId(),
    name: "Demo User",
    email: "demo@syncboard.dev",
    passwordHash,
  });
})();

export async function findUserByEmail(email) {
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id) {
  return db.users.find((u) => u.id === id) || null;
}

export async function createUser({ name, email, password }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error("An account with this email already exists");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: genUserId(), name, email, passwordHash };
  db.users.push(user);
  return user;
}

export async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.passwordHash);
}

// Never send passwordHash to the client.
export function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}