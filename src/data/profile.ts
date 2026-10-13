/**
 * Mock data for the account / profile area (user, orders, wallet, addresses).
 * Stands in for a real account API until one is wired in.
 */

export type ProfileUser = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dob: { day: string; month: string; year: string };
  gender: string;
  avatar?: string;
};

export type OrderStatus = "delivered" | "cancelled" | "in-transit";

export type OrderItem = {
  id: string;
  title: string;
  image: string;
  mrp: number;
  price: number;
};

export type Order = {
  id: string;
  status: OrderStatus;
  recipient: string;
  date: string;
  paymentMethod: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  discountLabel: string;
  discount: number;
  walletUsed: number;
  shipping: number;
  gst: number;
};

/** Grand total derived from the order's price components. */
export function orderTotal(o: Order): number {
  return o.subtotal - o.discount - o.walletUsed + o.shipping + o.gst * 2;
}

export type WalletTxn = {
  id: string;
  type: "received" | "payment";
  label: string;
  date: string;
  time: string;
  amount: number;
};

export type Address = {
  id: string;
  name: string;
  isDefault: boolean;
  company: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
};

export const PROFILE_USER: ProfileUser = {
  firstName: "Priya",
  lastName: "Kumari",
  phone: "+918090835556",
  email: "xyz@gmail.com",
  dob: { day: "", month: "", year: "" },
  gender: "",
};

const THUMB = "/collection/product-earrings.jpg";

const orderItems: OrderItem[] = Array.from({ length: 3 }, (_, i) => ({
  id: `oi-${i + 1}`,
  title: "Gilded Rings Layered Necklace",
  image: THUMB,
  mrp: 2747,
  price: 999,
}));

export const ORDERS: Order[] = [
  {
    id: "PM090774646747",
    status: "delivered",
    recipient: "Priya",
    date: "09/06/2025",
    paymentMethod: "Paid (UPI)",
    deliveryAddress:
      "5th Floor, Verdant 84, Plot 1, Lane 2, Koregaon Park Annexe, Mundhwa, Pune, Maharashtra",
    items: orderItems,
    subtotal: 8978,
    discountLabel: "Palmonas20",
    discount: 2978,
    walletUsed: 200,
    shipping: 0,
    gst: 60,
  },
  {
    id: "PM090774646748",
    status: "cancelled",
    recipient: "Priya",
    date: "09/06/2025",
    paymentMethod: "Paid (UPI)",
    deliveryAddress:
      "5th Floor, Verdant 84, Plot 1, Lane 2, Koregaon Park Annexe, Mundhwa, Pune, Maharashtra",
    items: orderItems,
    subtotal: 8978,
    discountLabel: "Palmonas20",
    discount: 2978,
    walletUsed: 0,
    shipping: 0,
    gst: 60,
  },
  {
    id: "PM090774646749",
    status: "in-transit",
    recipient: "Priya",
    date: "09/06/2025",
    paymentMethod: "Paid (UPI)",
    deliveryAddress:
      "5th Floor, Verdant 84, Plot 1, Lane 2, Koregaon Park Annexe, Mundhwa, Pune, Maharashtra",
    items: orderItems,
    subtotal: 8978,
    discountLabel: "Palmonas20",
    discount: 2978,
    walletUsed: 200,
    shipping: 0,
    gst: 60,
  },
  {
    id: "PM090774646750",
    status: "delivered",
    recipient: "Priya",
    date: "09/06/2025",
    paymentMethod: "Paid (UPI)",
    deliveryAddress:
      "5th Floor, Verdant 84, Plot 1, Lane 2, Koregaon Park Annexe, Mundhwa, Pune, Maharashtra",
    items: orderItems,
    subtotal: 8978,
    discountLabel: "Palmonas20",
    discount: 2978,
    walletUsed: 200,
    shipping: 0,
    gst: 60,
  },
];

export const WALLET_BALANCE = 505;

export const WALLET_TXNS: WalletTxn[] = [
  { id: "t1", type: "received", label: "Money Received", date: "Nov 6, 2024", time: "2:30 PM", amount: 500 },
  { id: "t2", type: "payment", label: "Order Payment", date: "Nov 5, 2024", time: "11:45 AM", amount: 150 },
  { id: "t3", type: "received", label: "Money Received", date: "Nov 6, 2024", time: "2:30 PM", amount: 500 },
  { id: "t4", type: "payment", label: "Order Payment", date: "Nov 5, 2024", time: "11:45 AM", amount: 150 },
  { id: "t5", type: "payment", label: "Order Payment", date: "Nov 5, 2024", time: "11:45 AM", amount: 150 },
  { id: "t6", type: "payment", label: "Order Payment", date: "Nov 5, 2024", time: "11:45 AM", amount: 150 },
];

export const WALLET_FAQS = [
  {
    q: "Is my money safe?",
    a: "Yes. Your wallet balance is protected with bank-level security and encryption, and can only be used by you.",
  },
  {
    q: "Can I withdraw my wallet balance?",
    a: "Wallet balance can be used towards any purchase on Palmonas. It is non-withdrawable but never expires.",
  },
  {
    q: "What payment methods can I use?",
    a: "You can top up your wallet using UPI, credit/debit cards, and net banking.",
  },
];

export const INITIAL_ADDRESSES: Address[] = [
  {
    id: "a1",
    name: "Name",
    isDefault: true,
    company: "Palmonas",
    line1: "XYZ Nagar colony",
    line2: "",
    city: "Pune",
    postalCode: "221002",
    country: "India",
    phone: "+918090833565",
  },
  {
    id: "a2",
    name: "Name",
    isDefault: false,
    company: "Palmonas",
    line1: "XYZ Nagar colony",
    line2: "",
    city: "Pune",
    postalCode: "221002",
    country: "India",
    phone: "+918090833565",
  },
];

export const DOB_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
export const DOB_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const DOB_YEARS = Array.from({ length: 70 }, (_, i) => String(2010 - i));
export const GENDERS = ["Female", "Male", "Other", "Prefer not to say"];
export const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia"];
