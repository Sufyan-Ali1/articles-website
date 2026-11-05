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
    "We aim to consult relevant sources, including official documentation, research publications, and reports where appropriate. We consider what the information supports, what remains uncertain, and whether important details may have changed.",
  ],
  [
    PenLine,
    "Writing",
    "Our approach is to answer the main question clearly, explain unfamiliar terms, and present relevant options and tradeoffs. We want readers to understand both the useful information and its limitations.",
  ],
  [
    ShieldCheck,
    "Fact-checking",
    "Our editorial standards emphasize checking important factual claims against relevant sources. We aim to distinguish confirmed information from estimates, opinions, and claims that require additional verification.",
  ],
  [
    RefreshCw,
    "Updates",
    "Technology, prices, product availability, travel information, and official guidance can change. Publication and update dates provide useful context, but they do not guarantee that every detail remains current.",
  ],
] as const;
const principles = [
  [
    CircleCheck,
    "Evidence in Context",
    "Sources, methods, and supporting details can help you judge whether an article's conclusions apply to your situation. We encourage readers to examine those details.",
  ],
  [
    ShieldCheck,
    "Transparent Recommendations",
    "Product comparisons should explain relevant features and tradeoffs. A review label does not automatically mean hands-on testing, and applicable commercial relationships should be disclosed.",
  ],
  [
    Users,
    "Reader-Focused Explanations",
    "We focus on making complex information easier to follow, including the differences between available options and the factors that may affect a decision.",
  ],
  [
    RefreshCw,
    "Changing Information",
    "Prices, specifications, software features, and official policies can change. Check the article date and verify important time-sensitive details with the original provider.",
  ],
] as const;
const sources = [
  [
    Landmark,
    "Official Websites",
    "Government agencies, regulators, official support centers, and public guidance can provide authoritative information about rules, services, and procedures.",
  ],
  [
    FileText,
    "Industry Reports",
    "Industry studies and published reports can help explain market trends, comparisons, and costs. Their methods, assumptions, and potential interests should be considered.",
  ],
  [
    GraduationCap,
    "Research Publications",
    "Academic papers and other research publications can provide evidence about particular questions. Individual findings should be understood within their study limitations.",
  ],
  [
    Newspaper,
    "Reputable Reporting",
    "Established news and specialist publications can offer useful reporting, context, and perspectives, especially when they identify their underlying sources.",
  ],
  [
    Database,
    "Product Documentation",
    "Manufacturer specifications, product manuals, and official support materials help explain features, compatibility, and intended operation. Manufacturer claims should not automatically be treated as independently verified results.",
  ],
] as const;
export function EditorialProfile({
  topics,
  exploreTopics,
  articles,
}: {
  topics: ReactNode;
  exploreTopics: ReactNode;
  articles: ReactNode;
}) {
  const profileSchema = editorialProfileSchema();
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
            <p>
              <em>
                Shared author profile for practical guides, clear explanations,
                and everyday decisions.
              </em>
            </p>
            <ul className={styles.badges}>
              {[
                "Evidence & context",
                "Practical guidance",
                "Editorial transparency",
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
              The Ask &amp; Explore Editorial Team is the shared author identity
              used for articles published under this name on Ask &amp; Explore.
              Our content focuses on useful explanations, practical guidance,
              and the information readers need to better understand everyday
              questions and decisions.
            </p>
            <p>
              From technology guides and automotive comparisons to digital
              safety tips, buying guides, lifestyle advice, and travel planning,
              our goal is to make complicated information easier to understand.
            </p>
            <p>
              This profile explains the principles behind our publishing
              approach and brings together articles attributed to the Ask &amp;
              Explore Editorial Team. The shared byline does not mean that
              multiple writers contributed to every article.
            </p>
            <p>
              Learn more <Link href="/about">about Ask &amp; Explore</Link>.
            </p>
            <p>
              Ask &amp; Explore is operated by <strong>Sufyan Ali</strong>, who
              manages the website and its editorial direction. For questions,
              feedback, or corrections, please visit our{" "}
              <Link href="/contact">Contact page</Link>.
            </p>
          </div>
          <Art name="about" />
        </section>
        <section aria-labelledby="expertise">
          <Heading id="expertise" title="Topics We Cover">
            Explore practical information about the technology, products,
            decisions, and everyday experiences that matter to you.
          </Heading>
          {topics}
        </section>
        <section aria-labelledby="process">
          <Heading id="process" title="Our Editorial Process">
            Our editorial approach is built around understanding readers&apos;
            questions, considering relevant evidence, and explaining information
            clearly. These are principles we aim to apply, rather than a claim
            that every article receives independent testing or external expert
            review.
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
            We believe useful information should be understandable, supported by
            relevant evidence, and clear about its limitations.
          </Heading>
          <div className={styles.threeCards}>
            {[
              [
                BookOpen,
                "Reliable Information",
                "We aim to prioritize credible sources, explain important details in context, and avoid presenting uncertain claims as established facts.",
              ],
              [
                Layers,
                "Reader-First Approach",
                "Our content focuses on answering practical questions in straightforward language. We aim to explain what matters, where the tradeoffs lie, and what readers may need to check before making a decision.",
              ],
              [
                Leaf,
                "Room for Improvement",
                "Information can become outdated, and errors can happen. Reader questions and correction reports help bring important details to our attention for review.",
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
              Have a question about an article, noticed outdated information, or
              want to suggest a correction?
            </p>
            <p>
              Use our Contact page and include the article URL, the specific
              information you want us to review, and a supporting source where
              possible.
            </p>
          </div>
          <Link className={styles.button} href="/contact">
            Contact Us <ArrowRight size={17} aria-hidden="true" />
          </Link>
          {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
        </section>
        <section className={styles.trust} aria-labelledby="trust">
          <Heading id="trust" title="Why Readers Can Trust Us">
            We want readers to understand the evidence and limitations behind an
            article, rather than rely on a recommendation simply because it
            appears on our website.
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
              The following principles guide the approach we aim to take when
              preparing practical guides, explanations, comparisons, and other
              informational content.
            </Heading>
            <ul className={styles.checklist}>
              {[
                "Accuracy: Present factual information carefully and acknowledge uncertainty.",
                "Clarity: Explain complicated subjects in accessible language.",
                "Context: Include relevant limitations, conditions, and tradeoffs.",
                "Evidence: Use appropriate sources and distinguish evidence from unsupported claims.",
                "Transparency: Make relevant commercial relationships and review limitations clear.",
                "Usefulness: Focus on the questions readers are trying to answer.",
              ].map((text) => (
                <li key={text}>
                  <Check size={21} aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
            <p>
              For more information, read our{" "}
              <Link href="/disclaimer">
                Editorial &amp; Affiliate Disclosures
              </Link>
              .
            </p>
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
              Different questions require different kinds of evidence. A
              technology guide may benefit from official product documentation,
              while an automotive cost comparison may depend on published
              studies, current prices, and clearly stated assumptions.
            </Heading>
            <p>
              We aim to use sources appropriate to each subject and make
              important limitations understandable. When information depends on
              a specific date, location, product version, or set of assumptions,
              that context matters.
            </p>
            <p>
              We do not promise a fixed update schedule. Readers should check
              publication and update dates and confirm important changing
              details with the relevant original source.
            </p>
            <ul className={styles.researchPoints}>
              <li>
                <Search aria-hidden="true" />
                <div>
                  <h3>Seek Relevant Sources</h3>
                  <p>
                    Look for information that directly addresses the subject and
                    helps clarify the main question.
                  </p>
                </div>
              </li>
              <li>
                <BookOpen aria-hidden="true" />
                <div>
                  <h3>Explain the Context</h3>
                  <p>
                    Consider the assumptions, evidence, limitations, and
                    circumstances behind important claims.
                  </p>
                </div>
              </li>
              <li>
                <RefreshCw aria-hidden="true" />
                <div>
                  <h3>Flag Changing Details</h3>
                  <p>
                    Make readers aware when prices, availability, software
                    features, or other information may change.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>
        <section aria-labelledby="sources">
          <Heading id="sources" title="Sources We Use">
            Our editorial principles favor relevant, credible information. The
            most appropriate sources depend on the subject and the evidence
            needed.
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
              {(
                [
                  [
                    "Who writes the articles on Ask & Explore?",
                    "Articles published under the Ask & Explore Editorial Team byline use our shared author identity. This does not necessarily mean multiple people worked on an individual article. The author profile provides information about the publishing approach associated with that byline.",
                  ],
                  [
                    "How does Ask & Explore approach content accuracy?",
                    "Our editorial principles emphasize relevant evidence, careful treatment of factual claims, and clear explanations of uncertainty. The methods and sources available may differ by article. Readers can examine the information provided and report details that may need review.",
                  ],
                  [
                    "How often are articles updated?",
                    "There is no fixed update schedule. Publication and update dates help readers understand when an article was prepared or revised, but important details such as prices, product features, and official guidance should be checked with the original source.",
                  ],
                  [
                    "How can I report an error or suggest a correction?",
                    <>
                      Visit our <Link href="/contact">Contact page</Link>,
                      select the correction option, and provide the article URL,
                      the specific issue, and supporting information where
                      possible.
                    </>,
                  ],
                ] as const
              ).map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
            <aside className={styles.callout}>
              <ShieldCheck size={48} aria-hidden="true" />
              <h3>Explore with Context</h3>
              <p>
                Useful information should help you ask better questions,
                understand important differences, and make decisions based on
                your own needs.
              </p>
              <Link href="/contact">
                Suggest a Correction <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </aside>
          </div>
        </section>
        <section aria-labelledby="latest">
          <div className={styles.latestHeading}>
            <Heading id="latest" title="Latest Articles by the Editorial Team">
              Browse the latest articles attributed to the Ask &amp; Explore
              Editorial Team, including technology explanations, automotive
              comparisons, digital safety guides, lifestyle advice, and travel
              information.
            </Heading>
            <Link href="/articles">
              View All Articles <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          {articles}
        </section>
        <section aria-labelledby="explore">
          <div className={styles.explore}>
            <div>
              <h2 id="explore">Explore More from Ask & Explore</h2>
              <p>
                Find practical how-to guides, product comparisons, and clear
                explanations across our main topics. Choose a category to
                explore articles relevant to your next question or decision.
              </p>
            </div>
            <Link className={styles.button} href="/articles">
              Browse All Articles <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          {exploreTopics}
        </section>
        {profileSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: safeJsonLd(profileSchema),
            }}
          />
        )}
      </div>
    </div>
  );
}
