import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Laptop,
  CarFront,
  ShoppingCart,
  Leaf,
  ShieldCheck,
  Plane,
  Search,
  PenLine,
  RefreshCw,
  Check,
  BookOpen,
  Users,
  Layers,
  FileText,
  Landmark,
  GraduationCap,
  Newspaper,
  Database,
  Mail,
  ArrowRight,
  CircleCheck,
  type LucideIcon,
} from "lucide-react";
import { Breadcrumbs } from "@/components/shared/states";
import { editorialTeam } from "@/lib/content/editorial-team";
import { editorialProfileSchema } from "@/lib/seo/editorial-team";
import { safeJsonLd } from "@/lib/seo/metadata";
import { site } from "@/lib/config";
import styles from "@/app/authors/editorial-team/profile.module.css";

const topicIcons = [Laptop, CarFront, ShoppingCart, Leaf, ShieldCheck, Plane];
export function TopicIcon({ index }: { index: number }) {
  const Icon = topicIcons[index] || BookOpen;
  return <Icon size={30} strokeWidth={1.7} aria-hidden="true" />;
}
function Art({ name, hero = false }: { name: string; hero?: boolean }) {
  return (
    <Image
      className={styles.art}
      src={`/images/authors/editorial-team/${name}.webp`}
      alt=""
      width={900}
      height={600}
      sizes="(max-width: 700px) 85vw, 35vw"
      preload={hero}
    />
  );
}
function IconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className={styles.icon}>
      <Icon size={28} strokeWidth={1.7} aria-hidden="true" />
    </span>
  );
}
function Heading({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.heading}>
      <h2 id={id}>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}
