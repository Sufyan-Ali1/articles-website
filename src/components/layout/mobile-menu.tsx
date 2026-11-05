"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, ArrowUpRight, ChevronDown } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Brand } from "@/components/shared/brand";
import styles from "./header.module.css";
export function MobileMenu({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
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
          <div className={styles.mobileCategories}>
            <div className={styles.mobileCategoryHeading}>
              <Link href="/categories">Categories</Link>
              <button
                type="button"
                aria-label="Toggle category dropdown"
                aria-expanded={categoriesOpen}
                aria-controls="mobile-categories-panel"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
              >
                <ChevronDown size={17} aria-hidden="true" />
              </button>
            </div>
            {categoriesOpen && (
              <div
                id="mobile-categories-panel"
                className={styles.mobileCategoryPanel}
              >
                {children}
              </div>
            )}
          </div>
          <Link href="/about">About</Link>
          <Link href="/search">Search</Link>
          <span className="menu-group-label">The publication</span>
          <Link href="/contact">Contact</Link>
          <Link href="/disclaimer">Editorial disclosures</Link>
          <span className="menu-group-label">Have a question?</span>
          <Link href="/request-article" className="text-blue">
            Request a Topic <ArrowUpRight size={20} />
          </Link>
        </nav>
      </Sheet>
    </div>
  );
}
