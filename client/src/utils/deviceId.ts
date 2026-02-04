// D:\1000_b_project\lostfinder\client\src\utils\deviceId.ts

import { v4 as uuidv4 } from 'uuid';

const KEY = 'lostfinder_device_id';

export function getDeviceId(): string {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && saved.trim().length > 0) return saved;

    // 브라우저가 지원하면 randomUUID 우선 사용
    const newId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? (crypto as Crypto).randomUUID()
        : uuidv4();

    localStorage.setItem(KEY, newId);
    return newId;
  } catch {
    // localStorage 막힌 환경 대비
    return uuidv4();
  }
}

export function resetDeviceId(): string {
  const newId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? (crypto as Crypto).randomUUID()
      : uuidv4();

  try {
    localStorage.setItem(KEY, newId);
  } catch {
    // 무시
  }
  return newId;
}
