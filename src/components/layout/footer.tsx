import { Suspense } from "react";
import { connection } from "next/server";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getClassifications } from "@/lib/api/client";
import { site } from "@/lib/config";
import { Logo } from "./header";
async function FooterCategories() {
  await connection();
  const categories = await getClassifications("categories")
    .then((items) => items.filter((c) => c.is_active).slice(0, 5))
    .catch(() => []);
  return (
    <>
      {categories.map((category) => (
        <Link key={category.id} href={`/category/${category.slug}`}>
          {category.name}
        </Link>
      ))}
    </>
  );
}
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getUTCFullYear();
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p>
              A little curiosity goes a long way.
              <br />
              Find your next perspective here.
            </p>
            <Link href="/request-article" className="text-link">
              What are you curious about? <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="footer-column">
            <h2>Explore</h2>
            <Link href="/articles">All articles</Link>
            <Link href="/categories">Categories</Link>
            <Suspense>
              <FooterCategories />
            </Suspense>
          </div>
          <div className="footer-column">
            <h2>The publication</h2>
            <Link href="/about">About us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/request-article">Request an article</Link>
            <Link href="/search">Search</Link>
          </div>
          <div className="footer-note">
            <span className="eyebrow">Stay curious</span>
            <p>
              Good questions
              <br />
              <em>open new doors.</em>
            </p>
            <span className="footer-asterisk" aria-hidden="true">
              ✳
            </span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            ©{" "}
            <Suspense>
              <CopyrightYear />
            </Suspense>{" "}
            {site.name}
          </span>
          <div>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/disclaimer">Disclosures</Link>
          </div>
          <span>Made for curious minds.</span>
        </div>
      </div>
    </footer>
  );
}
