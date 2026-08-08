/** Preferência: foto persistida no servidor. Fallback legado: localStorage. */

const PROFILE_PHOTO_PREFIX = "papufy_profile_photo_";

export function getLocalProfilePhotoUrl(userId?: string | null): string | null {
  if (!userId) return null;
  try {
    return localStorage.getItem(`${PROFILE_PHOTO_PREFIX}${userId}`);
  } catch {
    return null;
  }
}

/** @deprecated use resolveProfilePhotoUrl */
export function getProfilePhotoUrl(userId?: string | null): string | null {
  return getLocalProfilePhotoUrl(userId);
}

export function resolveProfilePhotoUrl(user?: {
  id?: string | null;
  fotoUrl?: string | null;
} | null): string | null {
  if (user?.fotoUrl) return user.fotoUrl;
  return getLocalProfilePhotoUrl(user?.id);
}

export function setProfilePhotoUrl(userId: string, photoUrl: string): void {
  try {
    localStorage.setItem(`${PROFILE_PHOTO_PREFIX}${userId}`, photoUrl);
  } catch {
    // ignore storage quota errors
  }
}

export function removeProfilePhotoUrl(userId: string): void {
  try {
    localStorage.removeItem(`${PROFILE_PHOTO_PREFIX}${userId}`);
  } catch {
    // ignore
  }
}
