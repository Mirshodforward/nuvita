export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  (process.env.NODE_ENV === "production"
    ? "https://nuvita.uz/api"
    : "http://localhost:3001/api");
