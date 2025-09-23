'use client';

import useSWR from 'swr';
import { auth } from '@/lib/firebase/client';
import React from 'react';

type MonthlyStat = {
  month: string;   // e.g., "2025-09"
  count: number;
};

type DatasetStats = {
  datasetsPerMonth: MonthlyStat[];
  likesPerMonth: MonthlyStat[];
  commentsPerMonth: MonthlyStat[];
};

type CombinedStat = {
  month: string;
  datasets: number;
  likes: number;
  comments: number;
};

const fetcher = async (url: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const token = await user.getIdToken();
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch dataset stats');

  const data = await res.json();
  return data;
};


function combineStats(
  datasets: MonthlyStat[] = [],
  likes: MonthlyStat[] = [],
  comments: MonthlyStat[] = []
): CombinedStat[] {
  // Collect all unique months from all 3 arrays
  const monthsSet = new Set<string>();
  datasets.forEach(d => monthsSet.add(d.month));
  likes.forEach(l => monthsSet.add(l.month));
  comments.forEach(c => monthsSet.add(c.month));

  const allMonths = Array.from(monthsSet).sort();

  return allMonths.map(month => ({
    month,
    datasets: datasets.find(d => d.month === month)?.count || 0,
    likes: likes.find(l => l.month === month)?.count || 0,
    comments: comments.find(c => c.month === month)?.count || 0,
  }));
}

export const useDatasetStats = () => {
  const { data, error, isLoading } = useSWR<DatasetStats>(
    () => (auth.currentUser ? '/api/datasets/stats' : null),
    fetcher
  );

  const stats = React.useMemo(() => {
    if (!data) return [];
    return combineStats(data.datasetsPerMonth, data.likesPerMonth, data.commentsPerMonth);
  }, [data]);

  return {
    stats,
    isLoading,
    isError: error,
  };
};