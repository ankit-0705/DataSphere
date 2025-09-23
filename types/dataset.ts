// types/dataset.ts

import type { User } from './user';

export interface Tag {
  id: string;
  name: string;
}

export interface DatasetTag {
  tag: Tag;
}

export interface Dataset {
  id: string;
  title: string;
  description?: string;
  url: string;
  category?: string;
  size?: number;
  createdBy: string;
  createdAt: string;  // ISO string
  isVerified: boolean;
  contributor: User;
  tags: DatasetTag[];
  likes: any[];   // you can define a Like interface too if needed
}
