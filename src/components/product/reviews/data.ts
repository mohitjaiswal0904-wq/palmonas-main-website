import type { RatingBreakdown, Review } from "./types";

const BODY =
  "Bought this as an anniversary gift for my wife and she absolutely loves it! The BIS hallmark gives confidence in quality. Highly recommend!";

export const SAMPLE_REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Meera Reddy",
    initials: "MR",
    rating: 5,
    date: "25 Oct 2025",
    title: "Perfect gift!",
    body: BODY,
    images: ["", "", "", ""],
    likes: 1,
    dislikes: 1,
  },
  {
    id: "r2",
    name: "Meera Reddy",
    initials: "MR",
    rating: 5,
    date: "25 Oct 2025",
    title: "Perfect gift!",
    body: BODY,
    images: ["", ""],
    likes: 1,
    dislikes: 1,
  },
  {
    id: "r3",
    name: "Meera Reddy",
    initials: "MR",
    rating: 5,
    date: "25 Oct 2025",
    title: "Perfect gift!",
    body: BODY,
    likes: 4,
    dislikes: 0,
  },
  {
    id: "r4",
    name: "Meera Reddy",
    initials: "MR",
    rating: 4,
    date: "23 Oct 2025",
    title: "Perfect gift!",
    body: BODY,
    images: ["", ""],
    likes: 2,
    dislikes: 0,
  },
];

export const SAMPLE_BREAKDOWN: RatingBreakdown = {
  5: 224,
  4: 2,
  3: 2,
  2: 2,
  1: 2,
};
