import { FormsApiProvider } from "@/components/shared/forms-api-provider";
import { Suspense } from "react";
import { TrafficTracker } from "@/components/analytics/traffic-tracker";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { site, isIndexable, formsApiUrl } from "@/lib/config";
import "./globals.css";
const newsreader = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2",
      style: "normal",
      weight: "200 800",
    },
    {
      path: "../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2",
      style: "italic",
      weight: "200 800",
    },
  ],
  variable: "--font-editorial",
  display: "swap",
  fallback: ["Georgia"],
});
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Practical Guides & Clear Answers`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  robots: { index: isIndexable, follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable} ${newsreader.variable}`}
    >
      <body>
        <FormsApiProvider apiUrl={formsApiUrl}>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <Suspense fallback={null}>
            <TrafficTracker />
          </Suspense>
          <Header />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </FormsApiProvider>
      </body>
    </html>
  );
}
