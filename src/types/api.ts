/** Generic envelope returned by every Palmonas backend endpoint. */
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

/** Cursor-based pagination metadata included on list responses. */
export interface PaginationMeta {
  count: number;
  page_size: number;
  has_next: boolean;
  next_cursor: string | null;
  has_previous: boolean;
  previous_cursor: string | null;
}
