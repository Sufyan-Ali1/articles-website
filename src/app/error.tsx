"use client";
import { RouteError } from "@/components/errors/route-error";
export default function ErrorPage({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return <RouteError onRetry={retry} />;
}
