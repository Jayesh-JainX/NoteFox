import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { Navbar } from "./components/Navbar";
import supabase from "./lib/db";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import AnalyticsWrapper from "./components/AnalyticsWrapper";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Note Fox",
  description:
    "SaaS for Note - Enhance your note-taking experience with NoteFox",
  keywords: [
    "Note Fox",
    "note-taking",
    "SaaS",
    "productivity",
    "notes",
    "organization",
    "digital notes",
    "note management",
    "note app",
    "online notes",
    "note software",
    "collaboration",
    "workspace",
    "note sharing",
    "efficient notes",
    "cloud notes",
    "study notes",
    "work notes",
    "task management",
    "to-do lists",
    "note tagging",
    "note categorization",
    "note search",
    "notebook app",
    "mobile notes",
    "writing app",
    "data backup",
    "content organization",
    "project management",
    "remote work",
    "real-time editing",
    "annotation tools",
    "note syncing",
  ],
  robots: "index,follow",
  icons: {
    icon: "icon.ico",
  },
};

async function getData(userId: string) {
  if (userId) {
    const { data, error } = await supabase
      .from("users")
      .select("color_scheme")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user color scheme:", error);
      return null;
    }

    return { colorScheme: data?.color_scheme };
  }
}

function getShadowFromColor(colors: any) {
  return `0 0 10px ${colors}, 0 0 5px ${colors}`;
}

function getTopLoaderColor(colorSch: any) {
  switch (colorSch) {
    case "theme-green":
      return "#28a745";
    case "theme-blue":
      return "#2299DD";
    case "theme-violet":
      return "#6f42c1";
    case "theme-yellow":
      return "#ffc107";
    case "theme-orange":
      return "#fd7e14";
    case "theme-red":
      return "#dc3545";
    case "theme-rose":
      return "#e83e8c";
    default:
      return "#2299DD";
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData(user?.id as string);
  const topLoaderColor = getTopLoaderColor(data?.colorScheme);
  const topLoaderShadow = getShadowFromColor(topLoaderColor);
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="https://notefox.vercel.app/icon.ico"
          type="image/x-icon"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="https://notefox.vercel.app/icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="https://notefox.vercel.app/icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="https://notefox.vercel.app/icon.png"
        />
        <meta name="author" content="Jayesh Jain" />
        <meta property="og:title" content="Note Fox" />
        <meta
          property="og:description"
          content="SaaS for Note - Enhance your note-taking experience with Note Fox"
        />
        <meta
          property="og:image"
          content="https://notefox.vercel.app/image.jpeg"
        />
        <meta name="twitter:title" content="Note Fox" />
        <meta
          name="twitter:description"
          content="SaaS for Note - Enhance your note-taking experience with Note Fox"
        />
        <meta
          name="twitter:image"
          content="https://notefox.vercel.app/image.jpeg"
        />
      </head>
      <body
        className={`${inter.className} ${data?.colorScheme ?? "theme-blue"} `}
      >
        <NextTopLoader
          color={topLoaderColor}
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow={topLoaderShadow}
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<div>Loading...</div>}>
            <Navbar />
          </Suspense>
          <Suspense fallback={<div>Loading content...</div>}>
            {children}
          </Suspense>
          <Suspense fallback={null}>
            <AnalyticsWrapper />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
