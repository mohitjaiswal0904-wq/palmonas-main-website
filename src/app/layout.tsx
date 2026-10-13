import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/components/layout/Header";
import CategoryTabs from "@/components/layout/CategoryTabs";
import BottomNav from "@/components/layout/BottomNav";
import AppProviders from "@/providers/AppProviders";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Palmonas — Demi-Fine Jewellery",
  description:
    "Gold, Silver and Demi-Fine jewellery crafted to be worn every day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunitoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-[64px] lg:pb-0">
        <AppProviders>
          <Header />
          <CategoryTabs />
          {children}
          <BottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
