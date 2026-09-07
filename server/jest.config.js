/** Jest config — this project uses native ESM ("type": "module" in package.json),
 * so we point Jest at the Node ESM VM and use babel-jest only for transform passthrough. */
export default {
  testEnvironment: "node",
  transform: {},
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 20000,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/index.js",
    "!src/config/db.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "html", "lcov"],
};
