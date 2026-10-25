import type { ReactNode } from "react";
import type { PolicyIconName } from "./policy-icons";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
  icon?: PolicyIconName;
  tone?: string;
};

export type LegalPageConfig = {
  id: string;
  eyebrow: string;
  title: string;
  heroTitle?: ReactNode;
  headingStyle?: "serif" | "sans";
  description: string;
  image: { src: string; alt: string };
  sections: LegalSection[];
  note: {
    icon?: PolicyIconName;
    title: string;
    description: string;
    updatedAt?: string;
    link?: { href: string; label: string };
  };
};
