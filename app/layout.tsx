import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { Navbar } from "./components/Navbar";
import prisma from "./lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import AnalyticsWrapper from "./components/AnalyticsWrapper";

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
    const data = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        colorScheme: true,
      },
    });
    return data;
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
          <AnalyticsWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}
