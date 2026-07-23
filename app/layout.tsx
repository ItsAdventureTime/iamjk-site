import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://iamjk.site"),
  title: {
    default: "JK de Guzman | Personal archive",
    template: "%s | JK de Guzman",
  },
  description:
    "The personal site of Juan Karlo “JK” de Guzman: faith, language, curiosity, craft, and the life between the tabs.",
  alternates: { canonical: "https://iamjk.site" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "https://iamjk.site",
    title: "JK de Guzman | Personal archive",
    description:
      "Faith, language, curiosity, craft, and the life between the tabs.",
    siteName: "iamjk.site",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "JK de Guzman, a personal corner of the internet" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JK de Guzman | Personal archive",
    description:
      "Faith, language, curiosity, craft, and the life between the tabs.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#17191b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
