import type { ListingType } from "../types";

const LEGACY: Record<string, ListingType> = {
  BICO: "JOB_VACANCY",
  PRODUTO: "PROFESSIONAL_PROFILE",
};

/** Normaliza tipo de anúncio (aceita aliases BICO/PRODUTO legados). */
export function normalizeListingType(
  value?: string | null
): ListingType | undefined {
  if (!value) return undefined;
  if (value === "JOB_VACANCY" || value === "PROFESSIONAL_PROFILE") {
    return value;
  }
  return LEGACY[value];
}

export function isJobVacancyListing(
  listingType?: string | null
): boolean {
  return normalizeListingType(listingType) === "JOB_VACANCY";
}

export function isProfessionalProfileListing(
  listingType?: string | null
): boolean {
  return normalizeListingType(listingType) === "PROFESSIONAL_PROFILE";
}
