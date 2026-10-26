"use client";
import { useEffect, useState } from "react";

export function useSubmissionCooldown() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!seconds) return;
    const timeout = setTimeout(
      () => setSeconds((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => clearTimeout(timeout);
  }, [seconds]);
  return { seconds, setSeconds };
}
