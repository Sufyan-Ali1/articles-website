import Image from "next/image";
import { ArrowUpRight, Clock3, Mail, UsersRound } from "lucide-react";
import styles from "./contact.module.css";

export function ContactDetails({ email }: { email: string }) {
  return (
    <aside className={styles.details} aria-labelledby="contact-details-title">
      <div className={styles.detailsContent}>
        <h2 id="contact-details-title">Find the Right Way to Get in Touch</h2>
        <p className={styles.sectionDescription}>
          Choose the contact option that fits your message. For an article
          correction, include the page link and the detail you want us to check.
        </p>
        <div className={styles.contactMethod}>
          <span className={styles.methodIcon} aria-hidden="true">
            <Mail size={28} strokeWidth={1.7} />
          </span>
          <div>
            <h3>{email ? "Email" : "General Enquiries"}</h3>
            <p>
              For questions about the site, feedback on an article, or a general
              enquiry.
            </p>
            <a href={email ? `mailto:${email}` : "#contact-message-form"}>
              {email || "Use the message form"}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className={styles.contactMethod}>
          <span className={styles.methodIcon} aria-hidden="true">
            <Clock3 size={28} strokeWidth={1.7} />
          </span>
          <div>
            <h3>After You Send</h3>
            <p>
              An on-screen confirmation lets you know when your message is
              accepted. We may use the email you provide to follow up; a reply
              is not guaranteed.
            </p>
          </div>
        </div>
        <div className={styles.contactMethod}>
          <span className={styles.methodIcon} aria-hidden="true">
            <UsersRound size={28} strokeWidth={1.7} />
          </span>
          <div>
            <h3>Collaboration &amp; Press</h3>
            <p>
              Share your proposal, who it is for, and how it relates to our
              readers. Include a useful link or a short outline.
            </p>
            <a href="#contact-name">
              Start a conversation
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
