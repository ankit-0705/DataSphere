// types/user.ts

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  contributions: number;
  createdAt: string;  // ISO date string, adjust if you want Date type
  avatar?: string;    // if you have avatar URL or nullable
}
