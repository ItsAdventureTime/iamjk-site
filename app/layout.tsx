import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://iamjk.site"),
  title: {
    default: "JK de Guzman | Systems, infrastructure, and clear thinking",
    template: "%s | JK de Guzman",
  },
  description:
    "The personal site of Juan Karlo de Guzman, an AI infrastructure engineer, educator, and founder-operator based in the Philippines.",
  alternates: { canonical: "https://iamjk.site" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "https://iamjk.site",
    title: "JK de Guzman | Systems, infrastructure, and clear thinking",
    description:
      "AI infrastructure, education, and practical systems thinking from Marikina City, Philippines.",
    siteName: "iamjk.site",
    images: [{ url: "/og.png", width: 1792, height: 944, alt: "JK de Guzman, systems, infrastructure, clear thinking" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JK de Guzman | Systems, infrastructure, and clear thinking",
    description:
      "AI infrastructure, education, and practical systems thinking from Marikina City, Philippines.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#101311",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
