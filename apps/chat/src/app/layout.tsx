import type { Metadata } from "next";
import "../index.css";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "Chat with Prakhar's Portfolio",
  description: "Ask questions about Prakhar's blog posts, projects, and experience",
  keywords: ["portfolio", "developer", "projects", "blog", "AI chat"],
  authors: [{ name: "Prakhar Shukla" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prakhar.codes",
    siteName: "Prakhar's Portfolio",
    title: "Chat with Prakhar's Portfolio",
    description: "Ask questions about Prakhar's blog posts, projects, and experience",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Chat with Prakhar's Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chat with Prakhar's Portfolio",
    description: "Ask questions about Prakhar's blog posts, projects, and experience",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
