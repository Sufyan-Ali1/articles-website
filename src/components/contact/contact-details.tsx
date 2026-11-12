import Image from "next/image";
import { ArrowUpRight, Clock3, Mail, UsersRound } from "lucide-react";
import styles from "./contact.module.css";

export function ContactDetails() {
  return (
    <aside
      id="contact-options"
      className={styles.details}
      aria-labelledby="contact-details-title"
    >
      <div className={styles.detailsContent}>
        <h2 id="contact-details-title">How to Contact Ask &amp; Explore</h2>
        <p className={styles.sectionDescription}>
          Use the form for general questions, article feedback, privacy
          enquiries, or collaboration proposals. If your message concerns an
          article, include its link and the specific detail you want us to
          review.
        </p>
        <div id="general-enquiries" className={styles.contactMethod}>
          <span className={styles.methodIcon} aria-hidden="true">
            <Mail size={28} strokeWidth={1.7} />
          </span>
          <div>
            <h3>General Enquiries</h3>
            <p>
              For questions about Ask &amp; Explore, feedback on our articles,
              or other general enquiries.
            </p>
            <a href="#contact-message-form">
              Go to message form
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div id="after-submission" className={styles.contactMethod}>
          <span className={styles.methodIcon} aria-hidden="true">
            <Clock3 size={28} strokeWidth={1.7} />
          </span>
          <div>
            <h3>After You Send</h3>
            <p>
              After submitting, look for an on-screen confirmation. We may use
              your email address to follow up if needed, but a response
              isn&apos;t guaranteed.
            </p>
          </div>
        </div>
        <div id="collaboration" className={styles.contactMethod}>
          <span className={styles.methodIcon} aria-hidden="true">
            <UsersRound size={28} strokeWidth={1.7} />
          </span>
          <div>
            <h3>Collaboration &amp; Press</h3>
            <p>
              Have a collaboration or press proposal? Choose “General question”
              in the form and include a short outline, the intended audience,
              and why your idea is relevant to Ask &amp; Explore readers.
            </p>
            <a href="#contact-message-form">
              Go to message form
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      <div className={styles.detailsImage}>
        <Image
          src="/images/contact/plant-books.webp"
          alt="A leafy plant beside a stack of books about technology, automotive, lifestyle, and buying guides."
          width={1920}
          height={1080}
          sizes="(max-width: 760px) 100vw, 45vw"
        />
      </div>
    </aside>
  );
}
