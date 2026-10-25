import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopicForm } from "@/components/shared/topic-form";
import { solveCaptcha } from "./solve-captcha";
import { topicFormSchema } from "@/lib/utils/request-schema";
const blank = {
  topic: "A useful question",
  description: "",
  name: "",
  email: "",
  website: "",
};
afterEach(() => vi.unstubAllGlobals());
describe("topic suggestions", () => {
  it("switches starters while retaining the written subject and protecting custom drafts", async () => {
    const user = userEvent.setup();
    render(<TopicForm apiUrl="https://api.test" />);
    const topic = screen.getByLabelText(/what should we explore/i);
    const explain = screen.getByRole("button", { name: "Explain something" });
    const compare = screen.getByRole("button", { name: "Compare options" });
    const choose = screen.getByRole("button", { name: "Help me choose" });
    await user.click(explain);
    expect(topic).toHaveValue("How does ");
    await user.click(compare);
    expect(topic).toHaveValue("What’s the difference between ");
    expect(compare).toHaveAttribute("aria-pressed", "true");
    expect(explain).toHaveAttribute("aria-pressed", "false");
    await user.click(choose);
    expect(topic).toHaveValue("How do I choose ");
    await user.type(topic, "home chargers");
    await user.click(explain);
    expect(topic).toHaveValue("How does home chargers");
    await user.click(compare);
    expect(topic).toHaveValue("What’s the difference between home chargers");
    await user.clear(topic);
    await user.type(topic, "How does");
    await user.click(choose);
    expect(topic).toHaveValue("How do I choose ");
    await user.clear(topic);
    await user.type(topic, "A question I have already written");
    await user.click(compare);
    expect(topic).toHaveValue("A question I have already written");
    expect(topic).toHaveFocus();
    expect(compare).toHaveAttribute("aria-pressed", "false");
  });
  it("enforces limits, plain text, and optional contact details", () => {
    expect(topicFormSchema.safeParse(blank).success).toBe(true);
    for (const values of [
      { ...blank, topic: "   " },
      { ...blank, topic: "a".repeat(301) },
      { ...blank, email: "bad" },
      {
        ...blank,
        description: "&amp;lt;script&amp;gt;bad()&amp;lt;/script&amp;gt;",
      },
    ])
      expect(topicFormSchema.safeParse(values).success).toBe(false);
  });
  it("validates before making a request", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(<TopicForm apiUrl="https://api.test" />);
    expect(document.querySelector("form")).toHaveAttribute("method", "post");
    expect(document.querySelector("form")).toHaveAttribute(
      "action",
      "https://api.test/api/v1/article-requests",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /submit request/i }),
    );
    expect(await screen.findByText(/tell us the topic/i)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("submits only the public contract and shows success", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { message: "Thank you for your suggestion." },
        }),
        { status: 202 },
      ),
    );
    vi.stubGlobal("fetch", fetch);
    render(<TopicForm apiUrl="https://api.test" />);
    await userEvent.type(
      screen.getByLabelText(/what should we explore/i),
      "Choosing an electric car",
    );
    await solveCaptcha();
    await userEvent.click(
      screen.getByRole("button", { name: /submit request/i }),
    );
    expect(await screen.findByText("Curiosity, received.")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "https://api.test/api/v1/article-requests",
      expect.objectContaining({
        credentials: "omit",
        redirect: "error",
        body: JSON.stringify({
          topic: "Choosing an electric car",
          website: "",
        }),
      }),
    );
  });
  it("honors rate limits and preserves form input", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("{}", {
          status: 429,
          headers: { "Retry-After": "120" },
        }),
      ),
    );
    render(<TopicForm apiUrl="https://api.test" />);
    await userEvent.type(
      screen.getByLabelText(/what should we explore/i),
      "A question",
    );
    await solveCaptcha();
    await userEvent.click(
      screen.getByRole("button", { name: /submit request/i }),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /wait before trying/i,
      ),
    );
    expect(screen.getByLabelText(/what should we explore/i)).toHaveValue(
      "A question",
    );
    expect(
      screen.getByRole("button", { name: /submit request/i }),
    ).toBeDisabled();
  });
});
