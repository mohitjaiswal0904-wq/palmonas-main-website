import type { ApiResponse } from "@/types/api";

export const API_BASE = "https://app-backend.palmonas.tech/api/v1/shopify";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Typed fetch wrapper. Throws `ApiError` on non-2xx responses.
 * All Palmonas endpoints return `{ status, message, data, timestamp }`.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    next: { revalidate: 60 },   // ISR: revalidate every 60 s in Next.js
    ...init,
  });
  if (!res.ok) {
    throw new ApiError(res.status, `API ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<ApiResponse<T>>;
}
