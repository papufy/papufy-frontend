import { getApiBaseUrl } from "./env";

/** Só na sessão atual — nova aba/sessão volta a detectar GPS automaticamente. */
const LOCATION_MANUAL_KEY = "papufy_location_manual";

function sessionStore(): Storage | null {
  try {
    return sessionStorage;
  } catch {
    return null;
  }
}

export function isLocationManual(): boolean {
  const store = sessionStore();
  return store?.getItem(LOCATION_MANUAL_KEY) === "1";
}

export function markLocationManual(): void {
  sessionStore()?.setItem(LOCATION_MANUAL_KEY, "1");
}

export function clearLocationManual(): void {
  sessionStore()?.removeItem(LOCATION_MANUAL_KEY);
}

function ufFromNominatimAddress(
  address: Record<string, string> | undefined
): string | null {
  if (!address) return null;
  const iso = address["ISO3166-2-lvl4"];
  if (iso?.startsWith("BR-") && iso.length === 5) {
    return iso.slice(3).toUpperCase();
  }
  return null;
}

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ cidade: string; uf: string } | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: "json",
    "accept-language": "pt-BR",
    addressdetails: "1",
  });

  const response = await fetch(`${getApiBaseUrl()}/geo/reverse?${params}`);

  if (!response.ok) return null;

  const data = (await response.json()) as {
    address?: Record<string, string>;
  };

  const address = data.address;
  const cidade =
    address?.city ??
    address?.town ??
    address?.municipality ??
    address?.village ??
    address?.suburb;

  const uf = ufFromNominatimAddress(address);

  if (!cidade || !uf || cidade.length < 2) return null;

  return { cidade, uf: uf.toUpperCase() };
}

/** GPS + reverse geocode (Nominatim). Retorna null se negado ou indisponível. */
export function detectUserCity(): Promise<{ cidade: string; uf: string } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const loc = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );
          resolve(loc);
        } catch {
          resolve(null);
        }
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 60_000,
      }
    );
  });
}
