import { createUser, findUserByEmail, verifyPassword, toPublicUser } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are all required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "password must be at least 8 characters" });
  }

  const user = await createUser({ name, email, password });
  const token = signToken(user);
  res.status(201).json({ token, user: toPublicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = await findUserByEmail(email);
  const valid = user && (await verifyPassword(user, password));
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(user);
  res.json({ token, user: toPublicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  // req.user is set by requireAuth middleware
  res.json({ user: toPublicUser(req.user) });
});