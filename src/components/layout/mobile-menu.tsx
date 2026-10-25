"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, ArrowUpRight, ChevronDown } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Brand } from "@/components/shared/brand";
import styles from "./header.module.css";
export function MobileMenu({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mobile-menu">
      <Sheet
        title={<Brand />}
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
          <Link href="/">Home</Link>
          <Link href="/articles">Articles</Link>
          <details className={styles.mobileCategories}>
            <summary>
              Categories
              <ChevronDown size={17} aria-hidden="true" />
            </summary>
            <div>
              <Link href="/categories">Explore all categories</Link>
              {children}
            </div>
          </details>
          <Link href="/about">About</Link>
          <Link href="/search">Search</Link>
          <span className="menu-group-label">The publication</span>
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
