import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { ThemeProvider } from "./providers/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const domain = "https://job-matching-website.vercel.app/";
const imageUrl = `${domain}/images/preview-image.jpg`;

export const metadata: Metadata = {
  title: "Job Matching App",
  description: "Full-stack job matching platform with user accounts, vacancies, applications, and chat",
  openGraph: {
    title: "Job Matching App",
    description: "Full-stack job matching platform with user accounts, vacancies, applications, and chat",
    url: domain,
    siteName: "Job Matching App",
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: "Job Matching App Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Job Matching App",
    description: "Full-stack job matching platform with user accounts, vacancies, applications, and chat",
    images: [imageUrl],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <Header />
            <main className="">{children}</main>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
