import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://iamjk.site"),
  title: {
    default: "JK de Guzman | A personal field guide",
    template: "%s | JK de Guzman",
  },
  description:
    "A personal field guide to JK de Guzman: a systems-minded learner, English teacher, Christian, and curious human in Marikina, Philippines.",
  alternates: { canonical: "https://iamjk.site" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "https://iamjk.site",
    title: "JK de Guzman | A personal field guide",
    description:
      "Faith, language, technology, books, and the questions JK keeps coming back to.",
    siteName: "iamjk.site",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "JK de Guzman, personal website" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JK de Guzman | A personal field guide",
    description:
      "Faith, language, technology, books, and the questions JK keeps coming back to.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US">
      <body><a className="skip-link" href="#main-content">Skip to content</a>{children}</body>
    </html>
  );
}
