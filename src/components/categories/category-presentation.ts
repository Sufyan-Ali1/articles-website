import {
  BookOpen,
  CarFront,
  Heart,
  HouseWifi,
  Laptop,
  Leaf,
  Plane,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

type Presentation = {
  icon: LucideIcon;
  tone: string;
  image: string;
  alt: string;
  description: string;
  priority: number;
};

export function categoryPresentation({
  name,
  slug,
}: {
  name: string;
  slug: string;
}): Presentation {
  const text = `${name} ${slug}`;
  if (/smart.?home|automation/i.test(text))
    return {
      icon: HouseWifi,
      tone: "violet",
      image: "workspace",
      alt: "A bright workspace with a laptop and connected everyday tools.",
      description:
        "Smart home setup, connected-device compatibility, and practical automation guides.",
      priority: 4,
    };
  if (/tech|electronic|software|digital|device/i.test(text))
    return {
      icon: Laptop,
      tone: "blue",
      image: "workspace",
      alt: "A laptop, coffee, and books in a sunlit workspace.",
      description:
        "Laptop and device comparisons, software tips, and practical guides for your everyday tech.",
      priority: /electronic/i.test(text) ? 6 : 0,
    };
  if (/auto|car|motor|driving/i.test(text))
    return {
      icon: CarFront,
      tone: "blue",
      image: "automotive",
      alt: "A silver SUV on a mountain road.",
      description:
        "Car buying guides, vehicle comparisons, and maintenance explainers for everyday ownership.",
      priority: 1,
    };
  if (/buying|shopping|product/i.test(text))
    return {
      icon: ShoppingCart,
      tone: "green",
      image: "buying-guides",
      alt: "A shopping cart and paper bags on a warm neutral surface.",
      description:
        "Product features, costs, and practical tradeoffs to consider before your next purchase.",
      priority: 2,
    };
  if (/travel|destination|adventure/i.test(text))
    return {
      icon: Plane,
      tone: "teal",
      image: "explore",
      alt: "A traveler overlooking a mountain lake at sunrise.",
      description:
        "Destination ideas, packing advice, and travel planning guides for your next trip.",
      priority: 5,
    };
  if (/health|wellness/i.test(text))
    return {
      icon: Heart,
      tone: "rose",
      image: "lifestyle",
      alt: "A calm, bright living room with natural materials and greenery.",
      description:
        "General explainers on wellbeing, routines, and a more manageable everyday life.",
      priority: 7,
    };
  if (/lifestyle|living|home/i.test(text))
    return {
      icon: Heart,
      tone: "rose",
      image: "lifestyle",
      alt: "A welcoming living room with a linen sofa and green plants.",
      description:
        "Home office ideas, daily routines, and practical ways to organize everyday life.",
      priority: 3,
    };
  if (/nature|environment|garden/i.test(text))
    return {
      icon: Leaf,
      tone: "green",
      image: "lifestyle",
      alt: "Natural materials and leafy plants in a sunlit home.",
      description:
        "Practical ideas for your home, garden, and a closer connection with the outdoors.",
      priority: 8,
    };
  return {
    icon: BookOpen,
    tone: "blue",
    image: "how-to",
    alt: "An open notebook with the words Learn, Plan, Do, Grow.",
    description: `Explore ${name} articles, clear explanations, and practical guides in one place.`,
    priority: 9,
  };
}

export function compareCategories(
  a: { name: string; slug: string },
  b: { name: string; slug: string },
) {
  return (
    categoryPresentation(a).priority - categoryPresentation(b).priority ||
    a.name.localeCompare(b.name, "en", { numeric: true })
  );
}
