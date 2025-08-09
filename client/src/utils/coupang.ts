export const COUPANG_LINKS = [
  "https://link.coupang.com/a/cIFtru", // 🚨 뇌울림 3.0 PRO 도난방지 경보기
  "https://link.coupang.com/a/cIFumx", // 📍 갤럭시 스마트태그2 위치추적
  "https://link.coupang.com/a/cIFuZl", // 🔒 레오바니 자물쇠
  "https://link.coupang.com/a/cIFvsF", // 🍏 Apple 에어태그
  "https://link.coupang.com/a/cIFv4K", // 🧷 스프링 고리형 스트랩 (5개)
];

const KEY = "coupang.index";

export function nextCoupangLink(): string {
  const idx = Number(localStorage.getItem(KEY) ?? 0);
  const url = COUPANG_LINKS[idx % COUPANG_LINKS.length];
  localStorage.setItem(KEY, String((idx + 1) % COUPANG_LINKS.length));
  return url;
}
