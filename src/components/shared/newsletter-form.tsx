import { ArrowRight } from "lucide-react";

// Design only until a subscription provider is configured.
export function NewsletterForm({
  compact = false,
  label = "Newsletter signup",
}: {
  compact?: boolean;
  label?: string;
}) {
  return (
    <div>
      <form className="publication-newsletter-form" aria-label={label}>
        <div className="publication-newsletter-fields">
          <input
            type="email"
            name="email"
            aria-label="Your email address"
            placeholder="Your email address"
            disabled
          />
          <button type="submit" disabled aria-label="Subscribe to newsletter">
            {compact ? (
              <ArrowRight size={18} />
            ) : (
              <>
                Subscribe <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </form>
      <p className="publication-newsletter-note">
        Coming soon. This form is not accepting subscriptions yet.
      </p>
    </div>
  );
}
