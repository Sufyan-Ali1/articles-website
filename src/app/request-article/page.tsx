import { Lightbulb, ShieldCheck } from "lucide-react";
import { TopicForm } from "@/components/shared/topic-form";
import { CuriosityArt } from "@/components/shared/curiosity-art";
import { metadata } from "@/lib/seo/metadata";
export const generateMetadata = () =>
  metadata(
    "Request an article",
    "Have a question worth exploring? Suggest a topic for a future Ask & Explore article.",
    "/request-article",
  );
export default function RequestArticle() {
  return (
    <div className="container request-layout">
      <div className="request-intro">
        <div className="eyebrow">
          <span className="blue-dot" />
          You ask. We explore.
        </div>
        <h1>
          A good question deserves <em>a closer look.</em>
        </h1>
        <p>
          An explanation you can’t find. A comparison worth making. Tell us what
          you’d like to understand.
        </p>
        <CuriosityArt compact />
        <div className="request-note">
          <h2>
            <Lightbulb size={16} />
            Make it your kind of useful.
          </h2>
          <p>
            Be as specific as you like. Tell us what you’re trying to do,
            understand, or decide. A little context helps us see the question
            through your eyes.
          </p>
        </div>
        <div className="request-note">
          <h2>
            <ShieldCheck size={16} />
            Shared privately, considered thoughtfully.
          </h2>
          <p>
            Your suggestion isn’t published automatically. Name and email are
            optional. Please leave out passwords, account details, and other
            sensitive information.
          </p>
        </div>
      </div>
      <TopicForm apiUrl={process.env.NEXT_PUBLIC_API_BASE_URL || ""} />
    </div>
  );
}
