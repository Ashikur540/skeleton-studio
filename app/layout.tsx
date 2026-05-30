import { JsonLd } from "@/components/json-ld";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { DM_Sans, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "Skeleton Generator — Create Tailwind CSS Loading Skeletons from JSX",
    template: "%s — Skeleton Studio",
  },
  description:
    "Free online skeleton generator & loading skeleton generator. Paste React/JSX components and get production-ready Tailwind CSS skeleton loaders instantly. Export React+Tailwind or HTML+Tailwind code.",
  keywords: [
    "skeleton generator",
    "skeleton generator tailwind css",
    "tailwind loading skeleton generator",
    "loading skeleton generator",
    "React tailwind skeleton generator",
    "code to loading skeleton",
    "skeleton loader",
    "skeleton screen generator",
    "tailwind skeleton",
    "react skeleton loader",
    "jsx to skeleton",
    "loading placeholder generator",
  ],
  authors: [{ name: "Skeleton Studio" }],
  creator: "Skeleton Studio",
  publisher: "Skeleton Studio",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://skeletons-studio.vercel.app",
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "Skeleton Generator — Create Tailwind CSS Loading Skeletons from JSX",
    description:
      "Free online skeleton generator. Paste React components, get production-ready Tailwind CSS skeleton loaders. Edit dimensions, animations, colors — export React+Tailwind or HTML+Tailwind code.",
    url: "/",
    siteName: "Skeleton Studio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Skeleton Studio — Turn real UI into production-ready skeletons",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skeleton Generator — Tailwind CSS Loading Skeleton Generator",
    description:
      "Free skeleton generator. Paste JSX → get realistic Tailwind CSS skeleton loaders. Export React or HTML instantly.",
    images: ["/og-image.png"],
    creator: "@skeletonstudio",
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
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased font-sans",
        geistSans.variable,
        geistMono.variable,
        dmSans.variable,
      )}
    >
      <body className="h-full bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <JsonLd />
        <Analytics />
      </body>
    </html>
  );
}
