"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpRight,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import {
  contactSchema,
  contactReasons,
  type ContactReason,
  type ContactValues,
} from "@/lib/utils/contact-schema";
import { Button } from "@/components/ui/button";
export function ContactForm({
  enabled,
  initialReason = "general",
  articleUrl = "",
  email = "",
}: {
  enabled: boolean;
  initialReason?: ContactReason;
  articleUrl?: string;
  email?: string;
}) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      reason: initialReason,
      article_url: articleUrl,
      message: "",
      "bot-field": "",
    },
  });
  const reason = useWatch({ control: form.control, name: "reason" });
  const fields = form.formState.errors;
  async function submit(values: ContactValues) {
    if (!enabled) {
      setError("The contact form is not available yet.");
      return;
    }
    setError("");
    try {
      const body = new URLSearchParams({
        "form-name": "contact",
        ...values,
        article_url: values.reason === "correction" ? values.article_url : "",
      });
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        signal: AbortSignal.timeout(20000),
      });
      if (response.status === 429) {
        setError(
          "Please wait a little before sending another message. Your text is still here.",
        );
        return;
      }
      if (!response.ok) throw new Error("Contact delivery failed");
      form.reset();
      setSent(true);
    } catch {
      setError(
        "We couldn’t confirm delivery. Your message is still here—please check your connection and try again.",
      );
    }
  }
  if (sent)
    return (
      <section className="contact-form-panel contact-success" role="status">
        <span className="success-seal">
          <CheckCircle2 size={38} strokeWidth={1.5} />
        </span>
        <span className="eyebrow">Message received</span>
        <h2>
          Thanks for
          <br />
          <em>getting in touch.</em>
        </h2>
        <p>
          Your message has been received. Thank you for taking the time to share
          it with the publication.
        </p>
        <Button asChild>
          <Link href="/articles">
            Continue exploring
            <ArrowUpRight size={18} />
          </Link>
        </Button>
        <button className="text-link" onClick={() => setSent(false)}>
          Send another message
        </button>
      </section>
    );
  return (
    <form
      name="contact"
      method="post"
      action="/__forms.html"
      onSubmit={form.handleSubmit(submit)}
      noValidate
      className="contact-form-panel"
    >
      <input type="hidden" name="form-name" value="contact" />
      <noscript>
        <p className="form-alert">
          Please enable JavaScript and reload to send your message.
        </p>
      </noscript>
      <div className="form-panel-heading">
        <span className="eyebrow">A note to the publication</span>
        <LockKeyhole size={16} aria-hidden="true" />
      </div>
      <h2>What’s on your mind?</h2>
      <fieldset className="reason-fieldset">
        <legend>How can we help?</legend>
        <div className="reason-options">
          {contactReasons.map((r) => (
            <label key={r.value}>
              <input
                type="radio"
                value={r.value}
                {...form.register("reason")}
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {!enabled && (
        <div className="form-notice" role="status">
          The contact form is being connected.{" "}
          {email ? (
            <a href={`mailto:${email}`}>Email the publication instead.</a>
          ) : (
            <>
              For an article idea,{" "}
              <Link href="/request-article">suggest a topic</Link>. General
              enquiries will be available here once delivery is connected.
            </>
          )}
        </div>
      )}
      {error && (
        <div className="form-alert" role="alert">
          {error}
        </div>
      )}
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="contact-name">
            Your name <span>Optional</span>
          </label>
          <input
            id="contact-name"
            autoComplete="name"
            placeholder="What should we call you?"
            maxLength={150}
            aria-invalid={Boolean(fields.name)}
            aria-describedby="contact-name-error"
            {...form.register("name")}
          />
          <p className="field-error" id="contact-name-error">
            {fields.name?.message}
          </p>
        </div>
        <div className="form-field">
          <label htmlFor="contact-email">
            Email address <span>Required</span>
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            maxLength={255}
            aria-invalid={Boolean(fields.email)}
            aria-describedby="contact-email-error"
            {...form.register("email")}
          />
          <p className="field-error" id="contact-email-error">
            {fields.email?.message}
          </p>
        </div>
      </div>
      {reason === "correction" && (
        <div className="form-field">
          <label htmlFor="contact-article">
            Article link <span>Optional</span>
          </label>
          <input
            id="contact-article"
            type="url"
            placeholder="https://…/articles/…"
            maxLength={2048}
            aria-invalid={Boolean(fields.article_url)}
            aria-describedby="contact-article-error"
            {...form.register("article_url")}
          />
          <p className="field-error" id="contact-article-error">
            {fields.article_url?.message}
          </p>
        </div>
      )}
      <div className="form-field">
        <label htmlFor="contact-message">
          Your message <span>Required</span>
        </label>
        <textarea
          id="contact-message"
          rows={6}
          maxLength={5000}
          placeholder={contactReasons.find((r) => r.value === reason)?.hint}
          aria-invalid={Boolean(fields.message)}
          aria-describedby="contact-message-hint contact-message-error"
          {...form.register("message")}
        />
        <p className="field-hint" id="contact-message-hint">
          A little context goes a long way. Plain text, up to 5,000 characters.
        </p>
        <p className="field-error" id="contact-message-error">
          {fields.message?.message}
        </p>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-bot">Leave empty</label>
        <input
          id="contact-bot"
          tabIndex={-1}
          autoComplete="off"
          {...form.register("bot-field")}
        />
      </div>
      <div className="contact-form-bottom">
        <p>
          <LockKeyhole size={14} />
          Sent privately.{" "}
          <Link href="/privacy">How we use your information</Link>
        </p>
        <Button
          type="submit"
          disabled={!enabled || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <LoaderCircle size={17} className="animate-spin" />
              Sending…
            </>
          ) : (
            <>
              Send message
              <ArrowUpRight size={18} />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
