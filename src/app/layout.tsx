import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { GoogleAnalytics } from "@/components/layout/GoogleAnalytics";
import SentryUserProvider from "@/components/SentryUserProvider";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Florence With Locals Forum",
    template: "%s | Florence With Locals Forum",
  },
  description:
    "Join the Florence With Locals community. Share travel tips, ask questions, and connect with fellow travelers and local experts about Florence, Italy.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://forum.florencewithlocals.com"
  ),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Florence With Locals Forum",
  },
};

async function getCategories() {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, icon, color")
      .eq("is_active", true)
      .order("display_order");
    return data ?? [];
  } catch {
    // DB not connected yet — return empty array so the app still renders
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} overflow-x-hidden`}>
      <body className="font-body text-dark-text bg-warm-cream antialiased overflow-x-hidden max-w-[100vw]">
        <AuthProvider>
          <SentryUserProvider />
          <div className="flex min-h-screen flex-col w-full max-w-full">
            <Navbar categories={categories} />
            <main className="flex-1 w-full min-w-0 max-w-full overflow-x-hidden">{children}</main>
            <Footer />
            <CookieConsent />
            <GoogleAnalytics />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
