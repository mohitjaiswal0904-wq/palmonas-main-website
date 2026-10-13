export type Review = {
  id: string;
  name: string;
  initials: string;
  rating: number;
  date: string;
  title?: string;
  body: string;
  images?: string[];
  likes?: number;
  dislikes?: number;
};

export type NewReview = {
  rating: number;
  body: string;
  fileName?: string;
};

/** Count of reviews per star rating, indexed 5 → 1. */
export type RatingBreakdown = Record<1 | 2 | 3 | 4 | 5, number>;
