import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon } from "@/components/ui/icons";
import {
  footerCompany,
  footerLinkColumns,
  footerLinkHrefs,
  footerPopularSearches,
} from "@/data/footerContent";

function footerHref(label: string) {
  return footerLinkHrefs[label] ?? "#";
}

function FooterLinkColumn({
  title,
  links,
  className = "",
}: {
  title: string;
  links: readonly string[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="relative pb-2.5 text-base font-medium text-[#222]">
        {title}
        <span className="absolute bottom-0 left-0 h-px w-[60px] bg-[#222]" />
      </h3>
      <ul className="mt-6 space-y-2.5">
        {links.map((link) => (
          <li key={link}>
            <Link
              href={footerHref(link)}
              className="text-[13px] leading-[22px] text-[#868686] transition-colors hover:text-[#444]"
            >
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterAccordionColumn({
  title,
  links,
}: {
  title: string;
  links: readonly string[];
}) {
  return (
    <details className="group border-b border-black/5 lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="text-base font-medium text-[#222]">{title}</span>
        <ChevronDownIcon className="size-3.5 shrink-0 text-[#aaa] transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <ul className="space-y-2.5 pb-4">
        {links.map((link) => (
          <li key={link}>
            <Link
              href={footerHref(link)}
              className="text-[13px] leading-[22px] text-[#868686] transition-colors hover:text-[#444]"
            >
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex size-10 items-center justify-center rounded-full border border-[#6c6c6c] text-[#151515] transition-colors hover:bg-[#151515] hover:text-white"
    >
      {children}
    </a>
  );
}

function SearchTerms({ terms }: { terms: readonly string[] }) {
  return (
    <p className="text-sm leading-[1.7] text-[#868686]">
      {terms.map((term, index) => (
        <span key={term}>
          <Link href="#" className="transition-colors hover:text-[#444]">
            {term}
          </Link>
          {index < terms.length - 1 ? (
            <span className="mx-1.5 text-[#c8c8c8]">|</span>
          ) : null}
        </span>
      ))}
    </p>
  );
}

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-[#e6e6e6] bg-white text-[#151515]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 lg:py-12">
        {/* Newsletter + link columns */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-x-6">
          <div className="mb-8 lg:mb-0">
            <h3 className="text-xl leading-6 text-black">
              Subscribe to receive exciting offers!
            </h3>
            <form className="mt-5 flex h-12 overflow-hidden border border-[#f1f1f1]">
              <input
                type="email"
                placeholder="Your email address"
                className="min-w-0 flex-1 bg-transparent px-5 text-[13px] text-[#868686] outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="flex w-[68px] shrink-0 items-center justify-center border-l border-[#f1f1f1] text-[#151515] transition-colors hover:bg-[#f8f8f8]"
              >
                <svg
                  width="22"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </button>
            </form>

            <div className="mt-6">
              <p className="text-[15.5px] font-semibold leading-[22px] text-black">
                {footerCompany.name}
              </p>
              <p className="mt-1 text-[13px] leading-[22px] text-[#868686]">
                <span className="font-semibold text-[#868686]">
                  Registered Address :{" "}
                </span>
                {footerCompany.address}
              </p>
            </div>
          </div>

          {footerLinkColumns.map((col) => (
            <FooterAccordionColumn
              key={col.title}
              title={col.title}
              links={col.links}
            />
          ))}

          {footerLinkColumns.map((col) => (
            <FooterLinkColumn
              key={`desktop-${col.title}`}
              title={col.title}
              links={col.links}
              className="hidden lg:block"
            />
          ))}
        </div>

        {/* Social */}
        <div className="mt-8 flex items-center justify-center gap-2.5 sm:gap-3">
          <SocialIcon href="#" label="Facebook">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M13 22v-8h2.7l.4-3.1H13V8.9c0-.9.3-1.5 1.6-1.5H16V4.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H7v3.1h2.8V22H13Z" />
            </svg>
          </SocialIcon>
          <SocialIcon href="#" label="Instagram">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </SocialIcon>
          <SocialIcon href="#" label="LinkedIn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6.5 8.5h3v11h-3v-11ZM8 5.5a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5ZM11 8.5h2.9v1.5h.04c.4-.75 1.4-1.55 2.88-1.55 3.08 0 3.65 2.03 3.65 4.67v5.38h-3v-4.77c0-1.14-.02-2.6-1.58-2.6-1.58 0-1.82 1.24-1.82 2.52v4.85H11V8.5Z" />
            </svg>
          </SocialIcon>
          <SocialIcon href="#" label="YouTube">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M21.5 7.2c-.2-1-.9-1.7-1.9-2C17.9 4.8 12 4.8 12 4.8s-5.9 0-7.6.4c-1 .3-1.7 1-1.9 2C2 9 2 12 2 12s0 3 .5 4.8c.2 1 .9 1.7 1.9 2 1.7.4 7.6.4 7.6.4s5.9 0 7.6-.4c1-.3 1.7-1 1.9-2 .5-1.8.5-4.8.5-4.8s0-3-.5-4.8ZM10 15.3V8.7l5.2 3.3-5.2 3.3Z" />
            </svg>
          </SocialIcon>
        </div>

        {/* App download */}
        <div className="mx-auto mt-8 max-w-3xl rounded-xl bg-[#ffefef] px-5 py-5 text-center sm:px-6">
          <h3 className="text-xl font-semibold leading-7 text-black">
            Download the PALMONAS App
          </h3>
          <p className="mt-3 text-sm text-[#333]">
            ( 5L+ Downloads |{" "}
            <span className="text-[#fbbf24]">4.4 ★</span> )
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
            <a href="#" className="relative h-[61px] w-[203px] overflow-hidden">
              <Image
                src="/footer/app-store-badges.png"
                alt="Get it on Google Play"
                fill
                className="object-cover object-left"
                sizes="203px"
              />
            </a>
            <a href="#" className="relative h-[61px] w-[204px] overflow-hidden">
              <Image
                src="/footer/app-store-badges.png"
                alt="Download on the App Store"
                fill
                className="object-cover object-right"
                sizes="204px"
              />
            </a>
          </div>
          <p className="mt-3 text-sm text-[#333]">Get Exclusive Offers On App</p>
        </div>

        {/* Payment + annual returns */}
        <div className="mx-auto mt-8 flex max-w-[220px] flex-col items-center gap-3">
          <div className="relative h-[30px] w-full">
            <Image
              src="/footer/payment-icons.png"
              alt="Accepted payment methods"
              fill
              className="object-contain"
              sizes="220px"
            />
          </div>
          <p className="text-center text-xs leading-5 text-black">
            Annual Returns 2023-24
          </p>
        </div>
      </div>

      {/* Popular searches */}
      <div className="border-t border-[#e6e6e6]">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10">
          <h3 className="text-[23px] font-semibold leading-8 text-black">
            Popular Searches
          </h3>
          <div className="mt-2 divide-y divide-[#e9e9e9]">
            {footerPopularSearches.map((group) => (
              <div key={group.category} className="py-2.5">
                <p className="text-sm text-[#868686]">{group.category}</p>
                <SearchTerms terms={group.terms} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
