import type { PriceFilter } from "./heat";

const KEY = "vsv.desk.pricePref";

export function readPricePref(): PriceFilter | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === "5" || raw === "10" || raw === "20" || raw === "higher") {
      return raw;
    }
    return null;
  } catch {
    return null;
  }
}

export function writePricePref(filter: PriceFilter): void {
  if (typeof window === "undefined") return;
  if (filter === "all") return;
  try {
    window.localStorage.setItem(KEY, filter);
  } catch {
    /* ignore */
  }
}

export function pricePrefLabel(filter: PriceFilter | null): string | null {
  if (filter === "5") return "$5";
  if (filter === "10") return "$10";
  if (filter === "20") return "$20";
  if (filter === "higher") return "$25+";
  return null;
}
