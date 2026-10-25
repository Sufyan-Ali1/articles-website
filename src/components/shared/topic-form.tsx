"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpRight,
  CheckCircle2,
  LoaderCircle,
  Send,
  LockKeyhole,
} from "lucide-react";
import {
  topicFormSchema,
  type TopicFormValues,
} from "@/lib/utils/request-schema";
import { Button } from "@/components/ui/button";
import { MathCaptcha, type MathCaptchaHandle } from "./math-captcha";
import {
  TopicStarters,
  replaceTopicStarter,
} from "@/components/requests/topic-starters";
import styles from "@/components/requests/request.module.css";
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
  const captcha = useRef<MathCaptchaHandle>(null);
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: defaults,
  });
  const topic = useWatch({ control: form.control, name: "topic" });
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
    if (!captcha.current?.validate()) return;
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
          redirect: "error",
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
    } finally {
      captcha.current?.reset();
    }
  }
  if (complete)
    return (
      <section
        className={`topic-form ${styles.form} ${styles.success}`}
        role="status"
        aria-labelledby="request-form-title"
      >
        <span className={styles.successIcon}>
          <CheckCircle2 size={39} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <p className={styles.eyebrow}>Suggestion received</p>
        <h2 id="request-form-title">Curiosity, received.</h2>
        <p>
          Thank you for your idea. We’ll consider it as we plan future articles.
          Submission doesn’t guarantee publication or a reply.
        </p>
        <Button asChild className={styles.submitButton}>
          <Link href="/articles">
            Find your next read
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </Button>
        <button
          className={styles.anotherTopic}
          type="button"
          onClick={() => {
            setComplete(false);
            setAlert("");
          }}
        >
          Suggest another topic
        </button>
      </section>
    );
  const error = (field: keyof TopicFormValues) =>
    form.formState.errors[field]?.message;
  return (
    <form
      id="article-request-form"
      method="post"
      action={
        apiUrl
          ? `${apiUrl.replace(/\/$/, "")}/api/v1/article-requests`
          : undefined
      }
      className={`topic-form ${styles.form}`}
      onSubmit={(event) => void form.handleSubmit(submit)(event)}
      noValidate
      aria-labelledby="request-form-title"
    >
      <noscript>
        <p className="form-alert">
          Please enable JavaScript and reload to send a topic suggestion.
        </p>
      </noscript>
      <h2 id="request-form-title">Tell Us What You Want to Read</h2>
      <p className={styles.formDescription}>
        Start with the question you want answered. Add context if it would help
        us understand your idea.
      </p>
      {(!apiUrl || alert) && (
        <div className="form-alert" role="alert">
          {alert ||
            "Topic suggestions are being connected. Please check back shortly."}
          {seconds > 0 && <span> Try again in {seconds} seconds.</span>}
        </div>
      )}
      <div className={styles.field}>
        <label htmlFor="topic">
          What should we explore?{" "}
          <span className={styles.required}>Required</span>
        </label>
        <input
          id="topic"
          placeholder="e.g. How do I choose a laptop for working from home?"
          maxLength={300}
          aria-required="true"
          aria-invalid={Boolean(error("topic"))}
          aria-describedby={error("topic") ? "topic-error" : "topic-hint"}
          {...form.register("topic")}
        />
        <p id="topic-hint" className={styles.hint}>
          Ask a focused question or name a comparison. Up to 300 characters.
        </p>
        {error("topic") && (
          <p id="topic-error" className="field-error">
            {error("topic")}
          </p>
        )}
        <TopicStarters
          value={topic}
          onChoose={(text) => {
            const current = form.getValues("topic");
            const next = replaceTopicStarter(current, text);
            if (next !== current)
              form.setValue("topic", next, {
                shouldDirty: true,
                shouldValidate: true,
              });
            form.setFocus("topic");
            const input = document.activeElement;
            if (input instanceof HTMLInputElement && input.id === "topic")
              input.setSelectionRange(input.value.length, input.value.length);
          }}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="description">
          A little more context <span>Optional</span>
        </label>
        <textarea
          id="description"
          rows={4}
          placeholder="What are you trying to do, and what would a useful answer explain?"
          maxLength={10000}
          aria-invalid={Boolean(error("description"))}
          aria-describedby="description-error"
          {...form.register("description")}
        />
        <p className="field-error" id="description-error">
          {error("description")}
        </p>
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="name">
            Your name <span>Optional</span>
          </label>
          <input
            id="name"
            autoComplete="name"
            maxLength={150}
            placeholder="Your name"
            aria-invalid={Boolean(error("name"))}
            aria-describedby="name-error"
            {...form.register("name")}
          />
          <p className="field-error" id="name-error">
            {error("name")}
          </p>
        </div>
        <div className={styles.field}>
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
      <MathCaptcha ref={captcha} disabled={!apiUrl || seconds > 0} />
      <div className={styles.formFooter}>
        <Button
          className={styles.submitButton}
          type="submit"
          disabled={!apiUrl || form.formState.isSubmitting || seconds > 0}
        >
          {form.formState.isSubmitting ? (
            <>
              <LoaderCircle
                size={18}
                className="animate-spin"
                aria-hidden="true"
              />
              Sending your suggestion…
            </>
          ) : (
            <>
              <Send size={18} strokeWidth={1.8} aria-hidden="true" />
              Submit request
            </>
          )}
        </Button>
        <p>
          <LockKeyhole size={13} aria-hidden="true" />
          Sent privately. <Link href="/privacy">Privacy Policy</Link>
        </p>
      </div>
    </form>
  );
}
