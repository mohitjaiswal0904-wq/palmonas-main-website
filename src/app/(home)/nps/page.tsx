import type { Metadata } from "next";
import NpsPage from "@/features/nps/NpsPage";

export const metadata: Metadata = {
  title: "NPS Form | Palmonas",
  description:
    "Share your Net Promoter Score and feedback on your Palmonas shopping, delivery, and overall experience.",
};

export default function Page() {
  return <NpsPage />;
}
