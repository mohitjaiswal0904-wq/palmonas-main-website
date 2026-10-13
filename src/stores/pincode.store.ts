import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_PINCODE, type PincodeLookup } from "@/lib/pincode";

export type PincodeSource = "default" | "manual" | "geolocation" | "address";

interface PincodeState {
  pincode: string;
  city: string;
  state: string;
  district: string;
  serviceable: boolean;
  source: PincodeSource;
  sheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  applyLookup: (lookup: PincodeLookup, source: PincodeSource) => void;
  reset: () => void;
}

const toState = (lookup: PincodeLookup, source: PincodeSource) => ({
  pincode: lookup.pincode,
  city: lookup.city,
  state: lookup.state,
  district: lookup.district,
  serviceable: lookup.serviceable,
  source,
});

export const usePincodeStore = create<PincodeState>()(
  persist(
    (set) => ({
      ...toState(DEFAULT_PINCODE, "default"),
      sheetOpen: false,

      openSheet() {
        set({ sheetOpen: true });
      },

      closeSheet() {
        set({ sheetOpen: false });
      },

      applyLookup(lookup, source) {
        set({ ...toState(lookup, source), sheetOpen: false });
      },

      reset() {
        set({ ...toState(DEFAULT_PINCODE, "default"), sheetOpen: false });
      },
    }),
    {
      name: "palmonas_pincode",
      partialize: (state) => ({
        pincode: state.pincode,
        city: state.city,
        state: state.state,
        district: state.district,
        serviceable: state.serviceable,
        source: state.source,
      }),
    },
  ),
);
