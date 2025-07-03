// lib/admin.ts
export const ADMIN_UID = "누님의_UID_여기에_입력"; // Firebase Auth에서 본인 UID 확인 후 입력

export const isAdmin = (uid: string | null | undefined): boolean => {
  return uid === ADMIN_UID;
}; 