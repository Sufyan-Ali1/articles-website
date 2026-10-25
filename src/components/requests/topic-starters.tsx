"use client";

import { ArrowUpRight } from "lucide-react";
import styles from "./request.module.css";

const prompts = [
  { label: "Explain something", text: "How does " },
  { label: "Compare options", text: "What’s the difference between " },
  { label: "Help me choose", text: "How do I choose " },
];

function currentStarter(value: string) {
  const text = value.trimStart();
  return prompts.find(
    (prompt) =>
      text.startsWith(prompt.text) || text.trimEnd() === prompt.text.trimEnd(),
  );
}

export function replaceTopicStarter(value: string, prefix: string) {
  if (!value.trim()) return prefix;
  const previous = currentStarter(value);
  if (!previous) return value;
  return prefix + value.trimStart().slice(previous.text.length).trimStart();
}

export function TopicStarters({
  onChoose,
  value = "",
}: {
  onChoose: (text: string) => void;
  value?: string;
}) {
  return (
    <div className={styles.starters} role="group" aria-label="Idea starters">
      {prompts.map((prompt) => (
        <button
          key={prompt.label}
          type="button"
          onClick={() => onChoose(prompt.text)}
          aria-pressed={currentStarter(value)?.text === prompt.text}
        >
          {prompt.label}
          <ArrowUpRight size={12} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
