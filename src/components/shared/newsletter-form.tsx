"use client";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useFormsApiUrl } from "./forms-api-provider";
import { submitPublicForm } from "@/lib/api/public-submissions";
import { useSubmissionCooldown } from "@/lib/hooks/use-submission-cooldown";

const subscriptionSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(255, "Please use 255 characters or fewer.")
    .email("Please enter a valid email address.")
    .toLowerCase(),
});

export function NewsletterForm({
  compact = false,
  label = "Newsletter signup",
  apiUrl: suppliedApiUrl,
  formClassName = "",
  fieldsClassName = "",
  noteClassName = "",
}: {
  compact?: boolean;
  label?: string;
  apiUrl?: string;
  formClassName?: string;
  fieldsClassName?: string;
  noteClassName?: string;
}) {
  const configuredApiUrl = useFormsApiUrl();
  const apiUrl = suppliedApiUrl ?? configuredApiUrl;
  const id = useId();
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const { seconds, setSeconds } = useSubmissionCooldown();
  const form = useForm<{ email: string }>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: { email: "" },
  });
  const unavailable = !apiUrl;
  async function submit(values: { email: string }) {
    if (unavailable || seconds) return;
    setError("");
    try {
      const result = await submitPublicForm(apiUrl, "subscriptions", values);
      if (result.kind === "limited") {
        setSeconds(result.seconds);
        setError("Please wait before subscribing again.");
        return;
      }
      if (result.kind === "invalid") {
        form.setError(
          "email",
          { message: "Please check your email address." },
          { shouldFocus: true },
        );
        return;
      }
      form.reset();
      setComplete(true);
    } catch {
      setError(
        "We couldn’t confirm your subscription. Your email is still here—please try again.",
      );
    }
  }
  const disabled = unavailable || form.formState.isSubmitting || seconds > 0;
  return (
    <div>
      {complete ? (
        <p
          className={`publication-newsletter-note ${noteClassName}`}
          role="status"
        >
          You’re subscribed. We’ve saved your email for future article updates.
        </p>
      ) : (
        <>
          <form
            className={`publication-newsletter-form ${formClassName}`}
            aria-label={label}
            noValidate
            onSubmit={form.handleSubmit(submit)}
            aria-busy={form.formState.isSubmitting}
          >
            <div className={`publication-newsletter-fields ${fieldsClassName}`}>
              <input
                id={`${id}-email`}
                type="email"
                autoComplete="email"
                maxLength={255}
                aria-label="Your email address"
                placeholder="Your email address"
                aria-required="true"
                aria-invalid={Boolean(form.formState.errors.email)}
                aria-describedby={`${id}-note${form.formState.errors.email ? ` ${id}-error` : ""}`}
                disabled={unavailable}
                readOnly={form.formState.isSubmitting}
                {...form.register("email")}
              />
              <button
                type="submit"
                disabled={disabled}
                aria-label="Subscribe to newsletter"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                    <span className={compact ? "sr-only" : undefined}>
                      Subscribing…
                    </span>
                  </>
                ) : seconds ? (
                  <span>{seconds}s</span>
                ) : compact ? (
                  <ArrowRight size={18} aria-hidden="true" />
                ) : (
                  <>
                    Subscribe <ArrowRight size={15} aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>
          {form.formState.errors.email && (
            <p
              id={`${id}-error`}
              role="alert"
              className={`publication-newsletter-note ${noteClassName}`}
            >
              {form.formState.errors.email.message}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className={`publication-newsletter-note ${noteClassName}`}
            >
              {error}
              {seconds > 0 && ` Try again in ${seconds}s.`}
            </p>
          )}
          <p
            id={`${id}-note`}
            className={`publication-newsletter-note ${noteClassName}`}
          >
            {unavailable
              ? "Subscriptions are temporarily unavailable. Please check back soon."
              : "Sign up for future article updates. Emails are not being sent yet."}
          </p>
        </>
      )}
    </div>
  );
}
