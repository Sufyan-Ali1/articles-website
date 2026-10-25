"use client";

import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import { RefreshCw } from "lucide-react";
import styles from "./math-captcha.module.css";

type Question = { first: number; second: number };

export type MathCaptchaHandle = {
  validate: () => boolean;
  reset: () => void;
};

function newQuestion(previous?: Question | null): Question {
  const first = Math.floor(Math.random() * 9) + 1;
  let second = Math.floor(Math.random() * 9) + 1;
  if (previous?.first === first && previous.second === second)
    second = second === 9 ? 1 : second + 1;
  return { first, second };
}

export function MathCaptcha({
  ref,
  disabled = false,
  compact = false,
}: {
  ref?: Ref<MathCaptchaHandle>;
  disabled?: boolean;
  compact?: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Generate only in the browser so the server and initial client markup match.
    const frame = requestAnimationFrame(() => setQuestion(newQuestion()));
    return () => cancelAnimationFrame(frame);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      validate() {
        if (!question) {
          setError("Please wait for the addition question to load.");
          return false;
        }
        const value = answer.trim();
        if (
          !/^\d{1,2}$/.test(value) ||
          Number(value) !== question.first + question.second
        ) {
          setError(
            value
              ? "That answer isn’t correct. Please add the two numbers."
              : "Enter the sum of the two numbers.",
          );
          input.current?.focus();
          return false;
        }
        setError("");
        return true;
      },
      reset() {
        setQuestion(newQuestion(question));
        setAnswer("");
        setError("");
      },
    }),
    [answer, question],
  );

  return (
    <fieldset
      className={styles.captcha}
      data-compact={compact}
      data-math-captcha
      disabled={disabled || !question}
      aria-busy={!question}
      aria-label="Quick check"
    >
      <div className={styles.row}>
        <label htmlFor={id} className={styles.question}>
          {question
            ? `What is ${question.first} + ${question.second}?`
            : "Loading…"}
        </label>
        <input
          ref={input}
          id={id}
          className={styles.answer}
          type="number"
          inputMode="numeric"
          autoComplete="off"
          min={2}
          max={18}
          step={1}
          placeholder="Your answer"
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value.replace(/\D/g, "").slice(0, 2));
            setError("");
          }}
          aria-required={!disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
        />
        {!disabled && (
          <button
            type="button"
            className={styles.refresh}
            aria-label="Get a new addition question"
            title="New question"
            onClick={() => {
              setQuestion(newQuestion(question));
              setAnswer("");
              setError("");
              input.current?.focus();
            }}
          >
            <RefreshCw size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <p id={`${id}-hint`} className="sr-only">
        Enter the sum of the two numbers.
      </p>
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
