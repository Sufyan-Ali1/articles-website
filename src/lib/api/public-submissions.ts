import { z } from "zod";

const accepted = z.object({ data: z.object({ message: z.string().min(1) }) });
const validation = z.object({
  error: z.object({
    details: z
      .array(z.object({ location: z.array(z.union([z.string(), z.number()])) }))
      .optional(),
  }),
});
export type SubmissionResult =
  | { kind: "accepted" }
  | { kind: "limited"; seconds: number }
  | { kind: "invalid"; fields: string[] };

export function retrySeconds(value: string | null, now = Date.now()): number {
  const seconds =
    value && /^\d+$/.test(value)
      ? Number(value)
      : value
        ? Math.ceil((Date.parse(value) - now) / 1000)
        : 60;
  return Number.isFinite(seconds) ? Math.max(1, Math.min(86400, seconds)) : 60;
}

export async function submitPublicForm(
  apiUrl: string,
  endpoint: "contact-messages" | "subscriptions",
  values: object,
): Promise<SubmissionResult> {
  const response = await fetch(
    `${apiUrl.replace(/\/$/, "")}/api/v1/${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(values),
      credentials: "omit",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    },
  );
  if (response.status === 429)
    return {
      kind: "limited",
      seconds: retrySeconds(response.headers.get("Retry-After")),
    };
  if (response.status === 422) {
    const parsed = validation.safeParse(
      await response.json().catch(() => null),
    );
    return {
      kind: "invalid",
      fields: parsed.success
        ? (parsed.data.error.details || []).map((issue) =>
            String(issue.location.at(-1)),
          )
        : [],
    };
  }
  if (
    response.status !== 202 ||
    !accepted.safeParse(await response.json()).success
  )
    throw new Error("Submission was not confirmed");
  return { kind: "accepted" };
}
