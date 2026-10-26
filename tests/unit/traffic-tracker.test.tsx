import { StrictMode } from "react";
import { render, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { TrafficTracker } from "@/components/analytics/traffic-tracker";
const route = vi.hoisted(() => ({ path: "/articles/example" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.path }));
const send = vi.fn();
beforeEach(() => {
  route.path = "/articles/example";
  vi.stubGlobal("fetch", send);
  send.mockReset().mockResolvedValue({ ok: true, status: 204 });
  Object.defineProperty(document, "visibilityState", {
    value: "visible",
    configurable: true,
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("sends one event through StrictMode and tracks client navigation", async () => {
  const view = render(
    <StrictMode>
      <TrafficTracker />
    </StrictMode>,
  );
  await waitFor(() => expect(send).toHaveBeenCalledTimes(1));
  route.path = "/articles/another";
  view.rerender(
    <StrictMode>
      <TrafficTracker />
    </StrictMode>,
  );
  await waitFor(() => expect(send).toHaveBeenCalledTimes(2));
  expect(JSON.parse(send.mock.calls[1][1].body).path).toBe("/articles/another");
});
it("reuses event IDs for retries", async () => {
  send.mockResolvedValueOnce({ ok: false, status: 503 });
  render(<TrafficTracker />);
  await waitFor(() => expect(send).toHaveBeenCalledTimes(2));
  expect(send.mock.calls[0][1].body).toBe(send.mock.calls[1][1].body);
});
