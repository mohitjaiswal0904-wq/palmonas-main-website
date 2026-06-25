"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoutIcon } from "./icons";
import ProfileSidebar from "./ProfileSidebar";
import Addresses from "./sections/Addresses";
import Orders from "./sections/Orders";
import PlanOfPurchase from "./sections/PlanOfPurchase";
import ProfileDetails from "./sections/ProfileDetails";
import Wallet from "./sections/Wallet";
import WishlistSection from "./sections/WishlistSection";
import type { MenuKey } from "./types";
import { ConfirmModal } from "./ui";

type Section = MenuKey | "profile";

export default function ProfileAccount() {
  const router = useRouter();
  // `null` => landing menu (no split). A value => split two-pane view.
  const [section, setSection] = useState<Section | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const exit = () => setSection(null);

  const renderSection = () => {
    switch (section) {
      case "orders":
        return <Orders key="orders" onExit={exit} />;
      case "plan":
        return <PlanOfPurchase key="plan" onExit={exit} />;
      case "wishlist":
        return <WishlistSection key="wishlist" onExit={exit} />;
      case "wallet":
        return <Wallet key="wallet" onExit={exit} />;
      case "addresses":
        return <Addresses key="addresses" onExit={exit} />;
      case "profile":
        return <ProfileDetails key="profile" onExit={exit} />;
      default:
        return null;
    }
  };

  return (
    <main className="w-full bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-8">
        {section === null ? (
          /* Landing: account information only, no split. */
          <div className="mx-auto w-full max-w-[820px]">
            <ProfileSidebar
              variant="full"
              activeKey={null}
              onSelectMenu={(key) => setSection(key)}
              onViewProfile={() => setSection("profile")}
              onLogout={() => setLogoutOpen(true)}
            />
          </div>
        ) : (
          /* Split: menu on the left, the selected section on the right.
             On mobile the menu is hidden and only the active section shows;
             the section's back button returns to the landing menu. */
          <div className="flex flex-col lg:flex-row lg:gap-0">
            <div className="hidden lg:block lg:shrink-0">
              <ProfileSidebar
                activeKey={section === "profile" ? null : section}
                onSelectMenu={(key) => setSection(key)}
                onViewProfile={() => setSection("profile")}
                onLogout={() => setLogoutOpen(true)}
              />
            </div>

            <div className="hidden w-px shrink-0 bg-[#ececec] lg:mx-10 lg:block" />

            <section className="min-w-0 flex-1">{renderSection()}</section>
          </div>
        )}
      </div>

      {logoutOpen ? (
        <ConfirmModal
          icon={<LogoutIcon className="size-6" />}
          message="Are you sure you want to logout?"
          onYes={() => {
            setLogoutOpen(false);
            router.push("/");
          }}
          onNo={() => setLogoutOpen(false)}
        />
      ) : null}
    </main>
  );
}
