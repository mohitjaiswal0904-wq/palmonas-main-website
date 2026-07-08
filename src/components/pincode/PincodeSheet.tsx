"use client";

import { useEffect, useState } from "react";
import BottomSheet from "@/components/cart/BottomSheet";
import { INITIAL_ADDRESSES, type Address } from "@/data/profile";
import { usePincode } from "@/hooks/usePincode";
import {
  detectLocationPincode,
  fetchPincodeDetails,
  isValidPincodeFormat,
  normalizePincodeInput,
  type PincodeLookup,
} from "@/lib/pincode";
import { type PincodeSource } from "@/stores/pincode.store";
import { cn } from "@/lib/cn";

function LocationIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10Z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

export default function PincodeSheet() {
  const {
    pincode,
    city,
    state,
    serviceable,
    delivery,
    sheetOpen,
    closeSheet,
    applyLookup,
  } = usePincode();

  const [input, setInput] = useState(pincode);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (sheetOpen) {
      setInput(pincode);
      setError("");
    }
  }, [sheetOpen, pincode]);

  const applyPincode = async (
    value: string,
    source: PincodeSource = "manual",
    preset?: PincodeLookup,
  ) => {
    const normalized = normalizePincodeInput(value);
    setInput(normalized);
    setError("");

    if (!isValidPincodeFormat(normalized)) {
      setError("Enter a valid 6-digit Indian pincode.");
      return;
    }

    if (preset) {
      applyLookup(preset, source);
      return;
    }

    setLoading(true);
    try {
      const details = await fetchPincodeDetails(normalized);
      if (!details) {
        setError("Pincode not found. Check and try again.");
        return;
      }
      if (!details.serviceable) {
        setError("Delivery is not available for this pincode yet.");
        return;
      }
      applyLookup(details, source);
    } catch {
      setError("Unable to verify pincode. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = async () => {
    setError("");
    setLocating(true);
    try {
      const details = await detectLocationPincode();
      applyLookup(details, "geolocation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to detect location.");
    } finally {
      setLocating(false);
    }
  };

  const handleSelectAddress = (address: Address) => {
    void applyPincode(
      address.postalCode,
      "address",
      {
        pincode: address.postalCode,
        city: address.city,
        state: address.country === "India" ? "India" : address.country,
        district: address.city,
        serviceable: true,
      },
    );
  };

  const savedAddresses = INITIAL_ADDRESSES.filter(
    (address, index, list) =>
      list.findIndex((item) => item.postalCode === address.postalCode) === index,
  );

  return (
    <BottomSheet
      open={sheetOpen}
      onClose={closeSheet}
      title="Update delivery pincode"
      className="sm:max-w-[520px]"
      footer={
        <button
          type="button"
          disabled={loading || locating || input.length !== 6}
          onClick={() => applyPincode(input)}
          className="h-12 w-full rounded-lg bg-[#151515] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Checking…" : "Apply pincode"}
        </button>
      }
    >
      <div className="space-y-6">
        <div className="rounded-xl bg-[#f7f7f7] px-4 py-3 text-sm text-[#404040]">
          {serviceable ? (
            <>
              Currently delivering to{" "}
              <span className="font-semibold text-[#151515]">
                {pincode}
              </span>
              {city ? (
                <>
                  {" "}
                  · <span className="font-medium text-[#151515]">{city}</span>
                  {state ? `, ${state}` : null}
                </>
              ) : null}
              .{" "}
              <span className="text-[#15803d]">{delivery.headline}</span>
            </>
          ) : (
            <>Enter a pincode to check delivery availability.</>
          )}
        </div>

        <div>
          <label htmlFor="pincode-input" className="text-sm font-semibold text-[#151515]">
            Enter pincode
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="pincode-input"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              placeholder="6-digit pincode"
              value={input}
              onChange={(e) => {
                setInput(normalizePincodeInput(e.target.value));
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.length === 6) {
                  e.preventDefault();
                  void applyPincode(input);
                }
              }}
              className="h-12 flex-1 rounded-lg border border-[#e5e5e5] px-4 text-base text-[#151515] outline-none transition-colors focus:border-[#151515]"
            />
            <button
              type="button"
              disabled={loading || input.length !== 6}
              onClick={() => applyPincode(input)}
              className="h-12 shrink-0 rounded-lg border border-[#151515] px-4 text-sm font-semibold text-[#151515] transition-colors hover:bg-[#151515] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Check
            </button>
          </div>
          {error ? (
            <p className="mt-2 text-sm text-[#c51a27]" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => void handleUseLocation()}
          disabled={locating || loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#e5e5e5] px-4 py-3 text-sm font-semibold text-[#151515] transition-colors hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LocationIcon />
          {locating ? "Detecting location…" : "Use my current location"}
        </button>

        {savedAddresses.length > 0 ? (
          <div>
            <p className="text-sm font-semibold text-[#151515]">
              Saved addresses
            </p>
            <ul className="mt-3 space-y-2">
              {savedAddresses.map((address) => {
                const active = address.postalCode === pincode;
                return (
                  <li key={address.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectAddress(address)}
                      disabled={loading || locating}
                      className={cn(
                        "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                        active
                          ? "border-[#151515] bg-[#fafafa]"
                          : "border-[#ededed] hover:border-[#cfcfcf]",
                      )}
                    >
                      <p className="text-sm font-semibold text-[#151515]">
                        {address.postalCode} · {address.city}
                      </p>
                      <p className="mt-1 text-xs text-[#6b6b6b]">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </BottomSheet>
  );
}
