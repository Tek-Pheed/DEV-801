import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/tests"],
    testMatch: ["**/*.test.ts"],
    moduleFileExtensions: ["ts", "js", "json"],
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["text", "text-summary", "lcov"],
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/index.ts",
        "!src/utils/logger.ts",
        "!src/utils/swagger.ts",
        "!src/utils/openFoodFacts.ts",
    ],
    coverageThreshold: {
        global: {
            lines: 50,
        },
    },
};

export default config;
