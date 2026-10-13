export type PincodeLookup = {
  pincode: string;
  city: string;
  state: string;
  district: string;
  serviceable: boolean;
};

export type DeliveryEstimate = {
  express: boolean;
  headline: string;
  detail: string;
  cutoffMinutes?: number;
};

/** Matches existing mock addresses across profile / cart. */
export const DEFAULT_PINCODE: PincodeLookup = {
  pincode: "221002",
  city: "Pune",
  state: "Maharashtra",
  district: "Pune",
  serviceable: true,
};

const LOCAL_PINCODES: Record<string, PincodeLookup> = {
  "221002": DEFAULT_PINCODE,
  "110001": {
    pincode: "110001",
    city: "New Delhi",
    state: "Delhi",
    district: "New Delhi",
    serviceable: true,
  },
  "400001": {
    pincode: "400001",
    city: "Mumbai",
    state: "Maharashtra",
    district: "Mumbai",
    serviceable: true,
  },
  "560001": {
    pincode: "560001",
    city: "Bengaluru",
    state: "Karnataka",
    district: "Bengaluru",
    serviceable: true,
  },
};

const EXPRESS_PREFIXES = new Set([
  "11",
  "12",
  "22",
  "40",
  "41",
  "56",
  "60",
  "70",
  "80",
]);

export function normalizePincodeInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function isValidPincodeFormat(pin: string): boolean {
  return /^[1-9]\d{5}$/.test(pin);
}

export async function fetchPincodeDetails(
  pincode: string,
): Promise<PincodeLookup | null> {
  if (!isValidPincodeFormat(pincode)) return null;

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    if (!res.ok) throw new Error("lookup failed");
    const data = (await res.json()) as {
      Status: string;
      PostOffice?: { Name: string; District: string; State: string }[];
    }[];
    const entry = data?.[0];
    if (entry?.Status !== "Success" || !entry.PostOffice?.length) {
      return LOCAL_PINCODES[pincode] ?? null;
    }

    const office = entry.PostOffice[0];
    return {
      pincode,
      city: office.District || office.Name,
      state: office.State,
      district: office.District || office.Name,
      serviceable: true,
    };
  } catch {
    return LOCAL_PINCODES[pincode] ?? null;
  }
}

export function getDeliveryEstimate(lookup: PincodeLookup): DeliveryEstimate {
  if (!lookup.serviceable) {
    return {
      express: false,
      headline: "Not serviceable",
      detail: "We do not deliver to this pincode yet. Try a nearby area.",
    };
  }

  const prefix = lookup.pincode.slice(0, 2);
  if (EXPRESS_PREFIXES.has(prefix)) {
    return {
      express: true,
      headline: "Get it By Today",
      detail: "Free Delivery by Today. Order within 0 hours 59 minutes.",
      cutoffMinutes: 59,
    };
  }

  return {
    express: false,
    headline: "Standard Delivery",
    detail: "Free Delivery in 3–5 business days.",
  };
}

export function detectLocationPincode(): Promise<PincodeLookup> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported on this device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { "Accept-Language": "en" } },
          );
          if (!res.ok) throw new Error("Could not resolve your location.");

          const data = (await res.json()) as {
            address?: { postcode?: string };
          };
          const pin = normalizePincodeInput(data.address?.postcode ?? "");
          if (!isValidPincodeFormat(pin)) {
            reject(
              new Error(
                "Could not detect a valid Indian pincode for your location.",
              ),
            );
            return;
          }

          const details = await fetchPincodeDetails(pin);
          if (!details) {
            reject(new Error("Delivery is not available for your location."));
            return;
          }

          resolve(details);
        } catch {
          reject(new Error("Unable to detect your location. Enter pincode manually."));
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("Location permission denied. Enter pincode manually."));
          return;
        }
        reject(new Error("Unable to detect your location. Enter pincode manually."));
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 60_000 },
    );
  });
}
