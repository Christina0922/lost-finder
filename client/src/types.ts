// C:\LostFinderProject\client\src\types.ts
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  isTemporaryPassword?: boolean;
  role?: 'user' | 'admin';
}

export interface Comment { 
  id: number; 
  author_id: number; 
  author_name?: string;
  author_email?: string;
  text: string; 
  created_at?: string;
}

export interface LostItem {
  id: number;
  author_id: number;
  author_name?: string;
  author_email?: string;
  item_type: string;
  description: string;
  location: string;
  image_urls: string[];
  created_at?: string;
  updated_at?: string;
  comments?: Comment[];
}

export interface Notification {
  id: number;
  userId: number;
  itemId: number;
  message: string;
  read: boolean;
}

export type Theme = 'light' | 'dark';
export type EditMode = 'create' | 'edit';
