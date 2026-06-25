"use client";

import { PopSections } from "@/components/pop/PopPage";
import { PanelHeader } from "../ui";

export default function PlanOfPurchase({ onExit }: { onExit: () => void }) {
  return (
    <div>
      <PanelHeader title="Plan of Purchase" onBack={onExit} />
      <PopSections embedded />
    </div>
  );
}
