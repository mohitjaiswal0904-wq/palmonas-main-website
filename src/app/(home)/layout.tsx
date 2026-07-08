import Footer from "@/components/layout/Footer";

/** Shared shell for marketing landing pages (home, gold, silver, demifine, new-arrivals). */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
