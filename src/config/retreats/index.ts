import { RetreatConfig } from "./types";
import { desertAwakening2025 } from "./desert-awakening-2025";
import { thailandRetreat2025 } from "./thailand-retreat-2025";

// Registry of all retreats - add new retreats here
const retreats: RetreatConfig[] = [desertAwakening2025, thailandRetreat2025];

export function getRetreatBySlug(slug: string): RetreatConfig | undefined {
  return retreats.find((r) => r.slug === slug && r.isActive);
}

export function getAllRetreats(): RetreatConfig[] {
  return retreats.filter((r) => r.isActive);
}

export function getAllRetreatSlugs(): string[] {
  return retreats.filter((r) => r.isActive).map((r) => r.slug);
}

export type { RetreatConfig } from "./types";
