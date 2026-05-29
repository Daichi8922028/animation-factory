import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SITE } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.baseUrl),
  title: {
    default: SITE.name,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.shortDescription,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    title: SITE.name,
    description: SITE.shortDescription,
    url: SITE.baseUrl,
  },
  twitter: {
    card: SITE.twitterCard,
    title: SITE.name,
    description: SITE.shortDescription,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

/**
 * テーマ初期化スクリプト。SSR の HTML 出力時に <html data-theme> は無いため、
 * 初回描画より前に localStorage を読んで data-theme をセットし、FOUC を防ぐ。
 * 既定はライト。"dark" / "light" 以外の値は無視。
 */
const themeInit = `(function(){try{var t=localStorage.getItem('animation-factory:theme');document.documentElement.dataset.theme=(t==='dark'||t==='light')?t:'light';}catch(e){document.documentElement.dataset.theme='light';}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
