import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://iamjk.site"),
  title: {
    default: "JK de Guzman | A personal corner of the internet",
    template: "%s | JK de Guzman",
  },
  description:
    "A personal corner of the internet belonging to Juan Karlo “JK” de Guzman: a curious learner, teacher, builder, reader, and Christian from the Philippines.",
  alternates: { canonical: "https://iamjk.site" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "https://iamjk.site",
    title: "JK de Guzman | A personal corner of the internet",
    description:
      "Notes on learning, language, faith, books, systems, and everyday life from JK in the Philippines.",
    siteName: "iamjk.site",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "JK de Guzman, a personal corner of the internet" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JK de Guzman | A personal corner of the internet",
    description:
      "Notes on learning, language, faith, books, systems, and everyday life from JK in the Philippines.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4efe5",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
