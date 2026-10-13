"use client";

import Image from "next/image";
import { PROFILE_USER } from "@/data/profile";
import {
  ChevronRightIcon,
  HeartIcon,
  HistoryIcon,
  HomeIcon,
  PlanIcon,
  WalletIcon,
} from "./icons";
import type { MenuKey } from "./types";

type MenuEntry = {
  key: MenuKey;
  title: string;
  subtitle: string;
  Icon: (props: { className?: string }) => React.ReactElement;
};

const MENU: MenuEntry[] = [
  { key: "orders", title: "Order History", subtitle: "View order details", Icon: HistoryIcon },
  {
    key: "plan",
    title: "Plan of Purchase",
    subtitle: "A flexible monthly saving plan for your dream jewellery",
    Icon: PlanIcon,
  },
  { key: "wishlist", title: "Wishlist", subtitle: "All your favourites", Icon: HeartIcon },
  {
    key: "wallet",
    title: "Wallet",
    subtitle: "Recharge your wallet, use cash back received from rewards and orders",
    Icon: WalletIcon,
  },
  {
    key: "addresses",
    title: "Delivery Addresses",
    subtitle: "Edit, add, delete your addresses",
    Icon: HomeIcon,
  },
];

const OTHERS = [
  "Refer & Earn",
  "Change Password",
  "Palmonas Support Center",
  "How To Earn",
  "How To Redeem",
  "FAQs",
  "Privacy Policy",
  "Logout",
];

type Props = {
  activeKey: MenuKey | null;
  variant?: "full" | "compact";
  onSelectMenu: (key: MenuKey) => void;
  onViewProfile: () => void;
  onLogout: () => void;
};

export default function ProfileSidebar({
  activeKey,
  variant = "compact",
  onSelectMenu,
  onViewProfile,
  onLogout,
}: Props) {
  const full = variant === "full";
  return (
    <aside className={full ? "w-full" : "w-full lg:w-[540px] lg:shrink-0"}>
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative size-[86px] overflow-hidden rounded-full bg-[#151515]">
          <Image
            src="/collection/product-earrings.jpg"
            alt={`${PROFILE_USER.firstName} ${PROFILE_USER.lastName}`}
            fill
            sizes="86px"
            className="object-cover"
          />
        </div>
        <h2 className="mt-3 text-xl font-bold text-[#151515]">
          {PROFILE_USER.firstName} {PROFILE_USER.lastName}
        </h2>
        <button
          type="button"
          onClick={onViewProfile}
          className="mt-1 text-sm text-[#62748e] underline underline-offset-2 transition-colors hover:text-[#151515]"
        >
          View Profile
        </button>
      </div>

      {/* Primary menu card */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#ececec]">
        {MENU.map((m, i) => {
          const active = activeKey === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onSelectMenu(m.key)}
              className={`flex w-full items-center gap-4 px-4 py-4 text-left transition-colors ${
                i !== MENU.length - 1 ? "border-b border-[#f0f0f0]" : ""
              } ${active ? "bg-[#f6f1f1]" : "hover:bg-[#faf7f7]"}`}
            >
              <span className="flex size-[43px] shrink-0 items-center justify-center rounded-full bg-[#fbe9ea] text-[#a0454f]">
                <m.Icon className="size-[22px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-[#151515]">
                  {m.title}
                </span>
                <span
                  className={`block text-[13px] text-[#8a8a8a] ${full ? "" : "truncate"}`}
                >
                  {m.subtitle}
                </span>
              </span>
              <ChevronRightIcon className="size-5 shrink-0 text-[#bdbdbd]" />
            </button>
          );
        })}
      </div>

      {/* Others */}
      <p className="mt-6 text-center text-[11px] uppercase tracking-wide text-[#a3a3a3]">
        Others
      </p>
      <ul className="mt-2">
        {OTHERS.map((label) => (
          <li key={label}>
            <button
              type="button"
              onClick={label === "Logout" ? onLogout : undefined}
              className="flex w-full items-center justify-between border-b border-[#f0f0f0] py-4 text-left text-[15px] text-[#151515] transition-colors hover:text-[#a0454f]"
            >
              {label}
              <ChevronRightIcon className="size-5 shrink-0 text-[#bdbdbd]" />
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
