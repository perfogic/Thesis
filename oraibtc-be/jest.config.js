const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testEnvironmentOptions: {
    NODE_ENV: "test",
  },
  restoreMocks: true,
  coveragePathIgnorePatterns: [
    "node_modules",
    "src/config",
    "src/index.js",
    "tests",
  ],
  coverageReporters: ["text", "lcov", "clover", "html"],
};

module.exports = config;
