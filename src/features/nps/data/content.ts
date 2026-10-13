export type FeedbackTypeId = "shopping" | "delivery" | "overall";

export type FeedbackType = {
  id: FeedbackTypeId;
  label: string;
  window: string;
  primaryQuestion: string;
};

export type ScoreBand = "detractor" | "passive" | "promoter";

/** Shopping: each row pairs L1 (1–6), L2 (7–8), and promoter (9–10) per the sheet. */
export type ShoppingMatrixRow = {
  id: string;
  l1: string;
  l2: string | null;
  promoter: string | null;
};

export type DeliveryL1Option = {
  id: string;
  label: string;
  /** Good / Bad / Worst / Text — from column M in the sheet */
  ratingType: "GoodBadWorst" | "Text" | null;
};

export type FollowUpGroup = {
  id: string;
  label: string;
  options: string[];
  children?: FollowUpGroup[];
};

export const feedbackTypes: FeedbackType[] = [
  {
    id: "shopping",
    label: "Shoping Experience - on the website",
    window:
      "Immediately after order is placed- POP-up should show up",
    primaryQuestion: "How was your shopping experience",
  },
  {
    id: "delivery",
    label: "Delivery Experience",
    window: "Immediately after the product is delivered.",
    primaryQuestion: "How was your delivery experience with Palmonas?",
  },
  {
    id: "overall",
    label: "Over all experience",
    window: "On 21st day of delivery",
    primaryQuestion:
      "How likely are you to recommend Palmonas to a friend or colleague?",
  },
];

export const scoreBandLabels: Record<ScoreBand, string> = {
  detractor: "1-6 what did you not like. ?",
  passive: "7-8 what could we possibly improve?",
  promoter: "9-10. what did you like. ? :)",
};

export const followUpQuestion =
  "What is the primary reason for your score?";

export const optionalQuestion =
  "Which part of your experience needs improvement?";

export const shoppingMatrix: ShoppingMatrixRow[] = [
  {
    id: "shop-1",
    l1: "Navigation was not easy",
    l2: null,
    promoter: "No Question.",
  },
  {
    id: "shop-2",
    l1: "Check out page is not understandable",
    l2: "Positive and possibe outcomes/solution for detactror.",
    promoter: null,
  },
  { id: "shop-3", l1: "Payment failed", l2: null, promoter: null },
  {
    id: "shop-4",
    l1: "Money deducted but order not placed.",
    l2: null,
    promoter: null,
  },
  { id: "shop-5", l1: "Price mismatch", l2: null, promoter: null },
  {
    id: "shop-6",
    l1: "Coupon code not working",
    l2: null,
    promoter: null,
  },
  {
    id: "shop-7",
    l1: "Offer showing but not getting applied",
    l2: null,
    promoter: null,
  },
  { id: "shop-8", l1: "Website/App too slow", l2: null, promoter: null },
  {
    id: "shop-9",
    l1: "Product description not available",
    l2: null,
    promoter: null,
  },
  {
    id: "shop-10",
    l1: "Cancellation Option not available",
    l2: null,
    promoter: null,
  },
  {
    id: "shop-11",
    l1: "Gift card could not be redeemed",
    l2: null,
    promoter: null,
  },
];

export const shoppingPromoterExtra = "Tempered Packet";

export const deliveryPreQuestions = {
  shorterDeliveryTime: "Wanted Shorter Delivery Time",
  deliveryPersonBehaviour: "Delivery Person Behaviour",
} as const;

export const deliveryL1Options: DeliveryL1Option[] = [
  {
    id: "del-1",
    label: "Not delivered on time.",
    ratingType: "GoodBadWorst",
  },
  {
    id: "del-2",
    label: "Marked as delivered but actually not delivered",
    ratingType: "GoodBadWorst",
  },
  {
    id: "del-3",
    label: "Delivery guy mis-behaved",
    ratingType: "GoodBadWorst",
  },
  {
    id: "del-4",
    label: "Incomeplete order received",
    ratingType: null,
  },
  {
    id: "del-5",
    label: "Received Damaged",
    ratingType: "Text",
  },
  { id: "del-6", label: "Parcel was tampered", ratingType: null },
  { id: "del-7", label: "Packing Exp", ratingType: null },
];

export const deliveryRatingLabels = ["Good", "Bad", "Worst"] as const;

export const overallL1Categories = [
  { id: "ov-l1-shop", label: "Shopping experience" },
  { id: "ov-l1-delivery", label: "Delivery Service" },
  { id: "ov-l1-product", label: "Product" },
  { id: "ov-l1-return", label: "Related to Return & exchange" },
  { id: "ov-l1-store", label: "Store purchase Experience" },
] as const;

export const overallL2ByL1: Record<string, FollowUpGroup> = {
  "ov-l1-shop": {
    id: "ov-l2-shop",
    label: "Shopping experience",
    options: [
      "Navigation was not easy",
      "Check out page is not understandable",
      "Payment failed",
      "Money deducted but order not placed.",
      "Prices are not accurate",
      "Coupon code not working",
      "Offer showing but not getting applied",
    ],
  },
  "ov-l1-delivery": {
    id: "ov-l2-delivery",
    label: "Delivery",
    options: [
      "Did not arrived in time.",
      "Marked as delivered but actually not delivered",
      "Delivery guy mis-behaved",
      "Did not received the Order at all",
      "Received Damaged",
      "Parcel was tampered",
    ],
  },
  "ov-l1-product": {
    id: "ov-l2-product",
    label: "Product",
    options: [
      "Damaged after 1 use",
      "Plating removed",
      "Broken",
      "Earring screw damaged",
      "Inaccurate Size — Smaller/Bigger",
      "Incorrect product description",
      "Functionality issue /Mechanism",
      "Skin Sensitive",
      "Tarnished",
    ],
  },
  "ov-l1-return": {
    id: "ov-l2-return",
    label: "Related to Return & exchange",
    options: [],
  },
  "ov-l1-store": {
    id: "ov-l2-store",
    label: "Store purchase Experience",
    options: [],
    children: [
      {
        id: "ov-store-staff",
        label: "Staff & Service",
        options: [
          "Store staff was not attentive",
          "Staff was not knowledgeable about products",
          "Staff was pushy or overselling",
          "Staff behavior was not satisfactory",
          "Had to wait too long for assistance",
          "Store was understaffed",
        ],
      },
      {
        id: "ov-store-availability",
        label: "Product Availability",
        options: [
          "Product I wanted was out of stock",
          "Size/variant was unavailable",
          "Store assortment was limited",
          "Product shown online was unavailable in store",
          "Inventory information was inaccurate",
        ],
      },
      {
        id: "ov-store-billing",
        label: "Billing & Checkout",
        options: [
          "Billing took too long",
          "Billing system was slow",
          "Discount was not applied correctly",
          "Coupon/voucher could not be redeemed",
          "Payment issue during checkout",
          "Incorrect bill generated",
        ],
      },
      {
        id: "ov-store-ambience",
        label: "Store Ambience",
        options: [
          "Store was crowded",
          "Store was not clean",
          "Store was difficult to navigate",
          "Trial experience was poor",
          "Product displays were confusing",
        ],
      },
      {
        id: "ov-store-omni",
        label: "Omnichannel Issues (Optional)",
        options: [],
      },
      {
        id: "ov-store-product",
        label: "Product Related",
        options: [],
      },
    ],
  },
};

export const optionalImprovementAreas = overallL1Categories.map(
  (c) => c.label,
);
