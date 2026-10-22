"use client";
import { useEffect } from "react";
export function CodeCopy() {
  useEffect(() => {
    const root = document.getElementById("article-content");
    if (!root) return;
    const buttons = root.querySelectorAll<HTMLButtonElement>(
      "button[data-copy-code]",
    );
    buttons.forEach((button) => {
      button.disabled = false;
    });
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const copy = async (event: MouseEvent) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(
        "button[data-copy-code]",
      );
      if (!button || !root.contains(button)) return;
      const code = button.closest(".code-block")?.querySelector("pre");
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.textContent || "");
        button.textContent = "Copied";
      } catch {
        button.textContent = "Select code to copy";
      }
      const timer = setTimeout(() => {
        button.textContent = "Copy code";
        timers.delete(timer);
      }, 2200);
      timers.add(timer);
    };
    root.addEventListener("click", copy);
    return () => {
      root.removeEventListener("click", copy);
      timers.forEach(clearTimeout);
      buttons.forEach((button) => {
        button.disabled = true;
      });
    };
  }, []);
  return null;
}
