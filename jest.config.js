const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

module.exports = createJestConfig({
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    // `server-only` throws outside a React Server Components bundle.
    "^server-only$": "<rootDir>/__tests__/__mocks__/empty.js",
  },
  testPathIgnorePatterns: ["/node_modules/", "/docs/", "/__mocks__/"],
});
