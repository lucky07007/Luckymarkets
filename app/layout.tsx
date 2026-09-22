import "./globals.css";
import type { Metadata, Viewport } from "next";
import { DisclaimerFooter } from "@/components/Disclaimer";

const siteUrl = "https://luckymarkets.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Luckymarkets — IPO, Mutual Fund & Stock Data",
    template: "%s | Luckymarkets",
  },
  description:
    "Clear, data-first IPO, mutual fund and stock reference data for financial education. No buy or sell recommendations.",
  applicationName: "Luckymarkets",
  openGraph: {
    type: "website",
    siteName: "Luckymarkets",
    title: "Luckymarkets — IPO, Mutual Fund & Stock Data",
    description:
      "Clear, data-first market reference data for financial education.",
    url: siteUrl,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Luckymarkets financial education" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luckymarkets — Market Data, Explained",
    description: "Educational IPO, mutual fund and stock reference data.",
    images: ["/og.png"],
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <nav className="container nav" aria-label="Primary navigation">
            <a href="/" className="brand-mark" aria-label="Luckymarkets home">Lucky<span className="dot">•</span>Markets</a>
            <div className="nav-links">
              <a href="/ipo/bajaj-housing-finance">IPOs</a>
              <a href="/mutual-fund/parag-parikh-flexi-cap">Mutual Funds</a>
              <a href="/stocks/tcs">Stocks</a>
              <a href="/blog">Blog</a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer><DisclaimerFooter /></footer>
      </body>
    </html>
  );
}
