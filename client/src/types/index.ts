// 분실물 인터페이스
export interface LostItem {
  id: number;
  author_id: number;
  author_name?: string;
  author_email?: string;
  item_type: string;
  description: string;
  location: string;
  // 지도 관련 필드
  lat?: number | null;
  lng?: number | null;
  place_name?: string | null;
  address?: string | null;
  lost_at?: string | null;
  created_by_device_id?: string | null;
  // 기타 필드
  image_urls: string[];
  created_at?: string;
  updated_at?: string;
  comments?: Comment[];
}

// 댓글 인터페이스
export interface Comment {
  id: number;
  item_id: number;
  author_id: number;
  author_name?: string;
  author_email?: string;
  text: string;
  created_at?: string;
}

// 사용자 인터페이스
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  isTemporaryPassword?: boolean;
  role?: 'user' | 'admin';
}

// 알림 설정
export type NotificationMode = 'silent' | 'vibrate' | 'melody';

