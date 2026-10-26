"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Queue requests so the first landing response establishes a cookie before a
// fast client-side navigation sends the next event.
let pending: Promise<unknown> = Promise.resolve();

export function TrafficTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const initialReferrer = useRef<string | null>(null);
  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    if (
      navigator.doNotTrack === "1" ||
      (navigator as Navigator & { globalPrivacyControl?: boolean })
        .globalPrivacyControl
    )
      return;
    const referrer = initialReferrer.current ?? document.referrer;
    initialReferrer.current = referrer;
    const track = () => {
      if (
        document.visibilityState !== "visible" ||
        lastPath.current === pathname
      )
        return;
      lastPath.current = pathname;
      const body = JSON.stringify({
        event_id: crypto.randomUUID(),
        path: pathname,
        referrer: referrer.slice(0, 2048),
      });
      pending = pending
        .catch(() => undefined)
        .then(async () => {
          // Reuse event_id for one network retry; the backend deduplicates it.
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              const response = await fetch("/api/analytics/visit", {
                method: "POST",
                credentials: "same-origin",
                keepalive: true,
                headers: { "Content-Type": "application/json" },
                body,
              });
              if (response.ok || response.status < 500) return;
            } catch {
              /* Analytics failure must never interrupt reading. */
            }
          }
        });
    };
    track();
    document.addEventListener("visibilitychange", track);
    return () => document.removeEventListener("visibilitychange", track);
  }, [pathname]);
  return null;
}
