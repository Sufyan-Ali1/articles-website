"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpRight,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Send,
} from "lucide-react";
import {
  contactSchema,
  contactReasons,
  type ContactReason,
  type ContactValues,
} from "@/lib/utils/contact-schema";
import { Button } from "@/components/ui/button";
import { MathCaptcha, type MathCaptchaHandle } from "./math-captcha";
import styles from "@/components/contact/contact.module.css";
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
  const captcha = useRef<MathCaptchaHandle>(null);
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
    if (!captcha.current?.validate()) return;
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
    } finally {
      captcha.current?.reset();
    }
  }
  if (sent)
    return (
      <section
        className={`contact-form-panel ${styles.formPanel} ${styles.success}`}
        role="status"
        aria-labelledby="contact-form-title"
      >
        <span className={styles.successSeal}>
          <CheckCircle2 size={38} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className={styles.eyebrow}>Message received</p>
        <h2 id="contact-form-title">Thanks for getting in touch.</h2>
        <p>
          Your message has been accepted. Thank you for sharing the details; we
          may use the email you provided to follow up.
        </p>
        <Button asChild className={styles.submitButton}>
          <Link href="/articles">
            Continue exploring
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </Button>
        <button
          className={styles.anotherMessage}
          type="button"
          onClick={() => setSent(false)}
        >
          Send another message
        </button>
      </section>
    );
  return (
    <form
      id="contact-message-form"
      name="contact"
      method="post"
      action="/__forms.html"
      onSubmit={(event) => void form.handleSubmit(submit)(event)}
      noValidate
      className={`contact-form-panel ${styles.formPanel}`}
      aria-labelledby="contact-form-title"
    >
      <input type="hidden" name="form-name" value="contact" />
      <noscript>
        <p className="form-alert">
          Please enable JavaScript and reload to send your message.
        </p>
      </noscript>
      <h2 id="contact-form-title">Send Us a Message</h2>
      <p className={styles.formDescription}>
        Tell us what you need help with. For article feedback, include the page
        link and enough detail to explain your question or correction.
      </p>
      {!enabled && (
        <div className={styles.notice} role="status">
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
      <div className={styles.field}>
        <label htmlFor="contact-name">
          Your name <span>Optional</span>
        </label>
        <input
          id="contact-name"
          autoComplete="name"
          placeholder="Your name"
          maxLength={150}
          aria-invalid={Boolean(fields.name)}
          aria-describedby="contact-name-error"
          {...form.register("name")}
        />
        <p className="field-error" id="contact-name-error">
          {fields.name?.message}
        </p>
      </div>
      <div className={styles.field}>
        <label htmlFor="contact-email">
          Email address <span>Required</span>
        </label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          maxLength={255}
          aria-required="true"
          aria-invalid={Boolean(fields.email)}
          aria-describedby="contact-email-error"
          {...form.register("email")}
        />
        <p className="field-error" id="contact-email-error">
          {fields.email?.message}
        </p>
      </div>
      <fieldset className={styles.reasonFieldset}>
        <legend>Subject</legend>
        <div className={styles.reasonOptions}>
          {contactReasons.map((reason) => (
            <label key={reason.value}>
              <input
                type="radio"
                value={reason.value}
                {...form.register("reason")}
              />
              <span>{reason.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {reason === "correction" && (
        <div className={styles.field}>
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
      <div className={styles.field}>
        <label htmlFor="contact-message">
          Your message <span>Required</span>
        </label>
        <textarea
          id="contact-message"
          rows={6}
          maxLength={5000}
          placeholder={
            contactReasons.find((item) => item.value === reason)?.hint
          }
          aria-required="true"
          aria-invalid={Boolean(fields.message)}
          aria-describedby="contact-message-hint contact-message-error"
          {...form.register("message")}
        />
        <p className={styles.fieldHint} id="contact-message-hint">
          Include the details we need to understand your enquiry. Plain text, up
          to 5,000 characters.
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
      <MathCaptcha ref={captcha} disabled={!enabled} />
      <div className={styles.formBottom}>
        <Button
          className={styles.submitButton}
          type="submit"
          disabled={!enabled || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <LoaderCircle
                size={18}
                className="animate-spin"
                aria-hidden="true"
              />
              Sending…
            </>
          ) : (
            <>
              <Send size={19} strokeWidth={1.8} aria-hidden="true" />
              Send message
            </>
          )}
        </Button>
        <p>
          <LockKeyhole size={13} aria-hidden="true" />
          Sent privately.{" "}
          <Link href="/privacy">How we use your information</Link>
        </p>
      </div>
    </form>
  );
}
