// client/src/constants/categories.ts
export type LostItemCategory = 'kickboard' | 'bicycle' | 'parcel' | 'etc';

export const CATEGORY_OPTIONS: Array<{ value: LostItemCategory; label: string }> = [
  { value: 'kickboard', label: '킥보드' },
  { value: 'bicycle',   label: '자전거' },
  { value: 'parcel',    label: '택배' },
  { value: 'etc',       label: '기타' },
];
