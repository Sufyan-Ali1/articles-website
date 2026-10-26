import "@testing-library/jest-dom/vitest";
import { beforeEach, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
afterEach(() => cleanup());

beforeEach(() => {
  vi.stubEnv("API_USER", "test-website");
  vi.stubEnv("API_KEY", "test-only-api-key-over-32-characters-long");
});
