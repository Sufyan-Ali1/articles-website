"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";
import {
  topicFormSchema,
  type TopicFormValues,
} from "@/lib/utils/request-schema";
import { Button } from "@/components/ui/button";
const defaults: TopicFormValues = {
  topic: "",
  description: "",
  name: "",
  email: "",
  website: "",
};
export function TopicForm({ apiUrl }: { apiUrl: string }) {
  const [complete, setComplete] = useState(false);
  const [alert, setAlert] = useState("");
  const [seconds, setSeconds] = useState(0);
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: defaults,
  });
  useEffect(() => {
    if (!seconds) return;
    const timer = setTimeout(
      () => setSeconds((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [seconds]);
  async function submit(values: TopicFormValues) {
    setAlert("");
    if (!apiUrl) {
      setAlert(
        "Topic suggestions are being connected. Please check back shortly.",
      );
      return;
    }
    try {
      const response = await fetch(
        `${apiUrl.replace(/\/$/, "")}/api/v1/article-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "omit",
          cache: "no-store",
          signal: AbortSignal.timeout(20000),
          body: JSON.stringify({
            topic: values.topic,
            ...(values.description ? { description: values.description } : {}),
            ...(values.name ? { name: values.name } : {}),
            ...(values.email ? { email: values.email } : {}),
            website: values.website,
          }),
        },
      );
      if (response.status === 429) {
        const retry = response.headers.get("Retry-After");
        const delay =
          retry && /^\d+$/.test(retry)
            ? Number(retry)
            : retry
              ? Math.ceil((Date.parse(retry) - Date.now()) / 1000)
              : 60;
        setSeconds(
          Number.isFinite(delay) ? Math.min(86400, Math.max(1, delay)) : 60,
        );
        setAlert(
          "You’ve sent a few suggestions recently. Please wait before trying again.",
        );
        return;
      }
      if (response.status === 422) {
        const payload = await response.json().catch(() => null);
        const details: unknown = payload?.error?.details;
        if (Array.isArray(details))
          for (const issue of details) {
            const field = issue?.location?.at(-1);
            if (["topic", "description", "name", "email"].includes(field))
              form.setError(field as keyof TopicFormValues, {
                message:
                  "Please check this field. Use plain text within the stated limit.",
              });
          }
        setAlert("Please check the highlighted fields and try again.");
        return;
      }
      if (response.status !== 202) throw new Error("Submission failed");
      const data = await response.json();
      if (typeof data?.data?.message !== "string")
        throw new Error("Invalid response");
      form.reset(defaults);
      setComplete(true);
    } catch {
      setAlert(
        "We couldn’t confirm your suggestion was received. Please check your connection and try again.",
      );
    }
  }
  if (complete)
    return (
      <div className="topic-form form-success" role="status">
        <CheckCircle2 size={45} strokeWidth={1.3} />
        <h2>Curiosity, received.</h2>
        <p>
          Thank you for your suggestion. We’ll consider it as we plan future
          articles. Submission doesn’t guarantee publication or a reply.
        </p>
        <Button asChild>
          <Link href="/articles">
            Find your next read
            <ArrowUpRight size={16} />
          </Link>
        </Button>
        <button
          className="text-link"
          style={{
            margin: "20px auto 0",
            display: "flex",
            background: "none",
            border: 0,
          }}
          onClick={() => {
            setComplete(false);
            setAlert("");
          }}
        >
          Suggest another topic
        </button>
      </div>
    );
  const error = (field: keyof TopicFormValues) =>
    form.formState.errors[field]?.message;
  return (
    <form
      method="post"
      action={
        apiUrl
          ? `${apiUrl.replace(/\/$/, "")}/api/v1/article-requests`
          : undefined
      }
      className="topic-form"
      onSubmit={form.handleSubmit(submit)}
      noValidate
    >
      <noscript>
        <p className="form-alert">
          Please enable JavaScript and reload to send a topic suggestion.
        </p>
      </noscript>
      <div className="eyebrow">Your next question starts here</div>
      <h2 className="form-heading">Put your curiosity into words.</h2>
      <div className="topic-starters">
        <span>Need a starting point?</span>
        <div>
          {[
            { label: "Explain something", text: "How does " },
            {
              label: "Compare options",
              text: "What’s the difference between ",
            },
            { label: "Help me choose", text: "How do I choose " },
          ].map((prompt) => (
            <button
              type="button"
              key={prompt.label}
              onClick={() => {
                if (!form.getValues("topic").trim())
                  form.setValue("topic", prompt.text, { shouldDirty: true });
                form.setFocus("topic");
              }}
            >
              {prompt.label}
              <ArrowUpRight size={13} />
            </button>
          ))}
        </div>
      </div>
      {(!apiUrl || alert) && (
        <div className="form-alert" role="alert">
          {alert ||
            "Topic suggestions are being connected. Please check back shortly."}
          {seconds > 0 && <span> Try again in {seconds} seconds.</span>}
        </div>
      )}
      <div className="form-field">
        <label htmlFor="topic">
          What should we explore? <span>Required</span>
        </label>
        <input
          id="topic"
          placeholder="e.g. How to choose your first electric car"
          maxLength={300}
          aria-invalid={Boolean(error("topic"))}
          aria-describedby={error("topic") ? "topic-error" : "topic-hint"}
          {...form.register("topic")}
        />
        <p id="topic-hint" className="field-hint">
          A question, a comparison, a how-to. Up to 300 characters.
        </p>
        {error("topic") && (
          <p id="topic-error" className="field-error">
            {error("topic")}
          </p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="description">
          A little more context <span>Optional</span>
        </label>
        <textarea
          id="description"
          placeholder="What would you like to learn? Any specific questions we should answer?"
          maxLength={10000}
          aria-invalid={Boolean(error("description"))}
          aria-describedby="description-hint description-error"
          {...form.register("description")}
        />
        <p className="field-hint" id="description-hint">
          Plain text only. Up to 10,000 characters.
        </p>
        <p className="field-error" id="description-error">
          {error("description")}
        </p>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="name">
            Your name <span>Optional</span>
          </label>
          <input
            id="name"
            autoComplete="name"
            maxLength={150}
            placeholder="What should we call you?"
            aria-invalid={Boolean(error("name"))}
            aria-describedby="name-error"
            {...form.register("name")}
          />
          <p className="field-error" id="name-error">
            {error("name")}
          </p>
        </div>
        <div className="form-field">
          <label htmlFor="email">
            Email address <span>Optional</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            maxLength={255}
            placeholder="you@example.com"
            aria-invalid={Boolean(error("email"))}
            aria-describedby="email-error"
            {...form.register("email")}
          />
          <p className="field-error" id="email-error">
            {error("email")}
          </p>
        </div>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          tabIndex={-1}
          autoComplete="off"
          {...form.register("website")}
        />
      </div>
      <div className="form-footer">
        <Button
          type="submit"
          disabled={!apiUrl || form.formState.isSubmitting || seconds > 0}
        >
          {form.formState.isSubmitting ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Sending your suggestion…
            </>
          ) : (
            <>
              Send your suggestion
              <ArrowUpRight size={17} />
            </>
          )}
        </Button>
        <p>
          Your suggestion and optional contact details are sent privately.
          <br />
          Read our <Link href="/privacy">Privacy Policy</Link> before
          submitting.
        </p>
      </div>
    </form>
  );
}
