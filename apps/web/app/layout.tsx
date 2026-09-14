import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mizparfume.com"),
  title: {
    default: "Miz Parfume - Toko Parfum Padang | Parfum Pria & Wanita",
    template: "%s | Miz Parfume Padang",
  },
  description:
    "Toko parfum terpercaya di Padang. Jual parfum pria & wanita berkualitas, tahan lama, harga bersahabat. Custom aroma sesuai selera. Buka setiap hari.",
  verification: {
    google: "3B46ie-pU7XSL6bSYqGQ6HgZB8yQjjLCDYX7ebdQ2nE",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Miz Parfume",
    url: "https://mizparfume.com",
    title: "Miz Parfume - Toko Parfum Padang | Parfum Pria & Wanita",
    description: "Toko parfum terpercaya di Padang. Jual parfum pria & wanita berkualitas, tahan lama, harga bersahabat.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Miz Parfume - Toko Parfum Padang | Parfum Pria & Wanita",
    description: "Toko parfum terpercaya di Padang. Jual parfum pria & wanita berkualitas.",
  },
  keywords: [
    "parfum Padang",
    "toko parfum Padang",
    "parfum di Padang",
    "jual parfum Padang",
    "parfum pria Padang",
    "parfum wanita Padang",
    "parfum murah Padang",
    "toko parfum di Padang",
    "jual parfum di Padang",
  ],
  alternates: {
    canonical: "https://mizparfume.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}