// lib/admin.ts
export const ADMIN_UID = "여기에_누님_파이어베이스_UID_입력";

export const isAdmin = (uid: string | null | undefined): boolean => {
  return uid === ADMIN_UID;
}; 