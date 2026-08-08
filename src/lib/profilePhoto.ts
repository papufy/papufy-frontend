/** Foto de perfil vem do servidor (`user.fotoUrl`). Sem localStorage. */

export function resolveProfilePhotoUrl(user?: {
  id?: string | null;
  fotoUrl?: string | null;
} | null): string | null {
  return user?.fotoUrl?.trim() || null;
}

/** @deprecated use resolveProfilePhotoUrl */
export function getProfilePhotoUrl(_userId?: string | null): string | null {
  return null;
}

export function setProfilePhotoUrl(_userId: string, _photoUrl: string): void {
  /* no-op — persistência só via API */
}

export function removeProfilePhotoUrl(userId: string): void {
  try {
    localStorage.removeItem(`papufy_profile_photo_${userId}`);
  } catch {
    /* ignore */
  }
}
