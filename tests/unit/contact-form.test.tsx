import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/shared/contact-form";
import { contactPrefill, contactSchema } from "@/lib/utils/contact-schema";
import { solveCaptcha } from "./solve-captcha";
afterEach(() => vi.unstubAllGlobals());
describe("general contact", () => {
  it("keeps submissions disabled until delivery is explicitly enabled", () => {
    render(<ContactForm enabled={false} />);
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    expect(
      screen.getByRole("link", { name: /suggest a topic/i }),
    ).toHaveAttribute("href", "/request-article");
  });
  it("validates required information and focuses the first invalid field", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(<ContactForm enabled />);
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(
      await screen.findByText(/Enter an email address/),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByLabelText(/Email address/)).toHaveFocus(),
    );
    expect(fetch).not.toHaveBeenCalled();
  });
  it("registers every submitted field with the actual static Netlify definition", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response("Accepted", { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    render(
      <ContactForm
        enabled
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
    expect(url).toBe("/__forms.html");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    );
    const body = new URLSearchParams(init.body);
    expect(body.get("form-name")).toBe("contact");
    expect(body.get("article_url")).toBe("https://site.test/articles/a-story");
    const document = new DOMParser().parseFromString(
      readFileSync("public/__forms.html", "utf8"),
      "text/html",
    );
    const definition = document.querySelector('form[name="contact"]');
    expect(definition).not.toBeNull();
    for (const key of body.keys())
      expect(definition?.querySelector(`[name="${key}"]`)).not.toBeNull();
  });
  it("preserves a failed message without claiming success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Unavailable", { status: 503 })),
    );
    render(<ContactForm enabled />);
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
        enabled
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
    render(<ContactForm enabled />);
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
    render(<ContactForm enabled />);
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