const process = [
  [
    Search,
    "Research",
    "We aim to use credible sources, distinguish evidence from vendor claims, and explain the limits of the information available.",
  ],
  [
    PenLine,
    "Writing",
    "Our aim is to turn research into clear, useful explanations that start with your question and describe practical tradeoffs.",
  ],
  [
    ShieldCheck,
    "Fact-checking",
    "Our standards emphasize checking important details against relevant sources and acknowledging uncertainty.",
  ],
  [
    RefreshCw,
    "Updates",
    "Details can change. Article dates provide context; check current prices, specifications, and terms with the original provider.",
  ],
] as const;
const principles = [
  [
    CircleCheck,
    "Evidence in context",
    "Look for an article’s sources, methods, and limitations when assessing its conclusions.",
  ],
  [
    ShieldCheck,
    "Transparent recommendations",
    "A review label alone does not mean hands-on testing. Commercial relationships should be disclosed.",
  ],
  [
    Users,
    "Reader-focused",
    "We value useful explanations written around real questions and everyday decisions.",
  ],
  [
    RefreshCw,
    "Changing information",
    "Publication and update dates help readers understand when information was prepared.",
  ],
] as const;
const sources = [
  [
    Landmark,
    "Official websites",
    "Government agencies, regulators, and official guidance.",
  ],
  [
    FileText,
    "Industry reports",
    "Reports and whitepapers, read with their methods and interests in mind.",
  ],
  [
    GraduationCap,
    "Research publications",
    "Academic work and research relevant to the question.",
  ],
  [
    Newspaper,
    "Reputable reporting",
    "Reporting that identifies evidence and provides useful context.",
  ],
  [
    Database,
    "Product documentation",
    "Manufacturer specifications and support documentation, where relevant.",
  ],
] as const;
export function EditorialProfile({
  topics,
  articles,
}: {
  topics: ReactNode;
  articles: ReactNode;
}) {
  return (
    <div className={styles.page} data-editorial-profile>
      <div className={styles.shell}>
        <Breadcrumbs homeIcon items={[{ label: "Editorial Team" }]} />
        <header className={styles.hero}>
          <div className={styles.logoTile}>
            <Image
              src={editorialTeam.logo}
              width={160}
              height={86}
              alt="Ask & Explore logo — Editorial Team"
              unoptimized
            />
            <strong>Ask & Explore</strong>
          </div>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <Users size={16} aria-hidden="true" /> Author
            </span>
            <h1>{editorialTeam.name}</h1>
            <p>{editorialTeam.role}</p>
            <ul className={styles.badges}>
              {[
                "Evidence & context",
                "Clear explanations",
                "Accuracy & transparency",
              ].map((text) => (
                <li key={text}>
                  <CircleCheck size={17} aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <Art name="hero" hero />
        </header>
        <section className={styles.split} aria-labelledby="about-team">
          <div>
            <Heading id="about-team" title="About the Editorial Team" />
            <p>
              The Ask & Explore Editorial Team is the shared editorial identity
              for articles attributed to the team on this website. Our focus is
              clear explanations, useful guidance, and practical context for
              everyday decisions.
            </p>
            <p>
              This profile brings those articles together and explains the
              principles behind our approach. Learn more{" "}
              <Link href="/about">about Ask & Explore</Link>.
            </p>
          </div>
          <Art name="about" />
        </section>
        <section aria-labelledby="expertise">
          <Heading id="expertise" title="Our Expertise & Topics We Cover">
            Explore the subjects behind the things you buy, use, and do every
            day.
          </Heading>
          {topics}
        </section>
        <section aria-labelledby="process">
          <Heading id="process" title="Our Editorial Process">
            These steps describe the editorial approach we aim to follow, rather
            than a claim of independent review or hands-on testing for every
            article.
          </Heading>
          <ol className={styles.process}>
            {process.map(([Icon, title, text], i) => (
              <li key={title}>
                <IconBadge icon={Icon} />
                {i < process.length - 1 && (
                  <ArrowRight
                    className={styles.processArrow}
                    size={24}
                    aria-hidden="true"
                  />
                )}
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="accuracy">
          <Heading
            id="accuracy"
            title="Our Commitment to Accuracy and Transparency"
          >
            Useful information starts with clear standards and openness about
            what the evidence can tell us.
          </Heading>
          <div className={styles.threeCards}>
            {[
              [
                BookOpen,
                "Reliable information",
                "Our aim is to use credible sources and make important limitations clear.",
              ],
              [
                Layers,
                "Reader-first approach",
                "We value clear language, practical context, and explanations that are easy to follow.",
              ],
              [
                Leaf,
                "Room for improvement",
                "Questions and correction reports help identify details that need attention.",
              ],
            ].map(([Icon, title, text]) => {
              const I = Icon as LucideIcon;
              return (
                <article className={styles.card} key={String(title)}>
                  <IconBadge icon={I} />
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                </article>
              );
            })}
          </div>
        </section>
        <section className={styles.contact} aria-label="Contact Information">
          <Mail size={28} aria-hidden="true" />
          <div>
            <h2>Contact the Editorial Team</h2>
            <p>
              Have a question, suggestion, or correction? Include the article
              URL and supporting details.
            </p>
          </div>
          <Link className={styles.button} href="/contact">
            Contact us <ArrowRight size={17} aria-hidden="true" />
          </Link>
          {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
        </section>
        <section className={styles.trust} aria-labelledby="trust">
          <Heading id="trust" title="Why Readers Can Trust Us">
            Our commitment is to useful explanations, clear evidence, and
            transparency.
          </Heading>
          <div className={styles.fourCards}>
            {principles.map(([Icon, title, text]) => (
              <article key={title}>
                <IconBadge icon={Icon} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.split} aria-labelledby="standards">
          <div>
            <Heading id="standards" title="Our Editorial Standards">
              The principles we aim to apply across our topics.
            </Heading>
            <ul className={styles.checklist}>
              {[
                "Accuracy and factual correctness",
                "Clear, practical language",
                "Evidence and limitations in context",
                "Relevant sources and citations",
                "Transparent commercial disclosures",
                "A focus on real reader questions",
              ].map((text) => (
                <li key={text}>
                  <Check size={21} aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
            <Link href="/disclaimer">
              Read our editorial and affiliate disclosures{" "}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <Art name="standards" />
        </section>
        <section
          className={`${styles.split} ${styles.research}`}
          aria-labelledby="research"
        >
          <Art name="updates" />
          <div>
            <Heading id="research" title="How We Research and Update Content">
              We aim to ground research-backed articles in relevant sources and
              communicate what is known, what is uncertain, and what may change.
            </Heading>
            <p>
              There is no guaranteed update schedule. Check an article’s
              publication and update dates, and confirm time-sensitive details
              with the original source.
            </p>
            <ul className={styles.researchPoints}>
              <li>
                <Search aria-hidden="true" />
                Seek relevant sources
              </li>
              <li>
                <BookOpen aria-hidden="true" />
                Explain the context
              </li>
              <li>
                <RefreshCw aria-hidden="true" />
                Flag changing details
              </li>
            </ul>
          </div>
        </section>
        <section aria-labelledby="sources">
          <Heading id="sources" title="Sources We Use">
            Our standards favor credible, relevant evidence. The sources
            appropriate to an article depend on its subject.
          </Heading>
          <div className={styles.sources}>
            {sources.map(([Icon, title, text]) => (
              <article className={styles.card} key={title}>
                <IconBadge icon={Icon} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section aria-labelledby="faq">
          <Heading id="faq" title="Quick Trust FAQ" />
          <div className={styles.faqLayout}>
            <div className={styles.faq}>
              {[
                [
                  "Who writes the articles on Ask & Explore?",
                  "Articles show their attributed author in the byline. This profile lists only articles explicitly attributed to the Ask & Explore Editorial Team; individual bylines remain separate.",
                ],
                [
                  "How do you approach accuracy?",
                  "Our published principles emphasize credible sources, checking important details, and explaining limitations. Read each article’s evidence and methods, and contact us if something appears inaccurate.",
                ],
                [
                  "How often do you update your content?",
                  "There is no fixed update schedule. Dates provide context, but do not guarantee every detail is current. Verify changing details such as prices and specifications with the original provider.",
                ],
                [
                  "How can I report an error in an article?",
                  "Use our Contact page to suggest a correction. Include the article URL, explain which detail appears inaccurate, and share a supporting source where possible so the issue can be assessed.",
                ],
              ].map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
            <aside className={styles.callout}>
              <ShieldCheck size={48} aria-hidden="true" />
              <h3>Explore with context.</h3>
              <p>
                Understand the evidence, consider the tradeoffs, and ask the
                questions that matter to your decision.
              </p>
              <Link href="/contact?reason=correction">
                Suggest a correction <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </aside>
          </div>
        </section>
        <section aria-labelledby="latest">
          <div className={styles.latestHeading}>
            <Heading
              id="latest"
              title="Latest Articles by the Editorial Team"
            />
            <Link href="/articles">
              View all articles <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          {articles}
        </section>
        <section className={styles.explore} aria-labelledby="explore">
          <div>
            <h2 id="explore">Explore More from Ask & Explore</h2>
            <p>
              Discover practical guides and clear explanations for your next
              everyday decision.
            </p>
          </div>
          <Link className={styles.button} href="/articles">
            Browse all articles <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
        {editorialProfileSchema() && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: safeJsonLd(editorialProfileSchema()),
            }}
          />
        )}
      </div>
    </div>
  );
}
