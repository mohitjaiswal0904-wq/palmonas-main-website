import Link from "next/link";

const linkColumns: { title: string; links: string[] }[] = [
  {
    title: "Policy",
    links: [
      "Privacy Policy",
      "Return & Refund Policy",
      "Shipping Policy",
      "Terms & Conditions",
      "Cancellation Policy",
    ],
  },
  {
    title: "Help",
    links: [
      "Track Your Order",
      "Contact Us",
      "FAQs",
      "Care Guide",
      "Store Locator",
    ],
  },
  {
    title: "About Us",
    links: ["Our Story", "Blog", "Careers", "Reviews", "Press"],
  },
];

const popularSearches = [
  "Gold Earrings",
  "Silver Rings",
  "Demi-fine Necklaces",
  "Bracelets",
  "Mangalsutras",
  "Anti-Tarnish Jewellery",
  "Bestseller Hoops",
  "Gifting",
  "Men's Jewellery",
  "Daily Wear",
];

function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="#"
      className="flex size-9 items-center justify-center rounded-full border border-black/15 text-[#151515] transition-colors hover:bg-[#151515] hover:text-white"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-black/10 bg-white text-[#151515]">
      {/* Newsletter + links */}
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-6 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <h3 className="text-lg font-semibold">Subscribe to receive exciting offers</h3>
          <p className="mt-2 text-sm text-[#6b6b6b]">
            Be the first to know about new launches, offers and more.
          </p>
          <form className="mt-5 flex max-w-sm overflow-hidden rounded-full border border-black/15">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-transparent px-4 py-3 text-sm outline-none"
            />
            <button
              type="submit"
              className="shrink-0 bg-[#151515] px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Subscribe
            </button>
          </form>

          <address className="mt-6 not-italic text-sm leading-6 text-[#6b6b6b]">
            Palmonas Retail India Pvt. Ltd.
            <br />
            Registered Address: City Centre, Pune, Maharashtra
            <br />
            Email: support@palmonas.com
          </address>
        </div>

        {linkColumns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold uppercase tracking-wide">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-sm text-[#6b6b6b] transition-colors hover:text-[#151515]"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Social */}
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-center gap-3 px-6 pb-8">
        <SocialIcon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M13 22v-8h2.7l.4-3.1H13V8.9c0-.9.3-1.5 1.6-1.5H16V4.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H7v3.1h2.8V22H13Z" />
          </svg>
        </SocialIcon>
        <SocialIcon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
        </SocialIcon>
        <SocialIcon>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M21.5 7.2c-.2-1-.9-1.7-1.9-2C17.9 4.8 12 4.8 12 4.8s-5.9 0-7.6.4c-1 .3-1.7 1-1.9 2C2 9 2 12 2 12s0 3 .5 4.8c.2 1 .9 1.7 1.9 2 1.7.4 7.6.4 7.6.4s5.9 0 7.6-.4c1-.3 1.7-1 1.9-2 .5-1.8.5-4.8.5-4.8s0-3-.5-4.8ZM10 15.3V8.7l5.2 3.3-5.2 3.3Z" />
          </svg>
        </SocialIcon>
      </div>

      {/* App badges */}
      <div className="bg-[#fde9ec]">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-4 px-6 py-8 text-center">
          <p className="text-base font-semibold">Download the PALMONAS App</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#"
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M3.6 2.3 13 12 3.6 21.7c-.4-.2-.6-.6-.6-1.1V3.4c0-.5.2-.9.6-1.1Zm10.8 8.4L5.9 2.1 17 8.5l-2.6 2.2Zm0 2.6L17 15.5 5.9 21.9l8.5-8.6Zm1.4-1.3 3.1-1.8c.7-.4.7-1.4 0-1.8l-1.4-.8-1.7 1.5 1.5 1.2-1.5 1.2.4.3Z" />
              </svg>
              <span className="text-left text-xs leading-tight">
                GET IT ON
                <br />
                <span className="text-sm font-semibold">Google Play</span>
              </span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M16.4 12.7c0-2 1.6-3 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2.1 2.4 2 1-.1 1.3-.6 2.5-.6s1.5.6 2.6.6 1.7-.9 2.4-1.9c.5-.7.7-1.1 1.1-1.9-2.8-1.1-2.4-3.6-2.4-3.7ZM14.5 5.9c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.2-.5.6-1 1.5-.8 2.4.9.1 1.8-.4 2.4-1Z" />
              </svg>
              <span className="text-left text-xs leading-tight">
                Download on the
                <br />
                <span className="text-sm font-semibold">App Store</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Popular searches */}
      <div className="mx-auto w-full max-w-[1280px] px-6 py-10">
        <h4 className="text-base font-semibold">Popular Searches</h4>
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm text-[#6b6b6b]">
          {popularSearches.map((term, i) => (
            <span key={term} className="flex items-center gap-3">
              <Link href="#" className="transition-colors hover:text-[#151515]">
                {term}
              </Link>
              {i < popularSearches.length - 1 ? (
                <span className="text-black/20">|</span>
              ) : null}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-black/10 px-6 py-6 text-center text-sm text-[#6b6b6b]">
        © {new Date().getFullYear()} Palmonas. All rights reserved.
      </div>
    </footer>
  );
}
