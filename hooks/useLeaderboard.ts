'use client';

import useSWR from 'swr';
import { auth } from '@/lib/firebase/client';

export type LeaderboardUser = {
  id: string;
  name: string;
  avatar: string | null;
  contributions: number;
};

export type LeaderboardDataset = {
  id: string;
  title: string;
  description?: string;
  url: string;
  category?: string;
  size?: number;
  createdBy: string;
  createdAt: string;
  isVerified: boolean;
  contributor: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    contributions: number;
    createdAt: string;
  };
  _count: {
    likes: number;
  };
};

export type LeaderboardResponse = {
  topUsers: LeaderboardUser[];
  topDatasets: LeaderboardDataset[];
  meta: {
    page: number;
    limit: number;
    totalUsers: number;
    totalDatasets: number;
  };
};

const fetcherWithAuth = async (url: string): Promise<LeaderboardResponse> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  const token = await user.getIdToken();

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch leaderboard');
  }

  return res.json();
};

export const useLeaderboard = (
  enabled: boolean,
  page = 1,
  limit = 10
) => {
  const endpoint =
    enabled && auth.currentUser
      ? `/api/leaderboard?page=${page}&limit=${limit}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<LeaderboardResponse>(
    endpoint,
    fetcherWithAuth
  );

  return {
    topUsers: data?.topUsers || [],
    topDatasets: data?.topDatasets || [],
    isLoading,
    isError: error,
    refresh: mutate,
    meta: data?.meta || { page, limit, totalUsers: 0, totalDatasets: 0 },
  };
};
