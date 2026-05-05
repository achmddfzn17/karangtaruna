import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Karang Taruna Generasi Emas",
    template: "%s | Karang Taruna Generasi Emas",
  },
  description:
    "Bersama membangun pemuda yang kreatif, inovatif, dan berprestasi untuk Indonesia yang lebih baik",
  keywords: [
    "karang taruna",
    "organisasi pemuda",
    "generasi emas",
    "pemuda indonesia",
  ],
  authors: [{ name: "Karang Taruna Generasi Emas" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Karang Taruna Generasi Emas",
    title: "Karang Taruna Generasi Emas",
    description:
      "Bersama membangun pemuda yang kreatif, inovatif, dan berprestasi untuk Indonesia yang lebih baik",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
