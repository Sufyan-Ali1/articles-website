import { z } from "zod";
import { isPlainText } from "./request-schema";
export const contactReasons = [
  {
    value: "general",
    label: "General question",
    hint: "What would you like to know about the publication?",
  },
  {
    value: "correction",
    label: "Suggest a correction",
    hint: "Include the passage and what you believe should change.",
  },
  {
    value: "privacy",
    label: "Privacy enquiry",
    hint: "Tell us how we can help. Please leave out sensitive information.",
  },
] as const;
export type ContactReason = (typeof contactReasons)[number]["value"];
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .max(150, "Please use 150 characters or fewer.")
    .refine(isPlainText, "Please use plain text."),
  email: z
    .string()
    .trim()
    .min(1, "Enter an email address so we can reply.")
    .max(255)
    .email("Please enter a valid email address."),
  reason: z.enum(["general", "correction", "privacy"]),
  article_url: z
    .string()
    .trim()
    .max(2048)
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return (
          ["https:", "http:"].includes(url.protocol) &&
          !url.username &&
          !url.password
        );
      } catch {
        return false;
      }
    }, "Enter a complete http:// or https:// article address."),
  message: z
    .string()
    .trim()
    .min(1, "Tell us a little about your question.")
    .max(5000, "Please use 5,000 characters or fewer.")
    .refine(isPlainText, "Please use plain text without HTML."),
  "bot-field": z.string().max(2048),
});
export type ContactValues = z.infer<typeof contactSchema>;
export function contactPrefill(
  params: Record<string, string | string[] | undefined>,
  siteUrl: string,
) {
  const reason: ContactReason = contactReasons.some(
    (r) => r.value === params.reason,
  )
    ? (params.reason as ContactReason)
    : "general";
  let articleUrl = "";
  if (typeof params.article === "string" && params.article.length <= 2048) {
    try {
      const url = new URL(params.article);
      if (
        url.origin === new URL(siteUrl).origin &&
        /^\/articles\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/.test(url.pathname)
      )
        articleUrl = `${url.origin}${url.pathname}`;
    } catch {
      /* Invalid query values are ignored. */
    }
  }
  return { reason, articleUrl };
}
