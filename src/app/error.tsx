"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container error-panel">
      <div className="eyebrow" style={{ justifyContent: "center" }}>
        A brief interruption
      </div>
      <h1>Let’s pick up where we left off.</h1>
      <p>This page couldn’t load right now. Give it another try.</p>
      <Button onClick={reset}>Try again</Button>
      <Link href="/articles" className="text-link">
        Return to the publication
        <ArrowUpRight size={17} />
      </Link>
    </div>
  );
}
