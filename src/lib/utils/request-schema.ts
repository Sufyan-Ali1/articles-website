import { z } from "zod";
export function isPlainText(value: string) {
  if (
    [...value].some(
      (char) => char.charCodeAt(0) < 32 && !"\n\r\t".includes(char),
    )
  )
    return false;
  let decoded = value;
  for (let i = 0; i < 4; i++)
    decoded = decoded
      .replace(/&#(x[\da-f]+|\d+);?/gi, (_, n: string) => {
        const code =
          n[0].toLowerCase() === "x" ? parseInt(n.slice(1), 16) : Number(n);
        return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
      })
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&amp;/gi, "&");
  return !/<\s*\/?\s*[a-z][^>]*>|<!--|<!doctype/i.test(decoded);
}
const plain = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Please use ${max.toLocaleString()} characters or fewer.`)
    .refine(isPlainText, "Please use plain text without HTML.");
export const topicFormSchema = z.object({
  topic: plain(300).min(1, "Tell us the topic you’d like us to explore."),
  description: plain(10000),
  name: plain(150),
  email: z
    .string()
    .trim()
    .max(255)
    .refine(
      (value) => !value || z.email().safeParse(value).success,
      "Please enter a valid email address.",
    ),
  website: z.string().max(2048),
});
export type TopicFormValues = z.infer<typeof topicFormSchema>;
