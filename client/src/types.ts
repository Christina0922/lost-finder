// C:\LostFinderProject\client\src\types.ts

export type Theme = 'light' | 'dark';
export type EditMode = 'edit' | 'create';

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string; // 화면에서 username 사용 중이므로 옵션으로 허용
}

// Optional User 타입 추가
export type OptionalUser = User | null | undefined;

export interface Comment {
  id: number;
  text: string;
  author_id: string;
  author_name?: string;
  author_email?: string;
  created_at: number | string; // epoch ms 또는 ISO 문자열
}

export interface LostItem {
  id: number;
  title: string;
  description?: string;

  // 화면에서 참조 중인 필드들을 모두 옵션으로 허용
  item_type?: string;
  location?: string;
  date?: string;
  created_at?: number | string;
  image_urls?: string[];

  author_id: string;
  comments: Comment[];
}
