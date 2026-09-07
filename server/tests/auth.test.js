import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();

const validUser = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
};

describe("POST /api/auth/register", () => {
  test("creates a new user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({
      name: validUser.name,
      email: validUser.email,
    });
    // Password/hash must never be echoed back to the client.
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test("rejects a duplicate email with 409", async () => {
    await request(app).post("/api/auth/register").send(validUser);
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/i);
  });

  test.each([
    [{ email: validUser.email, password: validUser.password }, "missing name"],
    [{ name: validUser.name, password: validUser.password }, "missing email"],
    [{ name: validUser.name, email: validUser.email }, "missing password"],
  ])("rejects registration with %s (400)", async (body) => {
    const res = await request(app).post("/api/auth/register").send(body);
    expect(res.status).toBe(400);
  });

  test("rejects a password shorter than 8 characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/8 characters/i);
  });

  test("email is stored and matched case-insensitively", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, email: "Mixed.Case@Example.com" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "mixed.case@example.com", password: validUser.password });

    expect(res.status).toBe(200);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(validUser);
  });

  test("logs in with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe(validUser.email);
  });

  test("rejects an unknown email with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: validUser.password });

    expect(res.status).toBe(401);
  });

  test("rejects a wrong password with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "wrongpassword" });

    expect(res.status).toBe(401);
  });

  test("rejects a login missing email or password with 400", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: validUser.email });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  test("returns the current user when a valid token is supplied", async () => {
    const registerRes = await request(app).post("/api/auth/register").send(validUser);
    const { token } = registerRes.body;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  test("rejects a request with no Authorization header (401)", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("rejects a malformed/garbage token (401)", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-real-token");

    expect(res.status).toBe(401);
  });
});
