import Link from "next/link";
import { ArrowIcon } from "@/components/ui/icons";

/** Outlined "View All" pill linking to a collection (defaults to /collection). */
export default function ViewAllButton({ href = "/collection" }: { href?: string }) {
  return (
    <div className="flex justify-center">
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-full border border-[#151515] px-7 py-2.5 text-sm font-medium text-[#151515] transition-colors hover:bg-[#151515] hover:text-white"
      >
        View All
        <ArrowIcon />
      </Link>
    </div>
  );
}
