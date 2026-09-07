import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// A single in-memory MongoDB instance is shared across the whole test run.
// This means tests exercise the *real* Mongoose schemas/models/aggregations
// (unique indexes, validation, $facet pipelines) without touching the real
// Atlas cluster, and without needing any network access in CI.
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  // Clear all collections between tests so tests don't leak state into each other.
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
