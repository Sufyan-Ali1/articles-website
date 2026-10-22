"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, ArrowUpRight } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
export function MobileMenu({
  categories = [],
  children,
}: {
  categories?: { name: string; slug: string }[];
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mobile-menu">
      <Sheet
        title="Ask & Explore"
        open={open}
        onOpenChange={setOpen}
        trigger={
          <button className="icon-button" aria-label="Open navigation">
            <Menu size={22} />
          </button>
        }
      >
        <nav
          aria-label="Mobile navigation"
          className="mobile-links"
          onClick={(event) => {
            if ((event.target as Element).closest("a")) setOpen(false);
          }}
        >
          <span className="menu-group-label">Read & discover</span>
          <Link href="/articles">All articles</Link>
          <Link href="/categories">Explore categories</Link>
          {categories.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`}>
              {category.name}
            </Link>
          ))}
          {children}
          <Link href="/search">Search</Link>
          <span className="menu-group-label">The publication</span>
          <Link href="/about">About us</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/disclaimer">Editorial disclosures</Link>
          <span className="menu-group-label">Have a question?</span>
          <Link href="/request-article" className="text-blue">
            Request a topic <ArrowUpRight size={20} />
          </Link>
        </nav>
      </Sheet>
    </div>
  );
}
