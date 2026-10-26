import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/shared/contact-form";
import { contactPrefill, contactSchema } from "@/lib/utils/contact-schema";
import { solveCaptcha } from "./solve-captcha";
afterEach(() => vi.unstubAllGlobals());
describe("general contact", () => {
  it("disables submissions when the public API is unconfigured", () => {
    render(<ContactForm apiUrl="" />);
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    expect(
      screen.getByRole("link", { name: /suggest a topic/i }),
    ).toHaveAttribute("href", "/request-article");
  });
  it("validates required information and focuses the first invalid field", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(<ContactForm apiUrl="https://api.test" />);
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(
      await screen.findByText(/Enter an email address/),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByLabelText(/Email address/)).toHaveFocus(),
    );
    expect(fetch).not.toHaveBeenCalled();
  });
  it("sends the contact fields as JSON to the backend", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        Response.json(
          { data: { message: "Thank you for getting in touch." } },
          { status: 202 },
        ),
      );
    vi.stubGlobal("fetch", fetch);
    render(
      <ContactForm
        apiUrl="https://api.test"
        initialReason="correction"
        articleUrl="https://site.test/articles/a-story"
      />,
    );
    await userEvent.type(
      screen.getByLabelText(/Email address/),
      "reader@example.com",
    );
    await userEvent.type(
      screen.getByLabelText(/Your message/),
      "Please check the range specification in this article.",
    );
    await solveCaptcha();
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText(/Thanks for/)).toBeInTheDocument();
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://api.test/api/v1/contact-messages");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    const body = JSON.parse(init.body);
    expect(body["form-name"]).toBe("contact");
    expect(body.article_url).toBe("https://site.test/articles/a-story");
    expect(body.email).toBe("reader@example.com");
    expect(init.credentials).toBe("omit");
    expect(init.redirect).toBe("error");
  });
  it("preserves a failed message without claiming success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Unavailable", { status: 503 })),
    );
    render(<ContactForm apiUrl="https://api.test" />);
    await userEvent.type(
      screen.getByLabelText(/Email address/),
      "reader@example.com",
    );
    await userEvent.type(
      screen.getByLabelText(/Your message/),
      "My question about the publication.",
    );
    await solveCaptcha();
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /couldn’t confirm delivery/,
    );
    expect(screen.getByLabelText(/Your message/)).toHaveValue(
      "My question about the publication.",
    );
    expect(screen.queryByText(/Message received/)).not.toBeInTheDocument();
  });
  it("exposes correction context only for the relevant reason", async () => {
    render(
      <ContactForm
        apiUrl="https://api.test"
        initialReason="correction"
        articleUrl="https://site.test/articles/a-story"
      />,
    );
    expect(screen.getByLabelText(/Article link/)).toHaveValue(
      "https://site.test/articles/a-story",
    );
    await userEvent.click(screen.getByLabelText("General question"));
    expect(screen.queryByLabelText(/Article link/)).not.toBeInTheDocument();
  });
  it("blocks blank and incorrect addition answers without losing the message", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(<ContactForm apiUrl="https://api.test" />);
    await userEvent.type(
      screen.getByLabelText(/Email address/),
      "reader@example.com",
    );
    await userEvent.type(
      screen.getByLabelText(/Your message/),
      "My question about the publication.",
    );
    const submit = screen.getByRole("button", { name: "Send message" });
    await userEvent.click(submit);
    expect(await screen.findByRole("alert")).toHaveTextContent("Enter the sum");
    const answer = screen.getByRole("spinbutton");
    expect(answer).toHaveFocus();
    await userEvent.type(answer, "99");
    await userEvent.click(submit);
    expect(await screen.findByRole("alert")).toHaveTextContent("isn’t correct");
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Your message/)).toHaveValue(
      "My question about the publication.",
    );
  });
  it("refreshes the addition question and clears only its answer", async () => {
    render(<ContactForm apiUrl="https://api.test" />);
    await userEvent.type(
      screen.getByLabelText(/Your message/),
      "Please explain this topic.",
    );
    await solveCaptcha();
    const answer = screen.getByRole("spinbutton");
    const previous = answer.getAttribute("id");
    const label = document.querySelector(`label[for="${previous}"]`)!;
    const question = label.textContent;
    await userEvent.click(
      screen.getByRole("button", { name: "Get a new addition question" }),
    );
    expect(label.textContent).not.toBe(question);
    expect(answer).toHaveValue(null);
    expect(answer).toHaveFocus();
    expect(screen.getByLabelText(/Your message/)).toHaveValue(
      "Please explain this topic.",
    );
  });
  it("rejects unsafe prefill URLs and validates plain text", () => {
    expect(
      contactPrefill(
        { reason: "correction", article: "https://evil.test/articles/a" },
        "https://site.test",
      ),
    ).toEqual({ reason: "correction", articleUrl: "" });
    expect(
      contactPrefill(
        {
          reason: "correction",
          article: "https://site.test/articles/a#fragment",
        },
        "https://site.test",
      ).articleUrl,
    ).toBe("https://site.test/articles/a");
    expect(
      contactSchema.safeParse({
        name: "",
        email: "reader@example.com",
        reason: "general",
        article_url: "",
        message: "<script>bad()</script>",
        "bot-field": "",
      }).success,
    ).toBe(false);
  });
});

it("honors contact rate limits while preserving the draft", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(null, { status: 429, headers: { "Retry-After": "120" } }),
      ),
  );
  render(<ContactForm apiUrl="https://api.test" />);
  await userEvent.type(
    screen.getByLabelText(/Email address/),
    "reader@example.com",
  );
  await userEvent.type(
    screen.getByLabelText(/Your message/),
    "Please explain this topic.",
  );
  await solveCaptcha();
  await userEvent.click(screen.getByRole("button", { name: "Send message" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    /Try again in 120s/,
  );
  expect(
    screen.getByRole("button", { name: "Try again in 120s" }),
  ).toBeDisabled();
  expect(screen.getByLabelText(/Your message/)).toHaveValue(
    "Please explain this topic.",
  );
});

it("highlights backend validation errors without discarding the message", async () => {
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
  render(<ContactForm apiUrl="https://api.test" />);
  await userEvent.type(
    screen.getByLabelText(/Email address/),
    "reader@example.com",
  );
  await userEvent.type(
    screen.getByLabelText(/Your message/),
    "Please explain this topic.",
  );
  await solveCaptcha();
  await userEvent.click(screen.getByRole("button", { name: "Send message" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    /highlighted fields/,
  );
  expect(screen.getByLabelText(/Email address/)).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  expect(screen.getByLabelText(/Email address/)).toHaveFocus();
  expect(screen.getByLabelText(/Your message/)).toHaveValue(
    "Please explain this topic.",
  );
});
