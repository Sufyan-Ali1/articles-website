import { FormsApiProvider } from "@/components/shared/forms-api-provider";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewsletterSignup } from "@/components/articles/reader-actions";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { retrySeconds, submitPublicForm } from "@/lib/api/public-submissions";
const apiUrl = "https://api.test";
const accepted = () =>
  Response.json(
    { data: { message: "Thank you for subscribing." } },
    { status: 202 },
  );
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("subscriber signup", () => {
  it("disables signup only when the API is unconfigured", () => {
    render(<NewsletterForm apiUrl="" />);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText(/temporarily unavailable/)).toBeInTheDocument();
  });
  it("validates email and sends one normalized email field", async () => {
    const send = vi.fn().mockResolvedValue(accepted());
    vi.stubGlobal("fetch", send);
    render(<NewsletterForm apiUrl={apiUrl} />);
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Enter your email/,
    );
    expect(send).not.toHaveBeenCalled();
    await userEvent.type(screen.getByRole("textbox"), "Reader@Example.COM");
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("status")).toHaveTextContent(
      /You’re subscribed/,
    );
    const [url, init] = send.mock.calls[0];
    expect(url).toBe(`${apiUrl}/api/v1/subscriptions`);
    expect(JSON.parse(init.body)).toEqual({ email: "reader@example.com" });
    expect(init.credentials).toBe("omit");
    expect(init.redirect).toBe("error");
  });
  it("disables duplicate clicks during a pending request", async () => {
    let resolve!: (value: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise<Response>((done) => {
            resolve = done;
          }),
      ),
    );
    render(<NewsletterForm apiUrl={apiUrl} compact />);
    await userEvent.type(screen.getByRole("textbox"), "reader@example.com");
    await userEvent.click(
      screen.getByRole("button", { name: "Subscribe to newsletter" }),
    );
    await waitFor(() => expect(screen.getByRole("button")).toBeDisabled());
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
    resolve(accepted());
    expect(await screen.findByRole("status")).toHaveTextContent(
      /saved your email/,
    );
  });
  it("preserves an email on failure and allows retry", async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(accepted());
    vi.stubGlobal("fetch", send);
    render(<NewsletterForm apiUrl={apiUrl} />);
    await userEvent.type(screen.getByRole("textbox"), "reader@example.com");
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /couldn’t confirm/,
    );
    expect(screen.getByRole("textbox")).toHaveValue("reader@example.com");
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("status")).toBeInTheDocument();
  });
  it("honors Retry-After without clearing the address", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 429,
          headers: { "Retry-After": "120" },
        }),
      ),
    );
    render(<NewsletterForm apiUrl={apiUrl} />);
    await userEvent.type(screen.getByRole("textbox"), "reader@example.com");
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Try again in 120s/,
    );
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("textbox")).toHaveValue("reader@example.com");
  });
  it("maps backend validation to a safe field error", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            { error: { details: [{ location: ["body", "email"] }] } },
            { status: 422 },
          ),
        ),
    );
    render(<NewsletterForm apiUrl={apiUrl} />);
    await userEvent.type(screen.getByRole("textbox"), "reader@example.com");
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /check your email/,
    );
    expect(screen.getByRole("textbox")).toHaveFocus();
  });
  it("does not accept a malformed success response", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ message: "wrong envelope" }, { status: 202 }),
        ),
    );
    await expect(
      submitPublicForm(apiUrl, "subscriptions", {
        email: "reader@example.com",
      }),
    ).rejects.toThrow();
  });
  it("bounds Retry-After values and handles HTTP dates", () => {
    expect(retrySeconds(null)).toBe(60);
    expect(retrySeconds("invalid")).toBe(60);
    expect(retrySeconds("99999999")).toBe(86400);
    expect(
      retrySeconds(
        "Wed, 01 Jan 2031 00:01:00 GMT",
        Date.parse("2031-01-01T00:00:00Z"),
      ),
    ).toBe(60);
  });
});

it("connects the article reader signup to the same backend subscription flow", async () => {
  const send = vi.fn().mockResolvedValue(accepted());
  vi.stubGlobal("fetch", send);
  render(
    <FormsApiProvider apiUrl={apiUrl}>
      <NewsletterSignup />
    </FormsApiProvider>,
  );
  await userEvent.type(screen.getByRole("textbox"), "reader@example.com");
  await userEvent.click(
    screen.getByRole("button", { name: "Subscribe to newsletter" }),
  );
  expect(await screen.findByRole("status")).toHaveTextContent(
    /You’re subscribed/,
  );
  expect(send.mock.calls[0][0]).toBe(`${apiUrl}/api/v1/subscriptions`);
});
