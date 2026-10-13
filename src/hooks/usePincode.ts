"use client";

import { getDeliveryEstimate } from "@/lib/pincode";
import { usePincodeStore } from "@/stores/pincode.store";

export function usePincode() {
  const pincode = usePincodeStore((s) => s.pincode);
  const city = usePincodeStore((s) => s.city);
  const state = usePincodeStore((s) => s.state);
  const district = usePincodeStore((s) => s.district);
  const serviceable = usePincodeStore((s) => s.serviceable);
  const source = usePincodeStore((s) => s.source);
  const sheetOpen = usePincodeStore((s) => s.sheetOpen);
  const openSheet = usePincodeStore((s) => s.openSheet);
  const closeSheet = usePincodeStore((s) => s.closeSheet);
  const applyLookup = usePincodeStore((s) => s.applyLookup);
  const reset = usePincodeStore((s) => s.reset);

  const delivery = getDeliveryEstimate({
    pincode,
    city,
    state,
    district,
    serviceable,
  });

  return {
    pincode,
    city,
    state,
    district,
    serviceable,
    source,
    delivery,
    sheetOpen,
    openSheet,
    closeSheet,
    applyLookup,
    reset,
  };
}
