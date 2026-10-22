import { cn } from "@/lib/utils";
export function CuriosityArt({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "curiosity-art",
        compact && "curiosity-art-compact",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 520 400" fill="none">
        <path
          d="M-30 280C90 390 185 95 320 115S420 340 580 160"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          opacity=".35"
        />
        <circle cx="262" cy="200" r="145" stroke="currentColor" opacity=".16" />
        <circle cx="262" cy="200" r="105" stroke="currentColor" opacity=".16" />
        <path
          d="M262 98v204M174 149l176 102M174 251l176-102"
          stroke="currentColor"
          strokeWidth="25"
        />
        <circle cx="405" cy="110" r="23" fill="#E9A18B" />
        <circle cx="103" cy="298" r="8" fill="currentColor" />
        <path
          d="m420 300 11 11-11 11m-18-11h29"
          stroke="currentColor"
          strokeWidth="2"
        />
        <text
          x="49"
          y="80"
          fill="currentColor"
          fontSize="11"
          letterSpacing="3"
          fontFamily="sans-serif"
        >
          FOLLOW THE QUESTION
        </text>
        <text
          x="335"
          y="365"
          fill="currentColor"
          fontSize="11"
          letterSpacing="2"
          fontFamily="sans-serif"
        >
          FIND A NEW ANGLE ↗
        </text>
      </svg>
    </div>
  );
}
